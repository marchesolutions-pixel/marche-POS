import { useState, useRef } from "react";
import { trpc } from "@/providers/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import * as XLSX from "xlsx";
import {
  Search,
  Plus,
  Package,
  Barcode,
  ArrowLeft,
  ArrowRight,
  Edit,
  Trash2,
  RefreshCcw,
} from "lucide-react";

function formatNaira(amount: number) {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    minimumFractionDigits: 0,
  }).format(amount);
}

export default function Products() {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [showAdd, setShowAdd] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any>(null);
  const [form, setForm] = useState({
    sku: "",
    name: "",
    sellingPrice: "",
    costPrice: "",
    categoryId: "",
    taxRate: "7.5",
    branchId: "",
  });

  const { data, isLoading, refetch } = trpc.products.list.useQuery({
    search: search || undefined,
    categoryId: selectedCategory ? Number(selectedCategory) : undefined,
    page,
    limit: 20,
  });
  const { data: categories } = trpc.products.categories.useQuery();
  const { data: branches } = trpc.branches.list.useQuery();
  const utils = trpc.useUtils();

  const createProduct = trpc.products.create.useMutation({
    onSuccess: () => {
      setShowAdd(false);
      resetForm();
      refetch();
      utils.dashboard.kpi.invalidate();
    },
  });
  const updateProduct = trpc.products.update.useMutation({
    onSuccess: () => {
      setEditingProduct(null);
      resetForm();
      refetch();
      utils.dashboard.kpi.invalidate();
    },
  });
  const deleteProduct = trpc.products.delete.useMutation({
    onSuccess: () => {
      refetch();
      utils.dashboard.kpi.invalidate();
    },
  });

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [uploadingProducts, setUploadingProducts] = useState(false);
  const [uploadErrors, setUploadErrors] = useState<string[]>([]);

  const bulkCreateProducts = trpc.products.bulkCreate.useMutation({
    onSuccess: () => {
      refetch();
      utils.dashboard.kpi.invalidate();
      setUploadingProducts(false);
      setUploadErrors([]);
      if (fileInputRef.current) fileInputRef.current.value = "";
      alert("Products imported successfully.");
    },
    onError: error => {
      setUploadingProducts(false);
      setUploadErrors([error.message || "Failed to import products."]);
    },
  });

  const templateHeaders = [
    "SKU",
    "Name",
    "SellingPrice",
    "CostPrice",
    "CategoryName",
    "TaxRate",
    "BrandName",
    "BranchName",
    "IsActive",
  ];

  const downloadTemplate = () => {
    const worksheetData = [
      templateHeaders,
      [
        "PROD-100",
        "Example Product",
        "15000",
        "12000",
        "Electronics",
        "7.5",
        "Marche",
        "Main Branch",
        "true",
      ],
    ];
    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);
    XLSX.utils.book_append_sheet(workbook, worksheet, "Products");
    XLSX.writeFile(workbook, "product-import-template.xlsx");
  };

  const parseCsv = (csvText: string) => {
    const rows = csvText
      .split(/\r?\n/)
      .map(line => line.trim())
      .filter(line => line.length > 0);
    if (!rows.length) return [];

    const headers = rows[0]
      .split(",")
      .map(header => header.trim().toLowerCase());

    return rows.slice(1).map(row => {
      const cells = row.match(/("([^"]|"")*"|[^,]+)/g) || [];
      const values = cells.map(cell => {
        const trimmed = cell.trim();
        if (trimmed.startsWith('"') && trimmed.endsWith('"')) {
          return trimmed.slice(1, -1).replace(/""/g, '"');
        }
        return trimmed;
      });
      return headers.reduce<Record<string, string>>((acc, header, index) => {
        acc[header] = values[index]?.trim() ?? "";
        return acc;
      }, {});
    });
  };

  const parseXlsx = async (file: File) => {
    const data = await file.arrayBuffer();
    const workbook = XLSX.read(data, { type: "array" });
    const sheetName = workbook.SheetNames[0];
    if (!sheetName) return [];
    const worksheet = workbook.Sheets[sheetName];
    const csv = XLSX.utils.sheet_to_csv(worksheet);
    return parseCsv(csv);
  };

  const handleProductUpload = async (file: File) => {
    setUploadingProducts(true);
    setUploadErrors([]);

    try {
      const extension = file.name.split(".").pop()?.toLowerCase();
      const rows =
        extension === "xlsx" || extension === "xls"
          ? await parseXlsx(file)
          : parseCsv(await file.text());

      if (!rows.length) {
        setUploadErrors([
          "The uploaded file is empty or not a valid CSV/XLSX.",
        ]);
        setUploadingProducts(false);
        return;
      }

      const categoryMap = new Map(
        (categories || []).map(category => [
          category.name.toLowerCase(),
          category,
        ])
      );
      const branchMap = new Map(
        (branches || []).map(branch => [branch.name.toLowerCase(), branch])
      );

      const productsToCreate = rows.map((row, rowIndex) => {
        const categoryName = row["categoryname"]?.trim() || "";
        const branchName = row["branchname"]?.trim() || "";
        const categoryIdFromName = categoryMap.get(
          categoryName.toLowerCase()
        )?.id;
        const categoryIdFromId = Number(row["categoryid"]?.trim() || "");
        const branchIdFromName = branchMap.get(branchName.toLowerCase())?.id;
        const branchIdFromId = Number(row["branchid"]?.trim() || "");

        return {
          sku: row["sku"]?.trim() || "",
          name: row["name"]?.trim() || "",
          sellingPrice: row["sellingprice"]?.trim() || "",
          costPrice: row["costprice"]?.trim() || "0",
          categoryId:
            categoryIdFromName ||
            (Number.isFinite(categoryIdFromId) && categoryIdFromId > 0
              ? categoryIdFromId
              : 0),
          taxRate: row["taxrate"]?.trim() || "0",
          brandName: row["brandname"]?.trim() || "Generic",
          image: "",
          isActive:
            row["isactive"] === undefined ||
            row["isactive"].trim() === "" ||
            !["false", "0", "no", "n"].includes(
              row["isactive"]?.trim().toLowerCase() || ""
            ),
          branchId:
            branchIdFromName ||
            (Number.isFinite(branchIdFromId) && branchIdFromId > 0
              ? branchIdFromId
              : undefined),
          _row: rowIndex + 2,
        } as any;
      });

      const errors = productsToCreate.flatMap(product => {
        const rowErrors: string[] = [];
        if (!product.sku)
          rowErrors.push(`Row ${product._row}: SKU is required.`);
        if (!product.name)
          rowErrors.push(`Row ${product._row}: Name is required.`);
        if (!product.sellingPrice) {
          rowErrors.push(`Row ${product._row}: SellingPrice is required.`);
        } else if (Number.isNaN(Number(product.sellingPrice))) {
          rowErrors.push(`Row ${product._row}: SellingPrice must be a number.`);
        }
        if (!product.categoryId) {
          rowErrors.push(
            `Row ${product._row}: CategoryName or CategoryId is required and must match an existing category.`
          );
        }
        return rowErrors;
      });

      if (errors.length) {
        setUploadErrors(errors);
        setUploadingProducts(false);
        return;
      }

      bulkCreateProducts.mutate({
        products: productsToCreate.map(product => ({
          sku: product.sku,
          name: product.name,
          sellingPrice: product.sellingPrice,
          costPrice: product.costPrice,
          categoryId: product.categoryId,
          taxRate: product.taxRate,
          brandName: product.brandName,
          image: product.image,
          isActive: product.isActive,
          branchId: product.branchId,
        })),
      });
    } catch (error) {
      setUploadErrors([
        "Unable to read the uploaded file. Please upload a valid CSV.",
      ]);
      setUploadingProducts(false);
    }
  };

  const resetForm = () =>
    setForm({
      sku: "",
      name: "",
      sellingPrice: "",
      costPrice: "",
      categoryId: "",
      taxRate: "7.5",
      branchId: "",
    });

  const handleSubmit = () => {
    if (!form.sku || !form.name || !form.sellingPrice || !form.categoryId)
      return;
    const payload = {
      sku: form.sku,
      name: form.name,
      sellingPrice: form.sellingPrice,
      costPrice: form.costPrice || "0",
      categoryId: Number(form.categoryId),
      taxRate: form.taxRate,
      branchId: form.branchId ? Number(form.branchId) : undefined,
    };
    if (editingProduct) {
      updateProduct.mutate({ id: editingProduct.id, ...payload });
    } else {
      createProduct.mutate(payload);
    }
  };

  const openEdit = (product: any) => {
    setEditingProduct(product);
    setForm({
      sku: product.sku,
      name: product.name,
      sellingPrice: product.sellingPrice,
      costPrice: product.costPrice,
      categoryId: product.categoryId?.toString() || "",
      taxRate: product.taxRate,
      branchId: product.branchId?.toString() || "",
    });
    setShowAdd(true);
  };

  const handleDelete = (id: number) => {
    if (confirm("Delete this product? This action cannot be undone."))
      deleteProduct.mutate({ id });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Products</h1>
          <p className="text-muted-foreground">Manage your product catalog</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm" onClick={() => refetch()}>
            <RefreshCcw className="h-4 w-4 mr-2" /> Refresh
          </Button>
          <Button variant="outline" size="sm" onClick={downloadTemplate}>
            <Package className="h-4 w-4 mr-2" /> Download Excel Template
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploadingProducts}
          >
            <ArrowRight className="h-4 w-4 mr-2" /> Upload CSV / Excel
          </Button>
          <Button
            onClick={() => {
              resetForm();
              setEditingProduct(null);
              setShowAdd(true);
            }}
          >
            <Plus className="h-4 w-4 mr-2" /> Add Product
          </Button>
        </div>
      </div>
      <input
        type="file"
        accept=".csv,.xls,.xlsx"
        ref={fileInputRef}
        className="hidden"
        onChange={e => {
          const file = e.target.files?.[0];
          if (file) handleProductUpload(file);
        }}
      />
      {uploadErrors.length > 0 && (
        <Card className="bg-destructive/10 border-destructive text-destructive">
          <CardContent className="space-y-2">
            <p className="font-medium">Upload Errors</p>
            <ul className="list-disc pl-5 text-sm">
              {uploadErrors.map((error, index) => (
                <li key={index}>{error}</li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      <div className="flex gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search products..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="All Categories" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">All Categories</SelectItem>
            {categories?.map(c => (
              <SelectItem key={c.id} value={c.id.toString()}>
                {c.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="text-left p-3 font-medium">Product</th>
                  <th className="text-left p-3 font-medium">SKU</th>
                  <th className="text-left p-3 font-medium">Category</th>
                  <th className="text-right p-3 font-medium">Cost</th>
                  <th className="text-right p-3 font-medium">Price</th>
                  <th className="text-center p-3 font-medium">Status</th>
                  <th className="text-right p-3 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr>
                    <td
                      colSpan={7}
                      className="p-8 text-center text-muted-foreground"
                    >
                      Loading...
                    </td>
                  </tr>
                ) : data?.items.length === 0 ? (
                  <tr>
                    <td
                      colSpan={7}
                      className="p-8 text-center text-muted-foreground"
                    >
                      No products found
                    </td>
                  </tr>
                ) : (
                  data?.items.map((product: any) => (
                    <tr
                      key={product.id}
                      className="border-b hover:bg-accent/50 transition-colors"
                    >
                      <td className="p-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center overflow-hidden">
                            {product.image ? (
                              <img
                                src={product.image}
                                alt=""
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <Package className="h-5 w-5 text-muted-foreground" />
                            )}
                          </div>
                          <div>
                            <p className="font-medium">{product.name}</p>
                            <p className="text-xs text-muted-foreground">
                              {product.brandName}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="p-3">
                        <div className="flex items-center gap-1 text-muted-foreground">
                          <Barcode className="h-3 w-3" />
                          <span>{product.sku}</span>
                        </div>
                      </td>
                      <td className="p-3">
                        <Badge
                          variant="secondary"
                          style={{
                            backgroundColor: product.categoryColor + "20",
                            color: product.categoryColor,
                          }}
                        >
                          {product.categoryName}
                        </Badge>
                      </td>
                      <td className="p-3 text-right">
                        {formatNaira(Number(product.costPrice))}
                      </td>
                      <td className="p-3 text-right font-semibold">
                        {formatNaira(Number(product.sellingPrice))}
                      </td>
                      <td className="p-3 text-center">
                        <Badge
                          variant={product.isActive ? "default" : "secondary"}
                          className="text-xs"
                        >
                          {product.isActive ? "Active" : "Inactive"}
                        </Badge>
                      </td>
                      <td className="p-3 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0"
                            onClick={() => openEdit(product)}
                          >
                            <Edit className="h-3.5 w-3.5" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0 text-destructive"
                            onClick={() => handleDelete(product.id)}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
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
            Showing {(page - 1) * 20 + 1} to {Math.min(page * 20, data.total)}{" "}
            of {data.total}
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(p => Math.min(data.totalPages, p + 1))}
              disabled={page === data.totalPages}
            >
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      <Dialog
        open={showAdd}
        onOpenChange={open => {
          if (!open) {
            setShowAdd(false);
            setEditingProduct(null);
          }
        }}
      >
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {editingProduct ? "Edit Product" : "Add New Product"}
            </DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>SKU *</Label>
                <Input
                  value={form.sku}
                  onChange={e => setForm({ ...form, sku: e.target.value })}
                  placeholder="PROD-001"
                />
              </div>
              <div className="space-y-2">
                <Label>Tax Rate (%)</Label>
                <Input
                  value={form.taxRate}
                  onChange={e => setForm({ ...form, taxRate: e.target.value })}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Product Name *</Label>
              <Input
                value={form.name}
                onChange={e => setForm({ ...form, name: e.target.value })}
                placeholder="Product name"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Cost Price</Label>
                <Input
                  type="number"
                  value={form.costPrice}
                  onChange={e =>
                    setForm({ ...form, costPrice: e.target.value })
                  }
                  placeholder="0.00"
                />
              </div>
              <div className="space-y-2">
                <Label>Selling Price *</Label>
                <Input
                  type="number"
                  value={form.sellingPrice}
                  onChange={e =>
                    setForm({ ...form, sellingPrice: e.target.value })
                  }
                  placeholder="0.00"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Category *</Label>
              <Select
                value={form.categoryId}
                onValueChange={v => setForm({ ...form, categoryId: v })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {categories?.map(c => (
                    <SelectItem key={c.id} value={c.id.toString()}>
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Default Branch</Label>
              <Select
                value={form.branchId}
                onValueChange={v => setForm({ ...form, branchId: v })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select branch (optional)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">None</SelectItem>
                  {branches?.map(b => (
                    <SelectItem key={b.id} value={b.id.toString()}>
                      {b.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowAdd(false);
                setEditingProduct(null);
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={createProduct.isPending || updateProduct.isPending}
            >
              {createProduct.isPending || updateProduct.isPending
                ? "Saving..."
                : editingProduct
                  ? "Update"
                  : "Create"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
