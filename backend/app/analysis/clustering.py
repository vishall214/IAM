"""
STEP 3: User Clustering Module
Groups users by behavior similarity using Hierarchical Clustering
"""
from typing import Dict, List, Tuple, Any
from scipy.cluster.hierarchy import dendrogram, linkage, fcluster
from scipy.spatial.distance import pdist, squareform
import numpy as np
import logging

logger = logging.getLogger(__name__)


class UserClusterer:
    """Clusters users based on behavior vectors"""
    
    def __init__(self, min_cluster_size: int = 1, max_clusters: int = 10, distance_threshold: float = 0.5):
        self.min_cluster_size = min_cluster_size
        self.max_clusters = max_clusters
        self.distance_threshold = distance_threshold
    
    def cluster_users(self, vectors: Dict[str, Dict], permissions: List[Dict]) -> Dict[str, Any]:
        """
        Cluster users based on behavior vectors
        Returns: {cluster_id: {users, permissions, cohesion_score}}
        """
        
        if not vectors:
            return {}
        
        # Convert vectors to matrix format
        user_ids = sorted(vectors.keys())
        permission_ids = sorted(set().union(*[set(v.keys()) for v in vectors.values()]))
        
        # Create matrix: rows = users, columns = permissions
        matrix = np.zeros((len(user_ids), len(permission_ids)))
        
        for i, uid in enumerate(user_ids):
            for j, pid in enumerate(permission_ids):
                matrix[i, j] = vectors[uid].get(pid, 0)
        
        # Handle edge cases
        if len(user_ids) == 1:
            return {
                "cluster_0": {
                    "cluster_id": "cluster_0",
                    "cluster_name": f"Cluster {0}",
                    "users": user_ids,
                    "permissions": permission_ids,
                    "user_count": 1,
                    "cohesion_score": 1.0,
                    "characteristics": "Single user cluster"
                }
            }
        
        # Perform hierarchical clustering
        try:
            # Calculate pairwise distances (1 - cosine_similarity)
            distances = pdist(matrix, metric='cosine')
            linkage_matrix = linkage(distances, method='ward')
            
            # Cut dendrogram at distance threshold
            clusters = fcluster(linkage_matrix, self.distance_threshold, criterion='distance')
        except Exception as e:
            logger.warning(f"Clustering failed: {e}. Using single cluster.")
            clusters = np.ones(len(user_ids), dtype=int)
        
        # Group users by cluster
        cluster_dict = {}
        for user_id, cluster_id in zip(user_ids, clusters):
            c_id = f"cluster_{cluster_id}"
            if c_id not in cluster_dict:
                cluster_dict[c_id] = []
            cluster_dict[c_id].append(user_id)
        
        # Calculate cluster metrics
        result = {}
        for c_id, users in cluster_dict.items():
            cluster_vectors = [vectors[uid] for uid in users]
            dominant_perms = self._get_dominant_permissions(cluster_vectors, permission_ids, threshold=0.3)
            cohesion = self._calculate_cohesion(cluster_vectors)
            
            result[c_id] = {
                "cluster_id": c_id,
                "cluster_name": f"Cluster ({len(users)} users)",
                "users": users,
                "permissions": permission_ids,
                "dominant_permissions": dominant_perms,
                "user_count": len(users),
                "cohesion_score": cohesion
            }
        
        return result
    
    def _get_dominant_permissions(self, vectors: List[Dict], all_perms: List[str], threshold: float = 0.3) -> List[str]:
        """Get permissions used by majority of cluster"""
        if not vectors:
            return []
        
        usage_count = {pid: 0 for pid in all_perms}
        for v in vectors:
            for pid in v:
                usage_count[pid] += 1
        
        cluster_size = len(vectors)
        dominant = [pid for pid, count in usage_count.items() if count / cluster_size >= threshold]
        
        return sorted(dominant)
    
    def _calculate_cohesion(self, vectors: List[Dict]) -> float:
        """Calculate cluster cohesion (average pairwise similarity)"""
        if len(vectors) <= 1:
            return 1.0
        
        similarities = []
        all_perms = set().union(*[set(v.keys()) for v in vectors])
        
        # Convert to arrays for easier comparison
        matrix = []
        for v in vectors:
            row = np.array([v.get(p, 0) for p in all_perms])
            matrix.append(row)
        
        matrix = np.array(matrix)
        
        # Calculate average cosine similarity
        n = len(matrix)
        for i in range(n):
            for j in range(i + 1, n):
                # Cosine similarity
                dot = np.dot(matrix[i], matrix[j])
                norm_i = np.linalg.norm(matrix[i])
                norm_j = np.linalg.norm(matrix[j])
                
                if norm_i > 0 and norm_j > 0:
                    sim = dot / (norm_i * norm_j)
                    similarities.append(sim)
        
        return np.mean(similarities) if similarities else 1.0
