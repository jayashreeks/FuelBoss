import { useState, useEffect } from "react";
import { Switch, Route } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/useAuth";
import { useQuery } from "@tanstack/react-query";
import { BottomNavigation } from "@/components/ui/bottom-navigation";
import { SideMenu } from "@/components/ui/side-menu";
import { useTranslation } from "react-i18next";
import "./lib/i18n";

// Pages
import Landing from "@/pages/landing";
import Dashboard from "@/pages/dashboard";
import DataEntry from "@/pages/data-entry";
import StaffManagement from "@/pages/staff-management";
import Reports from "@/pages/reports";
import Setup from "@/pages/setup";
import NotFound from "@/pages/not-found";
import RODetailsPage from "@/pages/ro-details";
import TankManagementPage from "@/pages/tank-management";
import DispensingUnitsPage from "@/pages/dispensing-units";
import ManagerAccessPage from "@/pages/manager-access";
import SettingsPage from "@/pages/settings";

function MainApp() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const { t, i18n } = useTranslation();
  const [activeTab, setActiveTab] = useState("dashboard");
  const [showSetup, setShowSetup] = useState(false);
  const [currentPage, setCurrentPage] = useState<string | null>(null);

  // Check if user has retail outlet setup
  const { data: retailOutlet, isLoading: outletLoading } = useQuery({
    queryKey: ["/api/retail-outlet"],
    enabled: isAuthenticated && !!user,
    retry: false,
  });

  // Set language from user preference or localStorage
  useEffect(() => {
    const savedLanguage = localStorage.getItem('language') || user?.language || 'en';
    i18n.changeLanguage(savedLanguage);
  }, [user, i18n]);

  // Show setup if user is authenticated but no retail outlet
  useEffect(() => {
    if (isAuthenticated && !outletLoading && !retailOutlet) {
      setShowSetup(true);
    } else {
      setShowSetup(false);
    }
  }, [isAuthenticated, outletLoading, retailOutlet]);

  const handleSetupComplete = () => {
    setShowSetup(false);
  };

  const handleMenuItemClick = (item: string) => {
    console.log("Menu item clicked:", item);
    setCurrentPage(item);
  };

  const handleBackToMain = () => {
    setCurrentPage(null);
  };

  if (isLoading || (isAuthenticated && outletLoading)) {
    return (
      <div className="min-h-screen bg-surface flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">{t("common.loading")}</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Landing />;
  }

  if (showSetup) {
    return <Setup onComplete={handleSetupComplete} />;
  }

  const renderActiveContent = () => {
    // If a menu page is selected, show that instead of tab content
    if (currentPage) {
      switch (currentPage) {
        case "roDetails":
          return <RODetailsPage onBack={handleBackToMain} />;
        case "tankManagement":
          return <TankManagementPage onBack={handleBackToMain} />;
        case "dispensingUnits":
          return <DispensingUnitsPage onBack={handleBackToMain} />;
        case "managerAccess":
          return <ManagerAccessPage onBack={handleBackToMain} />;
        case "settings":
          return <SettingsPage onBack={handleBackToMain} />;
        default:
          return <Dashboard />;
      }
    }

    // Otherwise show tab-based content
    switch (activeTab) {
      case "dashboard":
        return <Dashboard />;
      case "dataEntry":
        return <DataEntry />;
      case "staff":
        return <StaffManagement />;
      case "reports":
        return <Reports />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="max-w-md mx-auto bg-white min-h-screen relative">
      {/* Header */}
      <header className="bg-primary text-white p-4 flex items-center justify-between shadow-md">
        <SideMenu onMenuItemClick={handleMenuItemClick} />
        <div className="flex flex-col items-center">
          <h1 className="text-lg font-medium" data-testid="app-header-title">
            {t("app.name")}
          </h1>
          <span className="text-xs opacity-90" data-testid="app-header-subtitle">
            {retailOutlet?.name || "Petrol Pump"}
          </span>
        </div>
        <div className="flex items-center space-x-2">
          <button className="text-sm bg-white/20 px-2 py-1 rounded" data-testid="language-indicator">
            <span>{i18n.language.toUpperCase()}</span>
          </button>
          <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
            {user?.profileImageUrl ? (
              <img 
                src={user.profileImageUrl} 
                alt="Profile" 
                className="w-8 h-8 rounded-full object-cover"
                data-testid="user-avatar"
              />
            ) : (
              <div className="text-sm" data-testid="user-avatar-fallback">
                {(user?.firstName || user?.email || "U").charAt(0).toUpperCase()}
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="min-h-screen bg-surface">
        {renderActiveContent()}
      </main>

      {/* Bottom Navigation - hide when viewing menu pages */}
      {!currentPage && (
        <BottomNavigation activeTab={activeTab} onTabChange={setActiveTab} />
      )}
    </div>
  );
}

function Router() {
  return (
    <Switch>
      <Route path="/" component={MainApp} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
