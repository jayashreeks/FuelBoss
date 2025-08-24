import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useTranslation } from "react-i18next";
import type { Tank } from "@/types";

interface TankCardProps {
  tank: Tank;
}

export function TankCard({ tank }: TankCardProps) {
  const { t } = useTranslation();
  
  const currentStock = parseFloat(tank.currentStock?.toString() || "0");
  const capacity = parseFloat(tank.capacity?.toString());
  const fillPercentage = (currentStock / capacity) * 100;
  
  const getStatusColor = () => {
    if (fillPercentage > 50) return "bg-success text-success";
    if (fillPercentage > 20) return "bg-warning text-warning";
    return "bg-error text-error";
  };
  
  const getStatusText = () => {
    if (fillPercentage > 50) return t("dashboard.normal");
    if (fillPercentage > 20) return t("dashboard.lowStock");
    return t("dashboard.empty");
  };

  const getProgressColor = () => {
    if (fillPercentage > 50) return "bg-success";
    if (fillPercentage > 20) return "bg-warning";
    return "bg-error";
  };

  const fuelTypeDisplay = {
    petrol: t("common.petrol"),
    diesel: t("common.diesel"),
    premium: t("common.premium"),
  };

  return (
    <Card className="shadow-sm border border-gray-200" data-testid={`tank-card-${tank.id}`}>
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2">
            <div className={cn("w-3 h-3 rounded-full", getStatusColor().split(" ")[0])} />
            <span className="font-medium text-sm" data-testid={`tank-fuel-type-${tank.id}`}>
              {fuelTypeDisplay[tank.fuelType as keyof typeof fuelTypeDisplay] || tank.fuelType}
            </span>
            <span className="text-xs text-gray-500" data-testid={`tank-number-${tank.id}`}>
              {tank.tankNumber}
            </span>
          </div>
          <Badge 
            variant="secondary" 
            className={cn("text-xs", getStatusColor().split(" ")[1])}
            data-testid={`tank-status-${tank.id}`}
          >
            {getStatusText()}
          </Badge>
        </div>
        
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">{t("dashboard.currentStock")}</span>
            <span className="font-medium" data-testid={`tank-current-stock-${tank.id}`}>
              {currentStock.toLocaleString()} L
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">{t("dashboard.capacity")}</span>
            <span data-testid={`tank-capacity-${tank.id}`}>
              {capacity.toLocaleString()} L
            </span>
          </div>
          
          <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
            <div 
              className={cn("h-2 rounded-full", getProgressColor())} 
              style={{ width: `${Math.min(fillPercentage, 100)}%` }}
              data-testid={`tank-progress-${tank.id}`}
            />
          </div>
          
          <div className="text-xs text-gray-500 text-right" data-testid={`tank-percentage-${tank.id}`}>
            {fillPercentage.toFixed(1)}% {t("dashboard.filled")}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
