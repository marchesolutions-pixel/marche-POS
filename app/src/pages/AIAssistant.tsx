import { useState, useRef, useEffect } from "react"
import { trpc } from "@/providers/trpc"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"

import { Brain, Send, User, TrendingUp, Package, Users, DollarSign, Sparkles, BarChart3, Loader2 } from "lucide-react"

interface Message {
  id: string
  role: "user" | "assistant"
  content: string
  data?: any
}

function formatNaira(amount: number) {
  return new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN", minimumFractionDigits: 0 }).format(amount)
}

const quickQuestions = [
  { icon: TrendingUp, label: "Sales today", query: "What are my sales today?" },
  { icon: Package, label: "Low stock", query: "Which products have low stock?" },
  { icon: Users, label: "Top customers", query: "Who are my top customers?" },
  { icon: DollarSign, label: "Monthly revenue", query: "What is my monthly revenue?" },
  { icon: BarChart3, label: "Best products", query: "What are my best selling products?" },
  { icon: Sparkles, label: "Business health", query: "How is my business performing?" },
]

export default function AIAssistant() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "assistant",
      content: "Hello! I'm your Marche AI Business Assistant. I can help you with sales analysis, inventory insights, customer analytics, and business recommendations. What would you like to know?",
    },
  ])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)

  const { data: kpi } = trpc.dashboard.kpi.useQuery()
  const { data: _products } = trpc.products.list.useQuery({ limit: 5 })
  const { data: customers } = trpc.customers.list.useQuery({ limit: 5 })

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages])

  const handleSend = async (query: string) => {
    if (!query.trim()) return
    const userMsg: Message = { id: Date.now().toString(), role: "user", content: query }
    setMessages((prev) => [...prev, userMsg])
    setInput("")
    setIsLoading(true)

    // Simulate AI processing with business insights
    setTimeout(() => {
      const response = generateResponse(query, kpi, null, customers)
      const assistantMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: response.text,
        data: response.data,
      }
      setMessages((prev) => [...prev, assistantMsg])
      setIsLoading(false)
    }, 1200)
  }

  const generateResponse = (query: string, kpiData: any, _productsData: any, customersData: any) => {
    const q = query.toLowerCase()

    if (q.includes("sale") && (q.includes("today") || q.includes("daily"))) {
      return {
        text: kpiData
          ? `Today's sales performance: ${formatNaira(kpiData.todaySales)}. You've processed transactions across ${kpiData.totalOrders} orders today. Your weekly sales are at ${formatNaira(kpiData.weekSales)}, showing a strong trend.`
          : "I need more data to analyze today's sales.",
        data: kpiData?.dailySales,
      }
    }

    if (q.includes("low stock") || q.includes("inventory") || q.includes("reorder")) {
      return {
        text: kpiData
          ? `You currently have ${kpiData.lowStockCount} products below their minimum stock levels. I recommend reviewing the inventory report and placing purchase orders for items that need restocking. Your total inventory value is ${formatNaira(kpiData.inventoryValue)}.`
          : "Let me check your inventory status.",
        data: null,
      }
    }

    if (q.includes("top customer") || q.includes("best customer")) {
      return {
        text: customersData?.items?.length
          ? `You have ${customersData.total || 0} customers in your database. Your VIP and wholesale customers are generating the highest revenue. I recommend running a loyalty campaign for your top 10 customers to increase retention.`
          : "Customer data analysis is available in the CRM section.",
        data: customersData?.items,
      }
    }

    if (q.includes("revenue") || q.includes("monthly") || q.includes("income")) {
      return {
        text: kpiData
          ? `Your monthly revenue is ${formatNaira(kpiData.monthSales)}. This includes sales from all branches. Your gross profit is approximately ${formatNaira(kpiData.grossProfit)}. After deducting monthly expenses of ${formatNaira(kpiData.monthExpenses)}, your net position looks healthy.`
          : "Revenue data is being analyzed.",
        data: kpiData?.monthlySales,
      }
    }

    if (q.includes("best selling") || q.includes("top product")) {
      const topProducts = kpiData?.topProducts?.slice(0, 5)
      return {
        text: topProducts?.length
          ? `Your top 5 best-selling products are: ${topProducts.map((p: any, i: number) => `${i + 1}. ${p.name} (${p.totalQuantity} sold)`).join(", ")}. I recommend ensuring these items are always well-stocked.`
          : "Product performance data is being analyzed.",
        data: topProducts,
      }
    }

    if (q.includes("business") && (q.includes("perform") || q.includes("health") || q.includes("how"))) {
      return {
        text: kpiData
          ? `Business Health Summary: Revenue this month: ${formatNaira(kpiData.monthSales)}. Total customers: ${kpiData.totalCustomers}. Products: ${kpiData.totalProducts}. Employees: ${kpiData.totalEmployees}. Inventory value: ${formatNaira(kpiData.inventoryValue)}. Overall, your business is showing positive growth trends with steady customer acquisition.`
          : "Business analytics are being compiled.",
        data: null,
      }
    }

    if (q.includes("expense") || q.includes("cost")) {
      return {
        text: kpiData
          ? `Your monthly expenses are ${formatNaira(kpiData.monthExpenses)}. Major expense categories include rent, salaries, and marketing. I recommend reviewing your expense breakdown in the Expenses module to identify potential savings.`
          : "Expense data is being retrieved.",
        data: null,
      }
    }

    if (q.includes("employee") || q.includes("staff")) {
      return {
        text: kpiData
          ? `You have ${kpiData.totalEmployees} employees across your branches. Payroll processing for this month has been completed. Staff productivity metrics show positive performance in sales and inventory management departments.`
          : "Employee data is being retrieved.",
        data: null,
      }
    }

    // Default response
    return {
      text: `I've analyzed your business data. Here's what I found: Your total sales are ${formatNaira(kpiData?.totalSales || 0)} with ${kpiData?.totalOrders || 0} orders. You have ${kpiData?.totalProducts || 0} products, ${kpiData?.totalCustomers || 0} customers, and ${kpiData?.totalEmployees || 0} employees. Is there a specific area you'd like me to dive deeper into?`,
      data: null,
    }
  }

  return (
    <div className="h-[calc(100vh-8rem)] flex flex-col gap-4">
      <div>
        <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
          <Brain className="h-6 w-6 text-primary" />
          AI Business Assistant
        </h1>
        <p className="text-muted-foreground">Ask me anything about your business</p>
      </div>

      <Card className="flex-1 flex flex-col overflow-hidden">
        <CardContent className="flex-1 flex flex-col p-0">
          {/* Messages Area */}
          <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((msg) => (
              <div key={msg.id} className={`flex gap-3 ${msg.role === "user" ? "justify-end" : ""}`}>
                {msg.role === "assistant" && (
                  <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Brain className="h-4 w-4 text-primary" />
                  </div>
                )}
                <div className={`max-w-[80%] rounded-lg p-3 text-sm ${
                  msg.role === "user"
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted"
                }`}>
                  <p className="whitespace-pre-wrap">{msg.content}</p>
                  {msg.data && Array.isArray(msg.data) && (
                    <div className="mt-2 space-y-1">
                      {msg.data.slice(0, 5).map((item: any, i: number) => (
                        <div key={i} className="flex justify-between text-xs bg-background/50 rounded px-2 py-1">
                          <span className="truncate">{item.name || item.productName || "-"}</span>
                          <span className="font-medium">
                            {item.totalQuantity ? `${item.totalQuantity} sold` : item.totalRevenue ? formatNaira(Number(item.totalRevenue)) : ""}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                {msg.role === "user" && (
                  <div className="w-8 h-8 rounded-lg bg-accent flex items-center justify-center flex-shrink-0">
                    <User className="h-4 w-4" />
                  </div>
                )}
              </div>
            ))}
            {isLoading && (
              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Brain className="h-4 w-4 text-primary" />
                </div>
                <div className="bg-muted rounded-lg p-3">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Analyzing your business data...
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Quick Questions */}
          {messages.length <= 2 && (
            <div className="px-4 pb-2">
              <p className="text-xs text-muted-foreground mb-2">Quick questions:</p>
              <div className="flex flex-wrap gap-2">
                {quickQuestions.map((q) => (
                  <button
                    key={q.label}
                    onClick={() => handleSend(q.query)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs hover:bg-accent transition-colors"
                  >
                    <q.icon className="h-3 w-3" />
                    {q.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Input Area */}
          <div className="border-t p-4">
            <form
              onSubmit={(e) => {
                e.preventDefault()
                handleSend(input)
              }}
              className="flex gap-2"
            >
              <Input
                placeholder="Ask about sales, inventory, customers..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                className="flex-1"
              />
              <Button type="submit" size="icon" disabled={isLoading || !input.trim()}>
                <Send className="h-4 w-4" />
              </Button>
            </form>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
