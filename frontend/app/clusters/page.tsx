"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { TopNav } from "@/components/dashboard/top-nav"
import { Sidebar } from "@/components/dashboard/sidebar"
import { useAnalysis } from "@/lib/analysis-context"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { 
  Users,
  AlertCircle,
  ChevronDown,
  ChevronUp,
  Shield,
  AlertTriangle
} from "lucide-react"

export default function ClustersPage() {
  const router = useRouter()
  const { data: analysisData } = useAnalysis()
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [expandedCluster, setExpandedCluster] = useState<string | null>(null)

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
              <p className="text-muted-foreground mb-6">Run an analysis first to see cluster results.</p>
              <Button onClick={() => router.push("/")} className="bg-primary hover:bg-primary/90 text-white">
                Go to Upload Page
              </Button>
            </div>
          </main>
        </div>
      </div>
    )
  }

  const clusters = analysisData.clusters

  return (
    <div className="min-h-screen bg-background">
      <TopNav onMenuClick={() => setSidebarOpen(!sidebarOpen)} />
      <div className="flex">
        <Sidebar isOpen={sidebarOpen} />
        <main className={`flex-1 transition-all duration-200 ${sidebarOpen ? 'ml-56' : 'ml-0'}`}>
          <div className="p-5 space-y-5">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-medium text-foreground flex items-center gap-2">
                  <Users className="h-5 w-5 text-primary" />
                  User Clusters
                </h2>
                <p className="text-sm text-muted-foreground">
                  {clusters.length} clusters identified from behavioral analysis
                </p>
              </div>
            </div>

            {/* Clusters Grid */}
            <div className="grid gap-4">
              {clusters.map((cluster) => {
                const isExpanded = expandedCluster === cluster.cluster_id
                return (
                  <div
                    key={cluster.cluster_id}
                    className="glass-card rounded-xl overflow-hidden transition-all duration-200"
                  >
                    {/* Cluster Header */}
                    <button
                      onClick={() => setExpandedCluster(isExpanded ? null : cluster.cluster_id)}
                      className="w-full p-4 flex items-center justify-between text-left hover:bg-primary/5 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                          <Users className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <h3 className="text-sm font-semibold text-foreground">{cluster.cluster_name}</h3>
                          <p className="text-xs text-muted-foreground">{cluster.characteristics}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right hidden sm:block">
                          <p className="text-sm font-medium text-foreground">{cluster.user_count} users</p>
                          <p className="text-xs text-muted-foreground">
                            Cohesion: {(cluster.cohesion_score * 100).toFixed(0)}%
                          </p>
                        </div>
                        {cluster.department && (
                          <Badge variant="outline" className="bg-muted text-foreground border-border text-xs hidden md:flex">
                            {cluster.department}
                          </Badge>
                        )}
                        {isExpanded ? (
                          <ChevronUp className="h-4 w-4 text-muted-foreground" />
                        ) : (
                          <ChevronDown className="h-4 w-4 text-muted-foreground" />
                        )}
                      </div>
                    </button>

                    {/* Expanded Content */}
                    {isExpanded && (
                      <div className="p-4 border-t border-border space-y-4">
                        {/* Stats Row */}
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                          <div className="glass-card rounded-lg p-3 text-center">
                            <p className="text-lg font-semibold gradient-text">{cluster.user_count}</p>
                            <p className="text-[10px] text-muted-foreground">Users</p>
                          </div>
                          <div className="glass-card rounded-lg p-3 text-center">
                            <p className="text-lg font-semibold gradient-text">
                              {(cluster.cohesion_score * 100).toFixed(0)}%
                            </p>
                            <p className="text-[10px] text-muted-foreground">Cohesion</p>
                          </div>
                          <div className="glass-card rounded-lg p-3 text-center">
                            <p className="text-lg font-semibold gradient-text">
                              {cluster.dominant_permissions.length}
                            </p>
                            <p className="text-[10px] text-muted-foreground">Permissions</p>
                          </div>
                          <div className="glass-card rounded-lg p-3 text-center">
                            <p className="text-lg font-semibold gradient-text">
                              {cluster.alerts?.length || 0}
                            </p>
                            <p className="text-[10px] text-muted-foreground">Alerts</p>
                          </div>
                        </div>

                        {/* Users */}
                        <div>
                          <h4 className="text-xs font-medium text-foreground mb-2 flex items-center gap-1.5">
                            <Users className="h-3.5 w-3.5 text-primary" /> Members
                          </h4>
                          <div className="flex flex-wrap gap-1.5">
                            {cluster.users.map(userId => (
                              <Badge key={userId} variant="outline" className="bg-muted text-foreground border-border text-xs">
                                {userId}
                              </Badge>
                            ))}
                          </div>
                        </div>

                        {/* Dominant Permissions */}
                        <div>
                          <h4 className="text-xs font-medium text-foreground mb-2 flex items-center gap-1.5">
                            <Shield className="h-3.5 w-3.5 text-primary" /> Dominant Permissions
                          </h4>
                          <div className="flex flex-wrap gap-1.5">
                            {cluster.dominant_permissions.map(perm => (
                              <Badge key={perm} variant="outline" className="bg-primary/5 text-primary border-primary/20 text-xs">
                                {perm}
                              </Badge>
                            ))}
                          </div>
                        </div>

                        {/* Alerts */}
                        {cluster.alerts && cluster.alerts.length > 0 && (
                          <div>
                            <h4 className="text-xs font-medium text-foreground mb-2 flex items-center gap-1.5">
                              <AlertTriangle className="h-3.5 w-3.5 text-orange-500" /> Alerts
                            </h4>
                            <div className="space-y-1.5">
                              {cluster.alerts.map((alert, i) => (
                                <div key={i} className={cn(
                                  "flex items-start gap-2 p-2 rounded-lg",
                                  "bg-orange-500/5 border border-orange-500/10"
                                )}>
                                  <AlertTriangle className="h-3.5 w-3.5 text-orange-500 mt-0.5 flex-shrink-0" />
                                  <p className="text-xs text-muted-foreground">{alert}</p>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
