from pydantic import BaseModel
from typing import List, Dict, Optional
from datetime import datetime

# Input Schemas
class UserBase(BaseModel):
    user_id: str
    department: Optional[str] = None

class User(UserBase):
    class Config:
        orm_mode = True

class PermissionBase(BaseModel):
    permission_id: str
    sensitivity_level: str  # low, medium, high, critical

class Permission(PermissionBase):
    class Config:
        orm_mode = True

class AccessLogBase(BaseModel):
    user_id: str
    permission_id: str
    timestamp: str  # ISO format
    frequency: int

class AccessLog(AccessLogBase):
    class Config:
        orm_mode = True

# Analysis Input
class AnalysisRequest(BaseModel):
    users: List[UserBase]
    permissions: List[PermissionBase]
    access_logs: List[AccessLogBase]

# Output Schemas
class ClusterSummary(BaseModel):
    cluster_id: str
    cluster_name: str
    users: List[str]
    department: Optional[str]
    user_count: int
    cohesion_score: float
    dominant_permissions: List[str]
    characteristics: str
    alerts: Optional[List[str]] = []

class RolePermission(BaseModel):
    permission_id: str
    sensitivity: str
    justification: str

class RoleSummary(BaseModel):
    role_id: str
    role_name: str
    source_cluster: str
    permissions: List[RolePermission]
    coverage: str
    user_count: int
    notes: str

class RiskComponent(BaseModel):
    sensitivity: float
    infrequency: float
    peer_deviation: float
    recency: float

class RiskScore(BaseModel):
    user_id: str
    permission_id: str
    risk_score: float
    risk_level: str
    components: RiskComponent
    flag: Optional[str] = None

class RecommendationMetrics(BaseModel):
    sensitivity: Optional[str] = None
    usage_frequency: Optional[str] = None
    recency_days: Optional[int] = None
    peer_prevalence: Optional[str] = None
    global_prevalence: Optional[str] = None
    role_alignment: Optional[str] = None
    cluster_baseline: Optional[str] = None

class Recommendation(BaseModel):
    priority: int
    action_type: str  # REMOVE, REVIEW, MONITOR
    user_id: str
    permission_id: str
    risk_score: float
    reason: str
    impact: str
    metrics: RecommendationMetrics
    resolution_options: Optional[List[str]] = []
    urgency: str

class Explanations(BaseModel):
    methodology: str
    role_mining_strategy: str
    risk_formula: str
    key_insights: List[str]

class SummaryState(BaseModel):
    total_permissions_assigned: int
    critical_risk_permissions: int
    high_risk_permissions: int
    medium_risk_permissions: int

class AnalysisSummary(BaseModel):
    current_state: SummaryState
    post_recommendation: SummaryState

class AnalysisResponse(BaseModel):
    metadata: Dict
    clusters: List[ClusterSummary]
    roles: List[RoleSummary]
    risk_scores: List[RiskScore]
    recommendations: List[Recommendation]
    explanations: Explanations
    summary: AnalysisSummary
