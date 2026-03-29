"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { TransformedSummary } from "@/lib/transform"
import { cn } from "@/lib/utils"
import { 
  ArrowRight, 
  X, 
  CheckCircle2, 
  TrendingDown,
  Sparkles,
  Shield,
  Key,
  Users,
  Zap
} from "lucide-react"

interface ImpactSimulationProps {
  summary: TransformedSummary
  selectedCount: number
  onApply: () => void
  onClose: () => void
}

interface MetricComparison {
  label: string
  icon: React.ReactNode
  before: number
  after: number
  unit?: string
  improvement: number
}

function AnimatedNumber({ 
  value, 
  duration = 1500,
  suffix = ""
}: { 
  value: number
  duration?: number
  suffix?: string 
}) {
  const [displayValue, setDisplayValue] = useState(0)
  
  useEffect(() => {
    const steps = 60
    const increment = value / steps
    let current = 0
    let frame = 0
    
    const animate = () => {
      frame++
      current = Math.min(value, Math.floor((frame / steps) * value))
      setDisplayValue(current)
      
      if (frame < steps) {
        requestAnimationFrame(animate)
      } else {
        setDisplayValue(value)
      }
    }
    
    requestAnimationFrame(animate)
  }, [value, duration])
  
  return <span>{displayValue.toLocaleString()}{suffix}</span>
}

function MetricCard({ metric, delay }: { metric: MetricComparison; delay: number }) {
  const [visible, setVisible] = useState(false)
  
  useEffect(() => {
    const timer = setTimeout(() => setVisible(true), delay)
    return () => clearTimeout(timer)
  }, [delay])
  
  return (
    <div 
      className={cn(
        "transition-all duration-300 transform",
        visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"
      )}
    >
      <div className="flex items-center gap-2 mb-2">
        <div className="w-6 h-6 rounded-md bg-primary/10 flex items-center justify-center text-primary">
          {metric.icon}
        </div>
        <span className="text-xs font-medium text-muted-foreground">{metric.label}</span>
      </div>
      
      <div className="flex items-center justify-between gap-3">
        {/* Before */}
        <div className="flex-1 glass-card rounded-lg p-3 text-center border border-red-500/10">
          <p className="text-[10px] text-muted-foreground mb-0.5">Before</p>
          <p className="text-lg font-semibold text-foreground">
            {metric.before.toLocaleString()}{metric.unit}
          </p>
        </div>
        
        {/* Arrow */}
        <div className="flex flex-col items-center gap-0.5">
          <ArrowRight className="h-4 w-4 text-primary" />
          <span className="text-[10px] font-medium text-green-500">
            -{metric.improvement}%
          </span>
        </div>
        
        {/* After */}
        <div className="flex-1 glass-card rounded-lg p-3 text-center border border-green-500/10">
          <p className="text-[10px] text-muted-foreground mb-0.5">After</p>
          <p className="text-lg font-semibold text-green-500">
            <AnimatedNumber value={metric.after} suffix={metric.unit} />
          </p>
        </div>
      </div>
    </div>
  )
}

export function ImpactSimulation({ summary, selectedCount, onApply, onClose }: ImpactSimulationProps) {
  const [phase, setPhase] = useState<"simulating" | "complete">("simulating")
  
  // Calculate simulated improvements based on selections
  const permissionReduction = Math.min(42, selectedCount * 6)
  const highRiskReduction = Math.min(60, selectedCount * 8)
  const avgPermReduction = Math.min(35, selectedCount * 5)
  
  const metrics: MetricComparison[] = [
    {
      label: "Total Permissions",
      icon: <Key className="h-4 w-4" />,
      before: summary.totalPermissions,
      after: Math.round(summary.totalPermissions * (1 - permissionReduction / 100)),
      improvement: permissionReduction
    },
    {
      label: "High Risk Users",
      icon: <Users className="h-4 w-4" />,
      before: summary.highRiskUsers,
      after: Math.max(1, Math.round(summary.highRiskUsers * (1 - highRiskReduction / 100))),
      improvement: highRiskReduction
    },
    {
      label: "Avg Permissions/User",
      icon: <Shield className="h-4 w-4" />,
      before: Math.round(summary.totalPermissions / summary.datasetSize),
      after: Math.round((summary.totalPermissions / summary.datasetSize) * (1 - avgPermReduction / 100)),
      improvement: avgPermReduction
    }
  ]
  
  useEffect(() => {
    const timer = setTimeout(() => setPhase("complete"), 2000)
    return () => clearTimeout(timer)
  }, [])
  
  return (
    <div className="glass-card rounded-xl overflow-hidden relative">
      {/* Close button */}
      <button 
        onClick={onClose}
        className="absolute top-3 right-3 z-10 p-1.5 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
      >
        <X className="h-4 w-4" />
      </button>
      
      {/* Header */}
      <div className="p-4 border-b border-border">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
            <Sparkles className="h-4 w-4 text-primary" />
          </div>
          <div>
            <h3 className="text-sm font-medium text-foreground">Impact Simulation</h3>
            <p className="text-xs text-muted-foreground">
              Simulating {selectedCount} recommended fixes
            </p>
          </div>
        </div>
      </div>
      
      {/* Content */}
      <div className="p-4">
        {phase === "simulating" ? (
          <div className="py-8 text-center">
            <div className="relative inline-flex items-center justify-center">
              <div className="absolute w-16 h-16 rounded-full bg-primary/10 animate-ping" />
              <div className="absolute w-14 h-14 rounded-full bg-primary/20 animate-pulse" />
              <div className="relative w-10 h-10 rounded-full bg-primary flex items-center justify-center">
                <Zap className="h-5 w-5 text-white animate-pulse" />
              </div>
            </div>
            <p className="mt-4 text-sm font-medium text-foreground">Running Simulation...</p>
            <p className="text-xs text-muted-foreground mt-0.5">Analyzing impact of selected changes</p>
            
            <div className="mt-4 flex items-center justify-center gap-1">
              {[0, 1, 2].map((i) => (
                <div 
                  key={i}
                  className="w-1.5 h-1.5 rounded-full bg-primary animate-bounce"
                  style={{ animationDelay: `${i * 0.15}s` }}
                />
              ))}
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Success Banner */}
            <div className="flex items-center gap-2 p-3 rounded-lg bg-green-500/5 border border-green-500/10">
              <CheckCircle2 className="h-4 w-4 text-green-500 flex-shrink-0" />
              <div>
                <p className="text-xs font-medium text-green-500">Simulation Complete</p>
                <p className="text-[10px] text-muted-foreground">
                  Applying these changes will reduce your risk profile
                </p>
              </div>
            </div>
            
            {/* Metrics Comparison */}
            <div className="grid gap-4">
              {metrics.map((metric, index) => (
                <MetricCard 
                  key={metric.label} 
                  metric={metric} 
                  delay={index * 150}
                />
              ))}
            </div>
            
            {/* Summary Stats */}
            <div className="grid grid-cols-3 gap-3 pt-2">
              <div className="text-center p-3 rounded-lg bg-muted">
                <TrendingDown className="h-4 w-4 text-green-500 mx-auto mb-1" />
                <p className="text-lg font-semibold text-green-500">-{permissionReduction}%</p>
                <p className="text-[10px] text-muted-foreground">Permissions</p>
              </div>
              <div className="text-center p-3 rounded-lg bg-muted">
                <Shield className="h-4 w-4 text-green-500 mx-auto mb-1" />
                <p className="text-lg font-semibold text-green-500">+24</p>
                <p className="text-[10px] text-muted-foreground">Security Score</p>
              </div>
              <div className="text-center p-3 rounded-lg bg-muted">
                <CheckCircle2 className="h-4 w-4 text-green-500 mx-auto mb-1" />
                <p className="text-lg font-semibold text-green-500">{selectedCount}</p>
                <p className="text-[10px] text-muted-foreground">Fixes Applied</p>
              </div>
            </div>
          </div>
        )}
      </div>
      
      {/* Footer */}
      {phase === "complete" && (
        <div className="p-3 border-t border-border flex gap-2">
          <Button 
            variant="outline" 
            size="sm"
            className="flex-1 text-xs border-border text-foreground hover:bg-muted"
            onClick={onClose}
          >
            Cancel
          </Button>
          <Button 
            size="sm"
            className="flex-1 text-xs bg-green-500 hover:bg-green-600 text-white"
            onClick={onApply}
          >
            <CheckCircle2 className="h-3.5 w-3.5 mr-1.5" />
            Apply All Fixes
          </Button>
        </div>
      )}
    </div>
  )
}
