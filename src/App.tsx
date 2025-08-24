import { useState, useEffect } from "react";
import { QueryClientProvider, useQuery } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/useAuth";
import { useManagerAuth } from "@/hooks/useManagerAuth";
import { ShiftProvider } from "@/contexts/ShiftContext";
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
import RODetailsPage from "@/pages/ro-details";
import ProductsPage from "@/pages/products";
import TankManagementPage from "@/pages/tank-management";
import DispensingUnitsPage from "@/pages/dispensing-units";
import SettingsPage from "@/pages/settings";
import ShiftPage from "@/pages/shift";
import ReadingsPage from "@/pages/readings";
import StockPage from "@/pages/stock";
import SummaryPage from "@/pages/summary";

// Types
import { User, Manager, RetailOutlet } from '@/types';

function MainApp() {
  // Use a type assertion to properly type the `user` and `manager` objects
  const { user, isAuthenticated, isLoading } = useAuth();
  const { manager, isManagerAuthenticated, isLoading: managerLoading } = useManagerAuth();
  const { t, i18n } = useTranslation();
  const [activeTab, setActiveTab] = useState("dashboard");
  const [showSetup, setShowSetup] = useState(false);
  const [currentPage, setCurrentPage] = useState<string | null>(null);

  // Correctly combine authentication state and determine the current user
  const isAnyUserAuthenticated = isAuthenticated || isManagerAuthenticated;
  const isLoadingAuth = isLoading || managerLoading;
  const currentUser: User | Manager | null = (isAuthenticated ? user : manager) as User | Manager | null;

  // Check if user has retail outlet setup - only for dealers
  const { data: retailOutlet, isLoading: outletLoading } = useQuery<RetailOutlet | null>({
    queryKey: ["/api/retail-outlet"],
    enabled: isAuthenticated && !!user,
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
    return <Login />;
  }

  if (isManagerAuthenticated && !isAuthenticated) {
    const renderManagerContent = () => {
      const managerPage = currentPage || "shift";

      switch (managerPage) {
        case "shift":
          return <ShiftPage />;
        case "readings":
          return <ReadingsPage />;
        case "stock":
          return <StockPage />;
        case "summary":
          return <SummaryPage />;
        case "dataEntry":
          return <DataEntry />;
        case "reports":
          return <Reports />;
        default:
          return <ShiftPage />;
      }
    };

    return (
      <div className="min-h-screen bg-surface">
        <div className="fixed top-4 left-4 z-50">
          <SideMenu onMenuItemClick={handleMenuItemClick} />
        </div>
        {renderManagerContent()}
        <BottomNavigation
          currentPage={currentPage || "shift"}
          onNavigate={handleMenuItemClick}
          userType="manager"
        />
      </div>
    );
  }

  if (showSetup) {
    return <Setup onComplete={handleSetupComplete} />;
  }

  const renderActiveContent = () => {
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
        case "summary":
          return <SummaryPage onBack={handleBackToMain} />;
        default:
          return <Dashboard />;
      }
    }

    switch (activeTab) {
      case "dashboard":
        return <Dashboard />;
      case "dataEntry":
        return <DataEntry onNavigate={handleMenuItemClick} />;
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
            <span>{i18n.language?.toUpperCase() || "EN"}</span>
          </button>
          <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
            {currentUser?.profileImageUrl ? (
              <img
                src={currentUser.profileImageUrl}
                alt="Profile"
                className="w-8 h-8 rounded-full object-cover"
                data-testid="user-avatar"
              />
            ) : (
              <div className="text-sm" data-testid="user-avatar-fallback">
                {(currentUser?.firstName || currentUser?.email || "U").charAt(0).toUpperCase()}
              </div>
            )}
          </div>
        </div>
      </header>

      <main className="min-h-screen bg-surface">
        {renderActiveContent()}
      </main>

      {!currentPage && (
        <BottomNavigation currentPage={activeTab} onNavigate={setActiveTab} userType="dealer" />
      )}
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <ShiftProvider>
          <Toaster />
          <MainApp />
        </ShiftProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;