import { useEffect, useState } from "react";
import { trpc } from "@/providers/trpc";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { format } from "date-fns";
import {
  User,
  Mail,
  Phone,
  Building,
  DollarSign,
  Briefcase,
  RefreshCcw,
  Search,
} from "lucide-react";

function formatNaira(amount: number) {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    minimumFractionDigits: 0,
  }).format(amount);
}

export default function Employees() {
  const [selectedEmployee, setSelectedEmployee] = useState<any>(null);
  const [search, setSearch] = useState("");
  const [department, setDepartment] = useState("");
  // Create employee modal state
  const [createOpen, setCreateOpen] = useState(false);
  const [empName, setEmpName] = useState("");
  const [empEmail, setEmpEmail] = useState("");
  const [empPassword, setEmpPassword] = useState("");
  const [empConfirmPassword, setEmpConfirmPassword] = useState("");
  const [empRole, setEmpRole] = useState<"admin" | "employee">("employee");
  const [empPrivileges, setEmpPrivileges] = useState<string[]>([]);

  const { data: roles } = trpc.roles.list.useQuery();
  const { data: branches } = trpc.branches.list.useQuery();
  const createUser = trpc.users.create.useMutation();
  const createEmployee = trpc.employees.create.useMutation();
  const updateEmployee = trpc.employees.update.useMutation();
  const deleteEmployee = trpc.employees.delete.useMutation();

  const [empBranchId, setEmpBranchId] = useState<number | undefined>(undefined);
  const [isEditing, setIsEditing] = useState(false);
  const [editFirstName, setEditFirstName] = useState("");
  const [editLastName, setEditLastName] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const [editPhone, setEditPhone] = useState("");
  const [editDepartment, setEditDepartment] = useState("");
  const [editDesignation, setEditDesignation] = useState("");
  const [editBranchId, setEditBranchId] = useState<number | undefined>(undefined);
  const [editStatus, setEditStatus] = useState<"active" | "inactive">("active");
  const [editBasicSalary, setEditBasicSalary] = useState("");
  const [editEmploymentType, setEditEmploymentType] = useState("");
  const [editDateOfJoining, setEditDateOfJoining] = useState("");

  const { data, isLoading, refetch } = trpc.employees.list.useQuery({
    search: search || undefined,
    department: department || undefined,
    limit: 50,
  });
  const {
    data: employeeDetail,
    refetch: refetchEmployeeDetail,
  } = trpc.employees.getById.useQuery(
    { id: selectedEmployee?.id },
    { enabled: !!selectedEmployee }
  );

  useEffect(() => {
    if (!employeeDetail) return;
    setEditFirstName(employeeDetail.firstName || "");
    setEditLastName(employeeDetail.lastName || "");
    setEditEmail(employeeDetail.email || "");
    setEditPhone(employeeDetail.phone || "");
    setEditDepartment(employeeDetail.department || "");
    setEditDesignation(employeeDetail.designation || "");
    setEditBranchId(employeeDetail.branchId ?? undefined);
    setEditStatus(
      employeeDetail.status === "inactive" ? "inactive" : "active"
    );
    setEditBasicSalary(employeeDetail.basicSalary || "");
    setEditEmploymentType(employeeDetail.employmentType || "");
    setEditDateOfJoining(employeeDetail.dateOfJoining || "");
    setIsEditing(false);
  }, [employeeDetail]);

  const departments = Array.from(
    new Set(data?.items.map((e: any) => e.department).filter(Boolean) || [])
  ) as string[];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Employees</h1>
          <p className="text-muted-foreground">
            Staff directory and management
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button size="sm" onClick={() => setCreateOpen(true)}>
            Create Employee
          </Button>
          <Button variant="outline" size="sm" onClick={() => refetch()}>
            <RefreshCcw className="h-4 w-4 mr-2" /> Refresh
          </Button>
        </div>
      </div>

      <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            className="pl-9"
            placeholder="Search employees..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <Select value={department} onValueChange={setDepartment}>
          <SelectTrigger className="w-48">
            <Building className="h-4 w-4 mr-2" />
            <SelectValue placeholder="All Departments" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">All Departments</SelectItem>
            {departments.map((d: any) => (
              <SelectItem key={d} value={d}>
                {d}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {isLoading ? (
          <div className="col-span-full text-center p-8 text-muted-foreground">
            Loading...
          </div>
        ) : data?.items.length === 0 ? (
          <div className="col-span-full text-center p-8 text-muted-foreground">
            No employees found
          </div>
        ) : (
          data?.items.map((emp: any) => (
            <Card
              key={emp.id}
              className="hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => setSelectedEmployee(emp)}
            >
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                      <User className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium">
                        {emp.firstName} {emp.lastName}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {emp.employeeCode}
                      </p>
                    </div>
                  </div>
                  <Badge
                    variant={emp.status === "active" ? "default" : "secondary"}
                    className="text-xs capitalize"
                  >
                    {emp.status}
                  </Badge>
                </div>
                <div className="mt-3 space-y-1.5 text-sm">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Briefcase className="h-3.5 w-3.5" />
                    <span>{emp.designation}</span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Building className="h-3.5 w-3.5" />
                    <span>
                      {emp.department}{" "}
                      {emp.branchName ? `- ${emp.branchName}` : ""}
                    </span>
                  </div>
                  {emp.email && (
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Mail className="h-3.5 w-3.5" />
                      <span className="truncate">{emp.email}</span>
                    </div>
                  )}
                </div>
                <div className="mt-3 pt-3 border-t flex items-center justify-between">
                  <div className="text-sm">
                    <span className="font-semibold">
                      {formatNaira(Number(emp.basicSalary))}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      /month
                    </span>
                  </div>
                  <Badge variant="outline" className="text-xs capitalize">
                    {emp.employmentType?.replace("_", " ")}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Create Employee Dialog */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Create Employee</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <Input
              placeholder="Full name"
              value={empName}
              onChange={e => setEmpName(e.target.value)}
            />
            <Input
              placeholder="Email"
              value={empEmail}
              onChange={e => setEmpEmail(e.target.value)}
            />
            <Input
              type="password"
              placeholder="Password"
              value={empPassword}
              onChange={e => setEmpPassword(e.target.value)}
            />
            <Input
              type="password"
              placeholder="Confirm password"
              value={empConfirmPassword}
              onChange={e => setEmpConfirmPassword(e.target.value)}
            />
            <div>
              <label className="text-sm text-muted-foreground">Role</label>
              <select
                className="w-full border rounded-lg p-2 mt-1"
                value={empRole}
                onChange={e => setEmpRole(e.target.value as "admin" | "employee")}
              >
                {(roles || []).map((r: any) => (
                  <option key={r.name} value={r.name}>
                    {r.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex gap-2 flex-wrap">
              {(Array.from(
                new Set((roles || []).flatMap((r: any) => r.privileges || []))
              ) as string[]).map((p: string) => (
                <label
                  key={p}
                  className="inline-flex items-center gap-2 text-sm"
                >
                  <input
                    type="checkbox"
                    checked={empPrivileges.includes(p)}
                    onChange={e =>
                      setEmpPrivileges(prev =>
                        e.target.checked
                          ? [...prev, p]
                          : prev.filter(x => x !== p)
                      )
                    }
                  />
                  <span className="capitalize">{p}</span>
                </label>
              ))}
            </div>
            <div>
              <label className="text-sm text-muted-foreground">Branch</label>
              <Select
                value={empBranchId?.toString() || ""}
                onValueChange={v => setEmpBranchId(v ? Number(v) : undefined)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select branch" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Default</SelectItem>
                  {branches?.map((b: any) => (
                    <SelectItem key={b.id} value={b.id.toString()}>
                      {b.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setCreateOpen(false)}>
                Cancel
              </Button>
              <Button
                onClick={async () => {
                  if (!empName.trim() || !empEmail.trim() || !empPassword) {
                    alert("Please provide a name, email, and password.");
                    return;
                  }
                  if (empPassword !== empConfirmPassword) {
                    alert("Passwords do not match.");
                    return;
                  }
                  const privs = empPrivileges.length
                    ? empPrivileges
                    : (roles?.find(r => r.name === empRole)?.privileges ?? []);
                  await createUser.mutateAsync({
                    name: empName.trim(),
                    email: empEmail.trim(),
                    password: empPassword,
                    role: empRole,
                    privileges: privs,
                    branchId: empBranchId,
                  });
                  await createEmployee.mutateAsync({
                    name: empName.trim(),
                    email: empEmail.trim(),
                    role: empRole,
                    privileges: privs,
                    branchId: empBranchId,
                  });
                  setEmpName("");
                  setEmpEmail("");
                  setEmpPassword("");
                  setEmpConfirmPassword("");
                  setEmpPrivileges([]);
                  setCreateOpen(false);
                  refetch();
                  alert("Employee account and record created");
                }}
              >
                Create
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Employee Detail Dialog */}
      <Dialog
        open={!!selectedEmployee}
        onOpenChange={() => setSelectedEmployee(null)}
      >
        <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Employee Details</DialogTitle>
            <div className="flex flex-wrap gap-2 mt-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsEditing(prev => !prev)}
              >
                {isEditing ? "View" : "Edit"}
              </Button>
              <Button
                variant={employeeDetail?.status === "active" ? "secondary" : "default"}
                size="sm"
                onClick={async () => {
                  if (!employeeDetail) return;
                  await updateEmployee.mutateAsync({
                    id: employeeDetail.id,
                    status:
                      employeeDetail.status === "active"
                        ? "inactive"
                        : "active",
                  });
                  await refetch();
                  await refetchEmployeeDetail();
                }}
              >
                {employeeDetail?.status === "active" ? "Lock Account" : "Unlock Account"}
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={async () => {
                  if (!employeeDetail) return;
                  if (!confirm("Delete this employee and account?")) return;
                  await deleteEmployee.mutateAsync({ id: employeeDetail.id });
                  setSelectedEmployee(null);
                  await refetch();
                }}
              >
                Delete
              </Button>
            </div>
          </DialogHeader>
          {employeeDetail && (
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                  <User className="h-8 w-8 text-primary" />
                </div>
                <div>
                  <p className="text-xl font-bold">
                    {employeeDetail.firstName} {employeeDetail.lastName}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {employeeDetail.employeeCode}
                  </p>
                  <div className="flex gap-2 mt-1">
                    <Badge variant="outline" className="capitalize">
                      {employeeDetail.designation}
                    </Badge>
                    <Badge
                      variant={
                        employeeDetail.status === "active"
                          ? "default"
                          : "secondary"
                      }
                      className="capitalize"
                    >
                      {employeeDetail.status}
                    </Badge>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="p-3 bg-accent/50 rounded-lg">
                  <p className="text-xs text-muted-foreground">Department</p>
                  <p className="font-medium">{employeeDetail.department}</p>
                </div>
                <div className="p-3 bg-accent/50 rounded-lg">
                  <p className="text-xs text-muted-foreground">Basic Salary</p>
                  <p className="font-medium">
                    {formatNaira(Number(employeeDetail.basicSalary))}
                  </p>
                </div>
                <div className="p-3 bg-accent/50 rounded-lg">
                  <p className="text-xs text-muted-foreground">
                    Employment Type
                  </p>
                  <p className="font-medium capitalize">
                    {employeeDetail.employmentType?.replace("_", " ")}
                  </p>
                </div>
                <div className="p-3 bg-accent/50 rounded-lg">
                  <p className="text-xs text-muted-foreground">Date Joined</p>
                  <p className="font-medium">
                    {employeeDetail.dateOfJoining
                      ? format(
                          new Date(employeeDetail.dateOfJoining),
                          "MMM dd, yyyy"
                        )
                      : "-"}
                  </p>
                </div>
              </div>

              <div className="space-y-2 text-sm">
                {employeeDetail.email && (
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <span>{employeeDetail.email}</span>
                  </div>
                )}
                {employeeDetail.phone && (
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <span>{employeeDetail.phone}</span>
                  </div>
                )}
              </div>

              {isEditing ? (
                <div className="space-y-3">
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <Input
                      value={editFirstName}
                      onChange={e => setEditFirstName(e.target.value)}
                      placeholder="First name"
                    />
                    <Input
                      value={editLastName}
                      onChange={e => setEditLastName(e.target.value)}
                      placeholder="Last name"
                    />
                  </div>
                  <Input
                    value={editEmail}
                    onChange={e => setEditEmail(e.target.value)}
                    placeholder="Email"
                  />
                  <Input
                    value={editPhone}
                    onChange={e => setEditPhone(e.target.value)}
                    placeholder="Phone"
                  />
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <Input
                      value={editDepartment}
                      onChange={e => setEditDepartment(e.target.value)}
                      placeholder="Department"
                    />
                    <Input
                      value={editDesignation}
                      onChange={e => setEditDesignation(e.target.value)}
                      placeholder="Designation"
                    />
                  </div>
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <Select value={editBranchId?.toString() || ""} onValueChange={v => setEditBranchId(v ? Number(v) : undefined)}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Branch" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">Main Branch</SelectItem>
                        {branches?.map((b: any) => (
                          <SelectItem key={b.id} value={b.id.toString()}>
                            {b.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Select value={editStatus} onValueChange={setEditStatus}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="inactive">Inactive</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <Input
                      value={editBasicSalary}
                      onChange={e => setEditBasicSalary(e.target.value)}
                      placeholder="Basic salary"
                    />
                    <Input
                      value={editEmploymentType}
                      onChange={e => setEditEmploymentType(e.target.value)}
                      placeholder="Employment type"
                    />
                  </div>
                  <Input
                    type="date"
                    value={editDateOfJoining}
                    onChange={e => setEditDateOfJoining(e.target.value)}
                    placeholder="Date joined"
                  />
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="outline"
                      onClick={() => setIsEditing(false)}
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={async () => {
                        if (!employeeDetail) return;
                        await updateEmployee.mutateAsync({
                          id: employeeDetail.id,
                          firstName: editFirstName,
                          lastName: editLastName,
                          email: editEmail,
                          phone: editPhone,
                          department: editDepartment,
                          designation: editDesignation,
                          branchId: editBranchId,
                          status: editStatus,
                          basicSalary: editBasicSalary,
                          employmentType: editEmploymentType,
                          dateOfJoining: editDateOfJoining,
                        });
                        await refetch();
                        await refetchEmployeeDetail();
                        setIsEditing(false);
                        alert("Employee saved.");
                      }}
                    >
                      Save changes
                    </Button>
                  </div>
                </div>
              ) : (
                employeeDetail.payrollHistory &&
                employeeDetail.payrollHistory.length > 0 && (
                  <div>
                    <h4 className="font-medium mb-2">Recent Payroll</h4>
                    <div className="space-y-2">
                      {employeeDetail.payrollHistory.map((p: any) => (
                        <div
                          key={p.id}
                          className="flex justify-between items-center p-2 rounded bg-muted/50 text-sm"
                        >
                          <span>{p.payPeriod}</span>
                          <span className="font-semibold">
                            {formatNaira(Number(p.netSalary))}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
