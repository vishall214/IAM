#!/usr/bin/env python3
"""
Quick test script for AccessMind backend
"""

import json
from app.analysis.orchestrator import IdentityGovernanceAnalyzer
from test_data import SAMPLE_DATA_SMALL

def test_analysis():
    print("=" * 60)
    print("AccessMind - Backend Test")
    print("=" * 60)
    
    analyzer = IdentityGovernanceAnalyzer()
    result = analyzer.analyze(SAMPLE_DATA_SMALL)
    
    print("\nResults Summary:")
    print(f"Status: {result['metadata']['status']}")
    print(f"Clusters: {len(result['clusters'])}")
    print(f"Roles: {len(result['roles'])}")
    print(f"Risk Scores: {len(result['risk_scores'])}")
    print(f"Recommendations: {len(result['recommendations'])}")
    
    # Print top recommendations
    print("\nTop 3 Recommendations:")
    for i, rec in enumerate(result['recommendations'][:3], 1):
        print(f"{i}. [{rec['action_type']}] {rec['user_id']}.{rec['permission_id']} - Risk: {rec['risk_score']}")
    
    # Save full result
    with open('results.json', 'w') as f:
        json.dump(result, f, indent=2)
    print("\nFull results saved to results.json")

if __name__ == "__main__":
    test_analysis()
