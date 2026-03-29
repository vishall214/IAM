"use client"

import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { User, RiskLevel, AccessEvent } from "@/lib/types"
import { cn } from "@/lib/utils"
import { 
  Shield, 
  Activity, 
  Users, 
  Clock, 
  AlertTriangle,
  CheckCircle,
  XCircle,
  TrendingUp,
  TrendingDown
} from "lucide-react"
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  ResponsiveContainer,
  Tooltip
} from "recharts"

interface UserDetailDrawerProps {
  user: User | null
  open: boolean
  onOpenChange: (open: boolean) => void
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

function MetricBar({ label, value, icon, color }: { 
  label: string
  value: number
  icon: React.ReactNode
  color: string 
}) {
  const isHigh = value >= 70
  
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          {icon}
          <span>{label}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="text-xs font-medium text-foreground">{value}</span>
          {isHigh ? (
            <TrendingUp className="h-3 w-3 text-red-500" />
          ) : (
            <TrendingDown className="h-3 w-3 text-green-500" />
          )}
        </div>
      </div>
      <div className="h-1.5 rounded-full bg-muted overflow-hidden">
        <div 
          className="h-full rounded-full transition-all duration-500"
          style={{ 
            width: `${value}%`,
            backgroundColor: color
          }}
        />
      </div>
    </div>
  )
}

function AccessTimeline({ events }: { events: AccessEvent[] }) {
  const riskColors = {
    high: "bg-red-500",
    medium: "bg-orange-500",
    low: "bg-green-500",
    none: "bg-muted-foreground"
  }
  
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }
  
  return (
    <div className="space-y-3">
      {events.slice(0, 5).map((event, index) => (
        <div key={index} className="flex items-start gap-3">
          <div className={cn("w-2 h-2 rounded-full mt-2 flex-shrink-0", riskColors[event.riskImpact])} />
          <div className="flex-1 min-w-0">
            <p className="text-sm text-foreground">
              <span className="font-medium">{event.action}</span>
              {" "}
              <span className="text-muted-foreground">{event.resource}</span>
            </p>
            <p className="text-xs text-muted-foreground">{formatDate(event.date)}</p>
          </div>
        </div>
      ))}
    </div>
  )
}

export function UserDetailDrawer({ user, open, onOpenChange }: UserDetailDrawerProps) {
  if (!user) return null
  
  const riskBreakdownData = [
    { name: 'Sensitivity', value: user.sensitivityScore, fill: '#7C3AED' },
    { name: 'Usage', value: user.usageFrequency, fill: '#DB2777' },
    { name: 'Peer Gap', value: user.peerComparison, fill: '#06B6D4' },
    { name: 'Recency', value: user.recencyGap, fill: '#F59E0B' },
  ]

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-md bg-background border-l border-border p-0 overflow-hidden">
        <ScrollArea className="h-full">
          <div className="p-5 space-y-5">
            {/* Header */}
            <SheetHeader className="space-y-3">
              <div className="flex items-center gap-3">
                <Avatar className="h-12 w-12">
                  <AvatarImage src={user.avatar} />
                  <AvatarFallback className="bg-muted text-muted-foreground">
                    {user.name.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <SheetTitle className="text-base text-foreground">{user.name}</SheetTitle>
                  <SheetDescription className="text-xs text-muted-foreground">{user.email}</SheetDescription>
                  <div className="flex items-center gap-2 mt-1.5">
                    <Badge variant="outline" className="bg-muted text-foreground border-border text-xs">
                      {user.department}
                    </Badge>
                    <RiskBadge level={user.riskLevel} />
                  </div>
                </div>
              </div>
            </SheetHeader>
            
            {/* AI Explanation Header */}
            <div className="glass-card rounded-lg p-3 border-l-2 border-l-primary">
              <div className="flex items-center gap-2 mb-1.5">
                <div className="w-5 h-5 rounded-md bg-primary/10 flex items-center justify-center">
                  <span className="text-[10px] font-bold text-primary">AI</span>
                </div>
                <span className="text-xs font-medium text-foreground">Risk Analysis Summary</span>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                This user has a <span className={cn(
                  "font-medium",
                  user.riskLevel === "high" ? "text-red-500" : 
                  user.riskLevel === "medium" ? "text-orange-500" : "text-green-500"
                )}>{user.riskLevel} risk score of {user.riskScore}</span> based on {user.reasons.length} contributing factors. 
                Key concerns include {user.reasons.slice(0, 2).join(" and ").toLowerCase()}.
              </p>
            </div>
            
            {/* Risk Score Card */}
            <div className="glass-card rounded-lg p-4 text-center">
              <p className="text-xs text-muted-foreground mb-2">Overall Risk Score</p>
              <div className="relative inline-flex items-center justify-center">
                <svg className="w-24 h-24 -rotate-90">
                  <circle
                    cx="48"
                    cy="48"
                    r="40"
                    fill="none"
                    stroke="rgba(124, 58, 237, 0.1)"
                    strokeWidth="8"
                  />
                  <circle
                    cx="48"
                    cy="48"
                    r="40"
                    fill="none"
                    stroke="url(#scoreGradient)"
                    strokeWidth="8"
                    strokeLinecap="round"
                    strokeDasharray={`${(user.riskScore / 100) * 251} 251`}
                    className="transition-all duration-1000"
                  />
                  <defs>
                    <linearGradient id="scoreGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#7C3AED" />
                      <stop offset="100%" stopColor="#DB2777" />
                    </linearGradient>
                  </defs>
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-2xl font-semibold gradient-text">{user.riskScore}</span>
                </div>
              </div>
              <p className="text-[11px] text-muted-foreground mt-2">
                {user.permissions} permissions • Last active {new Date(user.lastAccessed).toLocaleDateString()}
              </p>
            </div>
            
            {/* Risk Breakdown */}
            <div className="space-y-3">
              <h4 className="text-xs font-medium text-foreground flex items-center gap-2">
                <Activity className="h-3.5 w-3.5 text-primary" />
                Risk Breakdown
              </h4>
              
              <div className="h-32">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={riskBreakdownData} layout="vertical">
                    <XAxis type="number" domain={[0, 100]} hide />
                    <YAxis 
                      type="category" 
                      dataKey="name" 
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: '#9CA3AF', fontSize: 10 }}
                      width={60}
                    />
                    <Tooltip 
                      contentStyle={{ 
                        background: '#111111',
                        border: '1px solid rgba(255, 255, 255, 0.08)',
                        borderRadius: '6px',
                        color: '#E5E7EB',
                        fontSize: '11px'
                      }}
                    />
                    <Bar 
                      dataKey="value" 
                      radius={[0, 3, 3, 0]}
                      background={{ fill: 'rgba(124, 58, 237, 0.08)', radius: 3 }}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
            
            {/* Detailed Metrics */}
            <div className="space-y-3">
              <h4 className="text-xs font-medium text-foreground flex items-center gap-2">
                <Shield className="h-3.5 w-3.5 text-primary" />
                Detailed Metrics
              </h4>
              
              <div className="glass-card rounded-lg p-3 space-y-3">
                <MetricBar 
                  label="Sensitivity Score"
                  value={user.sensitivityScore}
                  icon={<AlertTriangle className="h-3.5 w-3.5" />}
                  color="#7C3AED"
                />
                <MetricBar 
                  label="Usage Frequency"
                  value={user.usageFrequency}
                  icon={<Activity className="h-3.5 w-3.5" />}
                  color="#DB2777"
                />
                <MetricBar 
                  label="Peer Comparison"
                  value={user.peerComparison}
                  icon={<Users className="h-3.5 w-3.5" />}
                  color="#06B6D4"
                />
                <MetricBar 
                  label="Recency Gap"
                  value={user.recencyGap}
                  icon={<Clock className="h-3.5 w-3.5" />}
                  color="#F59E0B"
                />
              </div>
            </div>
            
            {/* Risk Factors */}
            <div className="space-y-2">
              <h4 className="text-xs font-medium text-foreground">Risk Factors</h4>
              <div className="flex flex-wrap gap-1.5">
                {user.reasons.map((reason) => (
                  <Badge 
                    key={reason}
                    variant="outline" 
                    className="bg-red-500/5 text-red-500 border-red-500/20 text-[10px]"
                  >
                    {reason}
                  </Badge>
                ))}
              </div>
            </div>
            
            {/* Access Activity Timeline */}
            <div className="space-y-2">
              <h4 className="text-xs font-medium text-foreground flex items-center gap-2">
                <Clock className="h-3.5 w-3.5 text-primary" />
                Recent Activity
              </h4>
              <div className="glass-card rounded-lg p-3">
                <AccessTimeline events={user.accessHistory} />
              </div>
            </div>
            
            {/* Actions */}
            <div className="flex gap-2 pt-2">
              <Button size="sm" className="flex-1 bg-primary hover:bg-primary/90 text-white text-xs">
                <CheckCircle className="h-3.5 w-3.5 mr-1.5" />
                Review Access
              </Button>
              <Button size="sm" variant="outline" className="flex-1 border-border text-foreground hover:bg-destructive/10 hover:text-destructive hover:border-destructive/30 text-xs">
                <XCircle className="h-3.5 w-3.5 mr-1.5" />
                Revoke Access
              </Button>
            </div>
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  )
}
