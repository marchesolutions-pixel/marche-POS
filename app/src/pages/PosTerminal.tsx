import { useState, useMemo } from "react"
import { trpc } from "@/providers/trpc"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Search,
  ShoppingCart,
  Minus,
  Plus,
  Trash2,
  CreditCard,
  Banknote,
  Smartphone,
  Receipt,
  Package,
  UserPlus,
  Tag,
} from "lucide-react"

interface CartItem {
  productId: number
  name: string
  sku: string
  price: number
  quantity: number
  taxRate: number
}

function formatNaira(amount: number) {
  return new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN", minimumFractionDigits: 0 }).format(amount)
}

export default function PosTerminal() {
  const [search, setSearch] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [cart, setCart] = useState<CartItem[]>([])
  const [paymentMethod, setPaymentMethod] = useState("cash")
  const [showPaymentDialog, setShowPaymentDialog] = useState(false)
  const [showReceipt, setShowReceipt] = useState(false)
  const [discountPercent, setDiscountPercent] = useState(0)
  const [customerName, setCustomerName] = useState("")
  const [lastSaleId, setLastSaleId] = useState("")

  const { data: productsData } = trpc.products.list.useQuery({ search: search || undefined, limit: 50 })
  const { data: categories } = trpc.products.categories.useQuery()
  const { data: branches } = trpc.branches.list.useQuery()
  const utils = trpc.useUtils()
  const createSale = trpc.sales.create.useMutation({
    onSuccess: (data) => {
      setLastSaleId(data.saleNumber)
      setShowPaymentDialog(false)
      setShowReceipt(true)
      utils.dashboard.kpi.invalidate()
      utils.sales.list.invalidate()
    },
  })

  const filteredProducts = useMemo(() => {
    if (!productsData?.items) return []
    let items = productsData.items
    if (selectedCategory !== "all") {
      items = items.filter((p: any) => p.categoryName === selectedCategory)
    }
    return items
  }, [productsData, selectedCategory])

  const cartSummary = useMemo(() => {
    const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0)
    const taxTotal = cart.reduce((sum, item) => sum + item.price * item.quantity * (item.taxRate / 100), 0)
    const discountAmount = subtotal * (discountPercent / 100)
    const total = subtotal + taxTotal - discountAmount
    return { subtotal, taxTotal, discountAmount, total, itemCount: cart.reduce((s, i) => s + i.quantity, 0) }
  }, [cart, discountPercent])

  const addToCart = (product: any) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.productId === product.id)
      if (existing) {
        return prev.map((item) => item.productId === product.id ? { ...item, quantity: item.quantity + 1 } : item)
      }
      return [...prev, { productId: product.id, name: product.name, sku: product.sku, price: Number(product.sellingPrice), quantity: 1, taxRate: Number(product.taxRate || 0) }]
    })
  }

  const updateQuantity = (productId: number, delta: number) => {
    setCart((prev) => prev.map((item) => item.productId === productId ? { ...item, quantity: Math.max(0, item.quantity + delta) } : item).filter((item) => item.quantity > 0))
  }

  const removeFromCart = (productId: number) => {
    setCart((prev) => prev.filter((item) => item.productId !== productId))
  }

  const processPayment = () => {
    if (cart.length === 0 || !branches?.[0]) return
    createSale.mutate({
      branchId: branches[0].id,
      items: cart.map((item) => ({
        productId: item.productId, productName: item.name, sku: item.sku, quantity: item.quantity,
        unitPrice: item.price.toFixed(2), taxRate: item.taxRate.toFixed(2),
        taxAmount: (item.price * item.quantity * (item.taxRate / 100)).toFixed(2),
        totalAmount: (item.price * item.quantity).toFixed(2),
      })),
      subtotal: cartSummary.subtotal.toFixed(2), taxAmount: cartSummary.taxTotal.toFixed(2),
      discountAmount: cartSummary.discountAmount.toFixed(2), totalAmount: cartSummary.total.toFixed(2),
      amountPaid: cartSummary.total.toFixed(2), paymentMethod: paymentMethod as any,
      discountPercentage: discountPercent.toFixed(2), notes: customerName ? `Customer: ${customerName}` : undefined,
    })
  }

  return (
    <div className="h-full flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">POS Terminal</h1>
          <p className="text-muted-foreground">Process sales quickly</p>
        </div>
        <Badge variant="outline" className="px-3 py-1"><Package className="h-3 w-3 mr-1" />{branches?.[0]?.name || "Main Branch"}</Badge>
      </div>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-5 gap-4 min-h-0">
        {/* Products Panel */}
        <div className="lg:col-span-3 flex flex-col gap-4 min-h-0">
          <div className="relative flex-1 max-w-none">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search products by name, SKU, or barcode..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
          </div>

          <Tabs value={selectedCategory} onValueChange={setSelectedCategory}>
            <TabsList className="flex-wrap h-auto gap-1">
              <TabsTrigger value="all" className="text-xs">All</TabsTrigger>
              {categories?.map((cat) => <TabsTrigger key={cat.id} value={cat.name} className="text-xs">{cat.name}</TabsTrigger>)}
            </TabsList>
          </Tabs>

          <div className="flex-1 overflow-y-auto">
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {filteredProducts.map((product: any) => (
                <button key={product.id} onClick={() => addToCart(product)} className="flex flex-col items-start p-3 rounded-lg border bg-card hover:bg-accent hover:border-primary/50 transition-all text-left group">
                  <div className="w-full h-20 rounded-md bg-muted mb-2 overflow-hidden">
                    {product.image ? <img src={product.image} alt={product.name} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center"><Package className="h-8 w-8 text-muted-foreground/50" /></div>}
                  </div>
                  <p className="text-xs text-muted-foreground uppercase">{product.sku}</p>
                  <p className="text-sm font-medium line-clamp-2 leading-tight">{product.name}</p>
                  <p className="text-sm font-bold text-primary mt-1">{formatNaira(Number(product.sellingPrice))}</p>
                  <p className="text-xs text-muted-foreground">{product.categoryName}</p>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Cart Panel */}
        <Card className="lg:col-span-2 flex flex-col">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center justify-between">
              <span className="flex items-center gap-2"><ShoppingCart className="h-4 w-4" />Cart ({cartSummary.itemCount} items)</span>
              {cart.length > 0 && <button onClick={() => setCart([])} className="text-xs text-destructive hover:underline">Clear</button>}
            </CardTitle>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col p-4 pt-0 gap-3">
            <div className="flex-1 overflow-y-auto space-y-2 min-h-0">
              {cart.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-muted-foreground">
                  <ShoppingCart className="h-12 w-12 mb-2 opacity-30" /><p className="text-sm">Cart is empty</p><p className="text-xs">Click products to add</p>
                </div>
              ) : (
                cart.map((item) => (
                  <div key={item.productId} className="flex items-center gap-2 p-2 rounded-lg bg-accent/50">
                    <div className="flex-1 min-w-0"><p className="text-sm font-medium truncate">{item.name}</p><p className="text-xs text-muted-foreground">{formatNaira(item.price)} each</p></div>
                    <div className="flex items-center gap-1">
                      <button onClick={() => updateQuantity(item.productId, -1)} className="p-1 rounded-md hover:bg-background"><Minus className="h-3 w-3" /></button>
                      <span className="text-sm font-semibold w-6 text-center">{item.quantity}</span>
                      <button onClick={() => updateQuantity(item.productId, 1)} className="p-1 rounded-md hover:bg-background"><Plus className="h-3 w-3" /></button>
                    </div>
                    <p className="text-sm font-semibold min-w-[80px] text-right">{formatNaira(item.price * item.quantity)}</p>
                    <button onClick={() => removeFromCart(item.productId)} className="p-1 text-destructive/60 hover:text-destructive"><Trash2 className="h-3 w-3" /></button>
                  </div>
                ))
              )}
            </div>

            {cart.length > 0 && (
              <div className="border-t pt-3 space-y-2">
                <div className="flex items-center gap-2"><UserPlus className="h-4 w-4 text-muted-foreground" /><Input placeholder="Customer name (optional)" value={customerName} onChange={(e) => setCustomerName(e.target.value)} className="h-8 text-sm" /></div>
                <div className="flex items-center gap-2"><Tag className="h-4 w-4 text-muted-foreground" />
                  <Select value={discountPercent.toString()} onValueChange={(v) => setDiscountPercent(Number(v))}>
                    <SelectTrigger className="h-8 text-sm"><SelectValue placeholder="Discount" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="0">No Discount</SelectItem><SelectItem value="5">5% Off</SelectItem><SelectItem value="10">10% Off</SelectItem>
                      <SelectItem value="15">15% Off</SelectItem><SelectItem value="20">20% Off</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between"><span className="text-muted-foreground">Subtotal</span><span>{formatNaira(cartSummary.subtotal)}</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Tax (7.5%)</span><span>{formatNaira(cartSummary.taxTotal)}</span></div>
                  {discountPercent > 0 && <div className="flex justify-between text-destructive"><span>Discount ({discountPercent}%)</span><span>-{formatNaira(cartSummary.discountAmount)}</span></div>}
                  <div className="flex justify-between text-lg font-bold border-t pt-2"><span>Total</span><span className="text-primary">{formatNaira(cartSummary.total)}</span></div>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {[{ value: "cash", icon: Banknote, label: "Cash" }, { value: "card", icon: CreditCard, label: "Card" }, { value: "transfer", icon: Smartphone, label: "Transfer" }].map((m) => (
                    <button key={m.value} onClick={() => setPaymentMethod(m.value)} className={`flex flex-col items-center gap-1 p-2 rounded-lg border transition-all ${paymentMethod === m.value ? "border-primary bg-primary/10 text-primary" : "border-border hover:bg-accent"}`}>
                      <m.icon className="h-4 w-4" /><span className="text-xs">{m.label}</span>
                    </button>
                  ))}
                </div>
                <Button className="w-full" size="lg" onClick={() => setShowPaymentDialog(true)} disabled={cart.length === 0}>
                  <Receipt className="h-4 w-4 mr-2" />Pay {formatNaira(cartSummary.total)}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Payment Dialog */}
      <Dialog open={showPaymentDialog} onOpenChange={setShowPaymentDialog}>
        <DialogContent>
          <DialogHeader><DialogTitle>Confirm Payment</DialogTitle></DialogHeader>
          <div className="space-y-4 py-4">
            <div className="text-center"><p className="text-sm text-muted-foreground">Total Amount</p><p className="text-3xl font-bold text-primary">{formatNaira(cartSummary.total)}</p></div>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between py-1 border-b"><span>Items</span><span>{cartSummary.itemCount}</span></div>
              <div className="flex justify-between py-1 border-b"><span>Payment Method</span><span className="capitalize">{paymentMethod}</span></div>
              <div className="flex justify-between py-1 border-b"><span>Subtotal</span><span>{formatNaira(cartSummary.subtotal)}</span></div>
              <div className="flex justify-between py-1 border-b"><span>Tax</span><span>{formatNaira(cartSummary.taxTotal)}</span></div>
              {discountPercent > 0 && <div className="flex justify-between py-1 border-b text-destructive"><span>Discount</span><span>-{formatNaira(cartSummary.discountAmount)}</span></div>}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowPaymentDialog(false)}>Cancel</Button>
            <Button onClick={processPayment} disabled={createSale.isPending}>{createSale.isPending ? "Processing..." : "Confirm Payment"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Receipt Dialog */}
      <Dialog open={showReceipt} onOpenChange={setShowReceipt}>
        <DialogContent className="max-w-sm">
          <DialogHeader><DialogTitle className="text-center flex items-center justify-center gap-2"><Receipt className="h-5 w-5 text-primary" />Payment Successful</DialogTitle></DialogHeader>
          <div className="text-center space-y-4 py-4">
            <div className="w-16 h-16 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto"><Receipt className="h-8 w-8 text-emerald-500" /></div>
            <div><p className="text-2xl font-bold">{formatNaira(cartSummary.total)}</p><p className="text-sm text-muted-foreground">Sale {lastSaleId}</p></div>
            <div className="text-sm space-y-1 text-left bg-accent/50 rounded-lg p-4">
              <div className="flex justify-between"><span className="text-muted-foreground">Items</span><span>{cartSummary.itemCount}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Payment</span><span className="capitalize">{paymentMethod}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Date</span><span>{new Date().toLocaleString()}</span></div>
              {customerName && <div className="flex justify-between"><span className="text-muted-foreground">Customer</span><span>{customerName}</span></div>}
            </div>
            <p className="text-xs text-muted-foreground">Thank you for your business!</p>
          </div>
          <DialogFooter className="flex flex-col gap-2">
            <Button variant="outline" onClick={() => {
              // Print current receipt
              if (cart.length === 0) return alert("No items to print");
              const printWindow = window.open("", "_blank", "width=400,height=600");
              if (!printWindow) return alert("Unable to open print window");
              const itemsHtml = cart.map(i => `<tr><td>${i.name}</td><td style=\"text-align:right\">${i.quantity}</td><td style=\"text-align:right\">${formatNaira(i.price * i.quantity)}</td></tr>`).join("");
              const html = `
                <html>
                  <head>
                    <title>Receipt - ${lastSaleId || ""}</title>
                    <style>
                      body{font-family: Arial, Helvetica, sans-serif; padding:20px}
                      table{width:100%;border-collapse:collapse}
                      td,th{padding:6px;border-bottom:1px solid #ddd}
                      .total{font-weight:700;font-size:1.2em}
                    </style>
                  </head>
                  <body>
                    <h2>Marche POS</h2>
                    <p>Sale: ${lastSaleId || ""}</p>
                    <p>Date: ${new Date().toLocaleString()}</p>
                    <table>
                      <thead><tr><th>Item</th><th style=\"text-align:right\">Qty</th><th style=\"text-align:right\">Amount</th></tr></thead>
                      <tbody>
                        ${itemsHtml}
                      </tbody>
                    </table>
                    <hr />
                    <p>Subtotal: ${formatNaira(cartSummary.subtotal)}</p>
                    <p>Tax: ${formatNaira(cartSummary.taxTotal)}</p>
                    ${discountPercent > 0 ? `<p>Discount: -${formatNaira(cartSummary.discountAmount)}</p>` : ""}
                    <p class=\"total\">Total: ${formatNaira(cartSummary.total)}</p>
                    <p>Payment: ${paymentMethod}</p>
                    ${customerName ? `<p>Customer: ${customerName}</p>` : ""}
                    <p style=\"margin-top:20px\">Thank you for your business!</p>
                    <script>window.print();</script>
                  </body>
                </html>
              `;
              printWindow.document.open();
              printWindow.document.write(html);
              printWindow.document.close();
            }} className="w-full">Print Receipt</Button>
            <Button onClick={() => { setShowReceipt(false); setCustomerName(""); setCart([]); setDiscountPercent(0); setPaymentMethod("cash") }} className="w-full">New Sale</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
