"use client"

import { useState, useMemo } from "react"
import { Search, Filter, ChevronDown, ExternalLink, AlertTriangle, Zap, Database, Clock } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { mockUsers } from "@/lib/mock-data"
import { User, RiskLevel, RiskReason } from "@/lib/types"
import { cn } from "@/lib/utils"

interface RiskHeatmapTableProps {
  onUserClick: (user: User) => void
}

const reasonIcons: Record<RiskReason, React.ReactNode> = {
  "Unused Access": <Clock className="h-3 w-3" />,
  "Peer Deviation": <AlertTriangle className="h-3 w-3" />,
  "Sensitive Data": <Database className="h-3 w-3" />,
  "Infrequent Usage": <Clock className="h-3 w-3" />,
  "Excessive Permissions": <Zap className="h-3 w-3" />,
  "Stale Account": <Clock className="h-3 w-3" />,
}

function RiskBadge({ level }: { level: RiskLevel }) {
  const styles = {
    high: "bg-red-500/10 text-red-500 border-red-500/20",
    medium: "bg-orange-500/10 text-orange-500 border-orange-500/20",
    low: "bg-green-500/10 text-green-500 border-green-500/20"
  }
  
  return (
    <Badge 
      variant="outline" 
      className={cn("capitalize font-medium text-xs", styles[level])}
    >
      {level}
    </Badge>
  )
}

function RiskProgressBar({ score }: { score: number }) {
  return (
    <div className="flex items-center gap-2 min-w-[120px]">
      <div className="flex-1 h-2 rounded-full bg-muted/50 overflow-hidden">
        <div 
          className="h-full rounded-full risk-gradient transition-all duration-500"
          style={{ width: `${score}%` }}
        />
      </div>
      <span className="text-sm font-medium text-foreground w-8">{score}</span>
    </div>
  )
}

function ReasonPill({ reason }: { reason: RiskReason }) {
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs bg-muted/50 text-muted-foreground border border-border/50">
      {reasonIcons[reason]}
      {reason}
    </span>
  )
}

export function RiskHeatmapTable({ onUserClick }: RiskHeatmapTableProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [departmentFilter, setDepartmentFilter] = useState<string>("all")
  const [riskFilter, setRiskFilter] = useState<RiskLevel | "all">("all")
  
  const departments = useMemo(() => 
    ["all", ...new Set(mockUsers.map(u => u.department))],
    []
  )
  
  const filteredUsers = useMemo(() => {
    return mockUsers.filter(user => {
      const matchesSearch = user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           user.email.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesDepartment = departmentFilter === "all" || user.department === departmentFilter
      const matchesRisk = riskFilter === "all" || user.riskLevel === riskFilter
      
      return matchesSearch && matchesDepartment && matchesRisk
    })
  }, [searchQuery, departmentFilter, riskFilter])
  
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
    const diffDays = Math.floor(diffHours / 24)
    
    if (diffHours < 1) return "Just now"
    if (diffHours < 24) return `${diffHours}h ago`
    if (diffDays < 7) return `${diffDays}d ago`
    return date.toLocaleDateString()
  }

  return (
    <div className="glass-card rounded-2xl overflow-hidden">
      {/* Header */}
      <div className="p-5 border-b border-border/50">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-lg font-semibold text-foreground">Risk Heatmap</h3>
            <p className="text-sm text-muted-foreground">Detailed user risk analysis</p>
          </div>
          
          <div className="flex items-center gap-3">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search users..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-9 pl-9 pr-4 rounded-lg bg-muted/50 border border-border/50 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-all w-[200px]"
              />
            </div>
            
            {/* Department Filter */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="bg-muted/50 border-border/50 text-foreground">
                  <Filter className="h-4 w-4 mr-2" />
                  {departmentFilter === "all" ? "Department" : departmentFilter}
                  <ChevronDown className="h-4 w-4 ml-2" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="bg-popover border-border/50">
                {departments.map(dept => (
                  <DropdownMenuItem 
                    key={dept}
                    onClick={() => setDepartmentFilter(dept)}
                    className="text-foreground hover:bg-primary/10 capitalize"
                  >
                    {dept === "all" ? "All Departments" : dept}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
            
            {/* Risk Filter */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="bg-muted/50 border-border/50 text-foreground">
                  {riskFilter === "all" ? "Risk Level" : <RiskBadge level={riskFilter} />}
                  <ChevronDown className="h-4 w-4 ml-2" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="bg-popover border-border/50">
                <DropdownMenuItem 
                  onClick={() => setRiskFilter("all")}
                  className="text-foreground hover:bg-primary/10"
                >
                  All Levels
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={() => setRiskFilter("high")}
                  className="text-foreground hover:bg-primary/10"
                >
                  <RiskBadge level="high" />
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={() => setRiskFilter("medium")}
                  className="text-foreground hover:bg-primary/10"
                >
                  <RiskBadge level="medium" />
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={() => setRiskFilter("low")}
                  className="text-foreground hover:bg-primary/10"
                >
                  <RiskBadge level="low" />
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
      
      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border/50 bg-muted/30">
              <th className="text-left p-4 text-sm font-medium text-muted-foreground">User</th>
              <th className="text-left p-4 text-sm font-medium text-muted-foreground">Department</th>
              <th className="text-left p-4 text-sm font-medium text-muted-foreground">Risk Score</th>
              <th className="text-left p-4 text-sm font-medium text-muted-foreground">Risk Level</th>
              <th className="text-left p-4 text-sm font-medium text-muted-foreground">Reasons</th>
              <th className="text-left p-4 text-sm font-medium text-muted-foreground">Last Accessed</th>
              <th className="text-center p-4 text-sm font-medium text-muted-foreground">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.map((user) => (
              <tr 
                key={user.id}
                className={cn(
                  "border-b border-border/30 transition-all duration-200 cursor-pointer hover:bg-primary/5",
                  user.riskLevel === "high" && "glow-high-risk"
                )}
                onClick={() => onUserClick(user)}
              >
                <td className="p-4">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-9 w-9 ring-2 ring-border/50">
                      <AvatarImage src={user.avatar} />
                      <AvatarFallback className="bg-primary/20 text-primary text-sm">
                        {user.name.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium text-foreground">{user.name}</p>
                      <p className="text-xs text-muted-foreground">{user.email}</p>
                    </div>
                  </div>
                </td>
                <td className="p-4">
                  <span className="text-sm text-foreground">{user.department}</span>
                </td>
                <td className="p-4">
                  <RiskProgressBar score={user.riskScore} />
                </td>
                <td className="p-4">
                  <RiskBadge level={user.riskLevel} />
                </td>
                <td className="p-4">
                  <div className="flex flex-wrap gap-1 max-w-[250px]">
                    {user.reasons.slice(0, 2).map((reason) => (
                      <ReasonPill key={reason} reason={reason} />
                    ))}
                    {user.reasons.length > 2 && (
                      <span className="text-xs text-muted-foreground px-2 py-0.5">
                        +{user.reasons.length - 2} more
                      </span>
                    )}
                  </div>
                </td>
                <td className="p-4">
                  <span className="text-sm text-muted-foreground">{formatDate(user.lastAccessed)}</span>
                </td>
                <td className="p-4 text-center">
                  <Button 
                    variant="ghost" 
                    size="icon"
                    className="h-8 w-8 text-muted-foreground hover:text-primary hover:bg-primary/10"
                    onClick={(e) => {
                      e.stopPropagation()
                      onUserClick(user)
                    }}
                  >
                    <ExternalLink className="h-4 w-4" />
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {/* Footer */}
      <div className="p-4 border-t border-border/50 flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Showing {filteredUsers.length} of {mockUsers.length} users
        </p>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="bg-muted/50 border-border/50 text-foreground" disabled>
            Previous
          </Button>
          <Button variant="outline" size="sm" className="bg-muted/50 border-border/50 text-foreground" disabled>
            Next
          </Button>
        </div>
      </div>
    </div>
  )
}
