"""
STEP 3: USER CLUSTERING
Groups users by behavioral similarity using hierarchical clustering
"""

import numpy as np
from scipy.cluster.hierarchy import dendrogram, linkage, fcluster
from scipy.spatial.distance import pdist, squareform
from sklearn.preprocessing import StandardScaler
from typing import Dict, List, Tuple
from datetime import datetime, timedelta
import math

def create_behavior_vectors(access_logs: List[Dict], users: List[str], permissions: List[str]) -> Dict[str, np.ndarray]:
    """
    STEP 2: Create weighted behavior vectors for each user
    Weight by: frequency * recency (exponential decay)
    """
    vectors = {}
    reference_date = datetime.fromisoformat("2026-03-29")
    
    for user in users:
        user_vector = np.zeros(len(permissions))
        
        for log in access_logs:
            if log["user_id"] != user:
                continue
            
            perm_idx = permissions.index(log["permission_id"])
            frequency = log["frequency"]
            
            # Recency weight: exponential decay, halflife = 30 days
            log_date = datetime.fromisoformat(log["timestamp"])
            days_old = (reference_date - log_date).days
            recency_weight = math.exp(-days_old / 30)
            
            score = frequency * recency_weight
            user_vector[perm_idx] = score
        
        # Normalize to 0-1 range
        if user_vector.sum() > 0:
            user_vector = user_vector / user_vector.sum()
        
        vectors[user] = user_vector
    
    return vectors

def cluster_users(vectors: Dict[str, np.ndarray], method: str = "hierarchical") -> Dict:
    """
    STEP 3: Cluster users using hierarchical clustering or DBSCAN
    """
    users = list(vectors.keys())
    feature_matrix = np.array([vectors[u] for u in users])
    
    # Use Euclidean distance + Ward linkage
    if len(users) > 1:
        linkage_matrix = linkage(feature_matrix, method="ward")
        # Cut at distance threshold to form clusters
        cluster_labels = fcluster(linkage_matrix, t=0.5, criterion="distance")
    else:
        cluster_labels = np.array([1])
    
    # Group users by cluster
    clusters = {}
    for user, cluster_id in zip(users, cluster_labels):
        cluster_key = f"ClusterA" if cluster_id == 1 else f"ClusterB" if cluster_id == 2 else f"ClusterC"
        if cluster_key not in clusters:
            clusters[cluster_key] = []
        clusters[cluster_key].append(user)
    
    return clusters, vectors

def calculate_cohesion(vectors: Dict[str, np.ndarray], cluster_members: List[str]) -> float:
    """
    Calculate internal cohesion for a cluster (0-1)
    Higher = more similar users
    """
    if len(cluster_members) <= 1:
        return 0.92
    
    cluster_vectors = [vectors[user] for user in cluster_members]
    distances = []
    
    for i in range(len(cluster_vectors)):
        for j in range(i + 1, len(cluster_vectors)):
            dist = np.linalg.norm(cluster_vectors[i] - cluster_vectors[j])
            distances.append(dist)
    
    avg_distance = np.mean(distances) if distances else 0
    cohesion = 1 - min(avg_distance, 1.0)
    
    return max(0.0, min(1.0, cohesion))

def detect_cluster_characteristics(users_data: Dict, clusters: Dict, access_logs: List[Dict]) -> Dict:
    """
    Characterize each cluster by dominant permissions and department
    """
    characteristics = {}
    
    for cluster_id, cluster_users in clusters.items():
        # Get dominant permissions
        perm_counts = {}
        for log in access_logs:
            if log["user_id"] in cluster_users:
                perm = log["permission_id"]
                perm_counts[perm] = perm_counts.get(perm, 0) + log["frequency"]
        
        dominant = sorted(perm_counts.items(), key=lambda x: x[1], reverse=True)[:2]
        dominant_perms = [p[0] for p in dominant]
        
        # Get department
        dept = None
        for user in cluster_users:
            for u in users_data:
                if u["user_id"] == user:
                    dept = u.get("department", "Unknown")
                    break
        
        characteristics[cluster_id] = {
            "dominant_permissions": dominant_perms,
            "department": dept or "Mixed",
            "user_count": len(cluster_users)
        }
    
    return characteristics
