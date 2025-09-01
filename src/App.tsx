import { useEffect } from "react";
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
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useNavigate,
  useLocation,
} from "react-router-dom";

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
  const { user, isAuthenticated, isLoading } = useAuth();
  const { manager, isManagerAuthenticated, isLoading: managerLoading } = useManagerAuth();
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();

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
  const showSetup = isAuthenticated && !outletLoading && !retailOutlet;

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

  if (showSetup) {
    return <Setup onComplete={() => window.location.reload()} />;
  }

  const pageToRoute: Record<string, string> = {
    dashboard: "/dashboard",
    dataEntry: "/data-entry",
    staffManagement: "/staff-management",
    reports: "/reports",
    roDetails: "/ro-details",
    products: "/products",
    tankManagement: "/tank-management",
    dispensingUnits: "/dispensing-units",
    settings: "/settings",
    shift: "/shift",
    readings: "/readings",
    stock: "/stock",
    summary: "/summary",
    // Manager routes (if needed)
    managerShift: "/manager/shift",
    managerReadings: "/manager/readings",
    managerStock: "/manager/stock",
    managerSummary: "/manager/summary",
    managerDataEntry: "/manager/data-entry",
    managerReports: "/manager/reports",
  };

  return (
    <div className="max-w-md mx-auto bg-white min-h-screen relative">
      <header className="bg-primary text-white p-4 flex items-center justify-between shadow-md">
        <SideMenu
          onNavigate={(page) => {
            const route = pageToRoute[page] || "/dashboard";
            navigate(route);
          }}
        />
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
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/data-entry" element={<DataEntry />} />
          <Route path="/staff-management" element={<StaffManagement />} />
          <Route path="/reports" element={<Reports />} />
          <Route
            path="/ro-details"
            element={<RODetailsPage onBack={() => navigate("/dashboard")} />}
          />
          <Route
            path="/products"
            element={<ProductsPage onBack={() => navigate("/dashboard")} />}
          />
          <Route
            path="/tank-management"
            element={<TankManagementPage onBack={() => navigate("/dashboard")} />}
          />
          <Route
            path="/dispensing-units"
            element={<DispensingUnitsPage onBack={() => navigate("/dashboard")} />}
          />
          <Route
            path="/settings"
            element={<SettingsPage onBack={() => navigate("/dashboard")} />}
          />
          <Route path="/shift" element={<ShiftPage />} />
          <Route path="/readings" element={<ReadingsPage />} />
          <Route path="/stock" element={<StockPage />} />
          <Route path="/summary" element={<SummaryPage />} />
          {/* Manager routes */}
          {isManagerAuthenticated && !isAuthenticated && (
            <>
              <Route path="/manager/shift" element={<ShiftPage />} />
              <Route path="/manager/readings" element={<ReadingsPage />} />
              <Route path="/manager/stock" element={<StockPage />} />
              <Route path="/manager/summary" element={<SummaryPage />} />
              <Route path="/manager/data-entry" element={<DataEntry />} />
              <Route path="/manager/reports" element={<Reports />} />
              <Route path="/manager/*" element={<Navigate to="/manager/shift" />} />
            </>
          )}
          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </main>

      <BottomNavigation
        currentPage={location.pathname}
        onNavigate={(page) => {
          const route = pageToRoute[page] || "/dashboard";
          navigate(route);
        }}
      />
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <ShiftProvider>
          <Toaster />
          <Router>
            <MainApp />
          </Router>
        </ShiftProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;