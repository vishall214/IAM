"""
STEP 4: ROLE MINING
Extract minimal permission sets from clusters
"""

from typing import Dict, List, Tuple

def mine_roles(clusters: Dict[str, List[str]], 
               access_logs: List[Dict],
               permissions: List[Dict],
               threshold: float = 0.7) -> Dict:
    """
    Extract candidate roles from clusters.
    
    Core permissions: used by >threshold (70%) of cluster
    Optional permissions: used by minority
    """
    roles = {}
    role_counter = 0
    
    for cluster_id, cluster_users in clusters.items():
        role_counter += 1
        role_id = f"R{role_counter}"
        
        # Count permission usage in cluster
        perm_usage = {}
        for user in cluster_users:
            user_perms = set()
            for log in access_logs:
                if log["user_id"] == user:
                    user_perms.add(log["permission_id"])
            
            for perm in user_perms:
                perm_usage[perm] = perm_usage.get(perm, 0) + 1
        
        # Classify permissions
        cluster_size = len(cluster_users)
        core_perms = []
        optional_perms = []
        
        for perm, count in perm_usage.items():
            prevalence = count / cluster_size
            
            if prevalence >= threshold:
                core_perms.append(perm)
            else:
                optional_perms.append(perm)
        
        # Generate role name
        role_name = generate_role_name(cluster_id, core_perms)
        
        # Get sensitivity for each permission
        perm_sensitivity = {p["permission_id"]: p["sensitivity_level"] for p in permissions}
        
        roles[role_id] = {
            "role_name": role_name,
            "source_cluster": cluster_id,
            "core_permissions": core_perms,
            "optional_permissions": optional_perms,
            "permissions": core_perms,  # MVP: only core
            "coverage": f"{(len(core_perms) / max(1, len(perm_usage)) * 100):.0f}%",
            "user_count": cluster_size,
            "justifications": {
                perm: f"{'100% of cluster' if perm in core_perms else 'Minority use'}: {perm} is {'core' if perm in core_perms else 'specialized'} to {role_name}"
                for perm in core_perms
            }
        }
    
    return roles

def generate_role_name(cluster_id: str, core_perms: List[str]) -> str:
    """Generate descriptive role name from cluster ID and permissions"""
    name_map = {
        "ClusterA": "Engineer",
        "ClusterB": "Analyst",
        "ClusterC": "Administrator",
        "ClusterD": "Operator"
    }
    
    base_name = name_map.get(cluster_id, "Specialist")
    
    # Add specialization from permissions
    if "admin_access" in core_perms or "deploy_service" in core_perms:
        return f"{base_name}"
    elif "view_salary" in core_perms or "edit_employee" in core_perms:
        return f"{base_name.replace('Analyst', 'Specialist')}"
    
    return base_name

def validate_role_assignments(roles: Dict, users_to_roles: Dict) -> Dict:
    """
    Validate role assignments are reasonable
    Return coverage and gaps
    """
    validation = {
        "total_users": len(users_to_roles),
        "assigned_users": sum(1 for u in users_to_roles.values() if u),
        "unassigned": sum(1 for u in users_to_roles.values() if not u),
        "coverage_pct": 100 * sum(1 for u in users_to_roles.values() if u) / max(1, len(users_to_roles))
    }
    
    return validation
