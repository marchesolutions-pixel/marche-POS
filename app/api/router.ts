import { initTRPC } from "@trpc/server";
import superjson from "superjson";
import { z } from "zod";
import * as fs from "fs";
import * as path from "path";
import { createHash } from "crypto";

const t = initTRPC.create({
  transformer: superjson,
});

const dataDir = process.env.DATA_DIR
  ? path.resolve(process.env.DATA_DIR)
  : path.join(process.cwd(), "data");
function ensureDir() {
  if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });
}
function hashPassword(password: string) {
  return createHash("sha256").update(password).digest("hex");
}
function sanitizeUser(user: any) {
  const { passwordHash, ...safe } = user;
  return safe;
}
function loadJson(name: string, fallback: any) {
  ensureDir();
  try {
    const p = path.join(dataDir, name);
    if (!fs.existsSync(p)) {
      fs.writeFileSync(p, JSON.stringify(fallback, null, 2));
      return fallback;
    }
    return JSON.parse(fs.readFileSync(p, "utf-8"));
  } catch (e) {
    return fallback;
  }
}
function saveJson(name: string, data: any) {
  ensureDir();
  fs.writeFileSync(path.join(dataDir, name), JSON.stringify(data, null, 2));
}

type Branch = {
  id: number
  name: string
  address: string
  phone: string
}

type Category = {
  id: number
  name: string
  color: string
}

type Product = {
  id: number
  sku: string
  name: string
  brandName: string
  categoryId: number
  categoryName: string
  categoryColor: string
  image: string
  costPrice: string
  sellingPrice: string
  taxRate: string
  isActive: boolean
  branchId?: number
}

type Customer = {
  id: number
  customerCode: string
  firstName: string
  lastName: string
  email: string
  phone: string
  city: string
  customerGroup: "retail" | "wholesale" | "vip" | "corporate"
  loyaltyPoints: number
  outstandingBalance: string
  address: string
  createdAt: string
  salesCount: number
  totalSpent: string
}

type Employee = {
  id: number
  employeeCode: string
  firstName: string
  lastName: string
  department: string
  designation: string
  branchName: string
  status: string
  basicSalary: string
  employmentType: string
  dateOfJoining: string
  email: string
  phone: string
  payrollHistory: Array<{ id: string; payPeriod: string; netSalary: string }>
  branchId?: number
}

type User = {
  id: number
  name: string
  email: string
  role: "admin" | "employee"
  privileges: string[]
  passwordHash: string
  isActive?: boolean
  branchId?: number | null
}

type Role = {
  name: string
  privileges: string[]
}

type Supplier = {
  id: number
  name: string
  code: string
  contactPerson: string
  email: string
  phone: string
  address: string
  city: string
  rating: string
  isActive: boolean
  taxId: string
}

let branches: Branch[] = loadJson("branches.json", [
  {
    id: 1,
    name: "Main Branch",
    address: "125 Market St, Lagos",
    phone: "+234 901 234 5678",
  },
  {
    id: 2,
    name: "Victoria Island",
    address: "22 Ocean Drive, Lagos",
    phone: "+234 901 234 5679",
  },
]);

const categories: Category[] = [
  { id: 1, name: "Electronics", color: "#6366f1" },
  { id: 2, name: "Office Supplies", color: "#22c55e" },
  { id: 3, name: "Furniture", color: "#f59e0b" },
  { id: 4, name: "Food & Beverages", color: "#ef4444" },
];

const products: Product[] = [];

const customers: Customer[] = [];

let employees: Employee[] = loadJson("employees.json", [
  {
    id: 1,
    employeeCode: "EMP-001",
    firstName: "Amaka",
    lastName: "Okafor",
    department: "Operations",
    designation: "Store Manager",
    branchName: "Main Branch",
    status: "active",
    basicSalary: "180000",
    employmentType: "full_time",
    dateOfJoining: "2022-03-14",
    email: "amaka.okafor@example.com",
    phone: "+234 801 000 0101",
    payrollHistory: [
      { id: "pay_001", payPeriod: "Apr 2024", netSalary: "168000" },
      { id: "pay_002", payPeriod: "May 2024", netSalary: "170000" },
    ],
  },
  {
    id: 2,
    employeeCode: "EMP-002",
    firstName: "Tunde",
    lastName: "Adebayo",
    department: "Sales",
    designation: "Sales Lead",
    branchName: "Victoria Island",
    status: "active",
    basicSalary: "145000",
    employmentType: "full_time",
    dateOfJoining: "2022-07-25",
    email: "tunde.adebayo@example.com",
    phone: "+234 801 000 0102",
    payrollHistory: [
      { id: "pay_003", payPeriod: "May 2024", netSalary: "136000" },
    ],
  },
  {
    id: 3,
    employeeCode: "EMP-003",
    firstName: "Ngozi",
    lastName: "Chukwu",
    department: "Finance",
    designation: "Accountant",
    branchName: "Main Branch",
    status: "active",
    basicSalary: "150000",
    employmentType: "full_time",
    dateOfJoining: "2023-01-18",
    email: "ngozi.chukwu@example.com",
    phone: "+234 801 000 0103",
    payrollHistory: [
      { id: "pay_004", payPeriod: "May 2024", netSalary: "140000" },
    ],
  },
]);

let users: User[] = loadJson("users.json", [
  {
    id: 1,
    name: "Admin",
    email: "admin@example.com",
    role: "admin",
    privileges: ["products", "categories", "sales", "settings"],
    passwordHash: hashPassword("Admin123!"),
  },
]);
let roles: Role[] = loadJson("roles.json", [
  {
    name: "admin",
    privileges: ["products", "categories", "sales", "settings", "inventory"],
  },
  { name: "employee", privileges: ["products", "sales"] },
]);

const systemSettings = {
  receiptAuto: true,
  lowStockAlerts: true,
  emailReports: false,
  emailAlerts: true,
  smsAlerts: false,
  smsNumber: "",
  soundEnabled: true,
  defaultTaxRate: "7.5",
  currency: "NGN",
  multiBranchEnabled: true,
  paymentMethods: {
    cash: true,
    card: true,
    bankTransfer: true,
    mobileMoney: true,
    posTerminal: false,
  },
};

const suppliers: Supplier[] = [];

const expenseCategories = [
  { id: 1, name: "Rent", color: "#f97316" },
  { id: 2, name: "Utilities", color: "#0ea5e9" },
  { id: 3, name: "Payroll", color: "#22c55e" },
  { id: 4, name: "Marketing", color: "#8b5cf6" },
];

const expenses = [];

const inventory = [];

const inventoryMovements = [];

const sales = [];

const nextIds = {
  product: products.length + 1,
  customer: customers.length + 1,
  supplier: suppliers.length + 1,
  sale: sales.length + 1,
  expense: expenses.length + 1,
  inventory: inventory.length + 1,
  inventoryMovement: inventoryMovements.length + 1,
  branch: branches.length ? Math.max(...branches.map((b: Branch) => b.id)) + 1 : 1,
};

const paginate = <T extends unknown>(items: T[], page = 1, limit = 20) => {
  const total = items.length;
  const totalPages = Math.max(1, Math.ceil(total / limit));
  const offset = (page - 1) * limit;
  return {
    items: items.slice(offset, offset + limit),
    total,
    totalPages,
  };
};

const groupByMonth = (date: Date) =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;

const buildKpi = () => {
  const now = new Date();
  const totalSales = sales.reduce(
    (sum, sale) => sum + Number(sale.totalAmount),
    0
  );
  const dailySalesMap = new Map<string, number>();
  for (let i = 13; i >= 0; i -= 1) {
    const day = new Date(now);
    day.setDate(now.getDate() - i);
    dailySalesMap.set(day.toISOString().slice(0, 10), 0);
  }

  const monthAggregation = new Map<string, number>();
  for (const sale of sales) {
    const saleDate = new Date(sale.createdAt);
    const dayKey = saleDate.toISOString().slice(0, 10);
    dailySalesMap.set(
      dayKey,
      (dailySalesMap.get(dayKey) ?? 0) + Number(sale.totalAmount)
    );

    const monthKey = groupByMonth(saleDate);
    monthAggregation.set(
      monthKey,
      (monthAggregation.get(monthKey) ?? 0) + Number(sale.totalAmount)
    );
  }

  const dailySales = Array.from(dailySalesMap.entries()).map(
    ([date, total]) => ({ date, total })
  );
  const monthLabels = Array.from({ length: 6 }).map((_, index) => {
    const month = new Date(now.getFullYear(), now.getMonth() - (5 - index), 1);
    return groupByMonth(month);
  });
  const monthlySales = monthLabels.map(monthKey => ({
    month: monthKey,
    total: monthAggregation.get(monthKey) ?? 0,
  }));

  const weekSales = sales
    .filter(sale => {
      const saleDate = new Date(sale.createdAt);
      return now.getTime() - saleDate.getTime() <= 7 * 24 * 60 * 60 * 1000;
    })
    .reduce((sum, sale) => sum + Number(sale.totalAmount), 0);

  const monthSales = sales
    .filter(sale => {
      const saleDate = new Date(sale.createdAt);
      return now.getTime() - saleDate.getTime() <= 30 * 24 * 60 * 60 * 1000;
    })
    .reduce((sum, sale) => sum + Number(sale.totalAmount), 0);

  const topProducts = Object.values(
    products.reduce(
      (acc, product) => {
        acc[product.name] = {
          name: product.name,
          totalQuantity: 0,
          totalRevenue: 0,
        };
        return acc;
      },
      {} as Record<
        string,
        { name: string; totalQuantity: number; totalRevenue: number }
      >
    )
  );

  for (const sale of sales) {
    for (const item of sale.items) {
      const entry = topProducts.find(
        itemEntry => itemEntry.name === item.productName
      );
      if (entry) {
        entry.totalQuantity += Number(item.quantity);
        entry.totalRevenue += Number(item.totalAmount);
      }
    }
  }

  const sortedTopProducts = topProducts
    .sort((a, b) => b.totalQuantity - a.totalQuantity)
    .slice(0, 5);

  const lowStockCount = inventory.filter(
    item => item.quantity <= item.minStockLevel
  ).length;
  const inventoryValue = inventory.reduce((sum, item) => {
    const product = products.find(product => product.id === item.productId);
    return sum + (product ? Number(product.costPrice) * item.quantity : 0);
  }, 0);

  return {
    todaySales: sales
      .filter(
        sale => new Date(sale.createdAt).toDateString() === now.toDateString()
      )
      .reduce((sum, sale) => sum + Number(sale.totalAmount), 0),
    weekSales,
    monthSales,
    totalSales,
    totalProducts: products.length,
    totalCustomers: customers.length,
    totalOrders: sales.length,
    totalEmployees: employees.length,
    lowStockCount,
    inventoryValue,
    grossProfit: Math.round(totalSales * 0.28),
    monthExpenses: expenses.reduce((sum, exp) => sum + Number(exp.amount), 0),
    dailySales,
    monthlySales,
    topProducts: sortedTopProducts,
    recentSales: sales
      .slice()
      .sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      )
      .slice(0, 8)
      .map(sale => ({
        id: sale.id.toString(),
        saleNumber: sale.saleNumber,
        customerName: sale.customerName,
        totalAmount: Number(sale.totalAmount),
        status: sale.status,
        paymentMethod: sale.paymentMethod,
      })),
  };
};

const dashboardRouter = t.router({
  kpi: t.procedure.query(() => buildKpi()),
  monthlySales: t.procedure.query(() => buildKpi().monthlySales),
  paymentMethods: t.procedure.query(() => {
    const summary = sales.reduce(
      (acc, sale) => {
        const key = sale.paymentMethod;
        acc[key] = acc[key] || { method: key, total: 0, count: 0 };
        acc[key].total += Number(sale.totalAmount);
        acc[key].count += 1;
        return acc;
      },
      {} as Record<string, { method: string; total: number; count: number }>
    );
    return Object.values(summary);
  }),
});

const appRouter = t.router({
  dashboard: dashboardRouter,
  products: t.router({
    list: t.procedure
      .input(
        z.object({
          search: z.string().optional(),
          categoryId: z.number().optional(),
          page: z.number().optional().default(1),
          limit: z.number().optional().default(20),
        })
      )
      .query(({ input }) => {
        const items = products.filter(product => {
          const matchesSearch =
            !input.search ||
            [
              product.name,
              product.sku,
              product.brandName,
              product.categoryName,
            ].some(value =>
              value?.toLowerCase().includes(input.search!.toLowerCase())
            );
          const matchesCategory =
            !input.categoryId || product.categoryId === input.categoryId;
          return matchesSearch && matchesCategory;
        });
        return paginate(items, input.page, input.limit);
      }),
    categories: t.procedure.query(() => categories),
    create: t.procedure
      .input(
        z.object({
          sku: z.string(),
          name: z.string(),
          sellingPrice: z.string(),
          costPrice: z.string().optional().default("0"),
          categoryId: z.number(),
          taxRate: z.string().optional().default("0"),
          brandName: z.string().optional().default("Generic"),
          image: z.string().optional().default(""),
          isActive: z.boolean().optional().default(true),
          branchId: z.number().optional(),
        })
      )
      .mutation(({ input }) => {
        const category = categories.find(
          category => category.id === input.categoryId
        );
        const product = {
          id: nextIds.product++,
          sku: input.sku,
          name: input.name,
          brandName: input.brandName,
          categoryId: input.categoryId,
          categoryName: category?.name ?? "Uncategorized",
          categoryColor: category?.color ?? "#94a3b8",
          image: input.image,
          costPrice: input.costPrice,
          sellingPrice: input.sellingPrice,
          taxRate: input.taxRate,
          isActive: input.isActive,
          branchId: input.branchId ?? 1,
        };
        products.unshift(product);
        return product;
      }),
    update: t.procedure
      .input(
        z.object({
          id: z.number(),
          sku: z.string(),
          name: z.string(),
          sellingPrice: z.string(),
          costPrice: z.string().optional().default("0"),
          categoryId: z.number(),
          taxRate: z.string().optional().default("0"),
          brandName: z.string().optional().default("Generic"),
          isActive: z.boolean().optional().default(true),
          branchId: z.number().optional(),
        })
      )
      .mutation(({ input }) => {
        const index = products.findIndex(product => product.id === input.id);
        if (index === -1) throw new Error("Product not found");
        const category = categories.find(
          category => category.id === input.categoryId
        );
        products[index] = {
          ...products[index],
          sku: input.sku,
          name: input.name,
          brandName: input.brandName,
          categoryId: input.categoryId,
          categoryName: category?.name ?? products[index].categoryName,
          categoryColor: category?.color ?? products[index].categoryColor,
          costPrice: input.costPrice,
          sellingPrice: input.sellingPrice,
          taxRate: input.taxRate,
          isActive: input.isActive,
          branchId:
            typeof input.branchId !== "undefined"
              ? input.branchId
              : products[index].branchId,
        };
        return products[index];
      }),
    delete: t.procedure
      .input(z.object({ id: z.number() }))
      .mutation(({ input }) => {
        const index = products.findIndex(product => product.id === input.id);
        if (index === -1) throw new Error("Product not found");
        const [deleted] = products.splice(index, 1);
        return deleted;
      }),
    bulkCreate: t.procedure
      .input(
        z.object({
          products: z.array(
            z.object({
              sku: z.string(),
              name: z.string(),
              sellingPrice: z.string(),
              costPrice: z.string().optional().default("0"),
              categoryId: z.number(),
              taxRate: z.string().optional().default("0"),
              brandName: z.string().optional().default("Generic"),
              image: z.string().optional().default(""),
              isActive: z.boolean().optional().default(true),
              branchId: z.number().optional(),
            })
          ),
        })
      )
      .mutation(({ input }) => {
        const createdProducts = input.products.map(productInput => {
          const category = categories.find(
            category => category.id === productInput.categoryId
          );
          const product = {
            id: nextIds.product++,
            sku: productInput.sku,
            name: productInput.name,
            brandName: productInput.brandName,
            categoryId: productInput.categoryId,
            categoryName: category?.name ?? "Uncategorized",
            categoryColor: category?.color ?? "#94a3b8",
            image: productInput.image,
            costPrice: productInput.costPrice,
            sellingPrice: productInput.sellingPrice,
            taxRate: productInput.taxRate,
            isActive:
              typeof productInput.isActive !== "undefined"
                ? productInput.isActive
                : true,
            branchId: productInput.branchId ?? 1,
          };
          products.unshift(product);
          return product;
        });
        return createdProducts;
      }),
  }),
  branches: t.router({
    list: t.procedure.query(() => branches),
    create: t.procedure
      .input(
        z.object({
          name: z.string(),
          address: z.string().optional(),
          phone: z.string().optional(),
        })
      )
      .mutation(({ input }) => {
        const id = branches.length
          ? Math.max(...branches.map(b => b.id)) + 1
          : 1;
        const b = {
          id,
          name: input.name,
          address: input.address ?? "",
          phone: input.phone ?? "",
        };
        branches.unshift(b);
        saveJson("branches.json", branches);
        return b;
      }),
    update: t.procedure
      .input(
        z.object({
          id: z.number(),
          name: z.string().optional(),
          address: z.string().optional(),
          phone: z.string().optional(),
        })
      )
      .mutation(({ input }) => {
        const idx = branches.findIndex(b => b.id === input.id);
        if (idx === -1) throw new Error("Branch not found");
        branches[idx] = {
          ...branches[idx],
          ...(input.name ? { name: input.name } : {}),
          ...(input.address ? { address: input.address } : {}),
          ...(input.phone ? { phone: input.phone } : {}),
        };
        saveJson("branches.json", branches);
        return branches[idx];
      }),
    delete: t.procedure
      .input(z.object({ id: z.number() }))
      .mutation(({ input }) => {
        const idx = branches.findIndex(b => b.id === input.id);
        if (idx === -1) throw new Error("Branch not found");
        const [del] = branches.splice(idx, 1);
        saveJson("branches.json", branches);
        return del;
      }),
  }),
  sales: t.router({
    list: t.procedure
      .input(
        z.object({
          search: z.string().optional(),
          status: z.string().optional(),
          page: z.number().optional().default(1),
          limit: z.number().optional().default(20),
        })
      )
      .query(({ input }) => {
        const items = sales.filter(sale => {
          const matchesSearch =
            !input.search ||
            sale.saleNumber
              .toLowerCase()
              .includes(input.search.toLowerCase()) ||
            sale.customerName
              ?.toLowerCase()
              .includes(input.search.toLowerCase());
          const matchesStatus = !input.status || sale.status === input.status;
          return matchesSearch && matchesStatus;
        });
        return paginate(
          items.sort(
            (a, b) =>
              new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          ),
          input.page,
          input.limit
        );
      }),
    getById: t.procedure
      .input(z.object({ id: z.number() }))
      .query(({ input }) => {
        const sale = sales.find(sale => sale.id === input.id);
        if (!sale) throw new Error("Sale not found");
        return {
          ...sale,
          customer:
            customers.find(
              customer =>
                `${customer.firstName} ${customer.lastName}` ===
                sale.customerName
            ) ?? null,
        };
      }),
    create: t.procedure
      .input(
        z.object({
          branchId: z.number(),
          items: z.array(
            z.object({
              productId: z.number(),
              productName: z.string(),
              sku: z.string(),
              quantity: z.number(),
              unitPrice: z.string(),
              taxRate: z.string(),
              taxAmount: z.string(),
              totalAmount: z.string(),
            })
          ),
          subtotal: z.string(),
          taxAmount: z.string(),
          discountAmount: z.string(),
          totalAmount: z.string(),
          amountPaid: z.string(),
          paymentMethod: z.string(),
          discountPercentage: z.string().optional(),
          notes: z.string().optional(),
        })
      )
      .mutation(({ input }) => {
        try {
          console.log("[api] sales.create called with:", JSON.stringify(input));
        } catch (e) {
          console.log("[api] sales.create called (unable to stringify input)");
        }
        const saleNumber = `S-${1000 + nextIds.sale}`;
        const sale = {
          id: nextIds.sale++,
          saleNumber,
          customerName: input.notes?.replace("Customer: ", "") || "Walk-in",
          status: "completed",
          paymentMethod: input.paymentMethod,
          totalAmount: input.totalAmount,
          subtotal: input.subtotal,
          taxAmount: input.taxAmount,
          discountAmount: input.discountAmount,
          paymentStatus: "paid",
          createdAt: new Date().toISOString(),
          branchId: input.branchId,
          items: input.items.map((item, index) => ({
            id: `item_${nextIds.sale}_${index}`,
            ...item,
          })),
          notes: input.notes,
        };
        sales.unshift(sale);
        try {
          saveJson("sales.json", sales);
        } catch (e) {
          console.error("[api] failed to save sales.json", e);
        }
        try {
          console.log("[api] sale created:", sale.saleNumber);
        } catch (e) {
          /* ignore */
        }
        return sale;
      }),
  }),
  customers: t.router({
    list: t.procedure
      .input(
        z.object({
          search: z.string().optional(),
          page: z.number().optional().default(1),
          limit: z.number().optional().default(20),
        })
      )
      .query(({ input }) => {
        const items = customers.filter(customer => {
          const searchTerm = input.search?.toLowerCase() ?? "";
          return (
            !input.search ||
            customer.customerCode.toLowerCase().includes(searchTerm) ||
            customer.firstName.toLowerCase().includes(searchTerm) ||
            customer.lastName.toLowerCase().includes(searchTerm) ||
            customer.email?.toLowerCase().includes(searchTerm) ||
            customer.phone?.toLowerCase().includes(searchTerm) ||
            customer.city?.toLowerCase().includes(searchTerm)
          );
        });
        return paginate(
          items.sort((a, b) => a.id - b.id),
          input.page,
          input.limit
        );
      }),
    getById: t.procedure
      .input(z.object({ id: z.number() }))
      .query(({ input }) => {
        const customer = customers.find(customer => customer.id === input.id);
        if (!customer) throw new Error("Customer not found");
        return customer;
      }),
    create: t.procedure
      .input(
        z.object({
          customerCode: z.string(),
          firstName: z.string(),
          lastName: z.string(),
          email: z.string().optional(),
          phone: z.string().optional(),
          city: z.string().optional(),
          customerGroup: z.enum(["retail", "wholesale", "vip", "corporate"]),
        })
      )
      .mutation(({ input }) => {
        const customer = {
          id: nextIds.customer++,
          customerCode: input.customerCode,
          firstName: input.firstName,
          lastName: input.lastName,
          email: input.email ?? "",
          phone: input.phone ?? "",
          city: input.city ?? "",
          customerGroup: input.customerGroup,
          loyaltyPoints: 0,
          outstandingBalance: "0",
          address: "",
          createdAt: new Date().toISOString(),
          salesCount: 0,
          totalSpent: "0",
        };
        customers.unshift(customer);
        return customer;
      }),
  }),
  employees: t.router({
    list: t.procedure
      .input(
        z.object({
          search: z.string().optional(),
          department: z.string().optional(),
          page: z.number().optional().default(1),
          limit: z.number().optional().default(50),
        })
      )
      .query(({ input }) => {
        const searchTerm = input.search?.toLowerCase() ?? "";
        const items = employees.filter(employee => {
          const departmentMatches =
            !input.department || employee.department === input.department;
          const searchMatches =
            !input.search ||
            [
              employee.employeeCode,
              employee.firstName,
              employee.lastName,
              employee.email,
              employee.branchName,
              employee.designation,
            ]
              .filter(Boolean)
              .some(value =>
                value.toLowerCase().includes(searchTerm)
              );
          return departmentMatches && searchMatches;
        });
        return paginate(items, input.page, input.limit);
      }),
    getById: t.procedure
      .input(z.object({ id: z.number() }))
      .query(({ input }) => {
        const employee = employees.find(employee => employee.id === input.id);
        if (!employee) throw new Error("Employee not found");
        return employee;
      }),
    create: t.procedure
      .input(
        z.object({
          name: z.string(),
          email: z.string(),
          role: z.enum(["admin", "employee"]),
          privileges: z.array(z.string()).optional(),
          branchId: z.number().optional(),
        })
      )
      .mutation(({ input }) => {
        const [firstName, ...rest] = input.name.trim().split(" ");
        const lastName = rest.join(" ");
        const nextId = employees.length
          ? Math.max(...employees.map(e => e.id)) + 1
          : 1;
        const branch = input.branchId
          ? branches.find(b => b.id === input.branchId)
          : undefined;
        const employee = {
          id: nextId,
          employeeCode: `EMP-${String(nextId).padStart(3, "0")}`,
          firstName,
          lastName,
          department: input.role === "admin" ? "Management" : "Sales",
          designation: input.role === "admin" ? "Administrator" : "Staff",
          branchName: branch?.name ?? "Main Branch",
          status: "active",
          basicSalary: "120000",
          employmentType: "full_time",
          dateOfJoining: new Date().toISOString().slice(0, 10),
          email: input.email,
          branchId: input.branchId ?? (branch ? branch.id : 1),
          phone: "",
          payrollHistory: [],
        };
        employees.unshift(employee);
        saveJson("employees.json", employees);
        return employee;
      }),
    update: t.procedure
      .input(
        z.object({
          id: z.number(),
          firstName: z.string().optional(),
          lastName: z.string().optional(),
          email: z.string().optional(),
          phone: z.string().optional(),
          status: z.enum(["active", "inactive"]).optional(),
          department: z.string().optional(),
          designation: z.string().optional(),
          branchId: z.number().optional(),
          basicSalary: z.string().optional(),
          employmentType: z.string().optional(),
          dateOfJoining: z.string().optional(),
        })
      )
      .mutation(({ input }) => {
        const idx = employees.findIndex(employee => employee.id === input.id);
        if (idx === -1) throw new Error("Employee not found");
        const existing = employees[idx];
        const branch = input.branchId
          ? branches.find(b => b.id === input.branchId)
          : undefined;
        const updatedEmployee = {
          ...existing,
          ...(input.firstName ? { firstName: input.firstName } : {}),
          ...(input.lastName ? { lastName: input.lastName } : {}),
          ...(input.email ? { email: input.email } : {}),
          ...(input.phone ? { phone: input.phone } : {}),
          ...(input.status ? { status: input.status } : {}),
          ...(input.department ? { department: input.department } : {}),
          ...(input.designation ? { designation: input.designation } : {}),
          ...(typeof input.branchId !== "undefined"
            ? {
                branchId: input.branchId,
                branchName: branch?.name ?? existing.branchName,
              }
            : {}),
          ...(input.basicSalary ? { basicSalary: input.basicSalary } : {}),
          ...(input.employmentType ? { employmentType: input.employmentType } : {}),
          ...(input.dateOfJoining ? { dateOfJoining: input.dateOfJoining } : {}),
        };
        employees[idx] = updatedEmployee;
        saveJson("employees.json", employees);

        const userIdx = users.findIndex(u => u.email === existing.email);
        if (userIdx !== -1) {
          users[userIdx] = {
            ...users[userIdx],
            ...(input.email ? { email: input.email } : {}),
            ...(input.status
              ? { isActive: input.status === "active" }
              : {}),
            ...(input.branchId ? { branchId: input.branchId } : {}),
          };
          saveJson("users.json", users);
        }

        return updatedEmployee;
      }),
    delete: t.procedure
      .input(z.object({ id: z.number() }))
      .mutation(({ input }) => {
        const idx = employees.findIndex(employee => employee.id === input.id);
        if (idx === -1) throw new Error("Employee not found");
        const [removed] = employees.splice(idx, 1);
        saveJson("employees.json", employees);
        const userIdx = users.findIndex(u => u.email === removed.email);
        if (userIdx !== -1) {
          users.splice(userIdx, 1);
          saveJson("users.json", users);
        }
        return removed;
      }),
  }),
  users: t.router({
    list: t.procedure.query(() => users.map(sanitizeUser)),
    create: t.procedure
      .input(
        z.object({
          name: z.string(),
          email: z.string(),
          password: z.string(),
          role: z.enum(["admin", "employee"]),
          privileges: z.array(z.string()).optional(),
          branchId: z.number().optional(),
        })
      )
      .mutation(({ input }) => {
        const roleEntry = roles.find(r => r.name === input.role);
        if (!roleEntry) throw new Error("Role not found");
        const allowed = new Set<string>(roles.flatMap(r => r.privileges));
        const privs =
          input.privileges && input.privileges.length
            ? input.privileges
            : roleEntry.privileges;
        for (const p of privs) {
          if (!allowed.has(p)) throw new Error(`Invalid privilege: ${p}`);
        }
        const user = {
          id: users.length ? Math.max(...users.map((u: any) => u.id)) + 1 : 1,
          name: input.name,
          email: input.email,
          passwordHash: hashPassword(input.password),
          role: input.role,
          privileges: privs,
          isActive: true,
          branchId: input.branchId ?? null,
        };
        users.unshift(user);
        saveJson("users.json", users);
        return sanitizeUser(user);
      }),
    update: t.procedure
      .input(
        z.object({
          id: z.number(),
          name: z.string().optional(),
          password: z.string().optional(),
          role: z.enum(["admin", "employee"]).optional(),
          privileges: z.array(z.string()).optional(),
          branchId: z.number().optional(),
          isActive: z.boolean().optional(),
        })
      )
      .mutation(({ input }) => {
        const idx = users.findIndex(u => u.id === input.id);
        if (idx === -1) throw new Error("User not found");
        if (input.role) {
          const roleEntry = roles.find(r => r.name === input.role);
          if (!roleEntry) throw new Error("Role not found");
        }
        const allowed = new Set<string>(roles.flatMap(r => r.privileges));
        if (input.privileges) {
          for (const p of input.privileges) {
            if (!allowed.has(p)) throw new Error(`Invalid privilege: ${p}`);
          }
        }
        users[idx] = {
          ...users[idx],
          ...(input.name ? { name: input.name } : {}),
          ...(input.password
            ? { passwordHash: hashPassword(input.password) }
            : {}),
          ...(input.role ? { role: input.role } : {}),
          ...(input.privileges ? { privileges: input.privileges } : {}),
          ...(typeof input.branchId !== "undefined"
            ? { branchId: input.branchId }
            : {}),
          ...(typeof input.isActive !== "undefined"
            ? { isActive: input.isActive }
            : {}),
        };
        saveJson("users.json", users);
        return sanitizeUser(users[idx]);
      }),
  }),

  roles: t.router({
    list: t.procedure.query(() => roles),
    create: t.procedure
      .input(
        z.object({
          name: z.string(),
          privileges: z.array(z.string()).optional(),
        })
      )
      .mutation(({ input }) => {
        const role = { name: input.name, privileges: input.privileges ?? [] };
        roles.push(role);
        saveJson("roles.json", roles);
        return role;
      }),
    update: t.procedure
      .input(z.object({ name: z.string(), privileges: z.array(z.string()) }))
      .mutation(({ input }) => {
        const idx = roles.findIndex(r => r.name === input.name);
        if (idx === -1) throw new Error("Role not found");
        roles[idx] = { name: input.name, privileges: input.privileges };
        saveJson("roles.json", roles);
        return roles[idx];
      }),
    delete: t.procedure
      .input(z.object({ name: z.string() }))
      .mutation(({ input }) => {
        const idx = roles.findIndex(r => r.name === input.name);
        if (idx === -1) throw new Error("Role not found");
        const [del] = roles.splice(idx, 1);
        saveJson("roles.json", roles);
        return del;
      }),
  }),
  auth: t.router({
    login: t.procedure
      .input(z.object({ email: z.string(), password: z.string() }))
      .mutation(({ input }) => {
        const user = users.find(u => u.email === input.email);
        if (!user) throw new Error("Invalid credentials");
        if (
          !user.passwordHash ||
          user.passwordHash !== hashPassword(input.password)
        ) {
          throw new Error("Invalid credentials");
        }
        if (typeof user.isActive !== "undefined" && user.isActive === false) {
          throw new Error("Account locked");
        }
        return { token: `token-${user.id}`, user: sanitizeUser(user) };
      }),
  }),
  settings: t.router({
    get: t.procedure.query(() => systemSettings),
    update: t.procedure
      .input(
        z.object({
          receiptAuto: z.boolean().optional(),
          lowStockAlerts: z.boolean().optional(),
          emailReports: z.boolean().optional(),
          emailAlerts: z.boolean().optional(),
          smsAlerts: z.boolean().optional(),
          smsNumber: z.string().optional(),
          soundEnabled: z.boolean().optional(),
          multiBranchEnabled: z.boolean().optional(),
          defaultTaxRate: z.string().optional(),
          currency: z.string().optional(),
          paymentMethods: z
            .object({
              cash: z.boolean().optional(),
              card: z.boolean().optional(),
              bankTransfer: z.boolean().optional(),
              mobileMoney: z.boolean().optional(),
              posTerminal: z.boolean().optional(),
            })
            .optional(),
        })
      )
      .mutation(({ input }) => {
        Object.assign(systemSettings, input);
        return systemSettings;
      }),
  }),
  inventory: t.router({
    list: t.procedure
      .input(
        z.object({
          search: z.string().optional(),
          branchId: z.number().optional(),
          lowStock: z.boolean().optional(),
          limit: z.number().optional().default(50),
        })
      )
      .query(({ input }) => {
        const searchTerm = input.search?.toLowerCase() ?? "";
        const items = inventory.filter(item => {
          const branchMatches =
            !input.branchId || item.branchId === input.branchId;
          const lowStockMatches =
            input.lowStock === undefined || item.quantity <= item.minStockLevel;
          const searchMatches =
            !input.search ||
            [
              item.productName,
              item.productSku,
              item.branchName,
              item.location,
            ]
              .filter(Boolean)
              .some(value =>
                value.toLowerCase().includes(searchTerm)
              );
          return branchMatches && lowStockMatches && searchMatches;
        });
        return paginate(
          items.sort((a, b) => b.quantity - a.quantity),
          1,
          input.limit
        );
      }),
    movements: t.procedure
      .input(
        z.object({
          branchId: z.number().optional(),
          limit: z.number().optional().default(50),
        })
      )
      .query(({ input }) => {
        const items = inventoryMovements
          .filter(
            movement => !input.branchId || movement.branchId === input.branchId
          )
          .sort(
            (a, b) =>
              new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          );
        return paginate(items, 1, input.limit);
      }),
    create: t.procedure
      .input(
        z.object({
          productId: z.number(),
          branchId: z.number(),
          quantity: z.number().optional().default(0),
          reservedQuantity: z.number().optional().default(0),
          minStockLevel: z.number().optional().default(0),
          maxStockLevel: z.number().optional().default(0),
          location: z.string().optional().default(""),
          reason: z.string().optional().default("Inventory adjustment"),
        })
      )
      .mutation(({ input }) => {
        const product = products.find(p => p.id === input.productId);
        if (!product) throw new Error("Product not found");
        const branch = branches.find(b => b.id === input.branchId);
        if (!branch) throw new Error("Branch not found");

        const existingIndex = inventory.findIndex(
          item => item.productId === input.productId && item.branchId === input.branchId
        );
        const now = new Date().toISOString();
        if (existingIndex !== -1) {
          const existing = inventory[existingIndex];
          const previousStock = existing.quantity;
          existing.quantity += input.quantity;
          existing.reservedQuantity = input.reservedQuantity;
          existing.minStockLevel = input.minStockLevel;
          existing.maxStockLevel = input.maxStockLevel;
          existing.location = input.location;

          inventoryMovements.unshift({
            id: nextIds.inventoryMovement++,
            productId: existing.productId,
            productName: existing.productName,
            productSku: existing.productSku,
            branchId: existing.branchId,
            type: "in",
            quantity: input.quantity,
            previousStock,
            newStock: existing.quantity,
            reason: input.reason,
            createdAt: now,
          });
          return existing;
        }

        const item = {
          id: nextIds.inventory++,
          productId: product.id,
          productName: product.name,
          productSku: product.sku,
          branchId: branch.id,
          branchName: branch.name,
          quantity: input.quantity,
          reservedQuantity: input.reservedQuantity,
          minStockLevel: input.minStockLevel,
          maxStockLevel: input.maxStockLevel,
          location: input.location,
        };
        inventory.unshift(item);
        inventoryMovements.unshift({
          id: nextIds.inventoryMovement++,
          productId: item.productId,
          productName: item.productName,
          productSku: item.productSku,
          branchId: item.branchId,
          type: "in",
          quantity: item.quantity,
          previousStock: 0,
          newStock: item.quantity,
          reason: input.reason,
          createdAt: now,
        });
        return item;
      }),
  }),
  expenses: t.router({
    list: t.procedure
      .input(
        z.object({
          categoryId: z.number().optional(),
          branchId: z.number().optional(),
          limit: z.number().optional().default(50),
        })
      )
      .query(({ input }) => {
        const items = expenses.filter(expense => {
          const categoryMatches =
            !input.categoryId || expense.categoryId === input.categoryId;
          const branchMatches =
            !input.branchId || expense.branchId === input.branchId;
          return categoryMatches && branchMatches;
        });
        const totalAmount = items.reduce(
          (sum, expense) => sum + Number(expense.amount),
          0
        );
        return {
          items,
          total: items.length,
          totalAmount,
        };
      }),
    create: t.procedure
      .input(
        z.object({
          description: z.string(),
          categoryId: z.number(),
          branchId: z.number(),
          amount: z.string(),
          vendor: z.string().optional(),
          status: z
            .enum(["paid", "pending", "cancelled"])
            .optional()
            .default("pending"),
          expenseDate: z.string().optional(),
        })
      )
      .mutation(({ input }) => {
        const category = expenseCategories.find(
          category => category.id === input.categoryId
        );
        const branch = branches.find(branch => branch.id === input.branchId);
        const expenseNumber = `EXP-${1000 + (nextIds.expense ?? 0)}`;
        const expense = {
          id: nextIds.expense ?? 0,
          expenseNumber,
          description: input.description,
          categoryId: input.categoryId,
          categoryName: category?.name ?? "General",
          categoryColor: category?.color ?? "#94a3b8",
          amount: input.amount,
          vendor: input.vendor ?? "",
          status: input.status,
          expenseDate: input.expenseDate ?? new Date().toISOString(),
          branchId: input.branchId,
          branchName: branch?.name ?? "Main Branch",
        };
        expenses.unshift(expense);
        nextIds.expense = (nextIds.expense ?? 0) + 1;
        return expense;
      }),
    categories: t.procedure.query(() => expenseCategories),
  }),
  suppliers: t.router({
    list: t.procedure
      .input(
        z.object({
          search: z.string().optional(),
          page: z.number().optional().default(1),
          limit: z.number().optional().default(20),
        })
      )
      .query(({ input }) => {
        const items = suppliers.filter(supplier => {
          const searchTerm = input.search?.toLowerCase() ?? "";
          return (
            !input.search ||
            supplier.name.toLowerCase().includes(searchTerm) ||
            supplier.code.toLowerCase().includes(searchTerm) ||
            supplier.contactPerson?.toLowerCase().includes(searchTerm) ||
            supplier.email?.toLowerCase().includes(searchTerm) ||
            supplier.city?.toLowerCase().includes(searchTerm)
          );
        });
        return paginate(items, input.page, input.limit);
      }),
    create: t.procedure
      .input(
        z.object({
          name: z.string(),
          code: z.string(),
          contactPerson: z.string().optional(),
          email: z.string().optional(),
          phone: z.string().optional(),
          address: z.string().optional(),
          city: z.string().optional(),
          rating: z.string().optional().default("4"),
        })
      )
      .mutation(({ input }) => {
        const supplier = {
          id: nextIds.supplier++,
          name: input.name,
          code: input.code,
          contactPerson: input.contactPerson ?? "",
          email: input.email ?? "",
          phone: input.phone ?? "",
          address: input.address ?? "",
          city: input.city ?? "",
          rating: input.rating,
          isActive: true,
          taxId: "",
        };
        suppliers.unshift(supplier);
        return supplier;
      }),
  }),
});

export type AppRouter = typeof appRouter;

export { appRouter };
