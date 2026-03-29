"use client"

import { useState, useRef } from "react"
import { useRouter } from "next/navigation"
import { useAnalysis } from "@/lib/analysis-context"
import { AnalysisRequest } from "@/lib/api-types"
import { Button } from "@/components/ui/button"
import { 
  Upload, 
  FileJson, 
  FileSpreadsheet, 
  Sparkles, 
  Shield, 
  ArrowRight,
  Loader2,
  AlertCircle,
  CheckCircle2
} from "lucide-react"

const SAMPLE_DATA: AnalysisRequest = {
  users: [
    { user_id: "U1", department: "Engineering" },
    { user_id: "U2", department: "Engineering" },
    { user_id: "U3", department: "Finance" },
    { user_id: "U4", department: "Finance" },
    { user_id: "U5", department: "HR" },
    { user_id: "U6", department: "HR" },
    { user_id: "U7", department: "Marketing" },
    { user_id: "U8", department: "Marketing" },
    { user_id: "U9", department: "Operations" },
    { user_id: "U10", department: "Sales" }
  ],
  permissions: [
    { permission_id: "admin_access", sensitivity_level: "critical" },
    { permission_id: "read_code", sensitivity_level: "low" },
    { permission_id: "write_code", sensitivity_level: "medium" },
    { permission_id: "deploy_prod", sensitivity_level: "critical" },
    { permission_id: "view_reports", sensitivity_level: "low" },
    { permission_id: "edit_financial", sensitivity_level: "high" },
    { permission_id: "approve_expenses", sensitivity_level: "high" },
    { permission_id: "hr_records", sensitivity_level: "critical" },
    { permission_id: "modify_salaries", sensitivity_level: "critical" },
    { permission_id: "marketing_analytics", sensitivity_level: "medium" },
    { permission_id: "customer_data", sensitivity_level: "high" },
    { permission_id: "inventory_manage", sensitivity_level: "medium" }
  ],
  access_logs: [
    { user_id: "U1", permission_id: "admin_access", timestamp: "2026-03-01", frequency: 50 },
    { user_id: "U1", permission_id: "read_code", timestamp: "2026-03-15", frequency: 200 },
    { user_id: "U1", permission_id: "write_code", timestamp: "2026-03-20", frequency: 150 },
    { user_id: "U1", permission_id: "deploy_prod", timestamp: "2026-03-25", frequency: 30 },
    { user_id: "U1", permission_id: "hr_records", timestamp: "2026-01-05", frequency: 2 },
    { user_id: "U2", permission_id: "read_code", timestamp: "2026-03-20", frequency: 180 },
    { user_id: "U2", permission_id: "write_code", timestamp: "2026-03-22", frequency: 120 },
    { user_id: "U2", permission_id: "deploy_prod", timestamp: "2026-03-10", frequency: 20 },
    { user_id: "U3", permission_id: "view_reports", timestamp: "2026-03-18", frequency: 100 },
    { user_id: "U3", permission_id: "edit_financial", timestamp: "2026-03-19", frequency: 80 },
    { user_id: "U3", permission_id: "approve_expenses", timestamp: "2026-03-20", frequency: 60 },
    { user_id: "U3", permission_id: "admin_access", timestamp: "2026-01-10", frequency: 3 },
    { user_id: "U4", permission_id: "view_reports", timestamp: "2026-03-22", frequency: 90 },
    { user_id: "U4", permission_id: "edit_financial", timestamp: "2026-03-15", frequency: 70 },
    { user_id: "U5", permission_id: "hr_records", timestamp: "2026-03-20", frequency: 120 },
    { user_id: "U5", permission_id: "modify_salaries", timestamp: "2026-03-18", frequency: 40 },
    { user_id: "U5", permission_id: "customer_data", timestamp: "2026-02-01", frequency: 5 },
    { user_id: "U6", permission_id: "hr_records", timestamp: "2026-03-22", frequency: 100 },
    { user_id: "U6", permission_id: "admin_access", timestamp: "2026-01-15", frequency: 1 },
    { user_id: "U7", permission_id: "marketing_analytics", timestamp: "2026-03-20", frequency: 150 },
    { user_id: "U7", permission_id: "customer_data", timestamp: "2026-03-18", frequency: 80 },
    { user_id: "U8", permission_id: "marketing_analytics", timestamp: "2026-03-22", frequency: 130 },
    { user_id: "U8", permission_id: "deploy_prod", timestamp: "2026-01-05", frequency: 1 },
    { user_id: "U9", permission_id: "inventory_manage", timestamp: "2026-03-20", frequency: 100 },
    { user_id: "U9", permission_id: "view_reports", timestamp: "2026-03-15", frequency: 60 },
    { user_id: "U10", permission_id: "customer_data", timestamp: "2026-03-22", frequency: 120 },
    { user_id: "U10", permission_id: "admin_access", timestamp: "2026-02-01", frequency: 4 }
  ]
}

export default function HomePage() {
  const router = useRouter()
  const { runAnalysis, runCSVAnalysis, isLoading, error } = useAnalysis()
  const [jsonInput, setJsonInput] = useState("")
  const [activeTab, setActiveTab] = useState<"sample" | "json" | "csv">("sample")
  const [successMsg, setSuccessMsg] = useState("")
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleSampleData = async () => {
    try {
      await runAnalysis(SAMPLE_DATA)
      setSuccessMsg("Analysis complete! Redirecting...")
      setTimeout(() => router.push("/dashboard"), 800)
    } catch {
      // error is handled by context
    }
  }

  const handleJsonSubmit = async () => {
    try {
      const payload = JSON.parse(jsonInput) as AnalysisRequest
      if (!payload.users || !payload.permissions || !payload.access_logs) {
        throw new Error("JSON must contain users, permissions, and access_logs arrays")
      }
      await runAnalysis(payload)
      setSuccessMsg("Analysis complete! Redirecting...")
      setTimeout(() => router.push("/dashboard"), 800)
    } catch (err) {
      if (err instanceof SyntaxError) {
        // JSON parsing specific error — context won't have this
      }
    }
  }

  const handleCSVUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    try {
      await runCSVAnalysis(file)
      setSuccessMsg("Analysis complete! Redirecting...")
      setTimeout(() => router.push("/dashboard"), 800)
    } catch {
      // error is handled by context
    }
  }

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6">
      {/* Hero */}
      <div className="text-center mb-10 max-w-2xl">
        <div className="inline-flex items-center gap-2 mb-6">
          <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
            <Shield className="h-5 w-5 text-white" />
          </div>
          <span className="text-2xl font-bold tracking-tight text-foreground">
            AccessMind
          </span>
        </div>
        <h1 className="text-4xl font-bold text-foreground mb-3 tracking-tight">
          AI-Powered <span className="gradient-text">Identity Governance</span>
        </h1>
        <p className="text-muted-foreground text-lg">
          Upload your access data to analyze risks, mine roles, and get intelligent cleanup recommendations.
        </p>
      </div>

      {/* Tab Selector */}
      <div className="flex items-center gap-1 p-1 rounded-xl bg-muted/50 border border-border mb-6">
        {[
          { id: "sample" as const, label: "Sample Data", icon: Sparkles },
          { id: "json" as const, label: "JSON Upload", icon: FileJson },
          { id: "csv" as const, label: "CSV Upload", icon: FileSpreadsheet },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              activeTab === tab.id
                ? "bg-primary text-white shadow-md"
                : "text-muted-foreground hover:text-foreground hover:bg-muted"
            }`}
          >
            <tab.icon className="h-4 w-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content Card */}
      <div className="w-full max-w-2xl glass-card rounded-2xl p-6">
        {/* Sample Data Tab */}
        {activeTab === "sample" && (
          <div className="text-center space-y-4">
            <div className="w-16 h-16 rounded-xl bg-primary/10 flex items-center justify-center mx-auto">
              <Sparkles className="h-8 w-8 text-primary" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-foreground">Quick Start with Sample Data</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Load a pre-configured dataset with 10 users, 12 permissions, and 27 access logs
                to see AccessMind in action.
              </p>
            </div>
            <div className="grid grid-cols-3 gap-3 py-2">
              <div className="glass-card rounded-lg p-3 text-center">
                <p className="text-xl font-semibold gradient-text">10</p>
                <p className="text-[11px] text-muted-foreground">Users</p>
              </div>
              <div className="glass-card rounded-lg p-3 text-center">
                <p className="text-xl font-semibold gradient-text">12</p>
                <p className="text-[11px] text-muted-foreground">Permissions</p>
              </div>
              <div className="glass-card rounded-lg p-3 text-center">
                <p className="text-xl font-semibold gradient-text">27</p>
                <p className="text-[11px] text-muted-foreground">Access Logs</p>
              </div>
            </div>
            <Button
              onClick={handleSampleData}
              disabled={isLoading}
              className="w-full bg-primary hover:bg-primary/90 text-white glow-primary"
              size="lg"
            >
              {isLoading ? (
                <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Running Analysis...</>
              ) : (
                <><Sparkles className="h-4 w-4 mr-2" /> Load Sample Data & Analyze</>
              )}
            </Button>
          </div>
        )}

        {/* JSON Tab */}
        {activeTab === "json" && (
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold text-foreground">Upload JSON Data</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Paste your JSON with <code className="text-xs bg-muted px-1.5 py-0.5 rounded">users</code>,{" "}
                <code className="text-xs bg-muted px-1.5 py-0.5 rounded">permissions</code>, and{" "}
                <code className="text-xs bg-muted px-1.5 py-0.5 rounded">access_logs</code> arrays.
              </p>
            </div>
            <textarea
              value={jsonInput}
              onChange={(e) => setJsonInput(e.target.value)}
              placeholder='{\n  "users": [...],\n  "permissions": [...],\n  "access_logs": [...]\n}'
              className="w-full h-48 bg-muted/50 border border-border rounded-xl px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground font-mono focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none"
            />
            <Button
              onClick={handleJsonSubmit}
              disabled={isLoading || !jsonInput.trim()}
              className="w-full bg-primary hover:bg-primary/90 text-white"
              size="lg"
            >
              {isLoading ? (
                <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Analyzing...</>
              ) : (
                <><ArrowRight className="h-4 w-4 mr-2" /> Analyze JSON Data</>
              )}
            </Button>
          </div>
        )}

        {/* CSV Tab */}
        {activeTab === "csv" && (
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold text-foreground">Upload CSV File</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Upload a CSV with columns: <code className="text-xs bg-muted px-1.5 py-0.5 rounded">user_id, permission_id, timestamp, frequency, sensitivity, department</code>
              </p>
            </div>
            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-border rounded-xl p-10 text-center cursor-pointer hover:border-primary/50 hover:bg-primary/5 transition-all group"
            >
              <Upload className="h-10 w-10 text-muted-foreground mx-auto mb-3 group-hover:text-primary transition-colors" />
              <p className="text-sm font-medium text-foreground">Click to select CSV file</p>
              <p className="text-xs text-muted-foreground mt-1">or drag and drop</p>
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv"
                onChange={handleCSVUpload}
                className="hidden"
              />
            </div>
            {isLoading && (
              <div className="flex items-center justify-center gap-2 text-primary text-sm">
                <Loader2 className="h-4 w-4 animate-spin" />
                Processing CSV file...
              </div>
            )}
          </div>
        )}

        {/* Error message */}
        {error && (
          <div className="mt-4 flex items-center gap-2 p-3 rounded-lg bg-red-500/5 border border-red-500/20">
            <AlertCircle className="h-4 w-4 text-red-500 flex-shrink-0" />
            <p className="text-sm text-red-500">{error}</p>
          </div>
        )}

        {/* Success message */}
        {successMsg && (
          <div className="mt-4 flex items-center gap-2 p-3 rounded-lg bg-green-500/5 border border-green-500/20">
            <CheckCircle2 className="h-4 w-4 text-green-500 flex-shrink-0" />
            <p className="text-sm text-green-500">{successMsg}</p>
          </div>
        )}
      </div>

      {/* Already have results? */}
      <p className="mt-6 text-xs text-muted-foreground">
        Already ran an analysis?{" "}
        <button onClick={() => router.push("/dashboard")} className="text-primary hover:underline">
          Go to Dashboard →
        </button>
      </p>
    </div>
  )
}
