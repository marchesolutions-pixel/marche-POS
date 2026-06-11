import type { ReactNode } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Navigate } from "react-router-dom";

type Props = {
  children: ReactNode;
  requiredRole?: "admin" | "employee";
  requiredPrivilege?: string;
};

export default function RoleGuard({
  children,
  requiredRole,
  requiredPrivilege,
}: Props) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;

  const hasRole = requiredRole
    ? user.role === requiredRole || user.role === "admin"
    : true;
  const hasPrivilege = requiredPrivilege
    ? user.privileges?.includes(requiredPrivilege) || user.role === "admin"
    : true;

  if (!hasRole || !hasPrivilege) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}
