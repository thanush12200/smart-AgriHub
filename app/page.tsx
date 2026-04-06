"use client"

import { useState } from "react"
import {
  Search,
  Bell,
  Users,
  Package,
  Brain,
  TrendingUp,
  AlertTriangle,
  ChevronRight,
  Leaf,
  LayoutDashboard,
  Store,
  FileText,
  Settings,
  Cpu,
} from "lucide-react"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts"

// Internal Data Structure
const stats = {
  farmers: { total: 104, active: 100, newThisWeek: 8 },
  products: { active: 45, lowStock: 3 },
  predictions: { total: 1205, thisWeek: 154 },
}

const farmers = [
  { _id: "1", name: "Rahul S.", email: "rahul@email.com", region: "North", isActive: true, createdAt: "2025-03-15" },
  { _id: "2", name: "Priya K.", email: "priya@email.com", region: "South", isActive: true, createdAt: "2025-03-14" },
  { _id: "3", name: "Amit V.", email: "amit@email.com", region: "West", isActive: false, createdAt: "2025-03-13" },
]

const predictions = [
  { _id: "1", type: "crop_prediction", confidence: 0.95, user: { name: "Rahul S." }, createdAt: "2025-03-15T10:30:00" },
  { _id: "2", type: "fertilizer", confidence: 0.88, user: { name: "Priya K." }, createdAt: "2025-03-15T09:15:00" },
  { _id: "3", type: "disease", confidence: 0.92, user: { name: "Amit V." }, createdAt: "2025-03-14T16:45:00" },
  { _id: "4", type: "crop_prediction", confidence: 0.91, user: { name: "Sunita M." }, createdAt: "2025-03-14T14:20:00" },
  { _id: "5", type: "fertilizer", confidence: 0.85, user: { name: "Raj P." }, createdAt: "2025-03-14T11:00:00" },
]

const products = [
  { productCode: "PS001", name: "Premium Seeds", category: "Seeds", price: 299, stock: 5, isActive: true },
  { productCode: "FT002", name: "Organic Fertilizer", category: "Fertilizer", price: 450, stock: 2, isActive: true },
  { productCode: "PD003", name: "Pesticide Spray", category: "Pesticide", price: 180, stock: 8, isActive: true },
]

const models = [
  { name: "crop_model.joblib", version: "v2", status: "deployed" },
  { name: "fertilizer_model.pkl", version: "v1.5", status: "deployed" },
  { name: "disease_classifier.h5", version: "v3", status: "training" },
]

const chartData = [
  { name: "Crop", value: 520, color: "hsl(var(--chart-1))" },
  { name: "Fertilizer", value: 385, color: "hsl(var(--chart-2))" },
  { name: "Disease", value: 300, color: "hsl(var(--chart-3))" },
]

const recentLogs = [
  { id: 1, action: "Prediction Made", user: "Rahul S.", type: "crop_prediction", timestamp: "2 mins ago", status: "success" },
  { id: 2, action: "New Registration", user: "Sunita M.", type: "farmer", timestamp: "15 mins ago", status: "success" },
  { id: 3, action: "Model Updated", user: "System", type: "ml_model", timestamp: "1 hour ago", status: "success" },
  { id: 4, action: "Low Stock Alert", user: "System", type: "inventory", timestamp: "2 hours ago", status: "warning" },
  { id: 5, action: "Order Completed", user: "Amit V.", type: "marketplace", timestamp: "3 hours ago", status: "success" },
]

const tabs = [
  { id: "overview", label: "Overview", icon: LayoutDashboard },
  { id: "farmers", label: "Farmers", icon: Users },
  { id: "marketplace", label: "Marketplace", icon: Store },
  { id: "models", label: "ML Models", icon: Cpu },
  { id: "logs", label: "Logs", icon: FileText },
  { id: "settings", label: "Settings", icon: Settings },
]

export default function AdminControlPanel() {
  const [activeTab, setActiveTab] = useState("overview")
  const [searchQuery, setSearchQuery] = useState("")

  return (
    <div className="min-h-screen bg-background">
      {/* Top Navigation Bar - Glassmorphic */}
      <header className="sticky top-0 z-50 border-b border-border/50 bg-card/80 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-[1600px] items-center justify-between gap-6 px-6">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary shadow-md">
              <Leaf className="h-5 w-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-lg font-bold tracking-tight text-foreground">Smart Agri Hub</h1>
              <p className="text-xs text-muted-foreground">Admin Control Panel</p>
            </div>
          </div>

          {/* Global Search */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search farmers, products, logs..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-10 w-full rounded-xl border border-border bg-muted/50 pl-10 pr-4 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
            />
          </div>

          {/* Notifications & Avatar */}
          <div className="flex items-center gap-4">
            <button className="relative flex h-10 w-10 items-center justify-center rounded-xl border border-border bg-card text-muted-foreground shadow-sm transition-all hover:bg-muted hover:text-foreground hover:shadow-md">
              <Bell className="h-5 w-5" />
              <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-secondary text-[10px] font-semibold text-secondary-foreground">
                3
              </span>
            </button>
            <div className="flex items-center gap-3 rounded-xl border border-border bg-card px-3 py-1.5 shadow-sm">
              <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
                <span className="text-sm font-semibold text-primary">AS</span>
              </div>
              <div className="hidden sm:block">
                <p className="text-sm font-medium text-foreground">Admin User</p>
                <p className="text-xs text-muted-foreground">Super Admin</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Tab Navigation */}
      <nav className="border-b border-border bg-card/50">
        <div className="mx-auto max-w-[1600px] px-6">
          <div className="flex items-center gap-1 py-3 overflow-x-auto">
            {tabs.map((tab) => {
              const Icon = tab.icon
              const isActive = activeTab === tab.id
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium transition-all whitespace-nowrap ${
                    isActive
                      ? "bg-primary text-primary-foreground shadow-md"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {tab.label}
                </button>
              )
            })}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="mx-auto max-w-[1600px] p-6">
        {/* Key Metrics Row */}
        <div className="mb-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {/* Total Farmers */}
          <MetricCard
            icon={Users}
            iconBg="bg-primary/10"
            iconColor="text-primary"
            label="Total Farmers"
            value={stats.farmers.total}
            subValue={`${stats.farmers.active} active`}
            badge={`+${stats.farmers.newThisWeek} this week`}
            badgeColor="bg-success/10 text-success"
            trend="up"
          />
          
          {/* Active Products */}
          <MetricCard
            icon={Package}
            iconBg="bg-secondary/10"
            iconColor="text-secondary"
            label="Active Products"
            value={stats.products.active}
            subValue="in marketplace"
            badge={`${stats.products.lowStock} low stock`}
            badgeColor="bg-warning/10 text-warning"
            trend="neutral"
          />
          
          {/* Total Predictions */}
          <MetricCard
            icon={Brain}
            iconBg="bg-chart-3/10"
            iconColor="text-chart-3"
            label="Total Predictions"
            value={stats.predictions.total.toLocaleString()}
            subValue="ML predictions made"
            badge={`+${stats.predictions.thisWeek} this week`}
            badgeColor="bg-success/10 text-success"
            trend="up"
          />
          
          {/* ML Models */}
          <MetricCard
            icon={Cpu}
            iconBg="bg-chart-4/10"
            iconColor="text-chart-4"
            label="ML Models"
            value={models.length}
            subValue={`${models.filter(m => m.status === "deployed").length} deployed`}
            badge="All systems go"
            badgeColor="bg-success/10 text-success"
            trend="up"
          />
        </div>

        {/* Main Content Grid */}
        <div className="mb-8 grid gap-6 lg:grid-cols-3">
          {/* Chart - 2/3 width */}
          <div className="lg:col-span-2">
            <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
              <div className="mb-6 flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-foreground">Prediction Breakdown by Type</h2>
                  <p className="text-sm text-muted-foreground">Distribution of ML predictions this month</p>
                </div>
                <button className="flex items-center gap-1 rounded-lg px-3 py-1.5 text-sm text-muted-foreground hover:bg-muted hover:text-foreground transition-colors">
                  View All
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData} barSize={60}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                    <XAxis 
                      dataKey="name" 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
                    />
                    <YAxis 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "hsl(var(--card))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "12px",
                        boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                      }}
                      labelStyle={{ color: "hsl(var(--foreground))", fontWeight: 600 }}
                      itemStyle={{ color: "hsl(var(--muted-foreground))" }}
                    />
                    <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                      {chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Low Stock Alerts - 1/3 width */}
          <div className="lg:col-span-1">
            <div className="rounded-2xl border border-border bg-card p-6 shadow-sm h-full">
              <div className="mb-6 flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-foreground">Low Stock Alerts</h2>
                  <p className="text-sm text-muted-foreground">Products needing restock</p>
                </div>
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-destructive/10 text-xs font-semibold text-destructive">
                  {products.filter(p => p.stock < 10).length}
                </span>
              </div>
              <div className="space-y-4">
                {products.filter(p => p.stock < 10).map((product) => (
                  <div
                    key={product.productCode}
                    className="flex items-center justify-between rounded-xl border border-border bg-muted/30 p-4 transition-all hover:bg-muted/50"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${
                        product.stock <= 5 ? "bg-destructive/10" : "bg-warning/10"
                      }`}>
                        <Package className={`h-5 w-5 ${
                          product.stock <= 5 ? "text-destructive" : "text-warning"
                        }`} />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-foreground">{product.name}</p>
                        <p className="text-xs text-muted-foreground">{product.category}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className={`inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-semibold ${
                        product.stock <= 5 
                          ? "bg-destructive/10 text-destructive" 
                          : "bg-warning/10 text-warning"
                      }`}>
                        <AlertTriangle className="h-3 w-3" />
                        {product.stock} left
                      </span>
                    </div>
                  </div>
                ))}
              </div>
              {products.filter(p => p.stock < 10).length === 0 && (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-success/10">
                    <Package className="h-6 w-6 text-success" />
                  </div>
                  <p className="text-sm font-medium text-foreground">All stocked up!</p>
                  <p className="text-xs text-muted-foreground">No low stock alerts at this time</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Recent Activity Table */}
        <div className="rounded-2xl border border-border bg-card shadow-sm overflow-hidden">
          <div className="border-b border-border p-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-foreground">Recent Logs</h2>
                <p className="text-sm text-muted-foreground">Latest activity across the platform</p>
              </div>
              <button className="flex items-center gap-1 rounded-lg px-3 py-1.5 text-sm text-muted-foreground hover:bg-muted hover:text-foreground transition-colors">
                View All Logs
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-muted/30">
                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">Action</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">User</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">Type</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">Status</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">Time</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {recentLogs.map((log) => (
                  <tr
                    key={log.id}
                    className="transition-colors hover:bg-muted/30"
                  >
                    <td className="whitespace-nowrap px-6 py-4">
                      <span className="text-sm font-medium text-foreground">{log.action}</span>
                    </td>
                    <td className="whitespace-nowrap px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
                          <span className="text-xs font-semibold text-primary">
                            {log.user.split(" ").map(n => n[0]).join("")}
                          </span>
                        </div>
                        <span className="text-sm text-foreground">{log.user}</span>
                      </div>
                    </td>
                    <td className="whitespace-nowrap px-6 py-4">
                      <span className="inline-flex items-center rounded-lg bg-muted px-2.5 py-1 text-xs font-medium text-muted-foreground">
                        {log.type.replace("_", " ")}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-6 py-4">
                      <span className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-semibold ${
                        log.status === "success" 
                          ? "bg-success/10 text-success" 
                          : "bg-warning/10 text-warning"
                      }`}>
                        <span className={`h-1.5 w-1.5 rounded-full ${
                          log.status === "success" ? "bg-success" : "bg-warning"
                        }`} />
                        {log.status}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-muted-foreground">
                      {log.timestamp}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  )
}

// Metric Card Component
function MetricCard({
  icon: Icon,
  iconBg,
  iconColor,
  label,
  value,
  subValue,
  badge,
  badgeColor,
  trend,
}: {
  icon: React.ElementType
  iconBg: string
  iconColor: string
  label: string
  value: string | number
  subValue: string
  badge: string
  badgeColor: string
  trend: "up" | "down" | "neutral"
}) {
  return (
    <div className="group rounded-2xl border border-border bg-card p-6 shadow-sm transition-all hover:shadow-md">
      <div className="mb-4 flex items-center justify-between">
        <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${iconBg}`}>
          <Icon className={`h-6 w-6 ${iconColor}`} />
        </div>
        {trend === "up" && (
          <TrendingUp className="h-5 w-5 text-success" />
        )}
      </div>
      <div className="space-y-1">
        <p className="text-sm font-medium text-muted-foreground">{label}</p>
        <p className="text-3xl font-bold tracking-tight text-foreground">{value}</p>
        <p className="text-sm text-muted-foreground">{subValue}</p>
      </div>
      <div className="mt-4">
        <span className={`inline-flex items-center rounded-lg px-2.5 py-1 text-xs font-semibold ${badgeColor}`}>
          {badge}
        </span>
      </div>
    </div>
  )
}
