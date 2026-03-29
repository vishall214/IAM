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
  Lightbulb,
  AlertCircle,
  Trash2,
  Eye,
  Activity,
  ChevronDown,
  ChevronUp,
  CheckCircle2,
  TrendingDown,
  Shield
} from "lucide-react"

export default function RecommendationsPage() {
  const router = useRouter()
  const { data: analysisData } = useAnalysis()
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [expandedRec, setExpandedRec] = useState<number | null>(null)

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
              <p className="text-muted-foreground mb-6">Run an analysis first to see recommendations.</p>
              <Button onClick={() => router.push("/")} className="bg-primary hover:bg-primary/90 text-white">
                Go to Upload Page
              </Button>
            </div>
          </main>
        </div>
      </div>
    )
  }

  const recommendations = analysisData.recommendations
  const summary = analysisData.summary

  const actionIcon = (type: string) => {
    switch (type) {
      case "REMOVE": return <Trash2 className="h-3.5 w-3.5" />
      case "REVIEW": return <Eye className="h-3.5 w-3.5" />
      case "MONITOR": return <Activity className="h-3.5 w-3.5" />
      default: return <AlertCircle className="h-3.5 w-3.5" />
    }
  }

  const actionColor = (type: string) => {
    switch (type) {
      case "REMOVE": return "bg-red-500/10 text-red-500 border-red-500/20"
      case "REVIEW": return "bg-orange-500/10 text-orange-500 border-orange-500/20"
      case "MONITOR": return "bg-cyan-500/10 text-cyan-500 border-cyan-500/20"
      default: return "bg-muted text-muted-foreground"
    }
  }

  const urgencyColor = (urgency: string) => {
    switch (urgency.toLowerCase()) {
      case "high": return "text-red-500"
      case "medium": return "text-orange-500"
      default: return "text-green-500"
    }
  }

  const totalCurrent = summary.current_state.total_permissions_assigned
  const totalPost = summary.post_recommendation.total_permissions_assigned
  const reduction = totalCurrent > 0 ? Math.round(((totalCurrent - totalPost) / totalCurrent) * 100) : 0

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
                  <Lightbulb className="h-5 w-5 text-primary" />
                  Recommendations
                </h2>
                <p className="text-sm text-muted-foreground">
                  {recommendations.length} cleanup actions prioritized by risk
                </p>
              </div>
            </div>

            {/* Impact Summary */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="glass-card rounded-xl p-4 text-center">
                <TrendingDown className="h-5 w-5 text-green-500 mx-auto mb-1.5" />
                <p className="text-xl font-semibold text-green-500">-{reduction}%</p>
                <p className="text-[11px] text-muted-foreground">Permission Reduction</p>
              </div>
              <div className="glass-card rounded-xl p-4 text-center">
                <Shield className="h-5 w-5 text-primary mx-auto mb-1.5" />
                <p className="text-xl font-semibold gradient-text">{totalCurrent}</p>
                <p className="text-[11px] text-muted-foreground">Current Permissions</p>
              </div>
              <div className="glass-card rounded-xl p-4 text-center">
                <CheckCircle2 className="h-5 w-5 text-green-500 mx-auto mb-1.5" />
                <p className="text-xl font-semibold text-green-500">{totalPost}</p>
                <p className="text-[11px] text-muted-foreground">After Cleanup</p>
              </div>
              <div className="glass-card rounded-xl p-4 text-center">
                <Lightbulb className="h-5 w-5 text-primary mx-auto mb-1.5" />
                <p className="text-xl font-semibold gradient-text">{recommendations.length}</p>
                <p className="text-[11px] text-muted-foreground">Total Actions</p>
              </div>
            </div>

            {/* Recommendations List */}
            <div className="glass-card rounded-2xl overflow-hidden">
              <div className="p-4 border-b border-border/50">
                <h3 className="text-sm font-semibold text-foreground">Prioritized Actions</h3>
              </div>
              <div className="divide-y divide-border/30">
                {recommendations.map((rec, index) => {
                  const isExpanded = expandedRec === index
                  return (
                    <div key={index} className={cn(
                      "transition-colors",
                      rec.risk_score >= 0.7 && "glow-high-risk"
                    )}>
                      <button
                        onClick={() => setExpandedRec(isExpanded ? null : index)}
                        className="w-full p-4 flex items-center justify-between text-left hover:bg-primary/5 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-xs font-bold text-muted-foreground w-6">#{rec.priority}</span>
                          <Badge
                            variant="outline"
                            className={cn("text-[10px] font-medium flex items-center gap-1", actionColor(rec.action_type))}
                          >
                            {actionIcon(rec.action_type)}
                            {rec.action_type}
                          </Badge>
                          <div>
                            <p className="text-sm font-medium text-foreground">
                              {rec.user_id} → {rec.permission_id}
                            </p>
                            <p className="text-xs text-muted-foreground truncate max-w-[400px]">{rec.reason}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className={cn("text-xs font-medium", urgencyColor(rec.urgency))}>
                            {rec.urgency}
                          </span>
                          <span className="text-sm font-medium text-foreground">
                            {typeof rec.risk_score === 'number' && rec.risk_score <= 1
                              ? (rec.risk_score * 100).toFixed(0)
                              : rec.risk_score
                            }
                          </span>
                          {isExpanded ? (
                            <ChevronUp className="h-4 w-4 text-muted-foreground" />
                          ) : (
                            <ChevronDown className="h-4 w-4 text-muted-foreground" />
                          )}
                        </div>
                      </button>

                      {isExpanded && (
                        <div className="px-4 pb-4 pl-12 space-y-3">
                          <div className="glass-card rounded-lg p-3 space-y-2">
                            <p className="text-xs text-muted-foreground"><strong className="text-foreground">Impact:</strong> {rec.impact}</p>
                            <p className="text-xs text-muted-foreground"><strong className="text-foreground">Reason:</strong> {rec.reason}</p>
                          </div>

                          {/* Metrics */}
                          {rec.metrics && (
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                              {Object.entries(rec.metrics).map(([key, value]) => {
                                if (!value) return null
                                return (
                                  <div key={key} className="glass-card rounded-lg p-2 text-center">
                                    <p className="text-[10px] text-muted-foreground capitalize">{key.replace(/_/g, ' ')}</p>
                                    <p className="text-xs font-medium text-foreground">{String(value)}</p>
                                  </div>
                                )
                              })}
                            </div>
                          )}

                          {/* Resolution Options */}
                          {rec.resolution_options && rec.resolution_options.length > 0 && (
                            <div>
                              <p className="text-xs font-medium text-foreground mb-1.5">Resolution Options:</p>
                              <div className="flex flex-wrap gap-1.5">
                                {rec.resolution_options.map((opt, i) => (
                                  <Badge key={i} variant="outline" className="bg-primary/5 text-primary border-primary/20 text-[10px]">
                                    {opt}
                                  </Badge>
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
          </div>
        </main>
      </div>
    </div>
  )
}
