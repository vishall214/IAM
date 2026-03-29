"""
Database Models for AccessMind
"""

from sqlalchemy import Column, String, Integer, Float, DateTime, Text, JSON
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
