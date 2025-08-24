import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/hooks/useAuth";
import { ArrowLeft, Settings, Languages, DollarSign, Shield, Fuel, LogOut } from "lucide-react";
import { useEffect } from "react";
import type { SettingsData } from "@/types";

interface SettingsPageProps {
  onBack: () => void;
}

export default function SettingsPage({ onBack }: SettingsPageProps) {
  const { t, i18n } = useTranslation();
  const { toast } = useToast();
  const { user, logout } = useAuth();
  const queryClient = useQueryClient();

  const [fuelPrices, setFuelPrices] = useState({
    petrolPrice: 0,
    dieselPrice: 0,
    cngPrice: 0,
  });

  const [appSettings, setAppSettings] = useState({
    enableNotifications: true,
    autoBackup: true,
    showLowStockAlerts: true,
    requireShiftConfirmation: true,
  });

  
  // const { data: settings, isLoading } = useQuery({
  //   queryKey: ["/api/settings"],
  //   onSuccess: (data) => {
  //     if (data?.fuelPrices) {
  //       setFuelPrices(data.fuelPrices);
  //     }
  //     if (data?.appSettings) {
  //       setAppSettings(data.appSettings);
  //     }
  //   },
  // });

  const { data: settings, isLoading } = useQuery<SettingsData>({
    queryKey: ["/api/settings"],
  });

  useEffect(() => {
    if (settings?.fuelPrices) {
      setFuelPrices(settings.fuelPrices);
    }
    if (settings?.appSettings) {
      setAppSettings(settings.appSettings);
    }
  }, [settings]);



  const updateSettingsMutation = useMutation({
    mutationFn: async (data: any) => {
      return apiRequest("/api/settings", {
        method: "PATCH",
        body: data,
      });
    },
    onSuccess: () => {
      toast({
        title: t("common.success"),
        description: t("settings.updateSuccess"),
      });
      queryClient.invalidateQueries({ queryKey: ["/api/settings"] });
    },
    onError: (error) => {
      toast({
        title: t("common.error"),
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleLanguageChange = (language: string) => {
    i18n.changeLanguage(language);
    localStorage.setItem('language', language);
    toast({
      title: t("common.success"),
      description: t("settings.languageChanged"),
    });
  };

  const handleFuelPriceUpdate = () => {
    updateSettingsMutation.mutate({
      fuelPrices,
    });
  };

  const handleAppSettingsUpdate = () => {
    updateSettingsMutation.mutate({
      appSettings,
    });
  };

  const handleLogout = () => {
    logout();
  };

  if (isLoading) {
    return (
      <div className="p-4">
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          <div className="h-20 bg-gray-200 rounded"></div>
          <div className="h-20 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 pb-20">
      {/* Header */}
      <div className="flex items-center mb-6">
        <Button
          variant="ghost"
          size="icon"
          onClick={onBack}
          className="mr-3"
          data-testid="back-button"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-xl font-semibold" data-testid="page-title">
          {t("menu.settings")}
        </h1>
      </div>

      <div className="space-y-6">
        {/* Language Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Languages className="h-5 w-5 mr-2 text-primary" />
              {t("settings.language")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Label>{t("settings.selectLanguage")}</Label>
              <Select value={i18n.language} onValueChange={handleLanguageChange}>
                <SelectTrigger data-testid="select-language">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="en">English</SelectItem>
                  <SelectItem value="hi">हिंदी (Hindi)</SelectItem>
                  <SelectItem value="kn">ಕನ್ನಡ (Kannada)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Fuel Prices */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <DollarSign className="h-5 w-5 mr-2 text-primary" />
              {t("settings.fuelPrices")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="petrolPrice">{t("settings.petrolPrice")} (₹/L)</Label>
                  <Input
                    id="petrolPrice"
                    type="number"
                    step="0.01"
                    value={fuelPrices.petrolPrice}
                    onChange={(e) => setFuelPrices({
                      ...fuelPrices,
                      petrolPrice: parseFloat(e.target.value) || 0
                    })}
                    data-testid="input-petrol-price"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="dieselPrice">{t("settings.dieselPrice")} (₹/L)</Label>
                  <Input
                    id="dieselPrice"
                    type="number"
                    step="0.01"
                    value={fuelPrices.dieselPrice}
                    onChange={(e) => setFuelPrices({
                      ...fuelPrices,
                      dieselPrice: parseFloat(e.target.value) || 0
                    })}
                    data-testid="input-diesel-price"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cngPrice">{t("settings.cngPrice")} (₹/Kg)</Label>
                  <Input
                    id="cngPrice"
                    type="number"
                    step="0.01"
                    value={fuelPrices.cngPrice}
                    onChange={(e) => setFuelPrices({
                      ...fuelPrices,
                      cngPrice: parseFloat(e.target.value) || 0
                    })}
                    data-testid="input-cng-price"
                  />
                </div>
              </div>
              <Button
                onClick={handleFuelPriceUpdate}
                disabled={updateSettingsMutation.isPending}
                className="w-full"
                data-testid="update-fuel-prices-button"
              >
                {updateSettingsMutation.isPending ? t("common.saving") : t("settings.updatePrices")}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* App Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Settings className="h-5 w-5 mr-2 text-primary" />
              {t("settings.appSettings")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="enableNotifications">{t("settings.enableNotifications")}</Label>
                  <p className="text-sm text-gray-600">{t("settings.enableNotificationsDesc")}</p>
                </div>
                <Switch
                  id="enableNotifications"
                  checked={appSettings.enableNotifications}
                  onCheckedChange={(checked) => setAppSettings({
                    ...appSettings,
                    enableNotifications: checked
                  })}
                  data-testid="switch-notifications"
                />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="autoBackup">{t("settings.autoBackup")}</Label>
                  <p className="text-sm text-gray-600">{t("settings.autoBackupDesc")}</p>
                </div>
                <Switch
                  id="autoBackup"
                  checked={appSettings.autoBackup}
                  onCheckedChange={(checked) => setAppSettings({
                    ...appSettings,
                    autoBackup: checked
                  })}
                  data-testid="switch-auto-backup"
                />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="showLowStockAlerts">{t("settings.showLowStockAlerts")}</Label>
                  <p className="text-sm text-gray-600">{t("settings.showLowStockAlertsDesc")}</p>
                </div>
                <Switch
                  id="showLowStockAlerts"
                  checked={appSettings.showLowStockAlerts}
                  onCheckedChange={(checked) => setAppSettings({
                    ...appSettings,
                    showLowStockAlerts: checked
                  })}
                  data-testid="switch-low-stock-alerts"
                />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="requireShiftConfirmation">{t("settings.requireShiftConfirmation")}</Label>
                  <p className="text-sm text-gray-600">{t("settings.requireShiftConfirmationDesc")}</p>
                </div>
                <Switch
                  id="requireShiftConfirmation"
                  checked={appSettings.requireShiftConfirmation}
                  onCheckedChange={(checked) => setAppSettings({
                    ...appSettings,
                    requireShiftConfirmation: checked
                  })}
                  data-testid="switch-shift-confirmation"
                />
              </div>

              <Button
                onClick={handleAppSettingsUpdate}
                disabled={updateSettingsMutation.isPending}
                className="w-full"
                data-testid="update-app-settings-button"
              >
                {updateSettingsMutation.isPending ? t("common.saving") : t("settings.updateSettings")}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Account Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Shield className="h-5 w-5 mr-2 text-primary" />
              {t("settings.account")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                {user?.profileImageUrl ? (
                  <img 
                    src={user.profileImageUrl} 
                    alt="Profile" 
                    className="w-10 h-10 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-10 h-10 bg-primary/20 rounded-full flex items-center justify-center">
                    <span className="text-sm font-medium text-primary">
                      {(user?.firstName || user?.email || "U").charAt(0).toUpperCase()}
                    </span>
                  </div>
                )}
                <div>
                  <p className="font-medium">{user?.firstName || user?.email}</p>
                  <p className="text-sm text-gray-600">{user?.email}</p>
                </div>
              </div>

              <Separator />

              <Button
                variant="destructive"
                onClick={handleLogout}
                className="w-full"
                data-testid="logout-button"
              >
                <LogOut className="h-4 w-4 mr-2" />
                {t("settings.logout")}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}