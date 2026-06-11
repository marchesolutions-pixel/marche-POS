import { useState } from "react"
import { trpc } from "@/providers/trpc"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { format } from "date-fns"
import { Search, Receipt, Eye, ArrowLeft, ArrowRight, RefreshCcw } from "lucide-react"

function formatNaira(amount: number) {
  return new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN", minimumFractionDigits: 0 }).format(amount)
}

export default function Sales() {
  const [search, setSearch] = useState("")
  const [page, setPage] = useState(1)
  const [status, setStatus] = useState("")
  const [selectedSale, setSelectedSale] = useState<any>(null)

  const { data, isLoading, refetch } = trpc.sales.list.useQuery({
    search: search || undefined,
    status: status || undefined,
    page,
    limit: 20,
  })

  const { data: saleDetail } = trpc.sales.getById.useQuery(
    { id: selectedSale?.id },
    { enabled: !!selectedSale }
  )

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Sales & Transactions</h1>
          <p className="text-muted-foreground">View and manage all sales</p>
        </div>
        <Button variant="outline" size="sm" onClick={() => refetch()}>
          <RefreshCcw className="h-4 w-4 mr-2" /> Refresh
        </Button>
      </div>

      <div className="flex gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search by sale number..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
        </div>
        <Select value={status} onValueChange={setStatus}>
          <SelectTrigger className="w-40"><SelectValue placeholder="All Status" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="">All</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="cancelled">Cancelled</SelectItem>
            <SelectItem value="refunded">Refunded</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="text-left p-3 font-medium">Sale #</th>
                  <th className="text-left p-3 font-medium">Customer</th>
                  <th className="text-right p-3 font-medium">Amount</th>
                  <th className="text-left p-3 font-medium">Payment</th>
                  <th className="text-center p-3 font-medium">Status</th>
                  <th className="text-left p-3 font-medium">Date</th>
                  <th className="text-right p-3 font-medium">Action</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr><td colSpan={7} className="p-8 text-center text-muted-foreground">Loading...</td></tr>
                ) : data?.items.length === 0 ? (
                  <tr><td colSpan={7} className="p-8 text-center text-muted-foreground">No sales found</td></tr>
                ) : (
                  data?.items.map((sale: any) => (
                    <tr key={sale.id} className="border-b hover:bg-accent/50 transition-colors">
                      <td className="p-3 font-medium">{sale.saleNumber}</td>
                      <td className="p-3">{sale.customerName || "Walk-in"}</td>
                      <td className="p-3 text-right font-semibold">{formatNaira(Number(sale.totalAmount))}</td>
                      <td className="p-3">
                        <Badge variant="outline" className="text-xs capitalize">{sale.paymentMethod?.replace("_", " ")}</Badge>
                      </td>
                      <td className="p-3 text-center">
                        <Badge variant={
                          sale.status === "completed" ? "default" :
                          sale.status === "pending" ? "secondary" :
                          sale.status === "cancelled" ? "destructive" : "outline"
                        } className="text-xs capitalize">{sale.status}</Badge>
                      </td>
                      <td className="p-3 text-muted-foreground">{format(new Date(sale.createdAt), "MMM dd, yyyy HH:mm")}</td>
                      <td className="p-3 text-right">
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => setSelectedSale(sale)}>
                          <Eye className="h-4 w-4" />
                        </Button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {data && data.totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Showing {(page - 1) * 20 + 1} to {Math.min(page * 20, data.total)} of {data.total}
          </p>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}><ArrowLeft className="h-4 w-4" /></Button>
            <Button variant="outline" size="sm" onClick={() => setPage(p => Math.min(data.totalPages, p + 1))} disabled={page === data.totalPages}><ArrowRight className="h-4 w-4" /></Button>
          </div>
        </div>
      )}

      {/* Sale Detail Dialog */}
      <Dialog open={!!selectedSale} onOpenChange={() => setSelectedSale(null)}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Receipt className="h-5 w-5 text-primary" />
              Sale Details
            </DialogTitle>
          </DialogHeader>
          {saleDetail && (
            <div className="space-y-4">
              <div className="flex justify-between items-center p-4 bg-accent/50 rounded-lg">
                <div>
                  <p className="text-2xl font-bold">{formatNaira(Number(saleDetail.totalAmount))}</p>
                  <p className="text-sm text-muted-foreground">{saleDetail.saleNumber}</p>
                </div>
                <Badge variant={saleDetail.status === "completed" ? "default" : "secondary"} className="capitalize">
                  {saleDetail.status}
                </Badge>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div><span className="text-muted-foreground">Customer:</span> {saleDetail.customer ? `${saleDetail.customer.firstName} ${saleDetail.customer.lastName}` : "Walk-in"}</div>
                <div><span className="text-muted-foreground">Date:</span> {format(new Date(saleDetail.createdAt), "MMM dd, yyyy HH:mm")}</div>
                <div><span className="text-muted-foreground">Payment:</span> <span className="capitalize">{saleDetail.paymentMethod?.replace("_", " ")}</span></div>
                <div><span className="text-muted-foreground">Status:</span> <span className="capitalize">{saleDetail.paymentStatus}</span></div>
              </div>

              <div>
                <h4 className="font-medium mb-2">Items</h4>
                <div className="space-y-2">
                  {saleDetail.items.map((item: any) => (
                    <div key={item.id} className="flex justify-between items-center p-2 rounded bg-muted/50">
                      <div>
                        <p className="font-medium text-sm">{item.productName}</p>
                        <p className="text-xs text-muted-foreground">{item.sku} x {item.quantity}</p>
                      </div>
                      <p className="font-semibold text-sm">{formatNaira(Number(item.totalAmount))}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="border-t pt-3 space-y-1 text-sm">
                <div className="flex justify-between"><span className="text-muted-foreground">Subtotal</span><span>{formatNaira(Number(saleDetail.subtotal))}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Tax</span><span>{formatNaira(Number(saleDetail.taxAmount))}</span></div>
                {Number(saleDetail.discountAmount) > 0 && <div className="flex justify-between text-destructive"><span>Discount</span><span>-{formatNaira(Number(saleDetail.discountAmount))}</span></div>}
                <div className="flex justify-between text-lg font-bold border-t pt-2"><span>Total</span><span>{formatNaira(Number(saleDetail.totalAmount))}</span></div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
