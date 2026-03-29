#!/usr/bin/env python
"""Test script to verify recommendations include required fields"""

from analysis.recommendations import generate_recommendations

# Test data
risk_scores = [
    {
        'user_id': 'U1',
        'permission_id': 'deploy_prod',
        'risk_score': 0.85,
        'risk_level': 'MEDIUM-HIGH',
        'components': {'sensitivity': 0.9, 'infrequency': 0.7, 'peer_deviation': 0.3, 'recency': 0.2},
        'flag': 'REVIEW'
    }
]

access_logs = [
    {'user_id': 'U1', 'permission_id': 'deploy_prod', 'timestamp': '2026-03-25', 'frequency': 2}
]

permissions = [
    {'permission_id': 'deploy_prod', 'sensitivity_level': 'high'}
]

clusters = {'C1': ['U1']}
user_cluster_map = {'U1': 'C1'}

recs = generate_recommendations(risk_scores, access_logs, permissions, clusters, user_cluster_map)

if recs:
    rec = recs[0]
    print(f"✓ Recommendation generated")
    print(f"  - user_id: {rec.get('user_id')} {'✓' if rec.get('user_id') else '✗ MISSING'}")
    print(f"  - permission_id: {rec.get('permission_id')} {'✓' if rec.get('permission_id') else '✗ MISSING'}")
    print(f"  - id: {rec.get('id')} {'✓' if rec.get('id') else '✗ MISSING'}")
    print(f"  - status: {rec.get('status')} {'✓' if rec.get('status') else '✗ MISSING'}")
    print(f"  - confidence: {rec.get('confidence')} {'✓' if rec.get('confidence') else '✗ MISSING'}")
    print(f"\nFull recommendation:")
    import json
    print(json.dumps(rec, indent=2))
else:
    print("✗ No recommendations generated")
