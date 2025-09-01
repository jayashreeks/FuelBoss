import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Menu, 
  X, 
  Fuel, 
  Package,
  Truck, 
  Gauge as GaugeIcon, 
  Users, 
  Languages, 
  Settings,
  User,
  LogOut
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/hooks/useAuth";
import { useState } from "react";

interface SideMenuProps {
  onNavigate?: (page: string) => void; // <-- updated prop name
  currentUser?: any;
  userRole?: "dealer" | "manager";
}

export function SideMenu({ onNavigate, currentUser, userRole = "dealer" }: SideMenuProps) {
  const { t, i18n } = useTranslation();
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);
  
  const displayUser = currentUser || user;

  const handleLanguageChange = (language: string) => {
    i18n.changeLanguage(language);
    localStorage.setItem('language', language);
  };

  // Define menu items based on user role
  const dealerMenuItems = [
    {
      id: "roDetails",
      label: t("menu.roDetails"),
      icon: Fuel,
    },
    {
      id: "products",
      label: t("menu.products"),
      icon: Package,
    },
    {
      id: "tankManagement",
      label: t("menu.tankManagement"),
      icon: Truck,
    },
    {
      id: "dispensingUnits",
      label: t("menu.dispensingUnits"),
      icon: GaugeIcon,
    },
    {
      id: "settings",
      label: t("menu.settings"),
      icon: Settings,
    },
  ];

  const managerMenuItems = [
    {
      id: "dataEntry",
      label: "Data Entry",
      icon: Package,
    },
    {
      id: "reports",
      label: "Reports",
      icon: Users,
    },
  ];

  const menuItems = userRole === "manager" ? managerMenuItems : dealerMenuItems;

  const handleMenuItemClick = (itemId: string) => {
    onNavigate?.(itemId); // <-- use new prop name
    setOpen(false);
  };

  const handleLogout = async () => {
    if (userRole === "manager") {
      try {
        // Manager logout - clear session via API
        const API_BASE = import.meta.env.VITE_API_URL || '';
        await fetch(`${API_BASE}/api/manager/logout`, {
          method: "POST",
          headers: { "Content-Type": "application/json" }
        });
      } catch (error) {
        console.error("Logout error:", error);
      }
      window.location.href = "/login";
    } else {
      // Dealer logout via Google OAuth
      logout();
    }
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button 
          variant="outline" 
          size="icon" 
          className="bg-primary text-white border-primary hover:bg-primary/90 hover:text-white shadow-lg" 
          data-testid="menu-trigger"
        >
          <Menu className="h-5 w-5" />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-80 p-0">
        <div className="bg-primary text-white p-4">
          <SheetHeader>
            <div className="flex items-center justify-between">
              <div>
                <SheetTitle className="text-white font-medium" data-testid="user-name">
                  {displayUser?.name || 
                   (displayUser?.firstName && displayUser?.lastName 
                     ? `${displayUser.firstName} ${displayUser.lastName}` 
                     : displayUser?.email || "User")}
                </SheetTitle>
                <p className="text-sm opacity-90" data-testid="user-role">
                  {userRole === "manager" ? "Manager" : "Owner"}
                </p>
              </div>
            </div>
          </SheetHeader>
        </div>
        
        <nav className="p-4">
          <div className="space-y-2">
            {menuItems.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => handleMenuItemClick(item.id)}
                  className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-100 transition-colors w-full text-left"
                  data-testid={`menu-${item.id}`}
                >
                  <Icon className="text-secondary w-5 h-5" />
                  <span>{item.label}</span>
                </button>
              );
            })}
            
            <div className="pt-4 border-t">
              <button
                onClick={handleLogout}
                className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-100 transition-colors w-full text-left text-red-600"
                data-testid="menu-logout"
              >
                <LogOut className="w-5 h-5" />
                <span>{t("menu.logout")}</span>
              </button>
            </div>
            
            <div className="pt-4 border-t">
              <div className="flex items-center space-x-3 p-3">
                <Languages className="text-secondary w-5 h-5" />
                <div className="flex-1">
                  <span className="text-sm font-medium">{t("menu.languageSettings")}</span>
                  <Select
                    value={i18n.language}
                    onValueChange={handleLanguageChange}
                  >
                    <SelectTrigger className="mt-1" data-testid="language-selector">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="en">English</SelectItem>
                      <SelectItem value="hi">हिन्दी</SelectItem>
                      <SelectItem value="kn">ಕನ್ನಡ</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </div>
        </nav>
      </SheetContent>
    </Sheet>
  );
}
