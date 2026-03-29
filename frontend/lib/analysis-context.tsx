"use client"

import React, { createContext, useContext, useState, useCallback } from "react"
import { AnalysisResult, AnalysisRequest } from "./api-types"
import { Recommendation } from "./types"
import { analyzeData, uploadCSV, revokeAccess, reviewAccess, ignoreAccess } from "./api"

interface AnalysisContextType {
  /** The full analysis result from the backend */
  data: AnalysisResult | null
  /** User metadata (name, email) for display */
  userMetadata: Map<string, { name: string; email: string }> | null
  /** Whether an analysis is currently running */
  isLoading: boolean
  /** Error message if analysis failed */
  error: string | null
  /** Run analysis with JSON data */
  runAnalysis: (payload: AnalysisRequest) => Promise<void>
  /** Run analysis by uploading a CSV file */
  runCSVAnalysis: (file: File) => Promise<void>
  /** Clear the current results */
  clearResults: () => void
  /** Execute action on recommendation (revoke, review, or ignore) */
  executeAction: (recommendationId: string, action: "revoke" | "review" | "ignore") => Promise<void>
  /** Get action error if any */
  actionError: string | null
  /** Clear action error */
  clearActionError: () => void
}

const AnalysisContext = createContext<AnalysisContextType | null>(null)

export function AnalysisProvider({ children }: { children: React.ReactNode }) {
  const [data, setData] = useState<AnalysisResult | null>(null)
  const [userMetadata, setUserMetadata] = useState<Map<string, { name: string; email: string }> | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [actionError, setActionError] = useState<string | null>(null)

  const runAnalysis = useCallback(async (payload: AnalysisRequest) => {
    setIsLoading(true)
    setError(null)
    try {
      // Store user metadata for frontend display
      const metadata = new Map(payload.users.map(u => [
        u.user_id,
        { name: u.name || u.user_id, email: u.email || `${u.user_id.toLowerCase()}@company.com` }
      ]))
      setUserMetadata(metadata)
      
      const result = await analyzeData(payload)
      setData(result)
    } catch (err) {
      const message = err instanceof Error ? err.message : "Analysis failed"
      setError(message)
      throw err
    } finally {
      setIsLoading(false)
    }
  }, [])

  const runCSVAnalysis = useCallback(async (file: File) => {
    setIsLoading(true)
    setError(null)
    try {
      const result = await uploadCSV(file)
      setData(result)
      // CSV doesn't have name/email, so we'll generate placeholders
      const metadata = new Map()
      // We can extract from risk_scores if available
      setUserMetadata(metadata)
    } catch (err) {
      const message = err instanceof Error ? err.message : "CSV upload failed"
      setError(message)
      throw err
    } finally {
      setIsLoading(false)
    }
  }, [])

  const clearResults = useCallback(() => {
    setData(null)
    setUserMetadata(null)
    setError(null)
  }, [])

  const executeAction = useCallback(async (recommendationId: string, action: "revoke" | "review" | "ignore") => {
    setActionError(null)
    try {
      if (!data?.recommendations) {
        throw new Error("No recommendations available")
      }

      // Find the recommendation
      const rec = data.recommendations.find(r => r.id === recommendationId)
      if (!rec) {
        throw new Error("Recommendation not found")
      }

      // Use backend IDs directly - they come in snake_case from the backend
      const userId = rec.user_id || rec.userId
      const permissionId = rec.permission_id || rec.permissionId

      if (!userId) {
        throw new Error(`Recommendation ${recommendationId}: missing required user_id. Got: ${JSON.stringify(rec)}`)
      }
      if (!permissionId) {
        throw new Error(`Recommendation ${recommendationId}: missing required permission_id. Got: ${JSON.stringify(rec)}`)
      }

      // Execute the action and get real response from backend
      let result
      if (action === "revoke") {
        result = await revokeAccess(userId, permissionId, recommendationId)
      } else if (action === "review") {
        result = await reviewAccess(userId, permissionId, recommendationId)
      } else if (action === "ignore") {
        result = await ignoreAccess(userId, permissionId, recommendationId)
      } else {
        throw new Error(`Unknown action type: ${action}`)
      }

      // Update the recommendation status from the backend response (real data, not fabricated)
      const recIndex = data.recommendations.findIndex(r => r.id === recommendationId)
      if (recIndex !== -1) {
        const updatedRec = { ...data.recommendations[recIndex] }
        
        // Update from backend response - this is the source of truth
        updatedRec.status = result.recommendation.status as any
        updatedRec.actionTimestamp = result.recommendation.updated_at
        
        // Create a NEW array to trigger React re-render
        let newRecommendations = data.recommendations.map((rec, idx) => 
          idx === recIndex ? updatedRec : rec
        )
        
        // If action is "revoke", simulate the impact across the entire analysis
        let newData: AnalysisResult = { ...data, recommendations: newRecommendations }
        
        if (action === "revoke" && data.risk_scores && data.summary) {
          // Simulate removing this permission access from the user's risk profile
          const updatedRiskScores = data.risk_scores.map(riskScore => {
            if (riskScore.user_id === userId && riskScore.permission_id === permissionId) {
              // Significantly reduce risk for this user-permission pair
              return {
                ...riskScore,
                risk_score: 0,
                risk_level: "low",
                flag: null
              }
            }
            return riskScore
          })
          
          // Recalculate summary based on risk score changes
          const criticalCount = updatedRiskScores.filter(r => r.risk_level === "critical").length
          const highCount = updatedRiskScores.filter(r => r.risk_level === "high").length
          const mediumCount = updatedRiskScores.filter(r => r.risk_level === "medium").length
          
          newData = {
            ...newData,
            risk_scores: updatedRiskScores,
            summary: {
              ...data.summary,
              post_recommendation: {
                total_permissions_assigned: data.summary.post_recommendation.total_permissions_assigned - 1,
                critical_risk_permissions: criticalCount,
                high_risk_permissions: highCount,
                medium_risk_permissions: mediumCount
              }
            }
          }
          
          // Remove this recommendation from the list (it's been resolved)
          newRecommendations = newRecommendations.filter(r => r.id !== recommendationId)
          newData.recommendations = newRecommendations
        }
        
        setData(newData)
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "Action failed"
      setActionError(message)
      throw err
    }
  }, [data])

  const clearActionError = useCallback(() => {
    setActionError(null)
  }, [])

  return (
    <AnalysisContext.Provider value={{
      data,
      userMetadata,
      isLoading,
      error,
      runAnalysis,
      runCSVAnalysis,
      clearResults,
      executeAction,
      actionError,
      clearActionError
    }}>
      {children}
    </AnalysisContext.Provider>
  )
}

export function useAnalysis() {
  const context = useContext(AnalysisContext)
  if (!context) {
    throw new Error("useAnalysis must be used within an AnalysisProvider")
  }
  return context
}
