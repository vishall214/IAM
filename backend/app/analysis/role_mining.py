"""
STEP 4: Role Mining Module
Generates minimal, optimized roles from clusters
Includes IMPROVEMENTS 1 & 2: Role optimization + deduplication
"""
from typing import Dict, List, Any, Tuple
import logging
from .role_optimizer import RoleOptimizer

logger = logging.getLogger(__name__)


class RoleMiner:
    """Mines candidate roles from user clusters"""
    
    def __init__(self, core_threshold: float = 0.70, enable_optimization: bool = True,
                 enable_deduplication: bool = True, similarity_threshold: float = 0.75):
        self.core_threshold = core_threshold
        self.enable_optimization = enable_optimization
        self.enable_deduplication = enable_deduplication
        self.similarity_threshold = similarity_threshold
        self.role_optimizer = RoleOptimizer() if enable_optimization else None
    
    def mine_roles(self, clusters: Dict[str, Any], vectors: Dict[str, Dict], 
                  permissions: List[Dict] = None) -> Dict[str, Any]:
        """
        Generate candidate roles from clusters with optimization and deduplication
        
        Returns: {role_id: {role_name, permissions, coverage, justification}}
        """
        
        roles = {}
        
        # PHASE 1: Generate candidate roles (with optimization if enabled)
        for cluster_id, cluster_info in clusters.items():
            role_id = f"role_{cluster_id.split('_')[1]}"
            
            # IMPROVEMENT 1: Use optimizer if enabled, else fallback to threshold
            if self.enable_optimization and self.role_optimizer and permissions:
                opt_result = self.role_optimizer.optimize_roles_for_cluster(
                    cluster_id,
                    cluster_info["users"],
                    vectors,
                    permissions
                )
                core_perms = opt_result["permissions"]
                justification = opt_result.get("justification", "Optimized role")
            else:
                core_perms = self._extract_core_permissions(
                    cluster_info["users"],
                    vectors,
                    self.core_threshold
                )
                justification = f"Minimal role extracted from {len(cluster_info['users'])} user cluster"
            
            # Calculate role coverage
            coverage = len(core_perms) / max(len(cluster_info["permissions"]), 1) * 100
            
            roles[role_id] = {
                "role_id": role_id,
                "role_name": f"Role_{cluster_id}",
                "source_cluster": cluster_id,
                "permissions": core_perms,
                "coverage": f"{coverage:.1f}%",
                "user_count": len(cluster_info["users"]),
                "users": cluster_info["users"],
                "dominance_threshold": f"{self.core_threshold * 100:.0f}%",
                "notes": justification
            }
        
        # PHASE 2: Deduplicate similar roles if enabled
        if self.enable_deduplication:
            deduplicated_roles, merge_map = self.deduplicate_roles(roles)
            
            # Store merge history in metadata
            roles["_deduplication_metadata"] = {
                "merge_map": merge_map,
                "original_count": len([r for r in roles if not r.startswith("_")]),
                "final_count": len([r for r in deduplicated_roles if not r.startswith("_")]),
                "similarity_threshold": self.similarity_threshold
            }
            
            return deduplicated_roles
        
        return roles
    
    def deduplicate_roles(self, roles: Dict, similarity_threshold: float = None) -> Tuple[Dict, Dict]:
        """
        IMPROVEMENT 2: Merge similar roles to reduce role inflation
        
        Returns:
            deduplicated_roles: Roles after merging similar ones
            merge_map: Who was merged into whom (for explainability)
        """
        if similarity_threshold is None:
            similarity_threshold = self.similarity_threshold
        
        # Filter out metadata entries
        role_ids = [r for r in roles.keys() if not r.startswith("_")]
        
        if len(role_ids) < 2:
            return roles, {}
        
        # PHASE 1: Compute pairwise Jaccard similarities
        similarities = {}
        
        for i, role_id_1 in enumerate(role_ids):
            for role_id_2 in role_ids[i+1:]:
                jaccard = self._compute_jaccard_similarity(
                    set(roles[role_id_1]["permissions"]),
                    set(roles[role_id_2]["permissions"])
                )
                
                if jaccard > similarity_threshold:
                    similarities[(role_id_1, role_id_2)] = jaccard
        
        # PHASE 2: Find connected components (groups of similar roles)
        merge_groups = self._find_connected_components(role_ids, similarities)
        
        # PHASE 3: Merge each group
        deduplicated = {}
        merge_map = {}
        role_counter = 0
        
        for group in merge_groups:
            if len(group) == 1:
                # No merges in this group
                role_id = group[0]
                deduplicated[role_id] = roles[role_id]
                merge_map[role_id] = {
                    "status": "kept",
                    "reason": "unique role"
                }
            else:
                # Merge group: compute intersection of permissions
                common_perms = self._compute_intersection_permissions(group, roles)
                
                new_role_id = f"role_base_{role_counter}"
                role_counter += 1
                
                deduplicated[new_role_id] = {
                    "role_id": new_role_id,
                    "role_name": f"BaseRole_{role_counter}",
                    "permissions": common_perms,
                    "coverage": "merged",
                    "user_count": sum(roles[r]["user_count"] for r in group),
                    "merged_from": group,
                    "merged_from_count": len(group),
                    "notes": (
                        f"Merged from {len(group)} similar roles; "
                        f"common permissions: {common_perms}; "
                        f"covers {sum(roles[r]['user_count'] for r in group)} users"
                    )
                }
                
                # Record merges for all source roles
                for role_id in group:
                    merge_map[role_id] = {
                        "status": "merged",
                        "merged_into": new_role_id,
                        "similarity_score": similarities.get((group[0], role_id), 
                                                           similarities.get((role_id, group[0]), 1.0))
                    }
        
        # Preserve metadata
        if "_deduplication_metadata" in roles:
            deduplicated["_deduplication_metadata"] = roles["_deduplication_metadata"]
        
        return deduplicated, merge_map
    
    @staticmethod
    def _compute_jaccard_similarity(set_a: set, set_b: set) -> float:
        """Jaccard similarity = |intersection| / |union|"""
        if not set_a and not set_b:
            return 1.0
        
        intersection = len(set_a & set_b)
        union = len(set_a | set_b)
        
        return intersection / union if union > 0 else 0.0
    
    def _find_connected_components(self, nodes: List[str], edges_dict: Dict) -> List[List[str]]:
        """Find groups of similar roles using graph connectivity"""
        graph = {node: [] for node in nodes}
        
        for (a, b) in edges_dict.keys():
            graph[a].append(b)
            graph[b].append(a)
        
        visited = set()
        components = []
        
        def dfs(node, component):
            visited.add(node)
            component.append(node)
            for neighbor in graph[node]:
                if neighbor not in visited:
                    dfs(neighbor, component)
        
        for node in nodes:
            if node not in visited:
                component = []
                dfs(node, component)
                components.append(component)
        
        return components
    
    @staticmethod
    def _compute_intersection_permissions(role_ids: List[str], roles: Dict) -> List[str]:
        """Find common permissions across all roles in group"""
        if not role_ids:
            return []
        
        common = set(roles[role_ids[0]]["permissions"])
        
        for role_id in role_ids[1:]:
            common = common & set(roles[role_id]["permissions"])
        
        return sorted(list(common))
    
    def _extract_core_permissions(self, users: List[str], vectors: Dict[str, Dict], threshold: float) -> List[str]:
        """
        Extract permissions used by >threshold of users
        """
        if not users:
            return []
        
        # Count permission usage
        perm_usage = {}
        for user_id in users:
            if user_id in vectors:
                for perm_id in vectors[user_id].keys():
                    if perm_id not in perm_usage:
                        perm_usage[perm_id] = 0
                    perm_usage[perm_id] += 1
        
        # Filter by threshold
        user_count = len(users)
        core_perms = [
            perm_id for perm_id, count in perm_usage.items()
            if count / user_count >= threshold
        ]
        
        return sorted(core_perms)
