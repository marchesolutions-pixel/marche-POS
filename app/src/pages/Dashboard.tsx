import { trpc } from "@/providers/trpc"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { format } from "date-fns"
import {
  TrendingUp,
  DollarSign,
  ShoppingCart,
  Users,
  Package,
  AlertTriangle,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts"

const COLORS = ["#6366f1", "#22c55e", "#f59e0b", "#ef4444", "#8b5cf6", "#06b6d4"]

function formatNaira(amount: number) {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

export default function Dashboard() {
  const { data: kpi, isLoading } = trpc.dashboard.kpi.useQuery()
  const { data } = trpc.dashboard.paymentMethods.useQuery()
  const paymentMethods = (data || []) as { method: string; total: number; count: number }[]

  if (isLoading || !kpi) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    )
  }

  const kpis = [
    { title: "Today's Sales", value: formatNaira(kpi.todaySales), icon: DollarSign, trend: "+12%", up: true, color: "bg-emerald-500/10 text-emerald-500" },
    { title: "Weekly Sales", value: formatNaira(kpi.weekSales), icon: TrendingUp, trend: "+8%", up: true, color: "bg-blue-500/10 text-blue-500" },
    { title: "Monthly Sales", value: formatNaira(kpi.monthSales), icon: ShoppingCart, trend: "+15%", up: true, color: "bg-violet-500/10 text-violet-500" },
    { title: "Total Products", value: kpi.totalProducts.toString(), icon: Package, trend: "+3", up: true, color: "bg-amber-500/10 text-amber-500" },
    { title: "Total Customers", value: kpi.totalCustomers.toString(), icon: Users, trend: "+5", up: true, color: "bg-cyan-500/10 text-cyan-500" },
    { title: "Low Stock Alerts", value: kpi.lowStockCount.toString(), icon: AlertTriangle, trend: "Needs attention", up: false, color: "bg-red-500/10 text-red-500" },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">Overview of your business performance</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {kpis.map((item) => (
          <Card key={item.title} className="hover:shadow-md transition-shadow">
            <CardContent className="p-5 h-28 flex items-center justify-between">
              <div className="min-w-0">
                <p className="text-sm text-muted-foreground truncate">{item.title}</p>
                <p className="text-2xl font-bold truncate">{item.value}</p>
                <div className={`flex items-center gap-1 text-xs mt-1 ${item.up ? "text-emerald-500" : "text-red-500"}`}>
                  {item.up ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
                  <span className="truncate">{item.trend}</span>
                </div>
              </div>
              <div className={`p-2.5 rounded-lg ${item.color} flex-none ml-4`}>
                <item.icon className="h-5 w-5" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Daily Sales Chart */}
        <Card className="h-full">
          <CardHeader>
            <CardTitle className="text-base">Daily Sales (Last 14 Days)</CardTitle>
          </CardHeader>
          <CardContent className="p-4 flex items-center justify-center">
            <div className="h-72 w-full flex items-center">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={kpi.dailySales} margin={{ top: 8, right: 12, left: 0, bottom: 4 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="date" tickFormatter={(val) => format(new Date(val), "MMM dd")} stroke="hsl(var(--muted-foreground))" fontSize={12} />
                  <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickFormatter={(val) => `N${(val / 1000).toFixed(0)}k`} />
                  <Tooltip
                    contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "8px", fontSize: "12px" }}
                    formatter={(value: any) => [formatNaira(Number(value)), "Sales"]}
                    labelFormatter={(label) => format(new Date(label), "MMM dd, yyyy")}
                  />
                  <Bar dataKey="total" fill="#6366f1" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Payment Methods */}
        <Card className="h-full">
          <CardHeader>
            <CardTitle className="text-base">Payment Methods</CardTitle>
          </CardHeader>
          <CardContent className="p-4 flex flex-col items-center">
            <div className="h-72 w-full flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={paymentMethods || []} cx="50%" cy="50%" innerRadius={60} outerRadius={100} dataKey="total" nameKey="method" paddingAngle={4}>
                    {(paymentMethods || []).map((_, index) => (
                      <Cell key={index} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "8px", fontSize: "12px" }}
                    formatter={(value: any, name: any) => [formatNaira(Number(value)), name]}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="grid grid-cols-3 gap-2 justify-items-center mt-4 w-full">
              {(paymentMethods || []).map((pm, i) => (
                <div key={pm.method} className="flex items-center gap-1.5 text-xs">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                  <span className="capitalize">{pm.method?.replace("_", " ")}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Products */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Top Selling Products</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="divide-y divide-border">
              {kpi.topProducts.slice(0, 6).map((product, i) => (
                <div key={i} className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3 py-3">
                  <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-xs font-bold text-primary">{i + 1}</div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate">{product.name}</p>
                    <p className="text-xs text-muted-foreground">{product.totalQuantity} sold</p>
                  </div>
                  <p className="text-sm font-semibold text-right">{formatNaira(Number(product.totalRevenue))}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent Sales */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Recent Transactions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="divide-y divide-border">
              {kpi.recentSales.slice(0, 8).map((sale) => (
                <div key={sale.id} className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3 py-3">
                  <div className={`w-2 h-2 rounded-full ${sale.status === "completed" ? "bg-emerald-500" : sale.status === "pending" ? "bg-amber-500" : sale.status === "cancelled" ? "bg-red-500" : "bg-blue-500"}`} />
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate">{sale.saleNumber}</p>
                    <p className="text-xs text-muted-foreground truncate">{sale.customerName || "Walk-in"}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold">{formatNaira(Number(sale.totalAmount))}</p>
                    <p className="text-xs text-muted-foreground capitalize">{sale.paymentMethod?.replace("_", " ")}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
