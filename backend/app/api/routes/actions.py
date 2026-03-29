"""
Action API Routes
Endpoints for executing actions on recommendations (revoke, review, ignore)
Mock implementation - no database required
"""

from fastapi import APIRouter, HTTPException
from datetime import datetime
from uuid import uuid4

from app.models.schema import ActionRequest, ActionExecutionResponse


# Create router for action endpoints
router = APIRouter(prefix="/api/actions", tags=["actions"])


def create_mock_response(user_id: str, permission_id: str, recommendation_id: str, action_type: str, message: str):
    """Create a mock action response"""
    action_id = f"action-{uuid4().hex[:8]}"
    now = datetime.utcnow().isoformat() + "Z"
    
    return {
        "success": True,
        "message": message,
        "recommendation": {
            "id": recommendation_id or f"rec-{user_id}-{permission_id}",
            "user_id": user_id,
            "permission_id": permission_id,
            "action_type": "REVIEW",  # Default action type
            "priority": 1,
            "risk_score": 0.5,
            "reason": "Permission under review",
            "impact": "Awaiting user decision",
            "status": "reviewed" if action_type == "review" else "revoked" if action_type == "revoke" else "ignored",
            "updated_at": now
        },
        "action": {
            "id": action_id,
            "recommendation_id": recommendation_id or f"rec-{user_id}-{permission_id}",
            "user_id": user_id,
            "permission_id": permission_id,
            "action_type": action_type,
            "status": "completed",
            "executed_by": "ui-user",
            "executed_at": now,
            "result_message": f"Successfully {action_type}ed permission"
        }
    }


@router.post("/revoke", response_model=ActionExecutionResponse)
async def revoke_access(request: ActionRequest):
    """
    Revoke access: Remove a permission from a user.
    Mock implementation that returns success without database.
    """
    try:
        result = create_mock_response(
            user_id=request.user_id,
            permission_id=request.permission_id,
            recommendation_id=request.recommendation_id,
            action_type="revoke",
            message=f"Successfully revoked {request.permission_id} from {request.user_id}"
        )
        return ActionExecutionResponse(**result)
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to revoke access: {str(e)}"
        )


@router.post("/review", response_model=ActionExecutionResponse)
async def review_access(request: ActionRequest):
    """
    Review access: Mark a user-permission pair as under review.
    Mock implementation that returns success without database.
    """
    try:
        result = create_mock_response(
            user_id=request.user_id,
            permission_id=request.permission_id,
            recommendation_id=request.recommendation_id,
            action_type="review",
            message=f"Successfully marked {request.permission_id} for {request.user_id} under review"
        )
        return ActionExecutionResponse(**result)
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to review access: {str(e)}"
        )


@router.post("/ignore", response_model=ActionExecutionResponse)
async def ignore_recommendation(request: ActionRequest):
    """
    Ignore recommendation: Mark a recommendation as ignored.
    Mock implementation that returns success without database.
    """
    try:
        result = create_mock_response(
            user_id=request.user_id,
            permission_id=request.permission_id,
            recommendation_id=request.recommendation_id,
            action_type="ignore",
            message=f"Successfully ignored recommendation for {request.user_id}/{request.permission_id}"
        )
        return ActionExecutionResponse(**result)
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to ignore recommendation: {str(e)}"
        )
