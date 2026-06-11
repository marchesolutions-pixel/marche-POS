import { useState } from "react"
import { trpc } from "@/providers/trpc"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { format } from "date-fns"
import { CreditCard, TrendingDown, Wallet, Building, Receipt, Plus, RefreshCcw } from "lucide-react"

function formatNaira(amount: number) {
  return new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN", minimumFractionDigits: 0 }).format(amount)
}

export default function ExpensesPage() {
  const [categoryId, setCategoryId] = useState("")
  const [branchId, setBranchId] = useState("")
  const [showAdd, setShowAdd] = useState(false)
  const [form, setForm] = useState({ description: "", categoryId: "", branchId: "", amount: "", vendor: "", status: "pending", expenseDate: new Date().toISOString().slice(0, 10) })

  const { data: expensesData, isLoading, refetch } = trpc.expenses.list.useQuery({
    categoryId: categoryId ? Number(categoryId) : undefined,
    branchId: branchId ? Number(branchId) : undefined,
    limit: 50,
  })
  const { data: categories } = trpc.expenses.categories.useQuery()
  const { data: branches } = trpc.branches.list.useQuery()

  const pendingCount = expensesData?.items.filter((expense) => expense.status === "pending").length || 0
  const createExpense = trpc.expenses.create.useMutation({
    onSuccess: () => {
      setShowAdd(false)
      setForm({ description: "", categoryId: "", branchId: "", amount: "", vendor: "", status: "pending", expenseDate: new Date().toISOString().slice(0, 10) })
      refetch()
    },
  })

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Expenses</h1>
          <p className="text-muted-foreground">Track and manage business expenses</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm" onClick={() => refetch()}>
            <RefreshCcw className="h-4 w-4 mr-2" /> Refresh
          </Button>
          <Button onClick={() => setShowAdd(true)}>
            <Plus className="h-4 w-4 mr-2" /> Add Expense
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Expenses</p>
                <p className="text-2xl font-bold">{formatNaira(Number(expensesData?.totalAmount || 0))}</p>
              </div>
              <div className="p-2.5 rounded-lg bg-red-500/10 text-red-500">
                <TrendingDown className="h-5 w-5" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Pending Expenses</p>
                <p className="text-2xl font-bold">{pendingCount}</p>
              </div>
              <div className="p-2.5 rounded-lg bg-amber-500/10 text-amber-500">
                <Wallet className="h-5 w-5" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Records</p>
                <p className="text-2xl font-bold">{expensesData?.total || 0}</p>
              </div>
              <div className="p-2.5 rounded-lg bg-blue-500/10 text-blue-500">
                <Receipt className="h-5 w-5" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 items-center">
        <Select value={categoryId} onValueChange={setCategoryId}>
          <SelectTrigger className="w-48">
            <CreditCard className="h-4 w-4 mr-2" />
            <SelectValue placeholder="All Categories" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">All Categories</SelectItem>
            {categories?.map((c) => (
              <SelectItem key={c.id} value={c.id.toString()}>{c.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={branchId} onValueChange={setBranchId}>
          <SelectTrigger className="w-48">
            <Building className="h-4 w-4 mr-2" />
            <SelectValue placeholder="All Branches" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">All Branches</SelectItem>
            {branches?.map((b) => (
              <SelectItem key={b.id} value={b.id.toString()}>{b.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Expenses Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="text-left p-3 font-medium">Expense #</th>
                  <th className="text-left p-3 font-medium">Description</th>
                  <th className="text-left p-3 font-medium">Category</th>
                  <th className="text-right p-3 font-medium">Amount</th>
                  <th className="text-left p-3 font-medium">Vendor</th>
                  <th className="text-center p-3 font-medium">Status</th>
                  <th className="text-left p-3 font-medium">Date</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr><td colSpan={7} className="p-8 text-center text-muted-foreground">Loading...</td></tr>
                ) : expensesData?.items.length === 0 ? (
                  <tr><td colSpan={7} className="p-8 text-center text-muted-foreground">No expenses found</td></tr>
                ) : (
                  expensesData?.items.map((exp: any) => (
                    <tr key={exp.id} className="border-b hover:bg-accent/50 transition-colors">
                      <td className="p-3 font-medium">{exp.expenseNumber}</td>
                      <td className="p-3">{exp.description || "-"}</td>
                      <td className="p-3">
                        <Badge variant="outline" style={{ borderColor: exp.categoryColor + "40", color: exp.categoryColor }} className="text-xs">
                          {exp.categoryName}
                        </Badge>
                      </td>
                      <td className="p-3 text-right font-semibold">{formatNaira(Number(exp.amount))}</td>
                      <td className="p-3 text-muted-foreground">{exp.vendor || "-"}</td>
                      <td className="p-3 text-center">
                        <Badge variant={exp.status === "paid" ? "default" : exp.status === "pending" ? "secondary" : "outline"} className="text-xs capitalize">
                          {exp.status}
                        </Badge>
                      </td>
                      <td className="p-3 text-muted-foreground">
                        {exp.expenseDate ? format(new Date(exp.expenseDate), "MMM dd, yyyy") : "-"}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <Dialog open={showAdd} onOpenChange={setShowAdd}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Add Expense</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2"><Label>Description *</Label><Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={3} placeholder="Describe the expense" /></div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><Label>Category *</Label>
                <Select value={form.categoryId} onValueChange={(v) => setForm({ ...form, categoryId: v })}>
                  <SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger>
                  <SelectContent>
                    {categories?.map((c) => <SelectItem key={c.id} value={c.id.toString()}>{c.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2"><Label>Expense Date</Label><Input type="date" value={form.expenseDate} onChange={(e) => setForm({ ...form, expenseDate: e.target.value })} /></div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><Label>Branch *</Label>
                <Select value={form.branchId} onValueChange={(v) => setForm({ ...form, branchId: v })}>
                  <SelectTrigger><SelectValue placeholder="Select branch" /></SelectTrigger>
                  <SelectContent>
                    {branches?.map((b) => <SelectItem key={b.id} value={b.id.toString()}>{b.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2"><Label>Status</Label>
                <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="paid">Paid</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><Label>Amount *</Label><Input type="number" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} placeholder="0.00" /></div>
              <div className="space-y-2"><Label>Vendor</Label><Input value={form.vendor} onChange={(e) => setForm({ ...form, vendor: e.target.value })} placeholder="Vendor name" /></div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAdd(false)}>Cancel</Button>
            <Button onClick={() => createExpense.mutate({
              description: form.description,
              categoryId: Number(form.categoryId),
              branchId: Number(form.branchId),
              amount: form.amount,
              vendor: form.vendor,
              status: form.status as 'paid' | 'pending' | 'cancelled',
              expenseDate: form.expenseDate,
            })} disabled={createExpense.isPending || !form.description || !form.categoryId || !form.branchId || !form.amount}>
              {createExpense.isPending ? 'Saving...' : 'Save Expense'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
