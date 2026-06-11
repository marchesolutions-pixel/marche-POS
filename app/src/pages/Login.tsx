import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Store, Globe, Zap, BarChart3 } from "lucide-react";
import { useState, useEffect } from "react";
import { trpc } from "@/providers/trpc";
import { useAuth } from "@/hooks/useAuth";

function getOAuthUrl() {
  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
  if (!clientId) return null;

  const baseUrl =
    import.meta.env.VITE_GOOGLE_AUTH_URL ?? "https://accounts.google.com";
  const redirectUri =
    import.meta.env.VITE_GOOGLE_REDIRECT_URI ||
    (typeof window !== "undefined" && window.location.protocol === "file:"
      ? "http://127.0.0.1:4174/api/oauth/callback"
      : `${window.location.origin}/api/oauth/callback`);

  const url = new URL(`${baseUrl}/o/oauth2/v2/auth`);
  url.searchParams.set("client_id", clientId);
  url.searchParams.set("redirect_uri", redirectUri);
  url.searchParams.set("response_type", "code");
  url.searchParams.set("scope", "openid profile email");
  url.searchParams.set("access_type", "offline");
  url.searchParams.set("prompt", "consent");

  return url.toString();
}

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const auth = useAuth();
  const loginMutation = trpc.auth.login.useMutation();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const googleName = params.get("googleName");
    const googleEmail = params.get("googleEmail");

    if (googleEmail) {
      auth.login({
        id: `google-${googleEmail}`,
        name: googleName || googleEmail,
        email: googleEmail,
        role: "employee",
        privileges: ["products", "sales"],
      });
      window.history.replaceState(null, "", window.location.pathname);
      window.location.href = "/";
    }
  }, [auth]);

  const doLogin = async () => {
    if (!email || !password) {
      alert("Enter both email and password.");
      return;
    }
    try {
      const res = await loginMutation.mutateAsync({ email, password });
      auth.login(res.user);
      window.location.href = "/";
    } catch (e) {
      alert("Login failed. Check your credentials.");
    }
  };

  const handleSocialLogin = () => {
    const url = getOAuthUrl();
    if (!url) {
      alert("Google login is not configured.");
      return;
    }
    window.location.href = url;
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-primary/5 p-4">
      <div className="w-full max-w-md space-y-8">
        {/* Logo */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 shadow-lg shadow-primary/10">
            <Store className="h-8 w-8 text-primary" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight">Marche POS</h1>
          <p className="text-muted-foreground text-sm">
            Enterprise Point of Sale & Business Management
          </p>
          <div className="flex items-center justify-center gap-2">
            <Badge variant="secondary" className="text-xs">
              v2.0.0
            </Badge>
            <Badge variant="outline" className="text-xs">
              Enterprise
            </Badge>
          </div>
        </div>

        {/* Login Card */}
        <Card className="shadow-xl border-0">
          <CardHeader className="text-center pb-2">
            <CardTitle className="text-lg">Welcome Back</CardTitle>
            <CardDescription>Sign in to access your dashboard</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-3">
              <Button
                variant="outline"
                className="w-full"
                size="lg"
                onClick={() => handleSocialLogin()}
                disabled={!getOAuthUrl()}
              >
                <Globe className="h-4 w-4 mr-2" />
                {getOAuthUrl()
                  ? "Sign in with Google"
                  : "Google login not configured"}
              </Button>
            </div>

            <div className="space-y-3">
              <Input
                type="email"
                placeholder="Email"
                value={email}
                onChange={e => setEmail(e.target.value)}
              />
              <Input
                type="password"
                placeholder="Password"
                value={password}
                onChange={e => setPassword(e.target.value)}
              />
              <Button className="w-full" onClick={doLogin}>
                Sign In with email
              </Button>
            </div>

            <p className="text-xs text-center text-muted-foreground">
              Sign in with email/password or use a social provider.
            </p>
          </CardContent>
        </Card>

        {/* Features */}
        <div className="grid grid-cols-3 gap-3 text-center">
          <div className="p-3 rounded-lg bg-card border space-y-1">
            <Zap className="h-4 w-4 mx-auto text-amber-500" />
            <p className="text-xs font-medium">Fast POS</p>
          </div>
          <div className="p-3 rounded-lg bg-card border space-y-1">
            <BarChart3 className="h-4 w-4 mx-auto text-emerald-500" />
            <p className="text-xs font-medium">Analytics</p>
          </div>
          <div className="p-3 rounded-lg bg-card border space-y-1">
            <Store className="h-4 w-4 mx-auto text-primary" />
            <p className="text-xs font-medium">Multi-Branch</p>
          </div>
        </div>
      </div>
    </div>
  );
}
