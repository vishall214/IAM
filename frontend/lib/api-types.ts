/**
 * TypeScript types matching backend models/schemas.py
 * These represent the API response shapes from the FastAPI backend
 */

// --- Input Types ---

export interface UserInput {
  user_id: string
  name?: string  // Optional: For frontend display
  email?: string // Optional: For frontend display
  department?: string
}

export interface PermissionInput {
  permission_id: string
  sensitivity_level: string // low, medium, high, critical
}

export interface AccessLogInput {
  user_id: string
  permission_id: string
  timestamp: string // ISO format
  frequency: number
}

export interface AnalysisRequest {
  users: UserInput[]
  permissions: PermissionInput[]
  access_logs: AccessLogInput[]
}

// --- Output Types ---

export interface ClusterSummary {
  cluster_id: string
  cluster_name: string
  users: string[]
  department: string | null
  user_count: number
  cohesion_score: number
  dominant_permissions: string[]
  characteristics: string
  alerts: string[]
}

export interface RolePermission {
  permission_id: string
  sensitivity: string
  justification: string
}

export interface RoleSummary {
  role_id: string
  role_name: string
  source_cluster: string
  permissions: RolePermission[]
  coverage: string
  user_count: number
  notes: string
}

export interface RiskComponent {
  sensitivity: number
  infrequency: number
  peer_deviation: number
  recency: number
}

export interface RiskScore {
  user_id: string
  permission_id: string
  risk_score: number
  risk_level: string
  components: RiskComponent
  flag: string | null
}

export interface RecommendationMetrics {
  sensitivity?: string
  usage_frequency?: string
  recency_days?: number
  peer_prevalence?: string
  global_prevalence?: string
  role_alignment?: string
  cluster_baseline?: string
}

export interface ApiRecommendation {
  priority: number
  action_type: string // REMOVE, REVIEW, MONITOR
  user_id: string
  permission_id: string
  risk_score: number
  reason: string
  impact: string
  metrics: RecommendationMetrics
  resolution_options: string[]
  urgency: string
}

export interface Explanations {
  methodology: string
  role_mining_strategy: string
  risk_formula: string
  key_insights: string[]
}

export interface SummaryState {
  total_permissions_assigned: number
  critical_risk_permissions: number
  high_risk_permissions: number
  medium_risk_permissions: number
}

export interface AnalysisSummary {
  current_state: SummaryState
  post_recommendation: SummaryState
}

export interface AnalysisMetadata {
  timestamp?: string
  total_users?: number
  total_permissions?: number
  total_access_logs?: number
  pipeline_steps?: number
  [key: string]: unknown
}

export interface AnalysisResult {
  metadata: AnalysisMetadata
  clusters: ClusterSummary[]
  roles: RoleSummary[]
  risk_scores: RiskScore[]
  recommendations: ApiRecommendation[]
  explanations: Explanations
  summary: AnalysisSummary
}

export interface PipelineStep {
  step: number
  name: string
  description: string
}

export interface PipelineStepsResponse {
  steps: PipelineStep[]
}
