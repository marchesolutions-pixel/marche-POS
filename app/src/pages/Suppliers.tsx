import { useState } from "react"
import { trpc } from "@/providers/trpc"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import {
  Search,
  Plus,
  Truck,
  Mail,
  Phone,
  MapPin,
  Building,
  Star,
  ArrowLeft,
  ArrowRight,
  RefreshCcw,
} from "lucide-react"

export default function Suppliers() {
  const [search, setSearch] = useState("")
  const [page, setPage] = useState(1)
  const [showAdd, setShowAdd] = useState(false)
  const [selectedSupplier, setSelectedSupplier] = useState<any>(null)
  const [form, setForm] = useState({ name: "", code: "", contactPerson: "", email: "", phone: "", address: "", city: "", rating: "4" })

  const { data, isLoading, refetch } = trpc.suppliers.list.useQuery({ search: search || undefined, page, limit: 20 })
  const createSupplier = trpc.suppliers.create.useMutation({
    onSuccess: () => { setShowAdd(false); setForm({ name: "", code: "", contactPerson: "", email: "", phone: "", address: "", city: "", rating: "4" }); refetch() },
  })
  // const updateSupplier = trpc.suppliers.update.useMutation({ onSuccess: () => { setSelectedSupplier(null); refetch() } })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Suppliers</h1>
          <p className="text-muted-foreground">Manage vendor relationships and procurement</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm" onClick={() => refetch()}>
            <RefreshCcw className="h-4 w-4 mr-2" /> Refresh
          </Button>
          <Button onClick={() => setShowAdd(true)}><Plus className="h-4 w-4 mr-2" /> Add Supplier</Button>
        </div>
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input placeholder="Search suppliers..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {isLoading ? (
          <div className="col-span-full text-center p-8 text-muted-foreground">Loading...</div>
        ) : data?.items.length === 0 ? (
          <div className="col-span-full text-center p-8 text-muted-foreground">No suppliers found</div>
        ) : (
          data?.items.map((supplier: any) => (
            <Card key={supplier.id} className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => setSelectedSupplier(supplier)}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <Truck className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium">{supplier.name}</p>
                      <p className="text-xs text-muted-foreground">{supplier.code}</p>
                    </div>
                  </div>
                  <Badge variant={supplier.isActive ? "default" : "secondary"} className="text-xs">{supplier.isActive ? "Active" : "Inactive"}</Badge>
                </div>
                <div className="mt-3 space-y-1 text-sm text-muted-foreground">
                  {supplier.contactPerson && <div className="flex items-center gap-2"><Building className="h-3 w-3" /><span>{supplier.contactPerson}</span></div>}
                  {supplier.phone && <div className="flex items-center gap-2"><Phone className="h-3 w-3" /><span>{supplier.phone}</span></div>}
                  {supplier.email && <div className="flex items-center gap-2"><Mail className="h-3 w-3" /><span className="truncate">{supplier.email}</span></div>}
                  {supplier.city && <div className="flex items-center gap-2"><MapPin className="h-3 w-3" /><span>{supplier.city}</span></div>}
                </div>
                <div className="mt-3 flex items-center gap-1">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} className={`h-3 w-3 ${i < Math.round(Number(supplier.rating || 0)) ? "text-amber-500 fill-amber-500" : "text-muted"}`} />
                  ))}
                  <span className="text-xs text-muted-foreground ml-1">{supplier.rating || 0}/5</span>
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

      {/* Add Supplier Dialog */}
      <Dialog open={showAdd} onOpenChange={setShowAdd}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>Add New Supplier</DialogTitle></DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><Label>Supplier Code *</Label><Input value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} placeholder="SUP-001" /></div>
              <div className="space-y-2"><Label>Rating</Label>
                <Select value={form.rating} onValueChange={(v) => setForm({ ...form, rating: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {[1,2,3,4,5].map(n => <SelectItem key={n} value={n.toString()}>{n} Stars</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2"><Label>Name *</Label><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Company name" /></div>
            <div className="space-y-2"><Label>Contact Person</Label><Input value={form.contactPerson} onChange={(e) => setForm({ ...form, contactPerson: e.target.value })} /></div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><Label>Email</Label><Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></div>
              <div className="space-y-2"><Label>Phone</Label><Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} /></div>
            </div>
            <div className="space-y-2"><Label>Address</Label><Textarea value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} rows={2} /></div>
            <div className="space-y-2"><Label>City</Label><Input value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAdd(false)}>Cancel</Button>
            <Button onClick={() => createSupplier.mutate(form)} disabled={createSupplier.isPending}>
              {createSupplier.isPending ? "Creating..." : "Create Supplier"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Supplier Detail */}
      <Dialog open={!!selectedSupplier} onOpenChange={() => setSelectedSupplier(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Supplier Details</DialogTitle></DialogHeader>
          {selectedSupplier && (
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                  <Truck className="h-8 w-8 text-primary" />
                </div>
                <div>
                  <p className="text-xl font-bold">{selectedSupplier.name}</p>
                  <p className="text-sm text-muted-foreground">{selectedSupplier.code}</p>
                  <div className="flex gap-1 mt-1">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star key={i} className={`h-3 w-3 ${i < Math.round(Number(selectedSupplier.rating || 0)) ? "text-amber-500 fill-amber-500" : "text-muted"}`} />
                    ))}
                  </div>
                </div>
              </div>
              <div className="space-y-2 text-sm">
                {selectedSupplier.contactPerson && <div className="flex items-center gap-2"><Building className="h-4 w-4 text-muted-foreground" /><span>{selectedSupplier.contactPerson}</span></div>}
                {selectedSupplier.email && <div className="flex items-center gap-2"><Mail className="h-4 w-4 text-muted-foreground" /><span>{selectedSupplier.email}</span></div>}
                {selectedSupplier.phone && <div className="flex items-center gap-2"><Phone className="h-4 w-4 text-muted-foreground" /><span>{selectedSupplier.phone}</span></div>}
                {selectedSupplier.address && <div className="flex items-center gap-2"><MapPin className="h-4 w-4 text-muted-foreground" /><span>{selectedSupplier.address}</span></div>}
                {selectedSupplier.city && <div className="flex items-center gap-2"><MapPin className="h-4 w-4 text-muted-foreground" /><span>{selectedSupplier.city}{selectedSupplier.state ? `, ${selectedSupplier.state}` : ""}</span></div>}
              </div>
              <div className="flex items-center gap-2 pt-2 border-t">
                <Badge variant={selectedSupplier.isActive ? "default" : "secondary"}>{selectedSupplier.isActive ? "Active" : "Inactive"}</Badge>
                {selectedSupplier.taxId && <Badge variant="outline">Tax: {selectedSupplier.taxId}</Badge>}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
