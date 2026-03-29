"use client"

import React, { createContext, useContext, useState, useCallback } from "react"
import { AnalysisResult, AnalysisRequest } from "./api-types"
import { analyzeData, uploadCSV } from "./api"

interface AnalysisContextType {
  /** The full analysis result from the backend */
  data: AnalysisResult | null
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
}

const AnalysisContext = createContext<AnalysisContextType | null>(null)

export function AnalysisProvider({ children }: { children: React.ReactNode }) {
  const [data, setData] = useState<AnalysisResult | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const runAnalysis = useCallback(async (payload: AnalysisRequest) => {
    setIsLoading(true)
    setError(null)
    try {
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
    setError(null)
  }, [])

  return (
    <AnalysisContext.Provider value={{ data, isLoading, error, runAnalysis, runCSVAnalysis, clearResults }}>
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
