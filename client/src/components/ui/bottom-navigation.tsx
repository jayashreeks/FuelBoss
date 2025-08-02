import { cn } from "@/lib/utils";
import { BarChart3, Edit, Gauge, Users } from "lucide-react";
import { useTranslation } from "react-i18next";

interface BottomNavigationProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export function BottomNavigation({ activeTab, onTabChange }: BottomNavigationProps) {
  const { t } = useTranslation();

  const tabs = [
    {
      id: "dashboard",
      label: t("navigation.dashboard"),
      icon: Gauge,
    },
    {
      id: "dataEntry",
      label: t("navigation.dataEntry"),
      icon: Edit,
    },
    {
      id: "staff",
      label: t("navigation.staff"),
      icon: Users,
    },
    {
      id: "reports",
      label: t("navigation.reports"),
      icon: BarChart3,
    },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-white border-t border-gray-200 px-4 py-2 shadow-lg z-50">
      <div className="flex items-center justify-around">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={cn(
                "flex flex-col items-center py-2 px-3 transition-colors",
                isActive ? "text-primary" : "text-gray-600"
              )}
              data-testid={`nav-${tab.id}`}
            >
              <Icon className="text-lg mb-1 h-5 w-5" />
              <span className="text-xs">{tab.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
