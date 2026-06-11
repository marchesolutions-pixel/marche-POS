import { NavLink } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import {
  Home,
  CreditCard,
  Package,
  BarChart3,
  Users,
  Box,
  UserCheck,
  Wallet,
  Truck,
  PieChart,
  Sparkles,
  Settings,
} from "lucide-react";

const navItems: Array<{
  label: string;
  to: string;
  icon: any;
  requiredPrivilege?: string;
}> = [
  { label: "Dashboard", to: "/", icon: Home },
  { label: "POS", to: "/pos", icon: CreditCard },
  {
    label: "Products",
    to: "/products",
    icon: Package,
    requiredPrivilege: "products",
  },
  { label: "Sales", to: "/sales", icon: BarChart3, requiredPrivilege: "sales" },
  { label: "Customers", to: "/customers", icon: Users },
  {
    label: "Inventory",
    to: "/inventory",
    icon: Box,
    requiredPrivilege: "inventory",
  },
  { label: "Employees", to: "/employees", icon: UserCheck },
  { label: "Expenses", to: "/expenses", icon: Wallet },
  { label: "Suppliers", to: "/suppliers", icon: Truck },
  { label: "Reports", to: "/reports", icon: PieChart },
  { label: "AI Assistant", to: "/ai-assistant", icon: Sparkles },
  {
    label: "Settings",
    to: "/settings",
    icon: Settings,
    requiredPrivilege: "settings",
  },
];

export function Sidebar() {
  const { user } = useAuth();

  const canShow = (item: any) => {
    if (!item.requiredPrivilege) return true;
    if (!user) return false;
    if (user.role === "admin") return true;
    return user.privileges?.includes(item.requiredPrivilege);
  };

  return (
    <aside className="hidden lg:flex flex-col w-72 shrink-0 border-r border-slate-800 bg-slate-900 text-slate-100">
      <div className="flex h-20 items-center px-6 text-lg font-semibold tracking-tight text-white">
        Marche POS
      </div>
      <div className="flex-1 overflow-y-auto px-2 py-4">
        <nav className="space-y-1">
          {navItems.filter(canShow).map(item => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `group flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-colors ${
                    isActive
                      ? "bg-slate-800 text-white shadow-sm shadow-slate-950/20"
                      : "text-slate-300 hover:bg-slate-800 hover:text-white"
                  }`
                }
              >
                <Icon className="h-5 w-5" />
                {item.label}
              </NavLink>
            );
          })}
        </nav>
      </div>
      <div className="border-t border-slate-800 px-6 py-4 text-xs text-slate-500">
        Built for POS workflow
      </div>
    </aside>
  );
}
