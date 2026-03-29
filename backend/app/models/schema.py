"""
Pydantic request/response models
"""

from pydantic import BaseModel
from typing import List, Dict, Any, Optional
from datetime import datetime


# Input models
class UserInput(BaseModel):
    user_id: str
    department: Optional[str] = None
    role: Optional[str] = None


class PermissionInput(BaseModel):
    permission_id: str
    sensitivity_level: Optional[str] = "low"


class AccessLogInput(BaseModel):
    user_id: str
    permission_id: str
    timestamp: str
    frequency: int


class AnalysisInput(BaseModel):
    users: List[UserInput]
    permissions: List[PermissionInput]
    access_logs: List[AccessLogInput]


# Action Request/Response models
class ActionRequest(BaseModel):
    """Request to execute an action on a recommendation"""
    user_id: str
    permission_id: str
    recommendation_id: Optional[str] = None


class RecommendationActionResponse(BaseModel):
    """Response describing an executed action"""
    id: str
    recommendation_id: str
    user_id: str
    permission_id: str
    action_type: str
    status: str
    executed_by: str
    executed_at: str
    result_message: Optional[str] = None
    error_message: Optional[str] = None


class UpdatedRecommendationResponse(BaseModel):
    """Updated recommendation after action execution"""
    id: str
    user_id: str
    permission_id: str
    action_type: str
    priority: int
    risk_score: float
    reason: str
    impact: Optional[str] = None
    status: str
    updated_at: str


class ActionExecutionResponse(BaseModel):
    """Complete response from executing an action"""
    success: bool
    message: str
    recommendation: UpdatedRecommendationResponse
    action: RecommendationActionResponse


# Output models
class ClusterResponse(BaseModel):
    cluster_id: str
    cluster_name: str
    users: List[str]
    user_count: int
    cohesion_score: float
    dominant_permissions: List[str]


class RoleResponse(BaseModel):
    role_id: str
    role_name: str
    permissions: List[str]
    coverage: str
    user_count: int


class RiskScoreResponse(BaseModel):
    user_id: str
    permission_id: str
    risk_score: float
    risk_level: str
    components: Dict[str, float]
    flag: Optional[str] = None


class RecommendationResponse(BaseModel):
    id: str
    priority: int
    action_type: str
    user_id: str
    permission_id: str
    risk_score: float
    confidence: float
    urgency: str
    reason: str
    impact: str
    status: str
    metrics: Dict[str, Any]


class ExplanationResponse(BaseModel):
    methodology: str
    role_mining_strategy: str
    risk_formula: str
    key_insights: List[str]


class SummaryResponse(BaseModel):
    current_state: Dict[str, Any]
    post_recommendation: Dict[str, Any]


class AnalysisResponse(BaseModel):
    metadata: Dict[str, Any]
    clusters: List[ClusterResponse]
    roles: List[RoleResponse]
    risk_scores: List[RiskScoreResponse]
    recommendations: List[RecommendationResponse]
    explanations: ExplanationResponse
    summary: SummaryResponse
