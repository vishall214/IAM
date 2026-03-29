"""
Database Models for AccessMind
"""

from sqlalchemy import Column, String, Integer, Float, DateTime, Text, JSON, ForeignKey
from sqlalchemy.ext.declarative import declarative_base
from datetime import datetime

Base = declarative_base()


class AnalysisJob(Base):
    """Store analysis job metadata"""
    __tablename__ = "analysis_jobs"
    
    id = Column(String, primary_key=True)
    status = Column(String, default="PENDING")  # PENDING, RUNNING, COMPLETED, FAILED
    created_at = Column(DateTime, default=datetime.utcnow)
    completed_at = Column(DateTime, nullable=True)
    input_data = Column(JSON)
    result = Column(JSON)
    error = Column(Text, nullable=True)


class Cluster(Base):
    """Store cluster results"""
    __tablename__ = "clusters"
    
    id = Column(String, primary_key=True)
    job_id = Column(String)
    cluster_id = Column(String)
    cluster_name = Column(String)
    users = Column(JSON)
    cohesion_score = Column(Float)
    user_count = Column(Integer)


class Role(Base):
    """Store mined roles"""
    __tablename__ = "roles"
    
    id = Column(String, primary_key=True)
    job_id = Column(String)
    role_id = Column(String)
    role_name = Column(String)
    permissions = Column(JSON)
    coverage = Column(String)
    user_count = Column(Integer)


class RiskScore(Base):
    """Store risk scores"""
    __tablename__ = "risk_scores"
    
    id = Column(String, primary_key=True)
    job_id = Column(String)
    user_id = Column(String)
    permission_id = Column(String)
    risk_score = Column(Float)
    risk_level = Column(String)
    components = Column(JSON)


class Recommendation(Base):
    """Store recommendations"""
    __tablename__ = "recommendations"
    
    id = Column(String, primary_key=True)
    job_id = Column(String)
    priority = Column(Integer)
    action_type = Column(String)
    user_id = Column(String)
    permission_id = Column(String)
    risk_score = Column(Float)
    reason = Column(Text)
    impact = Column(Text, nullable=True)
    metrics = Column(JSON, nullable=True)
    resolution_options = Column(JSON, nullable=True)
    urgency = Column(String, nullable=True)
    status = Column(String, default="pending")  # pending, reviewed, revoked, ignored
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)


class RecommendationAction(Base):
    """Store all actions executed on recommendations (audit trail)"""
    __tablename__ = "recommendation_actions"
    
    id = Column(String, primary_key=True)
    recommendation_id = Column(String, ForeignKey("recommendations.id"), nullable=False)
    user_id = Column(String, nullable=False)
    permission_id = Column(String, nullable=False)
    action_type = Column(String, nullable=False)  # revoke, review, ignore
    status = Column(String, default="completed")  # pending, completed, failed
    executed_by = Column(String, default="system")  # User who executed or "system"
    executed_at = Column(DateTime, default=datetime.utcnow)
    result_message = Column(Text, nullable=True)
    error_message = Column(Text, nullable=True)


class UserPermissionAssignment(Base):
    """Store current user-permission assignments (what can be revoked)"""
    __tablename__ = "user_permission_assignments"
    
    id = Column(String, primary_key=True)
    user_id = Column(String, nullable=False)
    permission_id = Column(String, nullable=False)
    assigned_at = Column(DateTime, default=datetime.utcnow)
    revoked_at = Column(DateTime, nullable=True)
    is_active = Column(String, default="true")  # true/false
