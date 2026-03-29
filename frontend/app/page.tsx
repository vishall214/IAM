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
    { user_id: "U1", name: "Aarav Mehta", email: "aarav.mehta@company.com", department: "Engineering" },
    { user_id: "U2", name: "Rohan Gupta", email: "rohan.gupta@company.com", department: "Engineering" },
    { user_id: "U3", name: "Priya Sharma", email: "priya.sharma@company.com", department: "Engineering" },
    { user_id: "U4", name: "Vikram Singh", email: "vikram.singh@company.com", department: "Finance" },
    { user_id: "U5", name: "Neha Kapoor", email: "neha.kapoor@company.com", department: "Finance" },
    { user_id: "U6", name: "Ananya Rao", email: "ananya.rao@company.com", department: "HR" },
    { user_id: "U7", name: "Karan Malhotra", email: "karan.malhotra@company.com", department: "HR" },
    { user_id: "U8", name: "Divya Patel", email: "divya.patel@company.com", department: "Marketing" },
    { user_id: "U9", name: "Arjun Reddy", email: "arjun.reddy@company.com", department: "Operations" },
    { user_id: "U10", name: "Sneha Iyer", email: "sneha.iyer@company.com", department: "Sales" },
    { user_id: "U11", name: "Amit Kumar", email: "amit.kumar@company.com", department: "Engineering" },
    { user_id: "U12", name: "Sana Khan", email: "sana.khan@company.com", department: "Marketing" },
    { user_id: "U13", name: "Rahul Verma", email: "rahul.verma@company.com", department: "Finance" },
    { user_id: "U14", name: "Pooja Desai", email: "pooja.desai@company.com", department: "IT" },
    { user_id: "U15", name: "Nikhil Sinha", email: "nikhil.sinha@company.com", department: "Engineering" },
    { user_id: "U16", name: "Zara Nair", email: "zara.nair@company.com", department: "HR" },
    { user_id: "U17", name: "Dev Agarwal", email: "dev.agarwal@company.com", department: "Operations" },
    { user_id: "U18", name: "Isha Joshi", email: "isha.joshi@company.com", department: "Sales" },
    { user_id: "U19", name: "Varun Menon", email: "varun.menon@company.com", department: "Finance" },
    { user_id: "U20", name: "Kavya Bhat", email: "kavya.bhat@company.com", department: "Engineering" },
    { user_id: "U21", name: "Aryan Das", email: "aryan.das@company.com", department: "IT" },
    { user_id: "U22", name: "Meera Chatterjee", email: "meera.chatterjee@company.com", department: "HR" },
    { user_id: "U23", name: "Siddharth Roy", email: "siddharth.roy@company.com", department: "Operations" },
    { user_id: "U24", name: "Tanya Kulkarni", email: "tanya.kulkarni@company.com", department: "Marketing" },
    { user_id: "U25", name: "Harsh Pandey", email: "harsh.pandey@company.com", department: "Finance" },
    { user_id: "U26", name: "Anjali Singh", email: "anjali.singh@company.com", department: "Engineering" },
    { user_id: "U27", name: "Sameer Chopra", email: "sameer.chopra@company.com", department: "IT" },
    { user_id: "U28", name: "Riya Nambiar", email: "riya.nambiar@company.com", department: "Sales" },
    { user_id: "U29", name: "Vivek Mishra", email: "vivek.mishra@company.com", department: "Operations" },
    { user_id: "U30", name: "Diya Saxena", email: "diya.saxena@company.com", department: "Marketing" }
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
    { permission_id: "inventory_manage", sensitivity_level: "medium" },
    { permission_id: "create_tickets", sensitivity_level: "low" },
    { permission_id: "close_tickets", sensitivity_level: "medium" },
    { permission_id: "database_backup", sensitivity_level: "critical" },
    { permission_id: "user_management", sensitivity_level: "high" },
    { permission_id: "audit_logs", sensitivity_level: "medium" },
    { permission_id: "security_config", sensitivity_level: "critical" }
  ],
  access_logs: [
    // Engineering team - normal access patterns
    { user_id: "U1", permission_id: "read_code", timestamp: "2026-03-25", frequency: 220 },
    { user_id: "U1", permission_id: "write_code", timestamp: "2026-03-24", frequency: 180 },
    { user_id: "U1", permission_id: "deploy_prod", timestamp: "2026-03-23", frequency: 45 },
    { user_id: "U1", permission_id: "admin_access", timestamp: "2026-03-01", frequency: 2 },
    { user_id: "U2", permission_id: "read_code", timestamp: "2026-03-25", frequency: 210 },
    { user_id: "U2", permission_id: "write_code", timestamp: "2026-03-24", frequency: 160 },
    { user_id: "U2", permission_id: "deploy_prod", timestamp: "2026-03-22", frequency: 38 },
    { user_id: "U3", permission_id: "read_code", timestamp: "2026-03-25", frequency: 195 },
    { user_id: "U3", permission_id: "write_code", timestamp: "2026-03-23", frequency: 155 },
    { user_id: "U3", permission_id: "deploy_prod", timestamp: "2026-03-21", frequency: 50 },
    { user_id: "U15", permission_id: "read_code", timestamp: "2026-03-25", frequency: 225 },
    { user_id: "U15", permission_id: "write_code", timestamp: "2026-03-24", frequency: 170 },
    { user_id: "U15", permission_id: "deploy_prod", timestamp: "2026-03-22", frequency: 42 },
    { user_id: "U20", permission_id: "read_code", timestamp: "2026-03-25", frequency: 200 },
    { user_id: "U20", permission_id: "write_code", timestamp: "2026-03-23", frequency: 165 },
    { user_id: "U20", permission_id: "admin_access", timestamp: "2026-01-05", frequency: 85 },
    { user_id: "U26", permission_id: "read_code", timestamp: "2026-03-25", frequency: 215 },
    { user_id: "U26", permission_id: "write_code", timestamp: "2026-03-24", frequency: 175 },
    { user_id: "U26", permission_id: "database_backup", timestamp: "2026-03-20", frequency: 120 },
    
    // Finance team - normal access patterns
    { user_id: "U4", permission_id: "view_reports", timestamp: "2026-03-25", frequency: 140 },
    { user_id: "U4", permission_id: "edit_financial", timestamp: "2026-03-24", frequency: 95 },
    { user_id: "U4", permission_id: "approve_expenses", timestamp: "2026-03-23", frequency: 55 },
    { user_id: "U4", permission_id: "modify_salaries", timestamp: "2026-01-08", frequency: 3 },
    { user_id: "U5", permission_id: "view_reports", timestamp: "2026-03-25", frequency: 130 },
    { user_id: "U5", permission_id: "edit_financial", timestamp: "2026-03-24", frequency: 85 },
    { user_id: "U5", permission_id: "customer_data", timestamp: "2026-02-15", frequency: 8 },
    { user_id: "U13", permission_id: "view_reports", timestamp: "2026-03-25", frequency: 145 },
    { user_id: "U13", permission_id: "edit_financial", timestamp: "2026-03-24", frequency: 100 },
    { user_id: "U13", permission_id: "approve_expenses", timestamp: "2026-03-23", frequency: 70 },
    { user_id: "U19", permission_id: "view_reports", timestamp: "2026-03-25", frequency: 135 },
    { user_id: "U19", permission_id: "edit_financial", timestamp: "2026-03-24", frequency: 90 },
    { user_id: "U19", permission_id: "admin_access", timestamp: "2026-02-10", frequency: 12 },
    { user_id: "U25", permission_id: "view_reports", timestamp: "2026-03-25", frequency: 125 },
    { user_id: "U25", permission_id: "edit_financial", timestamp: "2026-03-22", frequency: 75 },
    { user_id: "U25", permission_id: "modify_salaries", timestamp: "2026-03-15", frequency: 25 },
    
    // HR team - normal access patterns
    { user_id: "U6", permission_id: "hr_records", timestamp: "2026-03-25", frequency: 160 },
    { user_id: "U6", permission_id: "modify_salaries", timestamp: "2026-03-24", frequency: 50 },
    { user_id: "U6", permission_id: "user_management", timestamp: "2026-03-23", frequency: 35 },
    { user_id: "U7", permission_id: "hr_records", timestamp: "2026-03-25", frequency: 155 },
    { user_id: "U7", permission_id: "approve_expenses", timestamp: "2026-03-24", frequency: 45 },
    { user_id: "U7", permission_id: "create_tickets", timestamp: "2026-03-22", frequency: 20 },
    { user_id: "U16", permission_id: "hr_records", timestamp: "2026-03-25", frequency: 150 },
    { user_id: "U16", permission_id: "modify_salaries", timestamp: "2026-03-24", frequency: 48 },
    { user_id: "U16", permission_id: "admin_access", timestamp: "2026-01-12", frequency: 5 },
    { user_id: "U22", permission_id: "hr_records", timestamp: "2026-03-25", frequency: 165 },
    { user_id: "U22", permission_id: "user_management", timestamp: "2026-03-24", frequency: 40 },
    
    // Marketing team
    { user_id: "U8", permission_id: "marketing_analytics", timestamp: "2026-03-25", frequency: 175 },
    { user_id: "U8", permission_id: "customer_data", timestamp: "2026-03-24", frequency: 110 },
    { user_id: "U8", permission_id: "view_reports", timestamp: "2026-03-23", frequency: 65 },
    { user_id: "U12", permission_id: "marketing_analytics", timestamp: "2026-03-25", frequency: 180 },
    { user_id: "U12", permission_id: "customer_data", timestamp: "2026-03-24", frequency: 115 },
    { user_id: "U24", permission_id: "marketing_analytics", timestamp: "2026-03-25", frequency: 170 },
    { user_id: "U24", permission_id: "customer_data", timestamp: "2026-03-24", frequency: 105 },
    { user_id: "U30", permission_id: "marketing_analytics", timestamp: "2026-03-25", frequency: 165 },
    { user_id: "U30", permission_id: "customer_data", timestamp: "2026-03-23", frequency: 95 },
    
    // Operations team
    { user_id: "U9", permission_id: "inventory_manage", timestamp: "2026-03-25", frequency: 140 },
    { user_id: "U9", permission_id: "view_reports", timestamp: "2026-03-24", frequency: 85 },
    { user_id: "U9", permission_id: "create_tickets", timestamp: "2026-03-23", frequency: 60 },
    { user_id: "U17", permission_id: "inventory_manage", timestamp: "2026-03-25", frequency: 135 },
    { user_id: "U17", permission_id: "close_tickets", timestamp: "2026-03-24", frequency: 75 },
    { user_id: "U23", permission_id: "inventory_manage", timestamp: "2026-03-25", frequency: 145 },
    { user_id: "U23", permission_id: "view_reports", timestamp: "2026-03-24", frequency: 90 },
    { user_id: "U29", permission_id: "inventory_manage", timestamp: "2026-03-25", frequency: 130 },
    { user_id: "U29", permission_id: "close_tickets", timestamp: "2026-03-23", frequency: 70 },
    
    // Sales team
    { user_id: "U10", permission_id: "customer_data", timestamp: "2026-03-25", frequency: 190 },
    { user_id: "U10", permission_id: "view_reports", timestamp: "2026-03-24", frequency: 120 },
    { user_id: "U10", permission_id: "create_tickets", timestamp: "2026-03-23", frequency: 50 },
    { user_id: "U18", permission_id: "customer_data", timestamp: "2026-03-25", frequency: 185 },
    { user_id: "U18", permission_id: "view_reports", timestamp: "2026-03-24", frequency: 115 },
    { user_id: "U28", permission_id: "customer_data", timestamp: "2026-03-25", frequency: 195 },
    { user_id: "U28", permission_id: "view_reports", timestamp: "2026-03-24", frequency: 125 },
    
    // IT team
    { user_id: "U14", permission_id: "database_backup", timestamp: "2026-03-25", frequency: 95 },
    { user_id: "U14", permission_id: "user_management", timestamp: "2026-03-24", frequency: 55 },
    { user_id: "U14", permission_id: "security_config", timestamp: "2026-03-23", frequency: 80 },
    { user_id: "U14", permission_id: "audit_logs", timestamp: "2026-03-22", frequency: 40 },
    { user_id: "U21", permission_id: "database_backup", timestamp: "2026-03-25", frequency: 100 },
    { user_id: "U21", permission_id: "security_config", timestamp: "2026-03-24", frequency: 85 },
    { user_id: "U21", permission_id: "user_management", timestamp: "2026-03-23", frequency: 60 },
    { user_id: "U27", permission_id: "database_backup", timestamp: "2026-03-25", frequency: 92 },
    { user_id: "U27", permission_id: "audit_logs", timestamp: "2026-03-24", frequency: 45 },
    { user_id: "U27", permission_id: "security_config", timestamp: "2026-03-22", frequency: 75 },
    
    // ANOMALIES - Risk indicators
    { user_id: "U20", permission_id: "customer_data", timestamp: "2026-02-28", frequency: 200 },
    { user_id: "U26", permission_id: "modify_salaries", timestamp: "2026-03-10", frequency: 55 },
    { user_id: "U19", permission_id: "deploy_prod", timestamp: "2026-03-01", frequency: 35 },
    { user_id: "U25", permission_id: "database_backup", timestamp: "2026-02-20", frequency: 78 },
    { user_id: "U13", permission_id: "hr_records", timestamp: "2026-03-05", frequency: 25 },
    { user_id: "U12", permission_id: "admin_access", timestamp: "2026-01-15", frequency: 5 },
    { user_id: "U9", permission_id: "edit_financial", timestamp: "2026-02-25", frequency: 15 },
    { user_id: "U17", permission_id: "admin_access", timestamp: "2026-02-10", frequency: 8 }
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
