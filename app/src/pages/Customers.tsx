import { useState } from "react"
import { trpc } from "@/providers/trpc"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { format } from "date-fns"
import { Search, Plus, User, Phone, Mail, MapPin, ArrowLeft, ArrowRight, RefreshCcw } from "lucide-react"

function formatNaira(amount: number) {
  return new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN", minimumFractionDigits: 0 }).format(amount)
}

export default function Customers() {
  const [search, setSearch] = useState("")
  const [page, setPage] = useState(1)
  const [showAdd, setShowAdd] = useState(false)
  const [selectedCustomer, setSelectedCustomer] = useState<any>(null)
  const [form, setForm] = useState<{ customerCode: string; firstName: string; lastName: string; email: string; phone: string; city: string; customerGroup: "retail" | "wholesale" | "vip" | "corporate" }>({ customerCode: "", firstName: "", lastName: "", email: "", phone: "", city: "", customerGroup: "retail" })

  const { data, isLoading, refetch } = trpc.customers.list.useQuery({ search: search || undefined, page, limit: 20 })
  const { data: customerDetail } = trpc.customers.getById.useQuery(
    { id: selectedCustomer?.id },
    { enabled: !!selectedCustomer }
  )
  const createCustomer = trpc.customers.create.useMutation({
    onSuccess: () => { setShowAdd(false); setForm({ customerCode: "", firstName: "", lastName: "", email: "", phone: "", city: "", customerGroup: "retail" }); refetch() },
  })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Customers</h1>
          <p className="text-muted-foreground">Manage your customer database</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm" onClick={() => refetch()}>
            <RefreshCcw className="h-4 w-4 mr-2" /> Refresh
          </Button>
          <Button onClick={() => setShowAdd(true)}><Plus className="h-4 w-4 mr-2" /> Add Customer</Button>
        </div>
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input placeholder="Search customers..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {isLoading ? (
          <div className="col-span-full text-center p-8 text-muted-foreground">Loading...</div>
        ) : data?.items.length === 0 ? (
          <div className="col-span-full text-center p-8 text-muted-foreground">No customers found</div>
        ) : (
          data?.items.map((customer: any) => (
            <Card key={customer.id} className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => setSelectedCustomer(customer)}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <User className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium">{customer.firstName} {customer.lastName}</p>
                      <p className="text-xs text-muted-foreground">{customer.customerCode}</p>
                    </div>
                  </div>
                  <Badge variant="outline" className="capitalize text-xs">{customer.customerGroup}</Badge>
                </div>
                <div className="mt-3 space-y-1 text-sm text-muted-foreground">
                  {customer.phone && <div className="flex items-center gap-2"><Phone className="h-3 w-3" /><span>{customer.phone}</span></div>}
                  {customer.email && <div className="flex items-center gap-2"><Mail className="h-3 w-3" /><span className="truncate">{customer.email}</span></div>}
                  {customer.city && <div className="flex items-center gap-2"><MapPin className="h-3 w-3" /><span>{customer.city}</span></div>}
                </div>
                <div className="mt-3 flex items-center gap-3 text-xs">
                  <Badge variant="secondary">{customer.loyaltyPoints} pts</Badge>
                  <span className="text-muted-foreground">{customer.outstandingBalance > 0 ? `Balance: ${formatNaira(Number(customer.outstandingBalance))}` : "No outstanding"}</span>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {data && data.totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">Page {page} of {data.totalPages}</p>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}><ArrowLeft className="h-4 w-4" /></Button>
            <Button variant="outline" size="sm" onClick={() => setPage(p => Math.min(data.totalPages, p + 1))} disabled={page === data.totalPages}><ArrowRight className="h-4 w-4" /></Button>
          </div>
        </div>
      )}

      <Dialog open={showAdd} onOpenChange={setShowAdd}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>Add New Customer</DialogTitle></DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><Label>Customer Code *</Label><Input value={form.customerCode} onChange={(e) => setForm({ ...form, customerCode: e.target.value })} placeholder="CUS-001" /></div>
              <div className="space-y-2"><Label>Group</Label>
                <Select value={form.customerGroup} onValueChange={(v) => setForm({ ...form, customerGroup: v as "retail" | "wholesale" | "vip" | "corporate" })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="retail">Retail</SelectItem>
                    <SelectItem value="wholesale">Wholesale</SelectItem>
                    <SelectItem value="vip">VIP</SelectItem>
                    <SelectItem value="corporate">Corporate</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><Label>First Name *</Label><Input value={form.firstName} onChange={(e) => setForm({ ...form, firstName: e.target.value })} /></div>
              <div className="space-y-2"><Label>Last Name *</Label><Input value={form.lastName} onChange={(e) => setForm({ ...form, lastName: e.target.value })} /></div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><Label>Email</Label><Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></div>
              <div className="space-y-2"><Label>Phone</Label><Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} /></div>
            </div>
            <div className="space-y-2"><Label>City</Label><Input value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAdd(false)}>Cancel</Button>
            <Button onClick={() => createCustomer.mutate(form)} disabled={createCustomer.isPending}>
              {createCustomer.isPending ? "Creating..." : "Create Customer"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!selectedCustomer} onOpenChange={() => setSelectedCustomer(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Customer Details</DialogTitle></DialogHeader>
          {customerDetail && (
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                  <User className="h-8 w-8 text-primary" />
                </div>
                <div>
                  <p className="text-xl font-bold">{customerDetail.firstName} {customerDetail.lastName}</p>
                  <p className="text-sm text-muted-foreground">{customerDetail.customerCode}</p>
                  <Badge variant="outline" className="capitalize mt-1">{customerDetail.customerGroup}</Badge>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="p-3 bg-accent/50 rounded-lg text-center">
                  <p className="text-2xl font-bold">{customerDetail.salesCount || 0}</p>
                  <p className="text-xs text-muted-foreground">Total Orders</p>
                </div>
                <div className="p-3 bg-accent/50 rounded-lg text-center">
                  <p className="text-2xl font-bold">{formatNaira(Number(customerDetail.totalSpent || "0"))}</p>
                  <p className="text-xs text-muted-foreground">Total Spent</p>
                </div>
              </div>
              <div className="space-y-2 text-sm">
                {customerDetail.email && <div className="flex items-center gap-2"><Mail className="h-4 w-4 text-muted-foreground" /><span>{customerDetail.email}</span></div>}
                {customerDetail.phone && <div className="flex items-center gap-2"><Phone className="h-4 w-4 text-muted-foreground" /><span>{customerDetail.phone}</span></div>}
                {customerDetail.address && <div className="flex items-center gap-2"><MapPin className="h-4 w-4 text-muted-foreground" /><span>{customerDetail.address}</span></div>}
              </div>
              <div className="flex items-center justify-between pt-2 border-t">
                <div><span className="text-sm text-muted-foreground">Loyalty Points: </span><span className="font-semibold">{customerDetail.loyaltyPoints}</span></div>
                <div><span className="text-sm text-muted-foreground">Member since: </span><span>{format(new Date(customerDetail.createdAt), "MMM yyyy")}</span></div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
