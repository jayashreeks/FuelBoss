import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useTranslation } from "react-i18next";
import { Fuel } from "lucide-react";

export default function Landing() {
  const { t } = useTranslation();

  const handleLogin = () => {
    window.location.href = "/login";
  };

  return (
    <div className="min-h-screen bg-surface flex items-center justify-center p-4">
      <Card className="w-full max-w-md mx-auto shadow-lg">
        <CardHeader className="text-center pb-6">
          <div className="flex justify-center mb-4">
            <div className="bg-primary/10 p-3 rounded-full">
              <Fuel className="h-8 w-8 text-primary" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold text-primary" data-testid="app-title">
            {t("app.name")}
          </CardTitle>
          <p className="text-gray-600 text-sm" data-testid="app-tagline">
            {t("app.tagline")}
          </p>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="text-center">
              <h2 className="text-lg font-medium mb-2">Welcome to FuelFlow</h2>
              <p className="text-gray-600 text-sm mb-6">
                Manage your petrol pump operations on the go. Track inventory, sales, and staff efficiently.
              </p>
            </div>
            
            <Button 
              onClick={handleLogin} 
              className="w-full bg-primary hover:bg-primary/90 text-white py-3"
              data-testid="login-button"
            >
              Get Started
            </Button>
            
            <div className="text-center">
              <p className="text-xs text-gray-500">
                For petrol pump owners and managers
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
