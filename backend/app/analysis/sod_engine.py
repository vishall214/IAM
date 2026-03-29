"""
Separation of Duties (SoD) Constraint Engine
Detects and flags role violations against SoD policies
IMPROVEMENT 4: Constraint-aware role generation
"""
from typing import Dict, List, Tuple
import logging

logger = logging.getLogger(__name__)


class SoDConstraint:
    """Rule-based Separation of Duties constraint engine"""
    
    def __init__(self, constraints: List[Dict] = None):
        self.constraints = constraints or self._default_constraints()
    
    @staticmethod
    def _default_constraints() -> List[Dict]:
        """Default SoD rules for common domains"""
        return [
            {
                "name": "Finance: Cannot approve and audit own transactions",
                "severity": "CRITICAL",
                "conflict_pairs": [
                    ("payment_approve", "audit_logs"),
                    ("budget_approve", "budget_review"),
                    ("invoice_approve", "invoice_audit")
                ]
            },
            {
                "name": "Developer: Cannot commit and deploy own code",
                "severity": "HIGH",
                "conflict_pairs": [
                    ("code_commit", "deploy_prod"),
                    ("code_review", "deploy_prod"),
                    ("write_code", "deploy_service")
                ]
            },
            {
                "name": "Admin: Cannot administer and audit own actions",
                "severity": "HIGH",
                "conflict_pairs": [
                    ("admin_access", "admin_logs"),
                    ("user_create", "user_audit"),
                    ("role_assign", "role_audit")
                ]
            },
            {
                "name": "Security: Cannot configure and audit security controls",
                "severity": "CRITICAL",
                "conflict_pairs": [
                    ("security_policy_set", "security_audit"),
                    ("mfa_configure", "mfa_audit")
                ]
            }
        ]
    
    def check_role_violations(self, permissions: List[str]) -> List[Dict]:
        """
        Check if role violates any SoD constraint
        
        Args:
            permissions: List of permission IDs in role
        
        Returns:
            List of violations found
        """
        violations = []
        perm_set = set(permissions)
        
        for constraint in self.constraints:
            for perm_a, perm_b in constraint["conflict_pairs"]:
                if perm_a in perm_set and perm_b in perm_set:
                    violations.append({
                        "type": "SoD_VIOLATION",
                        "constraint_name": constraint["name"],
                        "severity": constraint["severity"],
                        "conflicting_permissions": [perm_a, perm_b],
                        "remediation": f"Split role: separate '{perm_a}' from '{perm_b}'",
                        "risk_penalty": 0.3  # Add 30% to risk score
                    })
        
        return violations
    
    def get_constraints(self) -> List[Dict]:
        """Return all configured constraints"""
        return self.constraints
    
    def add_constraint(self, name: str, severity: str, conflict_pairs: List[Tuple]) -> None:
        """Add new SoD constraint"""
        self.constraints.append({
            "name": name,
            "severity": severity,
            "conflict_pairs": conflict_pairs
        })
    
    def check_user_permissions(self, user_perms: List[str]) -> Dict:
        """
        Check if a user's permissions violate SoD
        
        Returns dict with violations and summary
        """
        violations = self.check_role_violations(user_perms)
        
        return {
            "user_permissions": user_perms,
            "violations_found": len(violations) > 0,
            "violation_count": len(violations),
            "violations": violations,
            "compliance_status": "NON_COMPLIANT" if violations else "COMPLIANT"
        }
