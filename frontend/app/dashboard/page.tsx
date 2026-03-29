"use client"

import { useState, useMemo } from "react"
import { useRouter } from "next/navigation"
import { TopNav } from "@/components/dashboard/top-nav"
import { Sidebar } from "@/components/dashboard/sidebar"
import { SummaryCards } from "@/components/dashboard/summary-cards"
import { RiskHeatmapTable } from "@/components/dashboard/risk-heatmap-table"
import { UserDetailDrawer } from "@/components/dashboard/user-detail-drawer"
import { RecommendationsPanel } from "@/components/dashboard/recommendations-panel"
import { User, Recommendation } from "@/lib/types"
import { useAnalysis } from "@/lib/analysis-context"
import { transformUsersFromAnalysis, transformRecommendationsFromAnalysis, transformSummaryFromAnalysis, generateSparklineData } from "@/lib/transform"
import { AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function DashboardPage() {
  const router = useRouter()
  const { data: analysisData, userMetadata } = useAnalysis()
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [selectedRecommendations, setSelectedRecommendations] = useState<string[]>([])
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")

  // Transform API data to UI format
  const { users, recommendations, summary, sparklineData } = useMemo(() => {
    if (!analysisData) {
      return { users: [], recommendations: [], summary: null, sparklineData: null }
    }
    const transformedUsers = transformUsersFromAnalysis(analysisData, userMetadata)
    const transformedRecommendations = transformRecommendationsFromAnalysis(analysisData, transformedUsers)
    const transformedSummary = transformSummaryFromAnalysis(transformedUsers, analysisData)
    const transformedSparklineData = generateSparklineData(transformedUsers)
    return {
      users: transformedUsers,
      recommendations: transformedRecommendations,
      summary: transformedSummary,
      sparklineData: transformedSparklineData
    }
  }, [analysisData, userMetadata])

  // Filter users by search query
  const filteredUsers = useMemo(() => {
    if (!searchQuery) return users
    const queryWords = searchQuery.toLowerCase().split(/\s+/).filter(Boolean)
    return users.filter(user => {
      const name = user.name.toLowerCase()
      const email = user.email.toLowerCase()
      // All words in query must be present in name or email
      return queryWords.every(word => name.includes(word) || email.includes(word))
    })
  }, [users, searchQuery])

  const handleUserClick = (user: User) => {
    setSelectedUser(user)
    setDrawerOpen(true)
  }

  const handleRecommendationToggle = (id: string) => {
    setSelectedRecommendations(prev => 
      prev.includes(id) 
        ? prev.filter(r => r !== id)
        : [...prev, id]
    )
  }

  // Note: RecommendationsPanel now handles bulk execution directly with confirmation dialog
  // onSimulate is kept for backward compatibility but not used in new flow
  const handleSimulate = () => {
    // Bulk action execution is now handled in RecommendationsPanel
  }

  const handleApplyFixes = () => {
    setSelectedRecommendations([])
  }

  // Show prompt if no analysis data loaded
  if (!analysisData) {
    return (
      <div className="min-h-screen bg-background">
        <TopNav onMenuClick={() => setSidebarOpen(!sidebarOpen)} />
        <div className="flex">
          <Sidebar isOpen={sidebarOpen} />
          <main className={`flex-1 transition-all duration-200 ${sidebarOpen ? 'ml-56' : 'ml-0'}`}>
            <div className="flex flex-col items-center justify-center min-h-[60vh] p-8 text-center">
              <div className="w-16 h-16 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                <AlertCircle className="h-8 w-8 text-primary" />
              </div>
              <h2 className="text-xl font-semibold text-foreground mb-2">No Analysis Data</h2>
              <p className="text-muted-foreground mb-6 max-w-md">
                Run an analysis first by uploading your access data to see the risk dashboard.
              </p>
              <Button onClick={() => router.push("/")} className="bg-primary hover:bg-primary/90 text-white">
                Go to Upload Page
              </Button>
            </div>
          </main>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <TopNav onMenuClick={() => setSidebarOpen(!sidebarOpen)} />
      <div className="flex">
        <Sidebar isOpen={sidebarOpen} />
        <main className={`flex-1 transition-all duration-200 ${sidebarOpen ? 'ml-56' : 'ml-0'}`}>
          <div className="p-5 space-y-5">
            {/* Search Bar removed - only keep in RiskHeatmapTable */}
            {/* Summary Cards */}
            {summary && sparklineData && (
              <SummaryCards summary={summary} sparklineData={sparklineData} />
            )}
            {/* Main Grid */}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
              {/* Risk Heatmap Table - 2 cols */}
              <div className="xl:col-span-2">
                <RiskHeatmapTable users={filteredUsers} onUserClick={handleUserClick} />
              </div>
              {/* Recommendations Panel - 1 col */}
              <div className="xl:col-span-1">
                <RecommendationsPanel 
                  recommendations={recommendations}
                  selectedIds={selectedRecommendations}
                  onToggle={handleRecommendationToggle}
                  onSimulate={handleSimulate}
                />
              </div>
            </div>
          </div>
        </main>
      </div>
      {/* User Detail Drawer */}
      <UserDetailDrawer 
        user={selectedUser}
        open={drawerOpen}
        onOpenChange={setDrawerOpen}
      />
    </div>
  )
}
