"""
STEP 1: Data Validation Module
Validates input data structure and quality
"""
from typing import Dict, List, Any, Tuple
from datetime import datetime
import logging

logger = logging.getLogger(__name__)


class DataValidator:
    """Validates and normalizes input data"""
    
    def __init__(self):
        self.errors = []
        self.warnings = []
    
    def validate(self, data: Dict[str, Any]) -> Tuple[bool, Dict[str, Any]]:
        """
        Validate complete dataset
        Returns: (is_valid, validation_report)
        """
        report = {
            "valid": True,
            "errors": [],
            "warnings": [],
            "data_quality": {}
        }
        
        # Check required fields
        required_fields = ["users", "permissions", "access_logs"]
        for field in required_fields:
            if field not in data or not data[field]:
                report["errors"].append(f"Missing required field: {field}")
                report["valid"] = False
        
        if not report["valid"]:
            return False, report
        
        # Validate each component
        users_valid = self._validate_users(data["users"], report)
        perms_valid = self._validate_permissions(data["permissions"], report)
        logs_valid = self._validate_access_logs(data["access_logs"], data["users"], data["permissions"], report)
        
        report["valid"] = users_valid and perms_valid and logs_valid
        return report["valid"], report
    
    def _validate_users(self, users: List[Dict], report: Dict) -> bool:
        """Validate users list"""
        if not isinstance(users, list):
            report["errors"].append("users must be a list")
            return False
        
        user_ids = set()
        for user in users:
            if "user_id" not in user:
                report["errors"].append("User missing user_id field")
                return False
            
            uid = user["user_id"]
            if uid in user_ids:
                report["warnings"].append(f"Duplicate user_id: {uid}")
            user_ids.add(uid)
        
        report["data_quality"]["total_users"] = len(users)
        report["data_quality"]["unique_users"] = len(user_ids)
        return True
    
    def _validate_permissions(self, permissions: List[Dict], report: Dict) -> bool:
        """Validate permissions list"""
        if not isinstance(permissions, list):
            report["errors"].append("permissions must be a list")
            return False
        
        valid_sensitivity_levels = {"low", "medium", "high", "critical"}
        perm_ids = set()
        
        for perm in permissions:
            if "permission_id" not in perm:
                report["errors"].append("Permission missing permission_id field")
                return False
            
            pid = perm["permission_id"]
            if pid in perm_ids:
                report["warnings"].append(f"Duplicate permission_id: {pid}")
            perm_ids.add(pid)
            
            if "sensitivity_level" in perm:
                if perm["sensitivity_level"] not in valid_sensitivity_levels:
                    report["warnings"].append(f"Unknown sensitivity level: {perm['sensitivity_level']}")
        
        report["data_quality"]["total_permissions"] = len(permissions)
        return True
    
    def _validate_access_logs(self, logs: List[Dict], users: List[Dict], permissions: List[Dict], report: Dict) -> bool:
        """Validate access logs"""
        if not isinstance(logs, list):
            report["errors"].append("access_logs must be a list")
            return False
        
        user_ids = {u["user_id"] for u in users}
        perm_ids = {p["permission_id"] for p in permissions}
        
        invalid_refs = 0
        for log in logs:
            if "user_id" not in log or "permission_id" not in log:
                report["errors"].append("Log missing user_id or permission_id")
                return False
            
            if log["user_id"] not in user_ids:
                report["warnings"].append(f"Log references unknown user_id: {log['user_id']}")
                invalid_refs += 1
            
            if log["permission_id"] not in perm_ids:
                report["warnings"].append(f"Log references unknown permission_id: {log['permission_id']}")
                invalid_refs += 1
            
            if "frequency" in log and log["frequency"] < 0:
                report["errors"].append(f"Negative frequency in log: {log['frequency']}")
                return False
        
        report["data_quality"]["total_accesses"] = len(logs)
        report["data_quality"]["invalid_references"] = invalid_refs
        return True
