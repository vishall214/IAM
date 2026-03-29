"use client"

import { useState } from "react"
import { TopNav } from "@/components/dashboard/top-nav"
import { Sidebar } from "@/components/dashboard/sidebar"
import { SummaryCards } from "@/components/dashboard/summary-cards"
import { RiskHeatmapTable } from "@/components/dashboard/risk-heatmap-table"
import { UserDetailDrawer } from "@/components/dashboard/user-detail-drawer"
import { RecommendationsPanel } from "@/components/dashboard/recommendations-panel"
import { ImpactSimulation } from "@/components/dashboard/impact-simulation"
import { User, Recommendation } from "@/lib/types"

export default function Dashboard() {
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [selectedRecommendations, setSelectedRecommendations] = useState<string[]>([])
  const [showSimulation, setShowSimulation] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(true)

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

  const handleSimulate = () => {
    if (selectedRecommendations.length > 0) {
      setShowSimulation(true)
    }
  }

  const handleApplyFixes = () => {
    // In a real app, this would apply the fixes
    setSelectedRecommendations([])
    setShowSimulation(false)
  }

  return (
    <div className="min-h-screen bg-background">
      <TopNav onMenuClick={() => setSidebarOpen(!sidebarOpen)} />
      
      <div className="flex">
        <Sidebar isOpen={sidebarOpen} />
        
        <main className={`flex-1 transition-all duration-200 ${sidebarOpen ? 'ml-56' : 'ml-0'}`}>
          <div className="p-5 space-y-5">
            {/* Summary Cards */}
            <SummaryCards />
            
            {/* Main Grid */}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
              {/* Risk Heatmap Table - 2 cols */}
              <div className="xl:col-span-2">
                <RiskHeatmapTable onUserClick={handleUserClick} />
              </div>
              
              {/* Recommendations Panel - 1 col */}
              <div className="xl:col-span-1">
                <RecommendationsPanel 
                  selectedIds={selectedRecommendations}
                  onToggle={handleRecommendationToggle}
                  onSimulate={handleSimulate}
                />
              </div>
            </div>
            
            {/* Impact Simulation */}
            {showSimulation && (
              <ImpactSimulation 
                selectedCount={selectedRecommendations.length}
                onApply={handleApplyFixes}
                onClose={() => setShowSimulation(false)}
              />
            )}
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
