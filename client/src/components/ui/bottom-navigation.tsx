import { Clock, Gauge, Package, Droplets, Warehouse } from "lucide-react";
import { cn } from "@/lib/utils";

interface BottomNavigationProps {
  currentPage: string | null;
  onNavigate: (page: string) => void;
}

export function BottomNavigation({ currentPage, onNavigate }: BottomNavigationProps) {
  const navItems = [
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