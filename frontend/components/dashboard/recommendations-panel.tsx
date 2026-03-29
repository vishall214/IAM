"use client"

import { useState, useCallback } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { ActionType, Recommendation, RecommendationState } from "@/lib/types"
import { cn } from "@/lib/utils"
import { useAnalysis } from "@/lib/analysis-context"
import { 
  Trash2, 
  Eye, 
  Activity,
  Sparkles,
  Zap,
  CheckCircle,
  XCircle,
  AlertCircle,
  Loader,
  RotateCcw
} from "lucide-react"

interface RecommendationsPanelProps {
  recommendations: Recommendation[]
  selectedIds: string[]
  onToggle: (id: string) => void
  onSimulate: () => void
}

const actionConfig: Record<ActionType, {
  icon: React.ReactNode
  color: string
  bgColor: string
  borderColor: string
}> = {
  REMOVE: {
    icon: <Trash2 className="h-3.5 w-3.5" />,
    color: "text-red-500",
    bgColor: "bg-red-500/10",
    borderColor: "border-red-500/20"
  },
  REVIEW: {
    icon: <Eye className="h-3.5 w-3.5" />,
    color: "text-orange-500",
    bgColor: "bg-orange-500/10",
    borderColor: "border-orange-500/20"
  },
  MONITOR: {
    icon: <Activity className="h-3.5 w-3.5" />,
    color: "text-cyan-500",
    bgColor: "bg-cyan-500/10",
    borderColor: "border-cyan-500/20"
  }
}

function ConfidenceBadge({ confidence }: { confidence: number }) {
  const getColor = () => {
    if (confidence >= 90) return "text-green-500"
    if (confidence >= 80) return "text-orange-500"
    return "text-muted-foreground"
  }
  
  return (
    <div className="flex items-center gap-1">
      <Sparkles className={cn("h-3 w-3", getColor())} />
      <span className={cn("text-[10px] font-medium", getColor())}>{confidence}%</span>
    </div>
  )
}

export function RecommendationsPanel({ recommendations, selectedIds, onToggle, onSimulate }: RecommendationsPanelProps) {
  const selectedCount = selectedIds.length
  const { executeAction, actionError } = useAnalysis()
  const [executingRecIds, setExecutingRecIds] = useState<Set<string>>(new Set())
  const [actionErrors, setActionErrors] = useState<Map<string, string>>(new Map())
  const [showBulkConfirm, setShowBulkConfirm] = useState(false)
  const [isBulkExecuting, setIsBulkExecuting] = useState(false)

  // State machine: determine UI state for a recommendation
  const getRecommendationState = useCallback((rec: Recommendation): RecommendationState => {
    if (executingRecIds.has(rec.id)) {
      return "EXECUTING"
    }
    switch (rec.status) {
      case "revoked":
        return "REVOKED"
      case "reviewed":
        return "REVIEWED"
      case "ignored":
        return "IGNORED"
      default:
        return "PENDING"
    }
  }, [executingRecIds])

  // Single action handler: NO optimistic UI, wait for backend response
  const handleAction = async (recId: string, action: "revoke" | "review" | "ignore") => {
    setExecutingRecIds(prev => new Set(prev).add(recId))
    setActionErrors(prev => new Map(prev).set(recId, ""))
    
    try {
      await executeAction(recId, action)
      // Success - context updated, component re-renders with new status
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Action failed"
      setActionErrors(prev => new Map(prev).set(recId, errorMessage))
    } finally {
      setExecutingRecIds(prev => {
        const next = new Set(prev)
        next.delete(recId)
        return next
      })
    }
  }

  // Bulk action: execute all selected recommendations
  const handleBulkExecute = async () => {
    setShowBulkConfirm(false)
    setIsBulkExecuting(true)
    
    const selectedRecs = recommendations.filter(r => selectedIds.includes(r.id))
    const errors: Map<string, string> = new Map()
    
    // Execute each action sequentially
    for (const rec of selectedRecs) {
      setExecutingRecIds(prev => new Set(prev).add(rec.id))
      
      try {
        // Determine action based on recommendation type
        const action = rec.actionType === "REMOVE" ? "revoke" : "review"
        await executeAction(rec.id, action)
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Action failed"
        errors.set(rec.id, errorMessage)
      } finally {
        setExecutingRecIds(prev => {
          const next = new Set(prev)
          next.delete(rec.id)
          return next
        })
      }
    }
    
    setActionErrors(errors)
    setIsBulkExecuting(false)
    
    // Clear selection after bulk action
    if (errors.size === 0) {
      // All succeeded - clear selection
      selectedIds.forEach(id => onToggle(id))
    }
  }

  // Retry failed action
  const handleRetry = async (recId: string, action: "revoke" | "review" | "ignore") => {
    setActionErrors(prev => new Map(prev).set(recId, ""))
    await handleAction(recId, action)
  }

  return (
    <>
      <div className="glass-card rounded-xl overflow-hidden h-fit">
        {/* Header */}
        <div className="p-4 border-b border-border">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-medium text-foreground flex items-center gap-2">
                <Zap className="h-4 w-4 text-primary" />
                AI Recommendations
              </h3>
              <p className="text-xs text-muted-foreground">
                {recommendations.length} suggested actions
              </p>
            </div>
            {selectedCount > 0 && (
              <Badge className="bg-primary/10 text-primary border-primary/20 text-[10px]">
                {selectedCount} selected
              </Badge>
            )}
          </div>
          {actionError && (
            <div className="mt-2 flex items-center gap-1.5 text-[10px] text-red-500 bg-red-500/10 p-1.5 rounded">
              <AlertCircle className="h-3 w-3 flex-shrink-0" />
              {actionError}
            </div>
          )}
        </div>
        
        {/* Recommendations List */}
        <div className="max-h-[420px] overflow-y-auto">
          {recommendations.map((rec) => {
            const config = actionConfig[rec.actionType]
            const isSelected = selectedIds.includes(rec.id)
            const isHighRisk = rec.riskScore >= 80
            const state = getRecommendationState(rec)
            const isExecuting = state === "EXECUTING"
            const isCompleted = state === "REVOKED" || state === "REVIEWED" || state === "IGNORED"
            const recError = actionErrors.has(rec.id) ? actionErrors.get(rec.id) : ""
            const hasError = !!recError
            
            return (
              <div 
                key={rec.id}
                className={cn(
                  "p-3 border-b border-border transition-colors duration-150",
                  isSelected && "bg-primary/5",
                  isHighRisk && !isSelected && "glow-high-risk",
                  isCompleted && "opacity-60 bg-muted/30",
                  hasError && "bg-red-500/5 border-red-500/20"
                )}
              >
                <div className="flex items-start gap-2.5">
                  <Checkbox 
                    checked={isSelected}
                    onCheckedChange={() => onToggle(rec.id)}
                    disabled={isCompleted}
                    className="mt-0.5 h-4 w-4 data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                  />
                  
                  <div className="flex-1 min-w-0 space-y-2">
                    {/* Action Type Badge */}
                    <div className="flex items-center justify-between">
                      <Badge 
                        variant="outline" 
                        className={cn(
                          "text-[10px] font-medium flex items-center gap-1",
                          config.bgColor,
                          config.color,
                          config.borderColor
                        )}
                      >
                        {config.icon}
                        {rec.actionType}
                      </Badge>
                      <ConfidenceBadge confidence={rec.confidence} />
                    </div>
                    
                    {/* User & Permission */}
                    <div className="flex items-center gap-2">
                      <Avatar className="h-5 w-5">
                        <AvatarImage src={rec.user.avatar} />
                        <AvatarFallback className="bg-muted text-muted-foreground text-[9px]">
                          {rec.user.name.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-foreground truncate">{rec.user.name}</p>
                        <p className="text-[10px] text-muted-foreground truncate">{rec.permission}</p>
                      </div>
                    </div>
                    
                    {/* Risk Score */}
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-1 rounded-full bg-muted overflow-hidden">
                        <div 
                          className="h-full rounded-full risk-gradient"
                          style={{ width: `${rec.riskScore}%` }}
                        />
                      </div>
                      <span className={cn(
                        "text-[10px] font-medium",
                        rec.riskScore >= 80 ? "text-red-500" : 
                        rec.riskScore >= 60 ? "text-orange-500" : "text-muted-foreground"
                      )}>
                        {rec.riskScore}
                      </span>
                    </div>
                    
                    {/* Reasons */}
                    <ul className="space-y-0.5">
                      {rec.reasons.map((reason, idx) => (
                        <li key={idx} className="text-[10px] text-muted-foreground flex items-start gap-1">
                          <span className="text-primary">•</span>
                          {reason}
                        </li>
                      ))}
                    </ul>

                    {/* Error Message with Retry */}
                    {hasError && (
                      <div className="text-[9px] text-red-500 bg-red-500/10 px-2 py-1 rounded flex items-center justify-between">
                        <span className="flex items-center gap-1">
                          <AlertCircle className="h-3 w-3 flex-shrink-0" />
                          {recError}
                        </span>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-4 px-1.5 text-[8px] text-red-600 hover:bg-red-500/20"
                          onClick={() => handleRetry(rec.id, rec.actionType === "REMOVE" ? "revoke" : "review")}
                        >
                          <RotateCcw className="h-2.5 w-2.5 mr-0.5" />
                          Retry
                        </Button>
                      </div>
                    )}
                    
                    {/* Quick Actions */}
                    <div className="flex items-center gap-1.5">
                      {/* Apply / Revoke Button */}
                      <Button 
                        variant="ghost" 
                        size="sm"
                        disabled={isExecuting || isCompleted || hasError}
                        onClick={() => handleAction(rec.id, "revoke")}
                        className={cn(
                          "h-6 px-2 text-[10px]",
                          state === "REVOKED" ? "text-green-500 bg-green-500/10 hover:bg-green-500/20" :
                          state === "REVIEWED" || state === "IGNORED" ? "text-gray-400 cursor-not-allowed" :
                          "text-green-500 hover:bg-green-500/10 hover:text-green-500"
                        )}
                      >
                        {isExecuting ? (
                          <>
                            <Loader className="h-3 w-3 mr-1 animate-spin" />
                            Revoking...
                          </>
                        ) : state === "REVOKED" ? (
                          <>
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Revoked
                          </>
                        ) : (
                          <>
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Revoke
                          </>
                        )}
                      </Button>

                      {/* Review Button (for REMOVE recommendations) */}
                      {rec.actionType === "REMOVE" && (
                        <Button 
                          variant="ghost" 
                          size="sm"
                          disabled={isExecuting || isCompleted || hasError}
                          onClick={() => handleAction(rec.id, "review")}
                          className={cn(
                            "h-6 px-2 text-[10px]",
                            state === "REVIEWED" ? "text-orange-500 bg-orange-500/10 hover:bg-orange-500/20" :
                            state === "REVOKED" || state === "IGNORED" ? "text-gray-400 cursor-not-allowed" :
                            "text-orange-500 hover:bg-orange-500/10 hover:text-orange-500"
                          )}
                        >
                          {isExecuting ? (
                            <>
                              <Loader className="h-3 w-3 mr-1 animate-spin" />
                              Reviewing...
                            </>
                          ) : state === "REVIEWED" ? (
                            <>
                              <Eye className="h-3 w-3 mr-1" />
                              Under Review
                            </>
                          ) : (
                            <>
                              <Eye className="h-3 w-3 mr-1" />
                              Review
                            </>
                          )}
                        </Button>
                      )}

                      {/* Ignore Button */}
                      <Button 
                        variant="ghost" 
                        size="sm"
                        disabled={isCompleted || hasError}
                        onClick={() => handleAction(rec.id, "ignore")}
                        className={cn(
                          "h-6 px-2 text-[10px]",
                          state === "IGNORED" ? "text-gray-400 bg-muted hover:bg-muted" :
                          "text-muted-foreground hover:bg-muted"
                        )}
                      >
                        <XCircle className="h-3 w-3 mr-1" />
                        {state === "IGNORED" ? "Ignored" : "Ignore"}
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
        
        {/* Footer Actions */}
        <div className="p-3 border-t border-border space-y-2">
          <Button 
            size="sm"
            className={cn(
              "w-full text-xs",
              selectedCount > 0 
                ? "bg-primary hover:bg-primary/90 text-white glow-primary" 
                : "bg-muted text-muted-foreground cursor-not-allowed"
            )}
            disabled={selectedCount === 0 || isBulkExecuting}
            onClick={() => setShowBulkConfirm(true)}
          >
            {isBulkExecuting ? (
              <>
                <Loader className="h-3.5 w-3.5 mr-1.5 animate-spin" />
                Executing...
              </>
            ) : (
              <>
                <Sparkles className="h-3.5 w-3.5 mr-1.5" />
                Apply Fixes ({selectedCount})
              </>
            )}
          </Button>
          
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              className="flex-1 text-xs border-border text-foreground hover:bg-primary/10 hover:text-primary hover:border-primary/20"
              onClick={() => recommendations.forEach(r => !selectedIds.includes(r.id) && onToggle(r.id))}
              disabled={isBulkExecuting}
            >
              Select All
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              className="flex-1 text-xs border-border text-foreground hover:bg-muted"
              onClick={() => selectedIds.forEach(id => onToggle(id))}
              disabled={selectedCount === 0 || isBulkExecuting}
            >
              Clear
            </Button>
          </div>
        </div>
      </div>

      {/* Bulk Confirmation Dialog */}
      <AlertDialog open={showBulkConfirm} onOpenChange={setShowBulkConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Apply Selected Fixes?</AlertDialogTitle>
            <AlertDialogDescription>
              You're about to execute {selectedCount} action{selectedCount !== 1 ? 's' : ''}. 
              {' '}
              <span className="text-foreground font-medium">
                This will modify your system permissions.
              </span>
              {' '}
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleBulkExecute}
              className="bg-red-600 hover:bg-red-700"
            >
              Execute {selectedCount} Action{selectedCount !== 1 ? 's' : ''}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
