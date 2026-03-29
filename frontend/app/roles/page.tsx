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
  Shield,
  AlertCircle,
  ChevronDown,
  ChevronUp,
  Key,
  Users
} from "lucide-react"

export default function RolesPage() {
  const router = useRouter()
  const { data: analysisData } = useAnalysis()
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [expandedRole, setExpandedRole] = useState<string | null>(null)

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
              <p className="text-muted-foreground mb-6">Run an analysis first to see mined roles.</p>
              <Button onClick={() => router.push("/")} className="bg-primary hover:bg-primary/90 text-white">
                Go to Upload Page
              </Button>
            </div>
          </main>
        </div>
      </div>
    )
  }

  const roles = analysisData.roles

  const sensitivityColor = (level: string) => {
    switch (level.toLowerCase()) {
      case "critical": return "bg-red-500/10 text-red-500 border-red-500/20"
      case "high": return "bg-orange-500/10 text-orange-500 border-orange-500/20"
      case "medium": return "bg-yellow-500/10 text-yellow-500 border-yellow-500/20"
      default: return "bg-green-500/10 text-green-500 border-green-500/20"
    }
  }

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
                  <Shield className="h-5 w-5 text-primary" />
                  Mined Roles
                </h2>
                <p className="text-sm text-muted-foreground">
                  {roles.length} roles extracted from cluster analysis
                </p>
              </div>
            </div>

            {/* Roles Grid */}
            <div className="grid gap-4">
              {roles.map((role) => {
                const isExpanded = expandedRole === role.role_id
                return (
                  <div
                    key={role.role_id}
                    className="glass-card rounded-xl overflow-hidden transition-all"
                  >
                    {/* Role Header */}
                    <button
                      onClick={() => setExpandedRole(isExpanded ? null : role.role_id)}
                      className="w-full p-4 flex items-center justify-between text-left hover:bg-primary/5 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                          <Shield className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <h3 className="text-sm font-semibold text-foreground">{role.role_name}</h3>
                          <p className="text-xs text-muted-foreground">
                            Source: {role.source_cluster} • {role.coverage}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-3 text-right hidden sm:flex">
                          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                            <Key className="h-3.5 w-3.5" />
                            {role.permissions.length} perms
                          </div>
                          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                            <Users className="h-3.5 w-3.5" />
                            {role.user_count} users
                          </div>
                        </div>
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
                        {/* Notes */}
                        {role.notes && (
                          <p className="text-xs text-muted-foreground bg-muted/50 rounded-lg p-3 border border-border/50">
                            {role.notes}
                          </p>
                        )}

                        {/* Permissions Table */}
                        <div>
                          <h4 className="text-xs font-medium text-foreground mb-2 flex items-center gap-1.5">
                            <Key className="h-3.5 w-3.5 text-primary" /> Permissions
                          </h4>
                          <div className="overflow-x-auto">
                            <table className="w-full">
                              <thead>
                                <tr className="border-b border-border/50">
                                  <th className="text-left p-2 text-xs font-medium text-muted-foreground">Permission</th>
                                  <th className="text-left p-2 text-xs font-medium text-muted-foreground">Sensitivity</th>
                                  <th className="text-left p-2 text-xs font-medium text-muted-foreground">Justification</th>
                                </tr>
                              </thead>
                              <tbody>
                                {role.permissions.map((perm) => (
                                  <tr key={perm.permission_id} className="border-b border-border/20">
                                    <td className="p-2">
                                      <span className="text-sm text-foreground font-medium">{perm.permission_id}</span>
                                    </td>
                                    <td className="p-2">
                                      <Badge
                                        variant="outline"
                                        className={cn("text-[10px] capitalize", sensitivityColor(perm.sensitivity))}
                                      >
                                        {perm.sensitivity}
                                      </Badge>
                                    </td>
                                    <td className="p-2">
                                      <span className="text-xs text-muted-foreground">{perm.justification}</span>
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </div>
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
