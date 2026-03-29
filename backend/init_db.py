"""
Database Initialization Script
Initializes database tables and sample data for testing
"""

import uuid
from datetime import datetime
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from app.models.database import (
    Base,
    UserPermissionAssignment,
    Recommendation,
)
from config import DATABASE_URL


def init_database():
    """Initialize database and create all tables"""
    engine = create_engine(DATABASE_URL)
    Base.metadata.create_all(bind=engine)
    print("✓ Database tables created")


def seed_sample_data():
    """Seed sample data for testing"""
    engine = create_engine(DATABASE_URL)
    SessionLocal = sessionmaker(bind=engine)
    db = SessionLocal()
    
    try:
        # Clear existing data
        db.query(UserPermissionAssignment).delete()
        db.query(Recommendation).delete()
        db.commit()
        print("✓ Cleared existing data")
        
        # Sample user-permission assignments
        sample_assignments = [
            ("U1", "read_code", True),
            ("U1", "write_code", True),
            ("U1", "access_database", True),
            ("U2", "read_code", True),
            ("U2", "view_logs", True),
            ("U3", "read_code", True),
            ("U3", "access_database", True),
            ("U3", "view_salary", False),  # Should be revoked
            ("U4", "read_code", True),
            ("U4", "write_code", False),  # Should be revoked
        ]
        
        for user_id, permission_id, is_active in sample_assignments:
            assignment = UserPermissionAssignment(
                id=str(uuid.uuid4()),
                user_id=user_id,
                permission_id=permission_id,
                assigned_at=datetime.utcnow(),
                is_active="true" if is_active else "false",
                revoked_at=datetime.utcnow() if not is_active else None
            )
            db.add(assignment)
        
        db.commit()
        print("✓ Seeded sample user-permission assignments")
        
        # Sample recommendations
        sample_recommendations = [
            ("U1", "read_code", "REMOVE", "High sensitivity access with infrequent usage"),
            ("U2", "view_logs", "REVIEW", "Access pattern anomaly detected"),
            ("U3", "access_database", "MONITOR", "Schedule review in 90 days"),
        ]
        
        for user_id, permission_id, action_type, reason in sample_recommendations:
            rec = Recommendation(
                id=str(uuid.uuid4()),
                priority=1,
                action_type=action_type,
                user_id=user_id,
                permission_id=permission_id,
                risk_score=0.75,
                reason=reason,
                impact="Reduces security risk",
                metrics={},
                status="pending"
            )
            db.add(rec)
        
        db.commit()
        print("✓ Seeded sample recommendations")
        
    except Exception as e:
        print(f"✗ Error seeding data: {e}")
        db.rollback()
    finally:
        db.close()


if __name__ == "__main__":
    print("Initializing IAM database...")
    init_database()
    seed_sample_data()
    print("\n✓ Database initialization complete!")
