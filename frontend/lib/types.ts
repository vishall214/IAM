export type RiskLevel = "high" | "medium" | "low"

export type RiskReason = 
  | "Unused Access"
  | "Peer Deviation"
  | "Sensitive Data"
  | "Infrequent Usage"
  | "Excessive Permissions"
  | "Stale Account"

export interface User {
  id: string
  name: string
  email: string
  avatar: string
  department: string
  riskScore: number
  riskLevel: RiskLevel
  reasons: RiskReason[]
  lastAccessed: string
  permissions: number
  sensitivityScore: number
  usageFrequency: number
  peerComparison: number
  recencyGap: number
  accessHistory: AccessEvent[]
}

export interface AccessEvent {
  date: string
  action: string
  resource: string
  riskImpact: "high" | "medium" | "low" | "none"
}

export type ActionType = "REMOVE" | "REVIEW" | "MONITOR"
export type RecommendationStatus = "pending" | "reviewed" | "revoked" | "ignored"

// UI state machine for recommendation processing
export type RecommendationState = "PENDING" | "EXECUTING" | "REVIEWED" | "REVOKED" | "IGNORED"

export interface Recommendation {
  id: string
  actionType: ActionType
  user: {
    name: string
    avatar: string
  }
  permission: string
  riskScore: number
  confidence: number
  reasons: string[]
  /** Unique identifier for the user (needed for backend action) - REQUIRED */
  userId?: string
  /** Backend format snake_case version */
  user_id?: string
  /** Unique identifier for the permission (needed for backend action) - REQUIRED */
  permissionId?: string
  /** Backend format snake_case version */
  permission_id?: string
  /** Current status of the recommendation */
  status: RecommendationStatus
  /** Timestamp of the last action */
  actionTimestamp?: string
}

export interface MetricsData {
  totalPermissions: number
  highRiskUsers: number
  avgPermissionsPerUser: number
}
