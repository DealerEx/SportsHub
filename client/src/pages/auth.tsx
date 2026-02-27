import { useState } from "react";
import { useAuth } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Trophy,
  Users,
  Bell,
  Search,
  MapPin,
  Calendar,
  ArrowRight,
} from "lucide-react";

export default function AuthPage() {
  const { login, register } = useAuth();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [loginForm, setLoginForm] = useState({ username: "", password: "" });
  const [registerForm, setRegisterForm] = useState({
    username: "",
    password: "",
    email: "",
    zipCode: "",
  });

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await login(loginForm.username, loginForm.password);
      toast({ title: "Welcome back!" });
    } catch (err: any) {
      toast({ title: "Login failed", description: err.message, variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await register(registerForm);
      toast({ title: "Account created!", description: "Welcome to SportsHub!" });
    } catch (err: any) {
      toast({ title: "Registration failed", description: err.message, variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="grid lg:grid-cols-2 min-h-screen">
        <div className="relative hidden lg:flex flex-col justify-center p-12 bg-primary/5">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-primary/5 to-transparent" />
          <div className="relative z-10 max-w-lg">
            <div className="flex items-center gap-3 mb-8">
              <div className="h-12 w-12 rounded-md bg-primary flex items-center justify-center">
                <Trophy className="h-7 w-7 text-primary-foreground" />
              </div>
              <h1 className="text-3xl font-bold tracking-tight">SportsHub</h1>
            </div>
            <h2 className="text-4xl font-bold tracking-tight mb-4">
              Every sport. Every league.{" "}
              <span className="text-primary">One place.</span>
            </h2>
            <p className="text-lg text-muted-foreground mb-10">
              Stop searching dozens of websites to find sports and activities for your kids.
              SportsHub brings all local leagues and registration dates to your fingertips.
            </p>

            <div className="space-y-6">
              <FeatureItem
                icon={<Search className="h-5 w-5" />}
                title="Discover Programs"
                description="Browse all local leagues and programs in one place"
              />
              <FeatureItem
                icon={<Users className="h-5 w-5" />}
                title="Track Your Kids"
                description="Add your children's ages, genders, and interests"
              />
              <FeatureItem
                icon={<Bell className="h-5 w-5" />}
                title="Get Notified"
                description="Receive alerts when sign-ups open for matched programs"
              />
              <FeatureItem
                icon={<MapPin className="h-5 w-5" />}
                title="Find Nearby"
                description="See what's available in your area at a glance"
              />
            </div>
          </div>
        </div>

        <div className="flex items-center justify-center p-6 lg:p-12">
          <div className="w-full max-w-md">
            <div className="flex items-center gap-3 mb-8 lg:hidden">
              <div className="h-10 w-10 rounded-md bg-primary flex items-center justify-center">
                <Trophy className="h-6 w-6 text-primary-foreground" />
              </div>
              <h1 className="text-2xl font-bold tracking-tight">SportsHub</h1>
            </div>

            <Tabs defaultValue="login" className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger value="login" data-testid="tab-login">Sign In</TabsTrigger>
                <TabsTrigger value="register" data-testid="tab-register">Create Account</TabsTrigger>
              </TabsList>

              <TabsContent value="login">
                <Card>
                  <CardHeader>
                    <CardTitle>Welcome back</CardTitle>
                    <CardDescription>Sign in to your SportsHub account</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleLogin} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="login-username">Username</Label>
                        <Input
                          id="login-username"
                          data-testid="input-login-username"
                          value={loginForm.username}
                          onChange={(e) => setLoginForm({ ...loginForm, username: e.target.value })}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="login-password">Password</Label>
                        <Input
                          id="login-password"
                          data-testid="input-login-password"
                          type="password"
                          value={loginForm.password}
                          onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                          required
                        />
                      </div>
                      <Button
                        type="submit"
                        className="w-full"
                        data-testid="button-login"
                        disabled={isSubmitting}
                      >
                        {isSubmitting ? "Signing in..." : "Sign In"}
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    </form>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="register">
                <Card>
                  <CardHeader>
                    <CardTitle>Create your account</CardTitle>
                    <CardDescription>Join SportsHub to find the best programs for your kids</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleRegister} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="reg-username">Username</Label>
                        <Input
                          id="reg-username"
                          data-testid="input-register-username"
                          value={registerForm.username}
                          onChange={(e) => setRegisterForm({ ...registerForm, username: e.target.value })}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="reg-email">Email</Label>
                        <Input
                          id="reg-email"
                          data-testid="input-register-email"
                          type="email"
                          value={registerForm.email}
                          onChange={(e) => setRegisterForm({ ...registerForm, email: e.target.value })}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="reg-zip">Zip Code</Label>
                        <Input
                          id="reg-zip"
                          data-testid="input-register-zipcode"
                          value={registerForm.zipCode}
                          onChange={(e) => setRegisterForm({ ...registerForm, zipCode: e.target.value })}
                          placeholder="e.g., 90210"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="reg-password">Password</Label>
                        <Input
                          id="reg-password"
                          data-testid="input-register-password"
                          type="password"
                          value={registerForm.password}
                          onChange={(e) => setRegisterForm({ ...registerForm, password: e.target.value })}
                          required
                        />
                      </div>
                      <Button
                        type="submit"
                        className="w-full"
                        data-testid="button-register"
                        disabled={isSubmitting}
                      >
                        {isSubmitting ? "Creating account..." : "Create Account"}
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    </form>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
}

function FeatureItem({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="flex items-start gap-4">
      <div className="flex-shrink-0 h-10 w-10 rounded-md bg-primary/10 flex items-center justify-center text-primary">
        {icon}
      </div>
      <div>
        <h3 className="font-semibold mb-0.5">{title}</h3>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
    </div>
  );
}
