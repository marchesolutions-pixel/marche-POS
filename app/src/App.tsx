import { Routes, Route } from "react-router-dom";
import { ThemeProvider } from "@/components/theme-provider";
import Layout from "./components/Layout";
import AuthGuard from "./components/AuthGuard";
import RoleGuard from "./components/RoleGuard";
import Dashboard from "./pages/Dashboard";
import PosTerminal from "./pages/PosTerminal";
import Products from "./pages/Products";
import Sales from "./pages/Sales";
import Customers from "./pages/Customers";
import InventoryPage from "./pages/InventoryPage";
import Employees from "./pages/Employees";
import ExpensesPage from "./pages/ExpensesPage";
import Suppliers from "./pages/Suppliers";
import Reports from "./pages/Reports";
import AIAssistant from "./pages/AIAssistant";
import Settings from "./pages/Settings";
import Login from "./pages/Login";
import NotFound from "./pages/NotFound";

export default function App() {
  return (
    <ThemeProvider defaultTheme="dark" storageKey="marche-theme">
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route
          path="/"
          element={
            <AuthGuard>
              <Layout />
            </AuthGuard>
          }
        >
          <Route index element={<Dashboard />} />
          <Route path="pos" element={<PosTerminal />} />
          <Route path="products" element={<Products />} />
          <Route path="sales" element={<Sales />} />
          <Route path="customers" element={<Customers />} />
          <Route path="inventory" element={<InventoryPage />} />
          <Route path="employees" element={<Employees />} />
          <Route path="expenses" element={<ExpensesPage />} />
          <Route path="suppliers" element={<Suppliers />} />
          <Route path="reports" element={<Reports />} />
          <Route path="ai-assistant" element={<AIAssistant />} />
          <Route
            path="settings"
            element={
              <RoleGuard requiredPrivilege="settings">
                <Settings />
              </RoleGuard>
            }
          />
        </Route>
        <Route path="*" element={<NotFound />} />
      </Routes>
    </ThemeProvider>
  );
}
