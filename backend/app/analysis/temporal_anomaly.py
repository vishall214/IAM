"""
Temporal Anomaly Detection Module
Detects unusual access patterns, bursts, and timing anomalies
IMPROVEMENT 6: Temporal anomaly detection
"""
from typing import Dict, List
from datetime import datetime
import logging

logger = logging.getLogger(__name__)


class TemporalAnomalyDetector:
    """Detects unusual access patterns and temporal anomalies"""
    
    def __init__(self, std_dev_threshold: float = 3.0):
        self.std_dev_threshold = std_dev_threshold
        self.burst_window_hours = 1
        self.burst_threshold = 10  # 10+ accesses in 1 hour = burst
    
    def detect_anomalies(self, user_id: str, logs: List[Dict], 
                        reference_date: datetime) -> Dict:
        """
        Detect temporal anomalies for a user
        
        Args:
            user_id: User ID
            logs: Access logs for user
            reference_date: Reference date for calculations
        
        Returns:
            {
                "anomalies": [...],
                "anomaly_score": 0-1,
                "patterns": {...},
                "risk_flag": str or None
            }
        """
        
        if not logs:
            return {
                "user_id": user_id,
                "anomalies": [],
                "anomaly_score": 0.0,
                "patterns": {},
                "risk_flag": None
            }
        
        anomalies = []
        
        # ANOMALY 1: Spike Detection
        spike_anomaly = self._detect_frequency_spike(user_id, logs, reference_date)
        if spike_anomaly:
            anomalies.append(spike_anomaly)
        
        # ANOMALY 2: Burst Detection
        burst_anomaly = self._detect_burst_activity(user_id, logs)
        if burst_anomaly:
            anomalies.append(burst_anomaly)
        
        # ANOMALY 3: Unusual Time Patterns
        time_anomaly = self._detect_unusual_times(user_id, logs)
        if time_anomaly:
            anomalies.append(time_anomaly)
        
        # ANOMALY 4: Permission Acquisition
        perm_change_anomaly = self._detect_permission_acquisition(user_id, logs)
        if perm_change_anomaly:
            anomalies.append(perm_change_anomaly)
        
        # Calculate overall anomaly score
        anomaly_score = min(1.0, len(anomalies) * 0.2)  # Each anomaly adds 0.2
        
        return {
            "user_id": user_id,
            "anomalies": anomalies,
            "anomaly_score": anomaly_score,
            "pattern_summary": self._summarize_patterns(logs),
            "risk_flag": "TEMPORAL_ANOMALY" if len(anomalies) > 0 else None
        }
    
    def _detect_frequency_spike(self, user_id: str, logs: List[Dict], 
                               reference_date: datetime) -> Dict or None:
        """Detect if frequency is unusually high"""
        if not logs:
            return None
        
        frequencies = {}
        for log in logs:
            perm = log["permission_id"]
            if perm not in frequencies:
                frequencies[perm] = []
            frequencies[perm].append(log)
        
        spike_detected = False
        spiked_perms = []
        
        for perm, perm_logs in frequencies.items():
            # Recent frequency (last 30 days)
            recent_freq = 0
            for log in perm_logs:
                try:
                    ts = datetime.fromisoformat(log["timestamp"])
                    days_old = (reference_date - ts).days
                    if days_old < 30:
                        recent_freq += log.get("frequency", 1)
                except:
                    pass
            
            # Overall average frequency
            overall_freq = sum(l.get("frequency", 1) for l in perm_logs)
            
            if overall_freq > 0:
                avg_freq = overall_freq / len(perm_logs)
                
                # If recent frequency >> average, it's a spike (3x)
                if recent_freq > avg_freq * 3:
                    spike_detected = True
                    spiked_perms.append(f"{perm} ({recent_freq} in last 30d vs {avg_freq:.1f} avg)")
        
        if spike_detected:
            return {
                "type": "FREQUENCY_SPIKE",
                "description": "Unusual access frequency increase detected",
                "affected_permissions": spiked_perms,
                "severity": "MEDIUM",
                "risk_adjustment": 0.15
            }
        
        return None
    
    def _detect_burst_activity(self, user_id: str, logs: List[Dict]) -> Dict or None:
        """Detect burst activity (many accesses in short time)"""
        if len(logs) < self.burst_threshold:
            return None
        
        # Simplified burst detection: threshold number of logs = potential burst
        burst_count = len([l for l in logs if l.get("frequency", 1) > 5])
        
        if burst_count >= self.burst_threshold / 2:  # High frequency access
            return {
                "type": "BURST_ACTIVITY",
                "description": "Rapid succession of accesses detected",
                "burst_count": burst_count,
                "severity": "HIGH",
                "risk_adjustment": 0.20
            }
        
        return None
    
    def _detect_unusual_times(self, user_id: str, logs: List[Dict]) -> Dict or None:
        """Detect accesses outside business hours"""
        if not logs:
            return None
        
        # Extract hours from timestamps (if available in ISO format)
        hours = []
        for log in logs:
            try:
                ts = datetime.fromisoformat(log.get("timestamp", ""))
                hours.append(ts.hour)
            except:
                pass
        
        if not hours:
            return None
        
        # Check if many accesses outside 8-18 (8am-6pm)
        off_hours = sum(1 for h in hours if h < 8 or h >= 18)
        
        if off_hours / len(hours) > 0.3:  # >30% off-hours
            return {
                "type": "UNUSUAL_TIME_PATTERN",
                "description": "Access pattern outside normal business hours",
                "off_hours_percentage": f"{off_hours / len(hours) * 100:.0f}%",
                "severity": "MEDIUM",
                "risk_adjustment": 0.10
            }
        
        return None
    
    def _detect_permission_acquisition(self, user_id: str, logs: List[Dict]) -> Dict or None:
        """Detect sudden acquisition of new permissions"""
        if not logs:
            return None
        
        perms_by_date = {}
        for log in logs:
            try:
                date = log["timestamp"].split("T")[0]
                perm = log["permission_id"]
                if date not in perms_by_date:
                    perms_by_date[date] = set()
                perms_by_date[date].add(perm)
            except:
                pass
        
        if len(perms_by_date) < 2:
            return None
        
        dates = sorted(perms_by_date.keys())
        old_perms = perms_by_date[dates[0]]
        recent_perms = perms_by_date[dates[-1]]
        
        new_perms = recent_perms - old_perms
        
        if len(old_perms) > 0 and len(new_perms) > len(old_perms) * 0.5:
            return {
                "type": "PERMISSION_ACQUISITION",
                "description": "Sudden increase in permission scope",
                "new_permissions": list(new_perms),
                "growth_percentage": f"{len(new_perms) / len(old_perms) * 100:.0f}%",
                "severity": "MEDIUM",
                "risk_adjustment": 0.25
            }
        
        return None
    
    @staticmethod
    def _summarize_patterns(logs: List[Dict]) -> Dict:
        """Summarize access patterns"""
        return {
            "total_logs": len(logs),
            "unique_permissions": len(set(l["permission_id"] for l in logs)),
            "total_frequency": sum(l.get("frequency", 1) for l in logs),
            "avg_frequency": (sum(l.get("frequency", 1) for l in logs) / len(logs)) if logs else 0
        }
