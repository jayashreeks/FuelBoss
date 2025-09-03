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

  // Define route objects for both user types
  // 💡 FIX: Updated route paths for manager
  const dealerRoutes = [
      { path: "/", component: Dashboard },
      { path: "/dashboard", component: Dashboard },
      { path: "/data-entry", component: DataEntry, props: { onNavigate: (page: string) => navigate(pageToRoute[page] || "/dashboard") } },
      { path: "/staff-management", component: StaffManagement },
      { path: "/reports", component: Reports },
      { path: "/ro-details", component: RODetailsPage, props: { onBack: () => navigate("/dashboard") } },
      { path: "/products", component: ProductsPage, props: { onBack: () => navigate("/dashboard") } },
      { path: "/tank-management", component: TankManagementPage, props: { onBack: () => navigate("/dashboard") } },
      { path: "/dispensing-units", component: DispensingUnitsPage, props: { onBack: () => navigate("/dashboard") } },
      { path: "/settings", component: SettingsPage, props: { onBack: () => navigate("/dashboard") } },
      { path: "/shift", component: ShiftPage, props: { onBack: () => navigate("/data-entry") } },
      { path: "/readings", component: ReadingsPage, props: { onBack: () => navigate("/data-entry") } },
      { path: "/stock", component: StockPage, props: { onBack: () => navigate("/data-entry") } },
      { path: "/summary", component: SummaryPage },
  ];
  
  const managerRoutes = [
      { path: "/", component: ShiftPage },
      { path: "/manager/shift", component: ShiftPage },
      { path: "/manager/readings", component: ReadingsPage },
      { path: "/manager/stock", component: StockPage },
      { path: "/manager/summary", component: SummaryPage },
  ];
  
  const routesToRender = isManagerAuthenticated ? managerRoutes : dealerRoutes;

  const currentUserType = isManagerAuthenticated ? 'manager' : 'dealer';

  const dealerPageToRoute: Record<string, string> = {
      dashboard: "/dashboard",
      dataEntry: "/data-entry",
      staff: "/staff-management",
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
  };
  
  // 💡 FIX: This maps manager's bottom nav IDs to the correct prefixed URLs
  const managerPageToRoute: Record<string, string> = {
      shift: "/manager/shift",
      readings: "/manager/readings",
      stock: "/manager/stock",
      summary: "/manager/summary",
  };
  
  const pageToRoute = isManagerAuthenticated ? managerPageToRoute : dealerPageToRoute;

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
          {routesToRender.map((route, index) => (
            <Route
              key={index}
              path={route.path}
              element={<route.component {...route.props} />}
            />
          ))}
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
         userType={currentUserType} 
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