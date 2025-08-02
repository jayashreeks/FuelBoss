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
  User
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/hooks/useAuth";
import { useState } from "react";

interface SideMenuProps {
  onMenuItemClick?: (item: string) => void;
}

export function SideMenu({ onMenuItemClick }: SideMenuProps) {
  const { t, i18n } = useTranslation();
  const { user } = useAuth();
  const [open, setOpen] = useState(false);

  const handleLanguageChange = (language: string) => {
    i18n.changeLanguage(language);
    localStorage.setItem('language', language);
  };

  const menuItems = [
    {
      id: "roDetails",
      label: t("menu.roDetails"),
      icon: Fuel,
    },
    {
      id: "products",
      label: "Products",
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
      id: "managerAccess",
      label: t("menu.managerAccess"),
      icon: Users,
    },
    {
      id: "settings",
      label: t("menu.settings"),
      icon: Settings,
    },
  ];

  const handleMenuItemClick = (itemId: string) => {
    onMenuItemClick?.(itemId);
    setOpen(false);
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="text-white" data-testid="menu-trigger">
          <Menu className="h-5 w-5" />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-80 p-0">
        <div className="bg-primary text-white p-4">
          <SheetHeader>
            <div className="flex items-center justify-between">
              <div>
                <SheetTitle className="text-white font-medium" data-testid="user-name">
                  {user?.firstName || user?.email || "User"}
                </SheetTitle>
                <p className="text-sm opacity-90" data-testid="user-role">
                  {user?.role || "Owner"}
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
