import { useState, useEffect } from "react";
import { Switch, Route } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/useAuth";
import { useManagerAuth } from "@/hooks/useManagerAuth";
import { ShiftProvider } from "@/contexts/ShiftContext";
import { useQuery } from "@tanstack/react-query";
import { BottomNavigation } from "@/components/ui/bottom-navigation";
import { SideMenu } from "@/components/ui/side-menu";
import { useTranslation } from "react-i18next";
import "./lib/i18n";

// Pages
import Login from "@/pages/login";
import Dashboard from "@/pages/dashboard";
import DataEntry from "@/pages/data-entry";
import StaffManagement from "@/pages/staff-management";
import Reports from "@/pages/reports";
import Setup from "@/pages/setup";
import NotFound from "@/pages/not-found";
import RODetailsPage from "@/pages/ro-details";
import ProductsPage from "@/pages/products";
import TankManagementPage from "@/pages/tank-management";
import DispensingUnitsPage from "@/pages/dispensing-units";

import SettingsPage from "@/pages/settings";
import ShiftPage from "@/pages/shift";
import ReadingsPage from "@/pages/readings";
import StockPage from "@/pages/stock";
import DensityPage from "@/pages/density";
import InventoryPage from "@/pages/inventory";

function MainApp() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const { manager, isManagerAuthenticated, isLoading: managerLoading } = useManagerAuth();
  const { t, i18n } = useTranslation();
  const [activeTab, setActiveTab] = useState("dashboard");
  const [showSetup, setShowSetup] = useState(false);
  const [currentPage, setCurrentPage] = useState<string | null>(null);
  
  // Combined authentication state
  const isAnyUserAuthenticated = isAuthenticated || isManagerAuthenticated;
  const isLoadingAuth = isLoading || managerLoading;
  const currentUser = user || manager;

  // Check if user has retail outlet setup - only for dealers
  const { data: retailOutlet, isLoading: outletLoading } = useQuery({
    queryKey: ["/api/retail-outlet"],
    enabled: isAuthenticated && !!user, // Only dealers need retail outlet
    retry: false,
  });

  // Set language from user preference or localStorage
  useEffect(() => {
    const savedLanguage = localStorage.getItem('language') || currentUser?.language || 'en';
    i18n.changeLanguage(savedLanguage);
  }, [currentUser, i18n]);

  // Show setup if dealer is authenticated but no retail outlet
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

  if (isLoadingAuth || (isAuthenticated && outletLoading)) {
    return (
      <div className="min-h-screen bg-surface flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">{t("common.loading")}</p>
        </div>
      </div>
    );
  }

  if (!isAnyUserAuthenticated) {
    // Show login screen directly for all non-authenticated users
    return <Login />;
  }

  // Managers skip setup and go directly to their allowed functions
  if (isManagerAuthenticated && !isAuthenticated) {
    const renderManagerContent = () => {
      switch (currentPage) {
        case "shift":
          return <ShiftPage onBack={handleBackToMain} />;
        case "readings":
          return <ReadingsPage onBack={handleBackToMain} />;
        case "stock":
          return <StockPage onBack={handleBackToMain} />;

        case "inventory":
          return <InventoryPage onBack={handleBackToMain} />;
        case "dataEntry":
          return <DataEntry onBack={handleBackToMain} />;
        case "reports":
          return <Reports onBack={handleBackToMain} />;
        default:
          return (
            <div className="min-h-screen bg-surface pb-20">
              <div className="bg-primary text-white p-4">
                <div className="flex items-center justify-between">
                  <h1 className="text-xl font-semibold">Manager Dashboard</h1>
                  <SideMenu
                    currentUser={currentUser}
                    onMenuItemClick={handleMenuItemClick}
                    userRole="manager"
                  />
                </div>
              </div>
              <div className="p-4">
                <div className="bg-white rounded-lg shadow-sm p-6 text-center">
                  <h2 className="text-lg font-semibold mb-2">Welcome, {currentUser?.name || 'Manager'}</h2>
                  <p className="text-gray-600 mb-4">Use the navigation below to access your tools.</p>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h3 className="font-medium">Quick Actions</h3>
                      <p className="text-sm text-gray-600">Tap any option in the bottom menu</p>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h3 className="font-medium">Current Shift</h3>
                      <p className="text-sm text-gray-600">Not Started</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
      }
    };

    return (
      <div className="min-h-screen bg-surface">
        {renderManagerContent()}
        <BottomNavigation
          currentPage={currentPage}
          onNavigate={handleMenuItemClick}
        />
      </div>
    );
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
        case "products":
          return <ProductsPage onBack={handleBackToMain} />;
        case "tankManagement":
          return <TankManagementPage onBack={handleBackToMain} />;
        case "dispensingUnits":
          return <DispensingUnitsPage onBack={handleBackToMain} />;

        case "settings":
          return <SettingsPage onBack={handleBackToMain} />;
        case "shift":
          return <ShiftPage onBack={handleBackToMain} />;
        case "readings":
          return <ReadingsPage onBack={handleBackToMain} />;
        case "stock":
          return <StockPage onBack={handleBackToMain} />;
        case "inventory":
          return <InventoryPage onBack={handleBackToMain} />;
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
            {(retailOutlet as any)?.name || "Petrol Pump"}
          </span>
        </div>
        <div className="flex items-center space-x-2">
          <button className="text-sm bg-white/20 px-2 py-1 rounded" data-testid="language-indicator">
            <span>{i18n.language?.toUpperCase() || "EN"}</span>
          </button>
          <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
            {(user as any)?.profileImageUrl ? (
              <img 
                src={(user as any).profileImageUrl} 
                alt="Profile" 
                className="w-8 h-8 rounded-full object-cover"
                data-testid="user-avatar"
              />
            ) : (
              <div className="text-sm" data-testid="user-avatar-fallback">
                {((user as any)?.firstName || (user as any)?.email || "U").charAt(0).toUpperCase()}
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
        <ShiftProvider>
          <Toaster />
          <Router />
        </ShiftProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
