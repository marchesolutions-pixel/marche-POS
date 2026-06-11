import { useState } from "react"
import { trpc } from "@/providers/trpc"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  AlertTriangle,
  Package,
  Warehouse,
  ArrowUpDown,
  TrendingDown,
  TrendingUp,
  RefreshCcw,
  Plus,
  Edit3,
  Search,
} from "lucide-react"

export default function InventoryPage() {
  const [branchId, setBranchId] = useState("")
  const [search, setSearch] = useState("")
  const [showLowStock, setShowLowStock] = useState(false)
  const [view, setView] = useState<"inventory" | "movements">("inventory")
  const [showAdd, setShowAdd] = useState(false)
  const [isAdjustMode, setIsAdjustMode] = useState(false)
  const [newInventory, setNewInventory] = useState({
    productId: "",
    branchId: "",
    quantity: "0",
    reservedQuantity: "0",
    minStockLevel: "0",
    maxStockLevel: "0",
    location: "",
    reason: "Initial stock",
  })

  const { data: branches } = trpc.branches.list.useQuery()
  const { data: products } = trpc.products.list.useQuery({ limit: 100 })
  const { data: inventoryData, isLoading, refetch: refetchInventory } = trpc.inventory.list.useQuery({
    search: search || undefined,
    branchId: branchId ? Number(branchId) : undefined,
    lowStock: showLowStock || undefined,
    limit: 50,
  })
  const { data: movementsData, refetch: refetchMovements } = trpc.inventory.movements.useQuery({
    branchId: branchId ? Number(branchId) : undefined,
    limit: 50,
  })
  const createInventory = trpc.inventory.create.useMutation({
    onSuccess: () => {
      setShowAdd(false)
      setIsAdjustMode(false)
      setNewInventory({
        productId: "",
        branchId: "",
        quantity: "0",
        reservedQuantity: "0",
        minStockLevel: "0",
        maxStockLevel: "0",
        location: "",
        reason: "Initial stock",
      })
      refetchInventory()
      refetchMovements()
    },
  })

  const inventoryItems = inventoryData?.items ?? []
  const movementItems = movementsData?.items ?? []

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Inventory Management</h1>
        <p className="text-muted-foreground">Track stock levels and movements</p>
      </div>

      <div className="flex flex-wrap gap-3 items-center justify-between">
        <div className="flex flex-1 flex-wrap gap-3 items-center">
          <div className="relative max-w-sm flex-1 min-w-[240px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              className="pl-9"
              placeholder="Search inventory..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <Select value={branchId} onValueChange={setBranchId}>
            <SelectTrigger className="w-48">
              <Warehouse className="h-4 w-4 mr-2" />
              <SelectValue placeholder="All Branches" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All Branches</SelectItem>
              {branches?.map((b: any) => (
                <SelectItem key={b.id} value={b.id.toString()}>
                  {b.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex bg-card border rounded-lg overflow-hidden">
          <button
            onClick={() => setView("inventory")}
            className={`px-4 py-2 text-sm font-medium transition-colors ${
              view === "inventory" ? "bg-primary text-primary-foreground" : "hover:bg-accent"
            }`}
          >
            Inventory
          </button>
          <button
            onClick={() => setView("movements")}
            className={`px-4 py-2 text-sm font-medium transition-colors ${
              view === "movements" ? "bg-primary text-primary-foreground" : "hover:bg-accent"
            }`}
          >
            Movements
          </button>
        </div>

        <div className="flex flex-wrap gap-2 items-center">
          <Button size="sm" onClick={() => {
            setIsAdjustMode(false)
            setNewInventory({
              productId: "",
              branchId: "",
              quantity: "0",
              reservedQuantity: "0",
              minStockLevel: "0",
              maxStockLevel: "0",
              location: "",
              reason: "Initial stock",
            })
            setShowAdd(true)
          }}>
            <Plus className="h-4 w-4 mr-2" /> Add Inventory
          </Button>
          <Button variant="outline" size="sm" onClick={() => { refetchInventory(); refetchMovements() }}>
            <RefreshCcw className="h-4 w-4 mr-2" /> Refresh
          </Button>
          <Button variant={showLowStock ? "default" : "outline"} size="sm" onClick={() => setShowLowStock(!showLowStock)}>
            <AlertTriangle className="h-4 w-4 mr-1" />
            Low Stock Only
          </Button>
        </div>
      </div>

      {view === "inventory" ? (
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-muted/50">
                    <th className="text-left p-3 font-medium">Product</th>
                    <th className="text-left p-3 font-medium">Branch</th>
                    <th className="text-right p-3 font-medium">Stock</th>
                    <th className="text-right p-3 font-medium">Reserved</th>
                    <th className="text-left p-3 font-medium">Location</th>
                    <th className="text-left p-3 font-medium">Status</th>
                    <th className="text-right p-3 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {isLoading || !inventoryData ? (
                    <tr>
                      <td colSpan={7} className="p-8 text-center text-muted-foreground">
                        Loading...
                      </td>
                    </tr>
                  ) : inventoryItems.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="p-8 text-center text-muted-foreground">
                        No inventory records
                      </td>
                    </tr>
                  ) : (
                    inventoryItems.map((item: any) => {
                      const isLow = item.quantity <= item.minStockLevel
                      const isHigh = item.quantity >= item.maxStockLevel
                      return (
                        <tr key={item.id} className="border-b hover:bg-accent/50 transition-colors">
                          <td className="p-3">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded bg-muted flex items-center justify-center">
                                <Package className="h-4 w-4 text-muted-foreground" />
                              </div>
                              <div>
                                <p className="font-medium">{item.productName}</p>
                                <p className="text-xs text-muted-foreground">{item.productSku}</p>
                              </div>
                            </div>
                          </td>
                          <td className="p-3">{item.branchName}</td>
                          <td className="p-3 text-right">
                            <span className={`font-semibold ${isLow ? "text-red-500" : isHigh ? "text-emerald-500" : ""}`}>
                              {item.quantity}
                            </span>
                          </td>
                          <td className="p-3 text-right text-muted-foreground">{item.reservedQuantity}</td>
                          <td className="p-3 text-muted-foreground">{item.location || "-"}</td>
                          <td className="p-3">
                            {isLow ? (
                              <Badge variant="destructive" className="text-xs">
                                <AlertTriangle className="h-3 w-3 mr-1" /> Low
                              </Badge>
                            ) : isHigh ? (
                              <Badge variant="default" className="text-xs bg-emerald-500">
                                Optimal
                              </Badge>
                            ) : (
                              <Badge variant="secondary" className="text-xs">Normal</Badge>
                            )}
                          </td>
                          <td className="p-3 text-right">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                setIsAdjustMode(true)
                                setNewInventory({
                                  productId: item.productId.toString(),
                                  branchId: item.branchId.toString(),
                                  quantity: "0",
                                  reservedQuantity: item.reservedQuantity.toString(),
                                  minStockLevel: item.minStockLevel.toString(),
                                  maxStockLevel: item.maxStockLevel.toString(),
                                  location: item.location || "",
                                  reason: "Adjustment",
                                })
                                setShowAdd(true)
                              }}
                            >
                              <Edit3 className="h-4 w-4 mr-2" /> Adjust
                            </Button>
                          </td>
                        </tr>
                      )
                    })
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-muted/50">
                    <th className="text-left p-3 font-medium">Date</th>
                    <th className="text-left p-3 font-medium">Product</th>
                    <th className="text-left p-3 font-medium">Type</th>
                    <th className="text-right p-3 font-medium">Qty</th>
                    <th className="text-right p-3 font-medium">Prev / New</th>
                    <th className="text-left p-3 font-medium">Reason</th>
                  </tr>
                </thead>
                <tbody>
                  {movementsData?.items.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="p-8 text-center text-muted-foreground">
                        No movements found
                      </td>
                    </tr>
                  ) : (
                    movementItems.map((m: any) => (
                      <tr key={m.id} className="border-b hover:bg-accent/50 transition-colors">
                        <td className="p-3 text-muted-foreground">{new Date(m.createdAt).toLocaleDateString()}</td>
                        <td className="p-3">
                          <p className="font-medium">{m.productName}</p>
                          <p className="text-xs text-muted-foreground">{m.productSku}</p>
                        </td>
                        <td className="p-3">
                          <Badge
                            variant="outline"
                            className={`text-xs capitalize ${
                              m.type === "in"
                                ? "text-emerald-500 border-emerald-500/30"
                                : m.type === "out"
                                ? "text-red-500 border-red-500/30"
                                : "text-amber-500 border-amber-500/30"
                            }`}
                          >
                            {m.type === "in" ? (
                              <TrendingUp className="h-3 w-3 mr-1" />
                            ) : m.type === "out" ? (
                              <TrendingDown className="h-3 w-3 mr-1" />
                            ) : (
                              <ArrowUpDown className="h-3 w-3 mr-1" />
                            )}
                            {m.type}
                          </Badge>
                        </td>
                        <td className="p-3 text-right font-semibold">
                          {m.quantity > 0 ? `+${m.quantity}` : m.quantity}
                        </td>
                        <td className="p-3 text-right text-muted-foreground">
                          {m.previousStock} / {m.newStock}
                        </td>
                        <td className="p-3 text-muted-foreground">{m.reason || "-"}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      <Dialog open={showAdd} onOpenChange={setShowAdd}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{isAdjustMode ? "Adjust Inventory" : "Add Inventory Item"}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Product</Label>
                <Select
                  value={newInventory.productId}
                  onValueChange={(value) => setNewInventory({ ...newInventory, productId: value })}
                  disabled={isAdjustMode}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select product" />
                  </SelectTrigger>
                  <SelectContent>
                    {products?.items.map((product: any) => (
                      <SelectItem key={product.id} value={product.id.toString()}>
                        {product.name} ({product.sku})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Branch</Label>
                <Select
                  value={newInventory.branchId}
                  onValueChange={(value) => setNewInventory({ ...newInventory, branchId: value })}
                  disabled={isAdjustMode}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select branch" />
                  </SelectTrigger>
                  <SelectContent>
                    {branches?.map((branch: any) => (
                      <SelectItem key={branch.id} value={branch.id.toString()}>
                        {branch.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Quantity</Label>
                <Input
                  type="number"
                  value={newInventory.quantity}
                  onChange={(e) => setNewInventory({ ...newInventory, quantity: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Reserved</Label>
                <Input
                  type="number"
                  value={newInventory.reservedQuantity}
                  onChange={(e) => setNewInventory({ ...newInventory, reservedQuantity: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Min Stock</Label>
                <Input
                  type="number"
                  value={newInventory.minStockLevel}
                  onChange={(e) => setNewInventory({ ...newInventory, minStockLevel: e.target.value })}
                />
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Max Stock</Label>
                <Input
                  type="number"
                  value={newInventory.maxStockLevel}
                  onChange={(e) => setNewInventory({ ...newInventory, maxStockLevel: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Location</Label>
                <Input
                  value={newInventory.location}
                  onChange={(e) => setNewInventory({ ...newInventory, location: e.target.value })}
                  placeholder="Aisle 1 Shelf B"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Reason</Label>
              <Input
                value={newInventory.reason}
                onChange={(e) => setNewInventory({ ...newInventory, reason: e.target.value })}
                placeholder="Initial stock"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setShowAdd(false)
              setIsAdjustMode(false)
            }}>Cancel</Button>
            <Button
              onClick={() => createInventory.mutate({
                productId: Number(newInventory.productId),
                branchId: Number(newInventory.branchId),
                quantity: Number(newInventory.quantity),
                reservedQuantity: Number(newInventory.reservedQuantity),
                minStockLevel: Number(newInventory.minStockLevel),
                maxStockLevel: Number(newInventory.maxStockLevel),
                location: newInventory.location,
                reason: newInventory.reason,
              })}
              disabled={createInventory.isPending || !newInventory.productId || !newInventory.branchId}
            >
              {createInventory.isPending ? "Saving..." : isAdjustMode ? "Save Adjustment" : "Create Inventory"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
