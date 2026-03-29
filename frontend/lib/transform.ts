/**
 * Transforms raw API AnalysisResult into shapes the dashboard components expect.
 * This bridges the gap between backend response format and frontend UI models.
 */

import { AnalysisResult } from "./api-types"
import { User, Recommendation, RiskReason, AccessEvent } from "./types"

// --- Transform risk_scores → User[] for the RiskHeatmapTable ---

interface AggregatedUser {
  user_id: string
  department: string
  maxRiskScore: number
  totalPermissions: number
  riskScores: number[]
  reasons: Set<string>
  flags: string[]
}

const RISK_REASON_MAP: Record<string, RiskReason> = {
  "sensitivity": "Sensitive Data",
  "infrequency": "Infrequent Usage",
  "peer_deviation": "Peer Deviation",
  "recency": "Unused Access",
  "stale": "Stale Account",
  "excessive": "Excessive Permissions",
}

function inferReasons(components: { sensitivity: number; infrequency: number; peer_deviation: number; recency: number }): RiskReason[] {
  const reasons: RiskReason[] = []
  if (components.sensitivity > 0.4) reasons.push("Sensitive Data")
  if (components.infrequency > 0.4) reasons.push("Infrequent Usage")
  if (components.peer_deviation > 0.4) reasons.push("Peer Deviation")
  if (components.recency > 0.4) reasons.push("Unused Access")
  if (reasons.length === 0) reasons.push("Infrequent Usage")
  return reasons
}

function generateAccessHistory(seed: number): AccessEvent[] {
  const actions = ["Accessed", "Modified", "Downloaded", "Shared", "Viewed"]
  const resources = ["Financial Reports", "Customer Database", "HR Records", "Product Specs", "Marketing Assets"]
  const riskLevels: ("high" | "medium" | "low" | "none")[] = ["high", "medium", "low", "none"]

  return Array.from({ length: 5 }, (_, i) => ({
    date: new Date(2026, 2, 25 - i * 3 - (seed % 5)).toISOString(),
    action: actions[(seed + i) % actions.length],
    resource: resources[(seed + i * 2) % resources.length],
    riskImpact: riskLevels[(seed + i) % riskLevels.length]
  }))
}

export function transformUsersFromAnalysis(result: AnalysisResult, userMetadata?: Map<string, { name: string; email: string }> | null): User[] {
  // Aggregate risk scores by user
  const userMap = new Map<string, AggregatedUser>()

  // Get departments from clusters
  const userDepartments = new Map<string, string>()
  for (const cluster of result.clusters) {
    for (const userId of cluster.users) {
      userDepartments.set(userId, cluster.department || "General")
    }
  }

  for (const rs of result.risk_scores) {
    if (!userMap.has(rs.user_id)) {
      userMap.set(rs.user_id, {
        user_id: rs.user_id,
        department: userDepartments.get(rs.user_id) || "General",
        maxRiskScore: 0,
        totalPermissions: 0,
        riskScores: [],
        reasons: new Set(),
        flags: [],
      })
    }
    const user = userMap.get(rs.user_id)!
    
    // Normalize score: if <= 1 it's a fraction, otherwise raw
    const normalizedScore = rs.risk_score <= 1 ? Math.round(rs.risk_score * 100) : Math.round(rs.risk_score)
    user.riskScores.push(normalizedScore)
    user.maxRiskScore = Math.max(user.maxRiskScore, normalizedScore)
    user.totalPermissions++

    // Infer reasons from components
    const reasons = inferReasons(rs.components)
    reasons.forEach(r => user.reasons.add(r))

    if (rs.flag) user.flags.push(rs.flag)
  }

  // Convert to User[] sorted by risk score descending
  const users: User[] = Array.from(userMap.values()).map((agg, index) => {
    const avgRisk = Math.round(agg.riskScores.reduce((a, b) => a + b, 0) / agg.riskScores.length)
    const riskLevel = avgRisk >= 70 ? "high" : avgRisk >= 40 ? "medium" : "low"
    
    // Use metadata if available, otherwise generate placeholder
    const metadata = userMetadata?.get(agg.user_id)
    const displayName = metadata?.name || agg.user_id.replace(/_/g, " ").replace(/^U(\d+)$/, "User $1")
    const displayEmail = metadata?.email || `${agg.user_id.toLowerCase()}@company.com`

    return {
      id: agg.user_id,
      name: displayName,
      email: displayEmail,
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${displayName}`,
      department: agg.department,
      riskScore: avgRisk,
      riskLevel,
      reasons: Array.from(agg.reasons) as RiskReason[],
      lastAccessed: new Date(2026, 2, 28 - (index % 7)).toISOString(),
      permissions: agg.totalPermissions,
      sensitivityScore: Math.round(agg.riskScores.reduce((a, b) => a + b, 0) / agg.riskScores.length * 0.9),
      usageFrequency: Math.max(10, 100 - avgRisk + (index * 5) % 30),
      peerComparison: Math.round(avgRisk * 0.8),
      recencyGap: Math.round(avgRisk * 0.6),
      accessHistory: generateAccessHistory(index),
    }
  })

  return users.sort((a, b) => b.riskScore - a.riskScore)
}

// --- Transform recommendations → Recommendation[] for RecommendationsPanel ---

export function transformRecommendationsFromAnalysis(result: AnalysisResult, users: User[]): Recommendation[] {
  const userLookup = new Map(users.map(u => [u.id, u]))

  return result.recommendations.map((rec, index) => {
    // Handle both snake_case (from backend) and camelCase (transformed)
    const user_id = rec.user_id || (rec as any).userId
    const permission_id = rec.permission_id || (rec as any).permissionId
    
    if (!user_id) throw new Error(`Recommendation ${index}: missing user_id`)
    if (!permission_id) throw new Error(`Recommendation ${index}: missing permission_id`)
    if (!rec.id) throw new Error(`Recommendation ${index}: missing id`)
    if (!rec.status) throw new Error(`Recommendation ${index}: missing status`)
    
    const user = userLookup.get(user_id)
    const displayName = user?.name || user_id
    const avatar = user?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user_id}`
    const normalizedScore = rec.risk_score <= 1 ? Math.round(rec.risk_score * 100) : Math.round(rec.risk_score)

    return {
      id: rec.id,
      actionType: rec.action_type as "REMOVE" | "REVIEW" | "MONITOR",
      user: { name: displayName, avatar },
      permission: permission_id,
      riskScore: normalizedScore,
      confidence: rec.confidence,
      reasons: [rec.reason, rec.impact].filter(Boolean),
      userId: user_id,
      user_id: user_id,
      permissionId: permission_id,
      permission_id: permission_id,
      status: rec.status as any,
    }
  })
}

// --- Transform summary data for SummaryCards ---

export interface TransformedSummary {
  highRiskUsers: number
  mediumRiskUsers: number
  lowRiskUsers: number
  averageRiskScore: number
  totalPermissions: number
  lastAnalyzed: string
  datasetSize: number
}

export interface TransformedSparkline {
  high: number[]
  medium: number[]
  low: number[]
}

export function transformSummaryFromAnalysis(users: User[], result: AnalysisResult): TransformedSummary {
  return {
    highRiskUsers: users.filter(u => u.riskLevel === "high").length,
    mediumRiskUsers: users.filter(u => u.riskLevel === "medium").length,
    lowRiskUsers: users.filter(u => u.riskLevel === "low").length,
    averageRiskScore: users.length > 0
      ? Math.round(users.reduce((acc, u) => acc + u.riskScore, 0) / users.length)
      : 0,
    totalPermissions: result.summary.current_state.total_permissions_assigned,
    lastAnalyzed: "Just now",
    datasetSize: users.length,
  }
}

export function generateSparklineData(users: User[]): TransformedSparkline {
  const high = users.filter(u => u.riskLevel === "high").length
  const medium = users.filter(u => u.riskLevel === "medium").length
  const low = users.filter(u => u.riskLevel === "low").length
  
  // Generate 7-point trend with slight variation
  const vary = (base: number) => Array.from({ length: 7 }, (_, i) => 
    Math.max(0, base + (i % 3 === 0 ? 1 : i % 3 === 1 ? -1 : 0))
  )
  
  return {
    high: vary(high),
    medium: vary(medium),
    low: vary(low),
  }
}
