"""
Action Service Layer
Handles validation, business logic, and persistence for action execution
"""

import uuid
from datetime import datetime
from typing import Dict, List, Optional, Tuple
from sqlalchemy.orm import Session

from app.models.database import (
    Recommendation,
    RecommendationAction,
    UserPermissionAssignment,
)


class ActionValidationError(Exception):
    """Validation error when executing actions"""
    pass


class ActionService:
    """
    Service for executing, validating, and persisting actions on recommendations.
    Ensures data consistency and provides idempotency.
    """
    
    def __init__(self, db: Session, analysis_data: Dict = None):
        """
        Initialize service with database session and optional analysis data.
        
        Args:
            db: SQLAlchemy database session
            analysis_data: Current analysis result data (for validation)
        """
        self.db = db
        self.analysis_data = analysis_data or {}
    
    def validate_action_request(
        self,
        user_id: str,
        permission_id: str,
        action_type: str,
        recommendation_id: Optional[str] = None
    ) -> Tuple[bool, Optional[str]]:
        """
        Validate that an action can be executed.
        
        Args:
            user_id: User ID
            permission_id: Permission ID
            action_type: Type of action (revoke, review, ignore)
            recommendation_id: ID of the recommendation being acted upon
        
        Returns:
            Tuple of (is_valid, error_message)
        """
        # Validate user_id format
        if not user_id or len(user_id.strip()) == 0:
            return False, "user_id cannot be empty"
        
        if not permission_id or len(permission_id.strip()) == 0:
            return False, "permission_id cannot be empty"
        
        # Validate action type
        valid_actions = ["revoke", "review", "ignore"]
        if action_type not in valid_actions:
            return False, f"Invalid action_type '{action_type}'. Must be one of: {', '.join(valid_actions)}"
        
        # For REVOKE actions, validate that user has this permission
        if action_type == "revoke":
            has_permission = self._user_has_permission(user_id, permission_id)
            if not has_permission:
                return False, f"User '{user_id}' does not have permission '{permission_id}' assigned"
        
        # Validate permission exists in analysis data
        if self.analysis_data:
            perms = self.analysis_data.get("permissions", [])
            perm_ids = [p.get("permission_id") for p in perms]
            if permission_id not in perm_ids:
                # Only warn for REVOKE, other actions don't need this
                if action_type == "revoke":
                    return False, f"Permission '{permission_id}' not found in system"
        
        return True, None
    
    def execute_revoke(
        self,
        user_id: str,
        permission_id: str,
        recommendation_id: Optional[str] = None,
        executed_by: str = "system"
    ) -> Dict:
        """
        Execute REVOKE action:
        - Remove permission from user
        - Update recommendation status
        - Create audit log
        
        Args:
            user_id: User to revoke permission from
            permission_id: Permission to revoke
            recommendation_id: ID of the recommendation (optional)
            executed_by: User/system performing the action
        
        Returns:
            Response with updated recommendation and action log
        """
        action_id = str(uuid.uuid4())
        
        try:
            # 1. Validate
            is_valid, error = self.validate_action_request(
                user_id, permission_id, "revoke", recommendation_id
            )
            if not is_valid:
                raise ActionValidationError(error)
            
            # 2. Check idempotency - has this already been revoked?
            existing_revoke = self.db.query(RecommendationAction).filter(
                RecommendationAction.user_id == user_id,
                RecommendationAction.permission_id == permission_id,
                RecommendationAction.action_type == "revoke",
                RecommendationAction.status == "completed"
            ).first()
            
            if existing_revoke:
                # Already revoked, return success (idempotent)
                recommendation = self._get_or_create_recommendation(
                    user_id, permission_id, recommendation_id
                )
                return {
                    "success": True,
                    "message": "Permission already revoked (idempotent)",
                    "recommendation": self._format_recommendation(recommendation),
                    "action": self._format_action(existing_revoke)
                }
            
            # 3. Revoke the permission
            result = self._revoke_permission(user_id, permission_id)
            if not result["success"]:
                raise ActionValidationError(result["message"])
            
            # 4. Update recommendation status
            recommendation = self._get_or_create_recommendation(
                user_id, permission_id, recommendation_id
            )
            recommendation.status = "revoked"
            recommendation.updated_at = datetime.utcnow()
            self.db.add(recommendation)
            
            # 5. Create audit log
            action = RecommendationAction(
                id=action_id,
                recommendation_id=recommendation.id,
                user_id=user_id,
                permission_id=permission_id,
                action_type="revoke",
                status="completed",
                executed_by=executed_by,
                executed_at=datetime.utcnow(),
                result_message=f"Successfully revoked '{permission_id}' from user '{user_id}'"
            )
            self.db.add(action)
            self.db.commit()
            
            return {
                "success": True,
                "message": f"Successfully revoked permission '{permission_id}' from user '{user_id}'",
                "recommendation": self._format_recommendation(recommendation),
                "action": self._format_action(action)
            }
        
        except ActionValidationError as e:
            # Log failed action
            self._log_failed_action(
                action_id, user_id, permission_id, "revoke", executed_by, str(e)
            )
            raise
        except Exception as e:
            # Unexpected error
            self._log_failed_action(
                action_id, user_id, permission_id, "revoke", executed_by, str(e)
            )
            raise
    
    def execute_review(
        self,
        user_id: str,
        permission_id: str,
        recommendation_id: Optional[str] = None,
        executed_by: str = "system"
    ) -> Dict:
        """
        Execute REVIEW action:
        - Mark recommendation as under review (does NOT modify permissions)
        - Create audit log
        
        Args:
            user_id: User being reviewed
            permission_id: Permission being reviewed
            recommendation_id: ID of the recommendation (optional)
            executed_by: User/system performing the action
        
        Returns:
            Response with updated recommendation and action log
        """
        action_id = str(uuid.uuid4())
        
        try:
            # 1. Validate
            is_valid, error = self.validate_action_request(
                user_id, permission_id, "review", recommendation_id
            )
            if not is_valid:
                raise ActionValidationError(error)
            
            # 2. Check idempotency - already under review?
            existing_review = self.db.query(RecommendationAction).filter(
                RecommendationAction.user_id == user_id,
                RecommendationAction.permission_id == permission_id,
                RecommendationAction.action_type == "review",
                RecommendationAction.status == "completed"
            ).first()
            
            if existing_review:
                # Already reviewed, return success (idempotent)
                recommendation = self._get_or_create_recommendation(
                    user_id, permission_id, recommendation_id
                )
                return {
                    "success": True,
                    "message": "Permission already marked for review (idempotent)",
                    "recommendation": self._format_recommendation(recommendation),
                    "action": self._format_action(existing_review)
                }
            
            # 3. Update recommendation status (NO permission modification)
            recommendation = self._get_or_create_recommendation(
                user_id, permission_id, recommendation_id
            )
            recommendation.status = "reviewed"
            recommendation.updated_at = datetime.utcnow()
            self.db.add(recommendation)
            
            # 4. Create audit log
            action = RecommendationAction(
                id=action_id,
                recommendation_id=recommendation.id,
                user_id=user_id,
                permission_id=permission_id,
                action_type="review",
                status="completed",
                executed_by=executed_by,
                executed_at=datetime.utcnow(),
                result_message=f"User '{user_id}' and permission '{permission_id}' marked for review"
            )
            self.db.add(action)
            self.db.commit()
            
            return {
                "success": True,
                "message": f"Permission '{permission_id}' for user '{user_id}' marked for review",
                "recommendation": self._format_recommendation(recommendation),
                "action": self._format_action(action)
            }
        
        except ActionValidationError as e:
            self._log_failed_action(
                action_id, user_id, permission_id, "review", executed_by, str(e)
            )
            raise
        except Exception as e:
            self._log_failed_action(
                action_id, user_id, permission_id, "review", executed_by, str(e)
            )
            raise
    
    def execute_ignore(
        self,
        user_id: str,
        permission_id: str,
        recommendation_id: Optional[str] = None,
        executed_by: str = "system"
    ) -> Dict:
        """
        Execute IGNORE action:
        - Mark recommendation as ignored
        - Does NOT modify permissions
        - Does NOT mark for review
        
        Args:
            user_id: User whose recommendation is ignored
            permission_id: Permission whose recommendation is ignored
            recommendation_id: ID of the recommendation (optional)
            executed_by: User/system performing the action
        
        Returns:
            Response with updated recommendation and action log
        """
        action_id = str(uuid.uuid4())
        
        try:
            # 1. Validate
            is_valid, error = self.validate_action_request(
                user_id, permission_id, "ignore", recommendation_id
            )
            if not is_valid:
                raise ActionValidationError(error)
            
            # 2. Check idempotency
            existing_ignore = self.db.query(RecommendationAction).filter(
                RecommendationAction.user_id == user_id,
                RecommendationAction.permission_id == permission_id,
                RecommendationAction.action_type == "ignore",
                RecommendationAction.status == "completed"
            ).first()
            
            if existing_ignore:
                # Already ignored, return success (idempotent)
                recommendation = self._get_or_create_recommendation(
                    user_id, permission_id, recommendation_id
                )
                return {
                    "success": True,
                    "message": "Recommendation already ignored (idempotent)",
                    "recommendation": self._format_recommendation(recommendation),
                    "action": self._format_action(existing_ignore)
                }
            
            # 3. Update recommendation status
            recommendation = self._get_or_create_recommendation(
                user_id, permission_id, recommendation_id
            )
            recommendation.status = "ignored"
            recommendation.updated_at = datetime.utcnow()
            self.db.add(recommendation)
            
            # 4. Create audit log
            action = RecommendationAction(
                id=action_id,
                recommendation_id=recommendation.id,
                user_id=user_id,
                permission_id=permission_id,
                action_type="ignore",
                status="completed",
                executed_by=executed_by,
                executed_at=datetime.utcnow(),
                result_message=f"Recommendation for user '{user_id}' and permission '{permission_id}' ignored"
            )
            self.db.add(action)
            self.db.commit()
            
            return {
                "success": True,
                "message": f"Recommendation for user '{user_id}' and permission '{permission_id}' marked as ignored",
                "recommendation": self._format_recommendation(recommendation),
                "action": self._format_action(action)
            }
        
        except ActionValidationError as e:
            self._log_failed_action(
                action_id, user_id, permission_id, "ignore", executed_by, str(e)
            )
            raise
        except Exception as e:
            self._log_failed_action(
                action_id, user_id, permission_id, "ignore", executed_by, str(e)
            )
            raise
    
    # ========== Helper Methods ==========
    
    def _user_has_permission(self, user_id: str, permission_id: str) -> bool:
        """Check if user currently has this permission assigned"""
        assignment = self.db.query(UserPermissionAssignment).filter(
            UserPermissionAssignment.user_id == user_id,
            UserPermissionAssignment.permission_id == permission_id,
            UserPermissionAssignment.is_active == "true",
            UserPermissionAssignment.revoked_at == None
        ).first()
        
        return assignment is not None
    
    def _revoke_permission(self, user_id: str, permission_id: str) -> Dict:
        """
        Remove permission from user by marking assignment as revoked.
        
        Returns:
            Dict with success status and message
        """
        assignment = self.db.query(UserPermissionAssignment).filter(
            UserPermissionAssignment.user_id == user_id,
            UserPermissionAssignment.permission_id == permission_id,
            UserPermissionAssignment.is_active == "true"
        ).first()
        
        if not assignment:
            return {
                "success": False,
                "message": f"No active assignment found for user '{user_id}' and permission '{permission_id}'"
            }
        
        # Mark as revoked
        assignment.is_active = "false"
        assignment.revoked_at = datetime.utcnow()
        self.db.add(assignment)
        
        return {
            "success": True,
            "message": f"Permission '{permission_id}' revoked from user '{user_id}'"
        }
    
    def _get_or_create_recommendation(
        self,
        user_id: str,
        permission_id: str,
        recommendation_id: Optional[str] = None
    ) -> Recommendation:
        """Get existing recommendation or create a temporary one"""
        if recommendation_id:
            rec = self.db.query(Recommendation).filter(
                Recommendation.id == recommendation_id
            ).first()
            if rec:
                return rec
        
        # Try to find by user_id and permission_id
        rec = self.db.query(Recommendation).filter(
            Recommendation.user_id == user_id,
            Recommendation.permission_id == permission_id
        ).first()
        
        if rec:
            return rec
        
        # Create minimal recommendation object
        rec = Recommendation(
            id=recommendation_id or str(uuid.uuid4()),
            user_id=user_id,
            permission_id=permission_id,
            priority=0,
            action_type="UNKNOWN",
            risk_score=0.0,
            reason="",
            status="pending",
            created_at=datetime.utcnow(),
            updated_at=datetime.utcnow()
        )
        self.db.add(rec)
        
        return rec
    
    def _log_failed_action(
        self,
        action_id: str,
        user_id: str,
        permission_id: str,
        action_type: str,
        executed_by: str,
        error_message: str
    ) -> None:
        """Log a failed action to the database"""
        action = RecommendationAction(
            id=action_id,
            recommendation_id=str(uuid.uuid4()),
            user_id=user_id,
            permission_id=permission_id,
            action_type=action_type,
            status="failed",
            executed_by=executed_by,
            executed_at=datetime.utcnow(),
            error_message=error_message
        )
        try:
            self.db.add(action)
            self.db.commit()
        except:
            pass  # Silently fail if we can't log the error
    
    def _format_recommendation(self, rec: Recommendation) -> Dict:
        """Format recommendation for response"""
        return {
            "id": rec.id,
            "user_id": rec.user_id,
            "permission_id": rec.permission_id,
            "action_type": rec.action_type,
            "priority": rec.priority,
            "risk_score": float(rec.risk_score),
            "reason": rec.reason,
            "impact": rec.impact or "",
            "status": rec.status,
            "updated_at": rec.updated_at.isoformat() if rec.updated_at else ""
        }
    
    def _format_action(self, action: RecommendationAction) -> Dict:
        """Format action for response"""
        return {
            "id": action.id,
            "recommendation_id": action.recommendation_id,
            "user_id": action.user_id,
            "permission_id": action.permission_id,
            "action_type": action.action_type,
            "status": action.status,
            "executed_by": action.executed_by,
            "executed_at": action.executed_at.isoformat() if action.executed_at else "",
            "result_message": action.result_message,
            "error_message": action.error_message
        }
