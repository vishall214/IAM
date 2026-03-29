"use client"

import { useEffect, useState } from "react"
import { AlertTriangle, AlertCircle, CheckCircle, Gauge, Clock, Database } from "lucide-react"
import { TransformedSummary, TransformedSparkline } from "@/lib/transform"
import { 
  LineChart, 
  Line, 
  ResponsiveContainer,
  RadialBarChart,
  RadialBar
} from "recharts"

interface SummaryCardsProps {
  summary: TransformedSummary
  sparklineData: TransformedSparkline
}

function SparklineChart({ data, color }: { data: number[], color: string }) {
  const chartData = data.map((value, index) => ({ value, index }))
  
  return (
    <ResponsiveContainer width="100%" height={32}>
      <LineChart data={chartData}>
        <Line 
          type="monotone" 
          dataKey="value" 
          stroke={color}
          strokeWidth={1.5}
          dot={false}
        />
      </LineChart>
    </ResponsiveContainer>
  )
}

function GaugeChart({ value }: { value: number }) {
  const data = [{ value, fill: "url(#gaugeGradient)" }]
  
  return (
    <ResponsiveContainer width="100%" height={80}>
      <RadialBarChart 
        cx="50%" 
        cy="100%" 
        innerRadius="75%" 
        outerRadius="100%" 
        startAngle={180} 
        endAngle={0}
        data={data}
      >
        <defs>
          <linearGradient id="gaugeGradient" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#7C3AED" />
            <stop offset="100%" stopColor="#DB2777" />
          </linearGradient>
        </defs>
        <RadialBar 
          dataKey="value" 
          cornerRadius={8}
          background={{ fill: "rgba(124, 58, 237, 0.1)" }}
        />
      </RadialBarChart>
    </ResponsiveContainer>
  )
}

function AnimatedNumber({ value, suffix = "" }: { value: number, suffix?: string }) {
  const [displayValue, setDisplayValue] = useState(0)
  
  useEffect(() => {
    const duration = 1000
    const steps = 30
    const increment = value / steps
    let current = 0
    
    const timer = setInterval(() => {
      current += increment
      if (current >= value) {
        setDisplayValue(value)
        clearInterval(timer)
      } else {
        setDisplayValue(Math.floor(current))
      }
    }, duration / steps)
    
    return () => clearInterval(timer)
  }, [value])
  
  return <span>{displayValue.toLocaleString()}{suffix}</span>
}

interface SummaryCardProps {
  title: string
  value: number
  suffix?: string
  icon: React.ReactNode
  iconBg: string
  iconColor: string
  sparklineData?: number[]
  sparklineColor?: string
  trend?: { value: number, positive: boolean }
  hasGlow?: boolean
}

function SummaryCard({ 
  title, 
  value, 
  suffix = "",
  icon, 
  iconBg,
  iconColor,
  sparklineData: sparkData,
  sparklineColor,
  trend,
  hasGlow = false
}: SummaryCardProps) {
  return (
    <div 
      className={`glass-card rounded-xl p-4 relative overflow-hidden group ${hasGlow ? 'glow-secondary' : ''}`}
    >
      <div className="flex items-start justify-between mb-3">
        <div 
          className="p-2 rounded-lg"
          style={{ backgroundColor: iconBg }}
        >
          <div style={{ color: iconColor }}>{icon}</div>
        </div>
        {trend && (
          <span className={`text-xs font-medium px-2 py-0.5 rounded-md ${
            trend.positive ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'
          }`}>
            {trend.positive ? '+' : '-'}{trend.value}%
          </span>
        )}
      </div>
      
      <p className="text-xs text-muted-foreground mb-1 uppercase tracking-wide">{title}</p>
      <p className="text-2xl font-semibold text-foreground tracking-tight">
        <AnimatedNumber value={value} suffix={suffix} />
      </p>
      
      {sparkData && sparklineColor && (
        <div className="mt-3">
          <SparklineChart data={sparkData} color={sparklineColor} />
        </div>
      )}
    </div>
  )
}

export function SummaryCards({ summary, sparklineData }: SummaryCardsProps) {
  return (
    <div className="space-y-4">
      {/* Meta info */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-medium text-foreground">Risk Overview</h2>
        <div className="flex items-center gap-4 text-xs text-muted-foreground">
          <div className="flex items-center gap-1.5">
            <Clock className="h-3.5 w-3.5" />
            <span>Last analyzed: {summary.lastAnalyzed}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Database className="h-3.5 w-3.5" />
            <span>Dataset: {summary.datasetSize} users</span>
          </div>
        </div>
      </div>
      
      {/* Cards Grid - 4 cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <SummaryCard
          title="High Risk Users"
          value={summary.highRiskUsers}
          icon={<AlertTriangle className="h-4 w-4" />}
          iconBg="rgba(220, 38, 38, 0.1)"
          iconColor="#DC2626"
          sparklineData={sparklineData.high}
          sparklineColor="#DC2626"
          trend={{ value: 12, positive: false }}
          hasGlow={true}
        />
        
        <SummaryCard
          title="Medium Risk Users"
          value={summary.mediumRiskUsers}
          icon={<AlertCircle className="h-4 w-4" />}
          iconBg="rgba(245, 158, 11, 0.1)"
          iconColor="#F59E0B"
          sparklineData={sparklineData.medium}
          sparklineColor="#F59E0B"
        />
        
        <SummaryCard
          title="Low Risk Users"
          value={summary.lowRiskUsers}
          icon={<CheckCircle className="h-4 w-4" />}
          iconBg="rgba(16, 185, 129, 0.1)"
          iconColor="#10B981"
          sparklineData={sparklineData.low}
          sparklineColor="#10B981"
          trend={{ value: 8, positive: true }}
        />
        
        {/* Average Risk Score with radial chart */}
        <div className="glass-card rounded-xl p-4 relative overflow-hidden">
          <div className="flex items-start justify-between mb-2">
            <div className="p-2 rounded-lg" style={{ backgroundColor: 'rgba(124, 58, 237, 0.1)' }}>
              <Gauge className="h-4 w-4 text-primary" />
            </div>
          </div>
          <p className="text-xs text-muted-foreground mb-1 uppercase tracking-wide">Average Risk Score</p>
          <div className="flex items-center gap-2">
            <span className="text-2xl font-semibold gradient-text">
              <AnimatedNumber value={summary.averageRiskScore} />
            </span>
            <span className="text-sm text-muted-foreground">/100</span>
          </div>
          <div className="mt-1">
            <GaugeChart value={summary.averageRiskScore} />
          </div>
        </div>
      </div>
    </div>
  )
}
