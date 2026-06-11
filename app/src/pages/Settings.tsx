import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { trpc } from "@/providers/trpc";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { useTheme } from "@/components/theme-provider";
import {
  Store,
  User,
  Shield,
  Bell,
  CreditCard,
  Globe,
  Moon,
  Sun,
  Mail,
  Banknote,
  ArrowLeftRight,
  Smartphone,
} from "lucide-react";

function RolesSection() {
  const { data: roles, refetch } = trpc.roles.list.useQuery();
  const createRole = trpc.roles.create.useMutation();
  const updateRole = trpc.roles.update.useMutation();
  const deleteRole = trpc.roles.delete.useMutation();
  const [name, setName] = useState("");
  const [privs, setPrivs] = useState<string[]>(["products"]);
  const [editing, setEditing] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editPrivs, setEditPrivs] = useState<string[]>([]);

  const allPrivs = ["products", "categories", "sales", "settings", "inventory"];

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-2">
        <Input
          placeholder="Role name"
          value={name}
          onChange={e => setName(e.target.value)}
        />
        <div className="col-span-2 flex items-center gap-2 flex-wrap">
          {allPrivs.map(p => (
            <label key={p} className="inline-flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={privs.includes(p)}
                onChange={e =>
                  setPrivs(prev =>
                    e.target.checked ? [...prev, p] : prev.filter(x => x !== p)
                  )
                }
              />
              <span className="capitalize">{p}</span>
            </label>
          ))}
        </div>
      </div>
      <div className="flex gap-2">
        <Button
          onClick={async () => {
            if (!name) return;
            await createRole.mutateAsync({ name, privileges: privs });
            setName("");
            setPrivs(["products"]);
            refetch();
          }}
        >
          Create Role
        </Button>
        <Button
          variant="outline"
          onClick={() => {
            setName("");
            setPrivs(["products"]);
          }}
        >
          Reset
        </Button>
      </div>

      <div className="divide-y divide-border">
        {(roles || []).map((r: any) => (
          <div key={r.name} className="flex items-center justify-between py-2">
            {editing === r.name ? (
              <div className="w-full">
                <div className="grid grid-cols-3 gap-2 mb-2">
                  <Input
                    value={editName}
                    onChange={e => setEditName(e.target.value)}
                  />
                  <div className="col-span-2 flex items-center gap-2 flex-wrap">
                    {allPrivs.map(p => (
                      <label
                        key={p}
                        className="inline-flex items-center gap-2 text-sm"
                      >
                        <input
                          type="checkbox"
                          checked={editPrivs.includes(p)}
                          onChange={e =>
                            setEditPrivs(prev =>
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
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    onClick={async () => {
                      await updateRole.mutateAsync({
                        name: editName,
                        privileges: editPrivs,
                      });
                      setEditing(null);
                      refetch();
                    }}
                  >
                    Save
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setEditing(null)}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            ) : (
              <>
                <div>
                  <p className="font-medium">{r.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {r.privileges?.join(", ")}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setEditing(r.name);
                      setEditName(r.name);
                      setEditPrivs(r.privileges ?? []);
                    }}
                  >
                    Edit
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={async () => {
                      if (!confirm("Delete role?")) return;
                      await deleteRole.mutateAsync({ name: r.name });
                      refetch();
                    }}
                  >
                    Delete
                  </Button>
                </div>
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export default function Settings() {
  const { user, logout, login } = useAuth();
  const { theme, setTheme } = useTheme();
  const settingsQuery = trpc.settings.get.useQuery();
  const updateSettings = trpc.settings.update.useMutation();

  const [receiptAuto, setReceiptAuto] = useState(true);
  const [lowStockAlerts, setLowStockAlerts] = useState(true);
  const [emailReports, setEmailReports] = useState(false);
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [smsAlerts, setSmsAlerts] = useState(false);
  const [smsNumber, setSmsNumber] = useState("");
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [multiBranchEnabled, setMultiBranchEnabled] = useState(true);
  const [paymentMethods, setPaymentMethods] = useState({
    cash: true,
    card: true,
    bankTransfer: true,
    mobileMoney: true,
    posTerminal: false,
  });
  const [paymentSaved, setPaymentSaved] = useState(false);
  // user management
  const { data: users, refetch: refetchUsers } = trpc.users.list.useQuery();
  const { data: roles } = trpc.roles.list.useQuery();
  // branches
  const { data: branches, refetch: refetchBranches } =
    trpc.branches.list.useQuery();
  const createBranch = trpc.branches.create.useMutation();
  const updateBranch = trpc.branches.update.useMutation();
  const deleteBranch = trpc.branches.delete.useMutation();
  const [branchName, setBranchName] = useState("");
  const [branchAddress, setBranchAddress] = useState("");
  const [branchPhone, setBranchPhone] = useState("");
  const createUser = trpc.users.create.useMutation();
  const updateUser = trpc.users.update.useMutation();
  const [profileName, setProfileName] = useState(user?.name || "");
  const [profileEmail, setProfileEmail] = useState(user?.email || "");
  const [profilePassword, setProfilePassword] = useState("");
  const [profileConfirmPassword, setProfileConfirmPassword] = useState("");
  const [profileSaved, setProfileSaved] = useState(false);
  const [newName, setNewName] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newRole, setNewRole] = useState<"admin" | "employee">("employee");
  const [newPrivileges, setNewPrivileges] = useState<string[]>(["products"]);
  const [newPassword, setNewPassword] = useState("");
  const [newBranchId, setNewBranchId] = useState<string>("");
  const [editingUserId, setEditingUserId] = useState<number | null>(null);
  const [editName, setEditName] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const [editRole, setEditRole] = useState<"admin" | "employee">("employee");
  const [editPrivileges, setEditPrivileges] = useState<string[]>([]);
  const [editBranchId, setEditBranchId] = useState<string>("");

  useEffect(() => {
    if (settingsQuery.data) {
      setReceiptAuto(!!settingsQuery.data.receiptAuto);
      setLowStockAlerts(!!settingsQuery.data.lowStockAlerts);
      setEmailReports(!!settingsQuery.data.emailReports);
      setEmailAlerts(!!settingsQuery.data.emailAlerts);
      setSmsAlerts(!!settingsQuery.data.smsAlerts);
      setSmsNumber(settingsQuery.data.smsNumber ?? "");
      setSoundEnabled(!!settingsQuery.data.soundEnabled);
      setMultiBranchEnabled(!!settingsQuery.data.multiBranchEnabled);
      setPaymentMethods({
        cash: settingsQuery.data.paymentMethods?.cash ?? true,
        card: settingsQuery.data.paymentMethods?.card ?? true,
        bankTransfer: settingsQuery.data.paymentMethods?.bankTransfer ?? true,
        mobileMoney: settingsQuery.data.paymentMethods?.mobileMoney ?? true,
        posTerminal: settingsQuery.data.paymentMethods?.posTerminal ?? false,
      });
    }
  }, [settingsQuery.data]);

  useEffect(() => {
    if (user) {
      setProfileName(user.name || "");
      setProfileEmail(user.email || "");
    }
  }, [user]);

  useEffect(() => {
    if (roles && roles.length) {
      // default new role and privileges to first role if not set
      if (!newRole) setNewRole(roles[0].name as "admin" | "employee");
      if (!newPrivileges || newPrivileges.length === 0)
        setNewPrivileges(roles[0].privileges ?? []);
    }
  }, [roles]);

  const [activeSection, setActiveSection] = useState<string>("all");

  useEffect(() => {
    // on mount, respect URL hash deep-links
    try {
      const hash = window.location.hash?.replace('#', '');
      if (hash) setActiveSection(hash);
    } catch (e) {
      // ignore in environments without window
    }
  }, []);

  useEffect(() => {
    // update URL and smooth-scroll to section when activeSection changes
    try {
      if (activeSection === 'all') {
        history.replaceState(null, '', location.pathname + location.search);
        return;
      }
      history.replaceState(null, '', location.pathname + location.search + '#' + activeSection);
      // wait for element to be rendered then scroll
      setTimeout(() => {
        const el = document.getElementById(activeSection);
        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 60);
    } catch (e) {
      // noop
    }
  }, [activeSection]);

  const saveSetting = async (patch: any) => {
    try {
      await updateSettings.mutateAsync(patch);
    } catch (e) {
      // ignore for now
    }
  };

  const sections = [
    { key: 'all', label: 'All Settings', Icon: Globe },
    { key: 'profile', label: 'Profile', Icon: User },
    { key: 'appearance', label: 'Appearance', Icon: Sun },
    { key: 'pos', label: 'POS', Icon: Store },
    { key: 'notifications', label: 'Notifications', Icon: Bell },
    { key: 'payments', label: 'Payment Methods', Icon: CreditCard },
    { key: 'users', label: 'Users', Icon: User },
    { key: 'branches', label: 'Branches', Icon: Banknote },
    { key: 'roles', label: 'Roles & Privileges', Icon: Shield },
    { key: 'system', label: 'System', Icon: Globe },
    { key: 'account', label: 'Account', Icon: Shield },
  ];

  return (
    <div className="grid gap-6 lg:grid-cols-[240px_minmax(0,1fr)]">
      <aside className="space-y-6 lg:sticky lg:top-6 lg:self-start lg:max-h-[calc(100vh-4rem)] lg:overflow-y-auto">
        <Card className="space-y-6">
          <CardHeader>
            <CardTitle>Settings</CardTitle>
            <CardDescription>Quick access to every configuration panel.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2 text-sm text-muted-foreground">
              <p>Use the navigation to jump directly to a settings category.</p>
              <p>Changes are saved automatically where possible.</p>
            </div>
            <div className="grid gap-2">
              {sections.map(section => (
                <Button
                  key={section.key}
                  variant={activeSection === section.key ? 'default' : 'outline'}
                  size="sm"
                  className="justify-start gap-3"
                  onClick={() => setActiveSection(section.key)}
                >
                  <section.Icon className="h-4 w-4" />
                  {section.label}
                </Button>
              ))}
            </div>
            <Separator />
            <Button
              variant="outline"
              size="sm"
              onClick={async () => {
                try {
                  const section = activeSection === 'all' ? '' : '#' + activeSection;
                  const url = window.location.origin + window.location.pathname + window.location.search + section;
                  await navigator.clipboard.writeText(url);
                  alert('Section link copied');
                } catch (e) {
                  alert('Could not copy link');
                }
              }}
              className="w-full"
            >
              Copy section link
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Need help?</CardTitle>
            <CardDescription>Settings tips</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-muted-foreground">
            <p>Use the sidebar to switch between settings areas quickly.</p>
            <p>Profile and account settings are separate from system-wide configuration.</p>
            <p>Only admin users can manage branches and roles.</p>
          </CardContent>
        </Card>
      </aside>

      <main className="space-y-6">
        <div className="rounded-3xl border border-border bg-background p-6 shadow-sm">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.24em] text-muted-foreground">Settings</p>
              <h1 className="text-3xl font-semibold tracking-tight">System configuration</h1>
            </div>
            <div className="space-y-1 text-sm text-muted-foreground">
              <p>Use the sections below to update profile, appearance, POS behavior, and user access.</p>
            </div>
          </div>
        </div>

      {/* Profile */}
      {(activeSection === 'all' || activeSection === 'profile') && (
        <Card id="profile">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5 text-primary" />
            Profile
          </CardTitle>
          <CardDescription>Update your account details and password</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center text-2xl font-bold text-primary">
              {user?.name?.charAt(0).toUpperCase() || "U"}
            </div>
            <div>
              <p className="font-semibold">{user?.name || "User"}</p>
              <p className="text-sm text-muted-foreground">{user?.email || ""}</p>
              <Badge variant="outline" className="mt-1 capitalize">
                {user?.role || "user"}
              </Badge>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Name</Label>
              <Input
                value={profileName}
                onChange={e => setProfileName(e.target.value)}
                placeholder="Admin name"
              />
            </div>
            <div className="space-y-2">
              <Label>Email</Label>
              <Input
                value={profileEmail}
                onChange={e => setProfileEmail(e.target.value)}
                placeholder="Email address"
              />
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>New password</Label>
              <Input
                type="password"
                value={profilePassword}
                onChange={e => setProfilePassword(e.target.value)}
                placeholder="Leave blank to keep current password"
              />
            </div>
            <div className="space-y-2">
              <Label>Confirm password</Label>
              <Input
                type="password"
                value={profileConfirmPassword}
                onChange={e => setProfileConfirmPassword(e.target.value)}
                placeholder="Confirm new password"
              />
            </div>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              {profileSaved && (
                <Badge variant="outline" className="text-xs">
                  Profile updated
                </Badge>
              )}
            </div>
            <div className="flex gap-2 flex-wrap">
              <Button
                variant="outline"
                onClick={() => {
                  setProfileName(user?.name || "");
                  setProfileEmail(user?.email || "");
                  setProfilePassword("");
                  setProfileConfirmPassword("");
                }}
              >
                Reset
              </Button>
              <Button
                onClick={async () => {
                  if (!user) return;
                  if (profilePassword && profilePassword !== profileConfirmPassword) {
                    alert("Passwords do not match.");
                    return;
                  }
                  await updateUser.mutateAsync({
                    id: user.id,
                    name: profileName,
                    email: profileEmail,
                    ...(profilePassword ? { password: profilePassword } : {}),
                  });
                  login({
                    ...user,
                    name: profileName,
                    email: profileEmail,
                  });
                  setProfilePassword("");
                  setProfileConfirmPassword("");
                  setProfileSaved(true);
                  window.setTimeout(() => setProfileSaved(false), 1800);
                }}
              >
                Save profile
              </Button>
            </div>
          </div>
        </CardContent>
        </Card>
      )}

      {/* Appearance */}
      {(activeSection === 'all' || activeSection === 'appearance') && (
        <Card id="appearance">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {theme === "dark" ? (
              <Moon className="h-5 w-5 text-primary" />
            ) : (
              <Sun className="h-5 w-5 text-primary" />
            )}
            Appearance
          </CardTitle>
          <CardDescription>Customize the look and feel</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Theme</p>
              <p className="text-sm text-muted-foreground">
                Switch between light and dark mode
              </p>
            </div>
            <div className="flex bg-accent rounded-lg p-1">
              <button
                onClick={() => setTheme("light")}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm transition-colors ${theme === "light" ? "bg-background shadow-sm" : "text-muted-foreground"}`}
              >
                <Sun className="h-4 w-4" /> Light
              </button>
              <button
                onClick={() => setTheme("dark")}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm transition-colors ${theme === "dark" ? "bg-background shadow-sm" : "text-muted-foreground"}`}
              >
                <Moon className="h-4 w-4" /> Dark
              </button>
            </div>
          </div>
        </CardContent>
        </Card>
      )}

      {/* POS Settings */}
      {(activeSection === 'all' || activeSection === 'pos') && (
        <Card id="pos">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Store className="h-5 w-5 text-primary" />
            POS Configuration
          </CardTitle>
          <CardDescription>Configure point of sale behavior</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Auto-print Receipt</p>
              <p className="text-sm text-muted-foreground">
                Automatically print receipt after sale
              </p>
            </div>
            <Switch
              checked={receiptAuto}
              onCheckedChange={(v: boolean) => {
                setReceiptAuto(v);
                saveSetting({ receiptAuto: v });
              }}
            />
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Multi-branch</p>
              <p className="text-sm text-muted-foreground">
                Enable multiple branches and branch-specific data
              </p>
            </div>
            <Switch
              checked={multiBranchEnabled}
              onCheckedChange={(v: boolean) => {
                setMultiBranchEnabled(v);
                saveSetting({ multiBranchEnabled: v });
              }}
            />
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Sound Effects</p>
              <p className="text-sm text-muted-foreground">
                Play sounds on actions
              </p>
            </div>
            <Switch
              checked={soundEnabled}
              onCheckedChange={(v: boolean) => {
                setSoundEnabled(v);
                saveSetting({ soundEnabled: v });
              }}
            />
          </div>
          <Separator />
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Default Tax Rate (%)</Label>
              <Input defaultValue="7.5" />
            </div>
            <div className="space-y-2">
              <Label>Currency</Label>
              <Input defaultValue="NGN (N)" disabled />
            </div>
          </div>
        </CardContent>
        </Card>
      )}

      {/* Notifications */}
      {(activeSection === 'all' || activeSection === 'notifications') && (
        <Card id="notifications">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5 text-primary" />
            Notifications
          </CardTitle>
          <CardDescription>Configure alert preferences</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-amber-500/10">
                <Bell className="h-4 w-4 text-amber-500" />
              </div>
              <div>
                <p className="font-medium">Low Stock Alerts</p>
                <p className="text-sm text-muted-foreground">
                  Get notified when inventory is low
                </p>
              </div>
            </div>
            <Switch
              checked={lowStockAlerts}
              onCheckedChange={(v: boolean) => {
                setLowStockAlerts(v);
                saveSetting({ lowStockAlerts: v });
              }}
            />
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-500/10">
                <Mail className="h-4 w-4 text-blue-500" />
              </div>
              <div>
                <p className="font-medium">Email Alerts</p>
                <p className="text-sm text-muted-foreground">
                  Send email notifications for key alerts
                </p>
              </div>
            </div>
            <Switch
              checked={emailAlerts}
              onCheckedChange={(v: boolean) => {
                setEmailAlerts(v);
                saveSetting({ emailAlerts: v });
              }}
            />
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-slate-500/10">
                <Smartphone className="h-4 w-4 text-slate-500" />
              </div>
              <div>
                <p className="font-medium">SMS Alerts</p>
                <p className="text-sm text-muted-foreground">
                  Send SMS notifications for urgent alerts
                </p>
              </div>
            </div>
            <Switch
              checked={smsAlerts}
              onCheckedChange={(v: boolean) => {
                setSmsAlerts(v);
                saveSetting({ smsAlerts: v });
              }}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="sms-number">SMS Number</Label>
            <Input
              id="sms-number"
              value={smsNumber}
              onChange={(e) => setSmsNumber(e.target.value)}
              onBlur={() => saveSetting({ smsNumber })}
              placeholder="+123 456 7890"
              disabled={!smsAlerts}
            />
            <p className="text-sm text-muted-foreground">
              Phone number used for SMS notifications.
            </p>
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-500/10">
                <Mail className="h-4 w-4 text-blue-500" />
              </div>
              <div>
                <p className="font-medium">Email Reports</p>
                <p className="text-sm text-muted-foreground">
                  Receive daily summary reports
                </p>
              </div>
            </div>
            <Switch
              checked={emailReports}
              onCheckedChange={(v: boolean) => {
                setEmailReports(v);
                saveSetting({ emailReports: v });
              }}
            />
          </div>
        </CardContent>
        </Card>
      )}

      {/* Payment Methods */}
      {(activeSection === 'all' || activeSection === 'payments') && (
        <Card id="payments">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5 text-primary" />
            Payment Methods
            {paymentSaved && (
              <Badge variant="outline" className="text-xs">
                Saved
              </Badge>
            )}
          </CardTitle>
          <CardDescription>Enabled payment options</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {[
              { key: 'cash', name: 'Cash', Icon: Banknote },
              { key: 'card', name: 'Card', Icon: CreditCard },
              { key: 'bankTransfer', name: 'Bank Transfer', Icon: ArrowLeftRight },
              { key: 'mobileMoney', name: 'Mobile Money', Icon: Smartphone },
              { key: 'posTerminal', name: 'POS Terminal', Icon: CreditCard },
            ].map(method => {
              const enabled = paymentMethods[method.key as keyof typeof paymentMethods];
              return (
                <div
                  key={method.key}
                  className="flex items-center justify-between p-2 rounded-lg hover:bg-accent/50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <method.Icon className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{method.name}</span>
                  </div>
                  <Switch
                    checked={enabled}
                    onCheckedChange={async (v: boolean) => {
                      const next = { ...paymentMethods, [method.key]: v };
                      setPaymentMethods(next);
                      await saveSetting({ paymentMethods: next });
                      setPaymentSaved(true);
                      window.setTimeout(() => setPaymentSaved(false), 1400);
                    }}
                  />
                </div>
              );
            })}
          </div>
        </CardContent>
        </Card>
      )}

      {/* User Management */}
      {(activeSection === 'all' || activeSection === 'users') && (
        <Card id="users">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5 text-primary" />
            User Management
          </CardTitle>
          <CardDescription>
            Add administrators and employees with privileges
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Create user (also available in Employees) */}
            <div className="grid grid-cols-4 gap-2 mb-2">
              <Input
                placeholder="Full name"
                value={newName}
                onChange={e => setNewName(e.target.value)}
              />
              <Input
                placeholder="Email"
                value={newEmail}
                onChange={e => setNewEmail(e.target.value)}
              />
              <Input
                placeholder="Password"
                type="password"
                value={newPassword}
                onChange={e => setNewPassword(e.target.value)}
              />
              <Select
                value={newBranchId}
                onValueChange={v => setNewBranchId(v)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Branch (optional)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Default</SelectItem>
                  {(branches || []).map((b: any) => (
                    <SelectItem key={b.id} value={b.id.toString()}>
                      {b.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex gap-2">
              <Button
                onClick={async () => {
                  if (!newName || !newEmail || !newPassword)
                    return alert("Provide name, email and password");
                  const privs = newPrivileges.length
                    ? newPrivileges
                    : (roles?.find(r => r.name === newRole)?.privileges ?? []);
                  await createUser.mutateAsync({
                    name: newName,
                    email: newEmail,
                    password: newPassword,
                    role: newRole,
                    privileges: privs,
                    branchId: newBranchId ? Number(newBranchId) : undefined,
                  });
                  setNewName("");
                  setNewEmail("");
                  setNewPassword("");
                  setNewPrivileges(["products"]);
                  setNewBranchId("");
                  refetchUsers();
                }}
              >
                Create User
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setNewName("");
                  setNewEmail("");
                  setNewPassword("");
                  setNewPrivileges(["products"]);
                  setNewBranchId("");
                }}
              >
                Reset
              </Button>
            </div>

            <div className="divide-y divide-border">
              {(users || []).map((u: any) => (
                <div
                  key={u.id}
                  className="flex items-center justify-between py-2"
                >
                  {editingUserId === u.id ? (
                    <div className="w-full">
                      <div className="grid grid-cols-4 gap-2 mb-2">
                        <Input
                          value={editName}
                          onChange={e => setEditName(e.target.value)}
                        />
                        <Input
                          value={editEmail}
                          onChange={e => setEditEmail(e.target.value)}
                        />
                        <select
                          className="border rounded-lg p-2"
                          value={editRole}
                          onChange={e => setEditRole(e.target.value as "admin" | "employee")}
                        >
                          {(roles || []).map((r: any) => (
                            <option key={r.name} value={r.name}>
                              {r.name}
                            </option>
                          ))}
                        </select>
                        <Select
                          value={editBranchId}
                          onValueChange={v => setEditBranchId(v)}
                        >
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Branch (optional)" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="">Default</SelectItem>
                            {(branches || []).map((b: any) => (
                              <SelectItem key={b.id} value={b.id.toString()}>
                                {b.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="flex items-center gap-3 flex-wrap mb-2">
                        {Array.from(
                          new Set(
                            (roles || []).flatMap((x: any) => x.privileges)
                          )
                        ).map((p: string) => (
                          <label
                            key={p}
                            className="inline-flex items-center gap-2 text-sm"
                          >
                            <input
                              type="checkbox"
                              checked={editPrivileges.includes(p)}
                              onChange={e =>
                                setEditPrivileges(prev =>
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
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          onClick={async () => {
                            await updateUser.mutateAsync({
                              id: u.id,
                              name: editName,
                              role: editRole,
                              privileges: editPrivileges,
                              branchId: editBranchId
                                ? Number(editBranchId)
                                : undefined,
                            });
                            setEditingUserId(null);
                            refetchUsers();
                          }}
                        >
                          Save
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setEditingUserId(null)}
                        >
                          Cancel
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div>
                        <p className="font-medium">
                          {u.name}{" "}
                          <span className="text-xs text-muted-foreground">
                            ({u.email})
                          </span>
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {u.role} — {u.privileges?.join(", ")}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setEditingUserId(u.id);
                            setEditName(u.name);
                            setEditEmail(u.email);
                            setEditRole(u.role);
                            setEditPrivileges(u.privileges ?? []);
                            setEditBranchId(
                              u.branchId ? String(u.branchId) : ""
                            );
                          }}
                        >
                          Edit
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            if (confirm("Imitate login as this user?")) {
                              const auth = useAuth();
                              auth.login(u);
                              location.reload();
                            }
                          }}
                        >
                          Imitate
                        </Button>
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>
          </div>
        </CardContent>
        </Card>
      )}

      {/* Branch Management (admin only) */}
      {user?.role === "admin" && (activeSection === 'all' || activeSection === 'branches') && (
        <Card id="branches">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Store className="h-5 w-5 text-primary" />
              Branches
            </CardTitle>
            <CardDescription>Manage company branches</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-2">
                <Input
                  placeholder="Branch name"
                  value={branchName}
                  onChange={e => setBranchName(e.target.value)}
                />
                <Input
                  placeholder="Address"
                  value={branchAddress}
                  onChange={e => setBranchAddress(e.target.value)}
                />
                <Input
                  placeholder="Phone"
                  value={branchPhone}
                  onChange={e => setBranchPhone(e.target.value)}
                />
              </div>
              <div className="flex gap-2">
                <Button
                  onClick={async () => {
                    if (!branchName) return;
                    await createBranch.mutateAsync({
                      name: branchName,
                      address: branchAddress,
                      phone: branchPhone,
                    });
                    setBranchName("");
                    setBranchAddress("");
                    setBranchPhone("");
                    refetchBranches();
                  }}
                >
                  New Branch
                </Button>
              </div>

              <div className="divide-y divide-border">
                {(branches || []).map((b: any) => (
                  <div
                    key={b.id}
                    className="flex items-center justify-between py-2"
                  >
                    <div>
                      <p className="font-medium">{b.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {b.address} — {b.phone}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={async () => {
                          const newName =
                            prompt("Branch name", b.name) || b.name;
                          const newAddress =
                            prompt("Address", b.address) || b.address;
                          const newPhone = prompt("Phone", b.phone) || b.phone;
                          await updateBranch.mutateAsync({
                            id: b.id,
                            name: newName,
                            address: newAddress,
                            phone: newPhone,
                          });
                          refetchBranches();
                        }}
                      >
                        Edit
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={async () => {
                          if (!confirm("Delete branch?")) return;
                          await deleteBranch.mutateAsync({ id: b.id });
                          refetchBranches();
                        }}
                      >
                        Delete
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Roles Management */}
      {(activeSection === 'all' || activeSection === 'roles') && (
        <Card id="roles">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" />
            Roles & Privileges
          </CardTitle>
          <CardDescription>Manage roles and their privileges</CardDescription>
        </CardHeader>
        <CardContent>
          {/* Roles form and list */}
          <RolesSection />
        </CardContent>
        </Card>
      )}

      {/* System Info */}
      {(activeSection === 'all' || activeSection === 'system') && (
        <Card id="system">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5 text-primary" />
            System Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Version</span>
            <span className="font-medium">Marche POS v2.0.0</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Build Date</span>
            <span className="font-medium">May 2025</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Database</span>
            <span className="font-medium">MySQL</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">API</span>
            <span className="font-medium">tRPC + Hono</span>
          </div>
        </CardContent>
        </Card>
      )}

      {/* Account */}
      {(activeSection === 'all' || activeSection === 'account') && (
        <Card id="account" className="border-destructive/30">
        <CardHeader>
          <CardTitle className="text-destructive flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Account
          </CardTitle>
          <CardDescription>Manage your session</CardDescription>
        </CardHeader>
        <CardContent>
          <Button variant="destructive" onClick={logout}>
            Sign Out
          </Button>
        </CardContent>
        </Card>
      )}
      </main>
    </div>
  );
}
