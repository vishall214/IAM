"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { 
  LayoutDashboard, 
  AlertTriangle, 
  Users, 
  Lightbulb, 
  Settings,
  Shield,
  Activity,
  FileBarChart,
  Upload
} from "lucide-react"
import { cn } from "@/lib/utils"

interface SidebarProps {
  isOpen: boolean
}

const navItems = [
  { icon: Upload, label: "Upload Data", href: "/" },
  // { icon: LayoutDashboard, label: "Dashboard", href: "/dashboard" },
  { icon: AlertTriangle, label: "Risk Analysis", href: "/dashboard" },
  { icon: Users, label: "Clusters", href: "/clusters" },
  { icon: Shield, label: "Roles", href: "/roles" },
  { icon: Lightbulb, label: "Recommendations", href: "/recommendations" },
  { icon: Activity, label: "Activity Log", href: "#" },
  { icon: FileBarChart, label: "Reports", href: "#" },
  { icon: Settings, label: "Settings", href: "#" },
]

export function Sidebar({ isOpen }: SidebarProps) {
  const pathname = usePathname()
  
  return (
    <aside 
      className={cn(
        "fixed left-0 top-14 h-[calc(100vh-3.5rem)] w-56 border-r border-border bg-sidebar transition-transform duration-200 z-40",
        !isOpen && "-translate-x-full"
      )}
    >
      <div className="flex flex-col h-full p-3">
        <nav className="flex-1 space-y-0.5">
          {navItems.map((item) => {
            const isActive = item.href !== "#" && pathname === item.href
            const isDisabled = item.href === "#"
            
            if (isDisabled) {
              return (
                <button
                  key={item.label}
                  disabled
                  className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-muted-foreground/50 cursor-not-allowed"
                >
                  <item.icon className="h-4 w-4" />
                  <span>{item.label}</span>
                </button>
              )
            }
            
            return (
              <Link
                key={item.label}
                href={item.href}
                className={cn(
                  "w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors duration-150",
                  isActive 
                    ? "bg-primary/10 text-primary font-medium" 
                    : "text-muted-foreground hover:text-foreground hover:bg-muted"
                )}
              >
                <item.icon className="h-4 w-4" />
                <span>{item.label}</span>
              </Link>
            )
          })}
        </nav>

        {/* Bottom section - Security Score */}
        <div className="mt-auto pt-3 border-t border-border">
          <div className="glass-card rounded-lg p-3">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-md bg-primary/10 flex items-center justify-center">
                <Shield className="h-4 w-4 text-primary" />
              </div>
              <div>
                <p className="text-xs font-medium text-foreground">Security Score</p>
                <p className="text-[10px] text-muted-foreground">Updated today</p>
              </div>
            </div>
            <div className="flex items-end justify-between">
              <span className="text-2xl font-semibold gradient-text">78</span>
              <span className="text-[10px] text-green-500">+5 this week</span>
            </div>
            <div className="mt-2 h-1.5 rounded-full bg-muted overflow-hidden">
              <div 
                className="h-full rounded-full risk-gradient transition-all duration-1000"
                style={{ width: '78%' }}
              />
            </div>
          </div>
        </div>
      </div>
    </aside>
  )
}
