import { User, Recommendation, RiskReason, AccessEvent } from "./types"

// Deterministic user data to prevent hydration mismatches
const userData: Array<{
  name: string
  department: string
  riskScore: number
  permissions: number
  sensitivityScore: number
  usageFrequency: number
  peerComparison: number
  recencyGap: number
  reasons: RiskReason[]
}> = [
  { name: "Sarah Chen", department: "Engineering", riskScore: 92, permissions: 45, sensitivityScore: 88, usageFrequency: 23, peerComparison: 85, recencyGap: 72, reasons: ["Excessive Permissions", "Sensitive Data", "Peer Deviation"] },
  { name: "Marcus Johnson", department: "Finance", riskScore: 87, permissions: 38, sensitivityScore: 91, usageFrequency: 15, peerComparison: 78, recencyGap: 65, reasons: ["Unused Access", "Sensitive Data", "Stale Account"] },
  { name: "Elena Rodriguez", department: "Sales", riskScore: 81, permissions: 32, sensitivityScore: 75, usageFrequency: 45, peerComparison: 82, recencyGap: 58, reasons: ["Peer Deviation", "Excessive Permissions", "Infrequent Usage"] },
  { name: "James Wilson", department: "HR", riskScore: 78, permissions: 28, sensitivityScore: 82, usageFrequency: 38, peerComparison: 71, recencyGap: 45, reasons: ["Sensitive Data", "Unused Access", "Peer Deviation"] },
  { name: "Aisha Patel", department: "Engineering", riskScore: 72, permissions: 41, sensitivityScore: 68, usageFrequency: 52, peerComparison: 65, recencyGap: 38, reasons: ["Excessive Permissions", "Peer Deviation", "Infrequent Usage"] },
  { name: "David Kim", department: "Operations", riskScore: 65, permissions: 25, sensitivityScore: 58, usageFrequency: 67, peerComparison: 55, recencyGap: 28, reasons: ["Infrequent Usage", "Peer Deviation"] },
  { name: "Maria Santos", department: "Marketing", riskScore: 58, permissions: 22, sensitivityScore: 48, usageFrequency: 72, peerComparison: 42, recencyGap: 22, reasons: ["Unused Access", "Stale Account"] },
  { name: "Robert Taylor", department: "Legal", riskScore: 52, permissions: 35, sensitivityScore: 62, usageFrequency: 58, peerComparison: 38, recencyGap: 18, reasons: ["Sensitive Data", "Unused Access"] },
  { name: "Jennifer Liu", department: "Product", riskScore: 45, permissions: 18, sensitivityScore: 42, usageFrequency: 78, peerComparison: 32, recencyGap: 15, reasons: ["Infrequent Usage", "Peer Deviation"] },
  { name: "Michael Brown", department: "Finance", riskScore: 38, permissions: 15, sensitivityScore: 35, usageFrequency: 82, peerComparison: 28, recencyGap: 12, reasons: ["Stale Account"] },
  { name: "Lisa Anderson", department: "Sales", riskScore: 32, permissions: 12, sensitivityScore: 28, usageFrequency: 88, peerComparison: 22, recencyGap: 8, reasons: ["Unused Access"] },
  { name: "Kevin O'Brien", department: "Engineering", riskScore: 28, permissions: 20, sensitivityScore: 25, usageFrequency: 85, peerComparison: 18, recencyGap: 5, reasons: ["Infrequent Usage"] },
  { name: "Amanda Foster", department: "HR", riskScore: 22, permissions: 14, sensitivityScore: 22, usageFrequency: 92, peerComparison: 15, recencyGap: 3, reasons: ["Peer Deviation"] },
  { name: "Christopher Lee", department: "Marketing", riskScore: 18, permissions: 11, sensitivityScore: 18, usageFrequency: 95, peerComparison: 12, recencyGap: 2, reasons: ["Unused Access"] },
  { name: "Rachel Green", department: "Operations", riskScore: 12, permissions: 8, sensitivityScore: 12, usageFrequency: 98, peerComparison: 8, recencyGap: 1, reasons: ["Infrequent Usage"] },
  { name: "Thomas Wright", department: "Legal", riskScore: 8, permissions: 10, sensitivityScore: 8, usageFrequency: 95, peerComparison: 5, recencyGap: 1, reasons: ["Stale Account"] }
]

function generateAccessHistory(seed: number): AccessEvent[] {
  const actions = ["Accessed", "Modified", "Downloaded", "Shared", "Viewed"]
  const resources = ["Financial Reports", "Customer Database", "HR Records", "Product Specs", "Marketing Assets"]
  const riskLevels: ("high" | "medium" | "low" | "none")[] = ["high", "medium", "low", "none"]
  
  // Use deterministic values based on seed
  return Array.from({ length: 5 }, (_, i) => ({
    date: new Date(2026, 2, 25 - i * 3 - (seed % 5)).toISOString(),
    action: actions[(seed + i) % actions.length],
    resource: resources[(seed + i * 2) % resources.length],
    riskImpact: riskLevels[(seed + i) % riskLevels.length]
  }))
}

export const mockUsers: User[] = userData.map((data, index) => {
  const riskLevel = data.riskScore >= 70 ? "high" : data.riskScore >= 40 ? "medium" : "low"
  
  return {
    id: `user-${index + 1}`,
    name: data.name,
    email: `${data.name.toLowerCase().replace(" ", ".")}@company.com`,
    avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${data.name}`,
    department: data.department,
    riskScore: data.riskScore,
    riskLevel,
    reasons: data.reasons,
    lastAccessed: new Date(2026, 2, 28 - (index % 7)).toISOString(),
    permissions: data.permissions,
    sensitivityScore: data.sensitivityScore,
    usageFrequency: data.usageFrequency,
    peerComparison: data.peerComparison,
    recencyGap: data.recencyGap,
    accessHistory: generateAccessHistory(index)
  }
})

// Deterministic recommendation data
const recommendationData: Array<{
  userIndex: number
  actionType: "REMOVE" | "REVIEW" | "MONITOR"
  permission: string
  riskScore: number
  confidence: number
  reasons: string[]
}> = [
  { userIndex: 0, actionType: "REMOVE", permission: "Admin Dashboard Access", riskScore: 94, confidence: 96, reasons: ["User has not accessed this resource in 90+ days", "Access level exceeds role requirements"] },
  { userIndex: 1, actionType: "REMOVE", permission: "Financial Reports Export", riskScore: 89, confidence: 92, reasons: ["Similar users don't have this permission", "Resource contains sensitive data"] },
  { userIndex: 2, actionType: "REVIEW", permission: "Customer Database Write", riskScore: 85, confidence: 88, reasons: ["Activity pattern suggests misalignment", "Access level exceeds role requirements"] },
  { userIndex: 3, actionType: "REMOVE", permission: "HR Records View", riskScore: 82, confidence: 94, reasons: ["Permission was granted for a completed project", "User has not accessed this resource in 90+ days"] },
  { userIndex: 4, actionType: "REVIEW", permission: "Production Server SSH", riskScore: 78, confidence: 85, reasons: ["Similar users don't have this permission", "Activity pattern suggests misalignment"] },
  { userIndex: 5, actionType: "MONITOR", permission: "Marketing Analytics Edit", riskScore: 72, confidence: 82, reasons: ["Resource contains sensitive data", "Access level exceeds role requirements"] },
  { userIndex: 6, actionType: "REVIEW", permission: "Sales Pipeline Manage", riskScore: 68, confidence: 80, reasons: ["Permission was granted for a completed project", "Similar users don't have this permission"] },
  { userIndex: 7, actionType: "MONITOR", permission: "Legal Documents Access", riskScore: 65, confidence: 88, reasons: ["User has not accessed this resource in 90+ days", "Resource contains sensitive data"] }
]

export const mockRecommendations: Recommendation[] = recommendationData.map((data, i) => {
  const user = mockUsers[data.userIndex]
  
  return {
    id: `rec-${i + 1}`,
    actionType: data.actionType,
    user: {
      name: user.name,
      avatar: user.avatar
    },
    permission: data.permission,
    riskScore: data.riskScore,
    confidence: data.confidence,
    reasons: data.reasons
  }
})

export const summaryData = {
  highRiskUsers: mockUsers.filter(u => u.riskLevel === "high").length,
  mediumRiskUsers: mockUsers.filter(u => u.riskLevel === "medium").length,
  lowRiskUsers: mockUsers.filter(u => u.riskLevel === "low").length,
  averageRiskScore: Math.round(mockUsers.reduce((acc, u) => acc + u.riskScore, 0) / mockUsers.length),
  totalPermissions: mockUsers.reduce((acc, u) => acc + u.permissions, 0),
  lastAnalyzed: "5 mins ago",
  datasetSize: mockUsers.length
}

export const sparklineData = {
  high: [4, 6, 5, 8, 7, 6, 5],
  medium: [8, 7, 9, 6, 8, 7, 6],
  low: [12, 14, 13, 15, 14, 16, 15]
}
