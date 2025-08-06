import { Clock, Gauge, Package, Droplets, Warehouse, BarChart3, Users, ClipboardList, Home } from "lucide-react";
import { cn } from "@/lib/utils";

interface BottomNavigationProps {
  currentPage: string | null;
  onNavigate: (page: string) => void;
  userType?: "dealer" | "manager";
}

export function BottomNavigation({ currentPage, onNavigate, userType = "dealer" }: BottomNavigationProps) {
  const managerNavItems = [
    {
      id: "shift",
      label: "Shift",
      icon: Clock,
    },
    {
      id: "readings",
      label: "Readings",
      icon: Gauge,
    },
    {
      id: "stock",
      label: "Stock",
      icon: Package,
    },
    {
      id: "inventory",
      label: "Inventory",
      icon: Warehouse,
    },
  ];

  const dealerNavItems = [
    {
      id: "dashboard",
      label: "Dashboard",
      icon: Home,
    },
    {
      id: "dataEntry",
      label: "Data Entry",
      icon: ClipboardList,
    },
    {
      id: "staff",
      label: "Staff",
      icon: Users,
    },
    {
      id: "reports",
      label: "Reports",
      icon: BarChart3,
    },
  ];

  const navItems = userType === "manager" ? managerNavItems : dealerNavItems;

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 safe-area-padding-bottom z-50">
      <div className="grid grid-cols-4 h-16">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentPage === item.id;
          
          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={cn(
                "flex flex-col items-center justify-center space-y-1 transition-colors",
                isActive 
                  ? "text-primary bg-primary/5" 
                  : "text-gray-600 hover:text-primary hover:bg-gray-50"
              )}
              data-testid={`nav-${item.id}`}
            >
              <Icon className="h-5 w-5" />
              <span className="text-xs font-medium truncate">{item.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}