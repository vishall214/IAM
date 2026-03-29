"""
Feedback Processing Module
Learns from analyst feedback to adjust risk scoring
IMPROVEMENT 3: Feedback loop with learning
"""
from typing import Dict, List, Optional
from datetime import datetime
import json
import logging

logger = logging.getLogger(__name__)


class FeedbackProcessor:
    """Learns from analyst feedback to adjust risk scoring"""
    
    def __init__(self, storage: Dict = None):
        self.storage = storage or {}
        self.risk_threshold_adjustments = {}
    
    def record_feedback(self, recommendation_id: str, action: str, 
                       reason: str = "", analyst: str = "") -> Dict:
        """
        Record feedback on a recommendation
        
        Args:
            recommendation_id: ID of the recommendation
            action: APPROVED | REJECTED | DEFERRED | CUSTOM_ACTION
            reason: Optional explanation
            analyst: Who provided feedback
        
        Returns:
            {"status": "recorded", "adjustments_made": [...]}
        """
        
        feedback_record = {
            "recommendation_id": recommendation_id,
            "action": action,
            "reason": reason,
            "analyst": analyst,
            "timestamp": datetime.now().isoformat(),
            "adjustment": None
        }
        
        # Store feedback
        self.storage[recommendation_id] = feedback_record
        
        # Calculate threshold adjustments based on feedback pattern
        adjustments = self._calculate_adjustments(recommendation_id, action)
        feedback_record["adjustment"] = adjustments
        
        return {
            "status": "recorded",
            "feedback_id": recommendation_id,
            "adjustments_made": adjustments
        }
    
    def _calculate_adjustments(self, rec_id: str, action: str) -> List[Dict]:
        """
        Based on feedback, suggest threshold adjustments
        """
        adjustments = []
        
        if action == "REJECTED":
            # REJECTED recommendation → increase risk threshold
            adjustments.append({
                "adjustment_type": "RAISE_RISK_THRESHOLD",
                "reason": "Recommendation rejected by analyst",
                "recommended_priority": "Low (revisit in 30 days)",
                "suggested_change": "+0.05 to risk threshold",
                "impact": "More conservative recommendations"
            })
        
        elif action == "DEFERRED":
            adjustments.append({
                "adjustment_type": "RESCHEDULE_REVIEW",
                "reason": "Analyst deferring decision",
                "recommended_priority": "Medium",
                "suggested_change": "Re-evaluate in 30-60 days",
                "impact": "Deferred items tracked for follow-up"
            })
        
        elif action == "APPROVED":
            adjustments.append({
                "adjustment_type": "CONFIDENCE_INCREASE",
                "reason": "Recommendation validated",
                "recommended_priority": "High",
                "suggested_change": "Increase confidence in similar cases",
                "impact": "More aggressive on similar patterns"
            })
        
        elif action == "CUSTOM_ACTION":
            adjustments.append({
                "adjustment_type": "CUSTOM_ACTION_RECORDED",
                "reason": "Custom remediation taken",
                "recommended_priority": "Medium",
                "suggested_change": "Record for future reference",
                "impact": "Understand actual remediation patterns"
            })
        
        return adjustments
    
    def get_feedback_summary(self, permission_id: str = None, user_id: str = None) -> Dict:
        """
        Summarize feedback patterns
        """
        approved = sum(1 for f in self.storage.values() if f["action"] == "APPROVED")
        rejected = sum(1 for f in self.storage.values() if f["action"] == "REJECTED")
        deferred = sum(1 for f in self.storage.values() if f["action"] == "DEFERRED")
        custom = sum(1 for f in self.storage.values() if f["action"] == "CUSTOM_ACTION")
        
        total = len(self.storage)
        
        return {
            "total_feedback": total,
            "approved": approved,
            "rejected": rejected,
            "deferred": deferred,
            "custom_actions": custom,
            "approval_rate": f"{approved / max(total, 1) * 100:.1f}%",
            "rejection_rate": f"{rejected / max(total, 1) * 100:.1f}%",
            "system_health": self._assess_system_health(approved, rejected, total),
            "recommended_action": self._get_recommended_action(approved, rejected, total)
        }
    
    @staticmethod
    def _assess_system_health(approved: int, rejected: int, total: int) -> str:
        """Assess whether system is performing well"""
        if total < 5:
            return "Insufficient data (need >5 feedback records)"
        
        approval_rate = approved / total if total > 0 else 0
        
        if approval_rate > 0.75:
            return "EXCELLENT (high accuracy)"
        elif approval_rate > 0.65:
            return "GOOD (acceptable accuracy)"
        elif approval_rate > 0.50:
            return "FAIR (needs tuning)"
        else:
            return "POOR (high false positive rate)"
    
    @staticmethod
    def _get_recommended_action(approved: int, rejected: int, total: int) -> str:
        """Get actionable recommendation based on feedback"""
        if total == 0:
            return "Collect feedback to evaluate system"
        
        approval_rate = approved / total
        
        if approval_rate > 0.75:
            return "System performing well. Monitor for degradation."
        elif approval_rate > 0.65:
            return "System acceptable. Consider minor tuning."
        elif approval_rate > 0.50:
            return "Review recommendation threshold. Raise risk thresholds to reduce false positives."
        else:
            return "System needs major review. Many false positives. Significantly raise risk thresholds."
    
    def get_all_feedback(self) -> Dict:
        """Return all stored feedback"""
        return self.storage
    
    def get_feedback_by_analyst(self, analyst: str) -> List[Dict]:
        """Get all feedback from specific analyst"""
        return [f for f in self.storage.values() if f.get("analyst") == analyst]
    
    def export_feedback(self) -> str:
        """Export feedback as JSON"""
        return json.dumps(self.storage, indent=2)
    
    def calculate_recommendation_adjustments(self) -> Dict:
        """
        Based on feedback patterns, calculate what adjustments should be made
        to recommendations
        """
        summary = self.get_feedback_summary()
        
        adjustments = {
            "recommendation_adjustments": [],
            "threshold_adjustments": {},
            "confidence_multipliers": {}
        }
        
        if summary["rejection_rate"] and float(summary["rejection_rate"].rstrip("%")) > 40:
            adjustments["threshold_adjustments"]["risk_threshold"] = "+0.10 (raise by 10%)"
            adjustments["recommendation_adjustments"].append(
                "Consider REMOVE actions only for risk > 0.95 (more conservative)"
            )
        
        if summary["approval_rate"] and float(summary["approval_rate"].rstrip("%")) > 80:
            adjustments["confidence_multipliers"]["similar_cases"] = 1.2
            adjustments["recommendation_adjustments"].append(
                "Increase confidence in recommendations of this type"
            )
        
        return adjustments
