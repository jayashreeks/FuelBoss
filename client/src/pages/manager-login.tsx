import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Eye, EyeOff, AlertCircle, Building2, User } from "lucide-react";
import { useTranslation } from "react-i18next";
import { apiRequest } from "@/lib/queryClient";

const loginSchema = z.object({
  role: z.enum(["dealer", "manager"]),
  phoneNumber: z.string().min(1, "Phone number is required"),
  password: z.string().optional(),
}).refine((data) => {
  // Password is required for managers
  if (data.role === "manager") {
    return data.password && data.password.length > 0;
  }
  return true;
}, {
  message: "Password is required for managers",
  path: ["password"],
});

type LoginForm = z.infer<typeof loginSchema>;

export default function UnifiedLogin() {
  const { t } = useTranslation();
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      role: "dealer",
      phoneNumber: "",
      password: "",
    },
  });

  const selectedRole = form.watch("role");

  const onSubmit = async (data: LoginForm) => {
    setIsLoading(true);
    setError(null);
    
    try {
      if (data.role === "dealer") {
        // Redirect to Replit Auth for dealer login
        window.location.href = "/api/login";
      } else {
        // Manager login via API
        const response = await apiRequest("/api/manager/login", "POST", {
          phoneNumber: data.phoneNumber,
          password: data.password,
        });
        
        console.log("Manager login response:", response);
        
        if (response.success) {
          // Redirect to manager dashboard
          window.location.reload();
        } else {
          setError(response.message || "Invalid manager credentials");
        }
      }
    } catch (err: any) {
      setError(err.message || "Login failed. Please check your credentials.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold text-gray-900">
            FuelFlow Login
          </CardTitle>
          <CardDescription>
            Sign in to access your dashboard
          </CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="role"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Login as</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger data-testid="select-role">
                          <SelectValue placeholder="Select your role" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="dealer">
                          <div className="flex items-center space-x-2">
                            <Building2 className="h-4 w-4" />
                            <span>Dealer/Owner</span>
                          </div>
                        </SelectItem>
                        <SelectItem value="manager">
                          <div className="flex items-center space-x-2">
                            <User className="h-4 w-4" />
                            <span>Manager</span>
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="phoneNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      {selectedRole === "dealer" ? "Phone Number" : "Phone Number (Login ID)"}
                    </FormLabel>
                    <FormControl>
                      <Input 
                        placeholder={selectedRole === "dealer" 
                          ? "Enter your phone number" 
                          : "Enter manager phone number"
                        }
                        {...field} 
                        data-testid="input-phone-number"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {selectedRole === "manager" && (
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Password</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input 
                            type={showPassword ? "text" : "password"}
                            placeholder="Enter your password" 
                            {...field} 
                            data-testid="input-password"
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="absolute right-2 top-1/2 transform -translate-y-1/2 h-8 w-8"
                            onClick={() => setShowPassword(!showPassword)}
                            data-testid="toggle-password"
                          >
                            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </Button>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full bg-primary text-white"
                data-testid="button-login"
              >
                {isLoading ? "Signing in..." : `Sign in as ${selectedRole === "dealer" ? "Dealer" : "Manager"}`}
              </Button>
            </form>
          </Form>

          {selectedRole === "dealer" && (
            <div className="mt-4 p-3 bg-blue-50 rounded-lg">
              <p className="text-xs text-blue-700">
                Dealers will be redirected to secure authentication. Managers use credentials provided by the dealer.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}