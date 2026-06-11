import { useState } from "react"
import { trpc } from "@/providers/trpc"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { format } from "date-fns"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
} from "recharts"
import {
  FileText,
  TrendingUp,
  Package,
  Users,
  DollarSign,
  Receipt,
  ArrowUpRight,
  ArrowDownRight,
  Download,
} from "lucide-react"

function formatNaira(amount: number) {
  return new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN", minimumFractionDigits: 0 }).format(amount)
}

function formatMonthLabel(value: string | number | undefined) {
  if (value == null) return ""
  const month = value.toString()
  const date = new Date(`${month}-01`)
  if (Number.isNaN(date.getTime())) return month
  return format(date, "MMM")
}

const COLORS = ["#6366f1", "#22c55e", "#f59e0b", "#ef4444", "#8b5cf6", "#06b6d4"]

export default function Reports() {
  const [period, setPeriod] = useState("30")
  const [activeTab, setActiveTab] = useState("sales")

  const { data: kpi } = trpc.dashboard.kpi.useQuery()
  const { data: monthlySales } = trpc.dashboard.monthlySales.useQuery()
  const { data: paymentMethods } = trpc.dashboard.paymentMethods.useQuery()

  const downloadFile = (filename: string, content: string, mimeType: string) => {
    const blob = new Blob([content], { type: mimeType })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.download = filename
    link.click()
    URL.revokeObjectURL(url)
  }

  const exportTopProductsCsv = () => {
    if (!kpi) return
    const headers = ["Rank", "Product", "Quantity Sold", "Revenue"]
    const rows = kpi.topProducts.map((product: any, index: number) => [
      String(index + 1),
      product.name,
      String(product.totalQuantity),
      String(product.totalRevenue),
    ])
    const csv = [
      headers.join(","),
      ...rows.map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(",")),
    ].join("\n")
    downloadFile(`top-products-${period}.csv`, csv, "text/csv;charset=utf-8;")
  }

  const exportTopProductsJson = () => {
    if (!kpi) return
    const payload = {
      generatedAt: new Date().toISOString(),
      period,
      topProducts: kpi.topProducts,
    }
    downloadFile(`top-products-${period}.json`, JSON.stringify(payload, null, 2), "application/json;charset=utf-8;")
  }

  if (!kpi) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    )
  }

  const reportSections = [
    {
      id: "sales",
      label: "Sales",
      icon: Receipt,
      data: [
        { label: "Total Sales", value: formatNaira(kpi.totalSales), change: "+12%", up: true },
        { label: "Today's Sales", value: formatNaira(kpi.todaySales), change: "+5%", up: true },
        { label: "Weekly Sales", value: formatNaira(kpi.weekSales), change: "+8%", up: true },
        { label: "Monthly Sales", value: formatNaira(kpi.monthSales), change: "+15%", up: true },
      ],
    },
    {
      id: "products",
      label: "Products",
      icon: Package,
      data: [
        { label: "Total Products", value: kpi.totalProducts.toString(), change: "+3", up: true },
        { label: "Low Stock Items", value: kpi.lowStockCount.toString(), change: "-2", up: true },
        { label: "Inventory Value", value: formatNaira(kpi.inventoryValue), change: "+3%", up: true },
        { label: "Categories", value: "8", change: "0", up: true },
      ],
    },
    {
      id: "customers",
      label: "Customers",
      icon: Users,
      data: [
        { label: "Total Customers", value: kpi.totalCustomers.toString(), change: "+5", up: true },
        { label: "VIP Customers", value: "3", change: "+1", up: true },
        { label: "New This Month", value: "12", change: "+4", up: true },
        { label: "Retention Rate", value: "87%", change: "+2%", up: true },
      ],
    },
    {
      id: "financial",
      label: "Financial",
      icon: DollarSign,
      data: [
        { label: "Gross Profit", value: formatNaira(kpi.grossProfit), change: "+10%", up: true },
        { label: "Monthly Expenses", value: formatNaira(kpi.monthExpenses), change: "-3%", up: true },
        { label: "Net Position", value: formatNaira(kpi.monthSales - kpi.monthExpenses), change: "+18%", up: true },
        { label: "Tax Collected", value: formatNaira(kpi.totalSales * 0.075), change: "+12%", up: true },
      ],
    },
  ]

  const currentSection = reportSections.find(s => s.id === activeTab) || reportSections[0]
  const SectionIcon = currentSection.icon

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <FileText className="h-6 w-6 text-primary" />
            Reports & Analytics
          </h1>
          <p className="text-muted-foreground">Comprehensive business intelligence</p>
        </div>
        <div className="flex flex-wrap gap-2 items-center">
          <Button variant="outline" size="sm" onClick={exportTopProductsCsv}>
            <Download className="h-4 w-4 mr-2" /> Export CSV
          </Button>
          <Button variant="outline" size="sm" onClick={exportTopProductsJson}>
            <Download className="h-4 w-4 mr-2" /> Export JSON
          </Button>
          <Select value={period} onValueChange={setPeriod}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Period" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7">Last 7 Days</SelectItem>
            <SelectItem value="30">Last 30 Days</SelectItem>
            <SelectItem value="90">Last 90 Days</SelectItem>
            <SelectItem value="365">This Year</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>

      {/* Report Category Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-4 w-full max-w-lg">
          {reportSections.map((section) => {
            const Icon = section.icon
            return (
              <TabsTrigger key={section.id} value={section.id} className="text-xs">
                <Icon className="h-3.5 w-3.5 mr-1" />
                {section.label}
              </TabsTrigger>
            )
          })}
        </TabsList>
      </Tabs>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {currentSection.data.map((item) => (
          <Card key={item.label} className="hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">{item.label}</p>
                  <p className="text-xl font-bold">{item.value}</p>
                  <div className={`flex items-center gap-1 text-xs ${item.up ? "text-emerald-500" : "text-red-500"}`}>
                    {item.up ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
                    <span>{item.change}</span>
                  </div>
                </div>
                <SectionIcon className="h-5 w-5 text-muted-foreground/50" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Sales Trend */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-primary" />
              Monthly Sales Trend
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={monthlySales || []}>
                <defs>
                  <linearGradient id="salesGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis
                  dataKey="month"
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={12}
                  tickFormatter={(val) => formatMonthLabel(val)}
                />
                <YAxis
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={12}
                  tickFormatter={(val) => `₦${(val / 1000).toFixed(0)}k`}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px",
                    fontSize: "12px",
                  }}
                  formatter={(value: any) => [formatNaira(Number(value)), "Sales"]}
                />
                <Area type="monotone" dataKey="total" stroke="#6366f1" fill="url(#salesGrad)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Daily Sales */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Receipt className="h-4 w-4 text-primary" />
              Daily Sales (Last 14 Days)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={kpi.dailySales}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis
                  dataKey="date"
                  tickFormatter={(val) => format(new Date(val), "MMM dd")}
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={12}
                />
                <YAxis
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={12}
                  tickFormatter={(val) => `₦${(val / 1000).toFixed(0)}k`}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px",
                    fontSize: "12px",
                  }}
                  formatter={(value: any) => [formatNaira(Number(value)), "Sales"]}
                  labelFormatter={(label) => format(new Date(label), "MMM dd, yyyy")}
                />
                <Bar dataKey="total" fill="#22c55e" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Top Products Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Package className="h-4 w-4 text-primary" />
            Top Selling Products
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="text-left p-3 font-medium">Rank</th>
                  <th className="text-left p-3 font-medium">Product</th>
                  <th className="text-right p-3 font-medium">Quantity Sold</th>
                  <th className="text-right p-3 font-medium">Revenue</th>
                  <th className="text-right p-3 font-medium">Performance</th>
                </tr>
              </thead>
              <tbody>
                {kpi.topProducts.map((product: any, i: number) => {
                  const maxQty = Math.max(...kpi.topProducts.map((p: any) => Number(p.totalQuantity)))
                  const pct = (Number(product.totalQuantity) / maxQty) * 100
                  return (
                    <tr key={i} className="border-b hover:bg-accent/50 transition-colors">
                      <td className="p-3">
                        <div className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold ${
                          i < 3 ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"
                        }`}>
                          {i + 1}
                        </div>
                      </td>
                      <td className="p-3 font-medium">{product.name}</td>
                      <td className="p-3 text-right">{product.totalQuantity}</td>
                      <td className="p-3 text-right font-semibold">{formatNaira(Number(product.totalRevenue))}</td>
                      <td className="p-3">
                        <div className="flex items-center gap-2 justify-end">
                          <div className="w-24 h-2 bg-muted rounded-full overflow-hidden">
                            <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, backgroundColor: COLORS[i % COLORS.length] }} />
                          </div>
                          <span className="text-xs text-muted-foreground w-10 text-right">{Math.round(pct)}%</span>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Payment Methods */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <DollarSign className="h-4 w-4 text-primary" />
            Payment Method Breakdown
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {(paymentMethods || []).map((pm: any, i: number) => (
              <div key={pm.method} className="p-4 rounded-lg bg-accent/50 text-center space-y-2">
                <div className="w-10 h-10 rounded-full mx-auto flex items-center justify-center" style={{ backgroundColor: COLORS[i % COLORS.length] + "20" }}>
                  <DollarSign className="h-5 w-5" style={{ color: COLORS[i % COLORS.length] }} />
                </div>
                <p className="text-sm font-medium capitalize">{pm.method?.replace("_", " ")}</p>
                <p className="text-lg font-bold">{formatNaira(Number(pm.total))}</p>
                <p className="text-xs text-muted-foreground">{pm.count} transactions</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
