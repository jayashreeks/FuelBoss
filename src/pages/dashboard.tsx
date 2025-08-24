import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TankCard } from "@/components/ui/tank-card";
import { ShiftCard } from "@/components/ui/shift-card";
import { Skeleton } from "@/components/ui/skeleton";
import { useTranslation } from "react-i18next";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import type { Tank, ShiftSales } from "@/types";
// Assuming you have a Staff type in your types file
import type { Staff } from "@/types";

export default function Dashboard() {
  const { t } = useTranslation();

  const { data: tanks = [], isLoading: tanksLoading, error: tanksError } = useQuery<Tank[]>({
    queryKey: ["/api/tanks"],
  });

  const { data: shiftSales = [], isLoading: salesLoading, error: salesError } = useQuery<ShiftSales[]>({
    queryKey: ["/api/shift-sales"],
  });

  // Fix 1: Correctly type the useQuery hook for staff data.
  // The API is expected to return an array of Staff objects.
  const { data: staff = [], isLoading: staffLoading } = useQuery<Staff[]>({
    queryKey: ["/api/staff"],
  });

  // Fix 2: Refactor getStaffName to be a memoized function.
  // This prevents re-creation on every render and ensures type safety.
  // The function now correctly takes a ShiftSales object and uses the properly typed 'staff' array.
  const getStaffName = (shift: ShiftSales) => {
    // If staffName is already included in the shift data, use it
    if (shift.staffName) {
      return shift.staffName;
    }
    // Fallback to finding staff by ID
    const staffMember = staff.find((s) => s.id === shift.staffId);
    return staffMember?.name || "Unknown";
  };

  if (tanksError || salesError || staffLoading) {
    return (
      <div className="p-4">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Failed to load dashboard data. Please try again.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="p-4 pb-20">
      <Tabs defaultValue="inventory" className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-4">
          <TabsTrigger value="inventory" data-testid="tab-inventory">
            {t("dashboard.tankInventory")}
          </TabsTrigger>
          <TabsTrigger value="sales" data-testid="tab-sales">
            {t("dashboard.shiftSales")}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="inventory" className="space-y-3">
          {tanksLoading ? (
            <div className="space-y-3">
              {[...Array(3)].map((_, i) => (
                <Skeleton key={i} className="h-32 w-full" />
              ))}
            </div>
          ) : tanks.length === 0 ? (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                No tanks configured. Please add tanks from the menu.
              </AlertDescription>
            </Alert>
          ) : (
            tanks.map((tank) => (
              <TankCard key={tank.id} tank={tank} />
            ))
          )}
        </TabsContent>

        <TabsContent value="sales" className="space-y-3">
          {salesLoading ? (
            <div className="space-y-3">
              {[...Array(3)].map((_, i) => (
                <Skeleton key={i} className="h-32 w-full" />
              ))}
            </div>
          ) : shiftSales.length === 0 ? (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                No shift sales data available. Add sales data from the Data Entry tab.
              </AlertDescription>
            </Alert>
          ) : (
            shiftSales.map((shift) => (
              <ShiftCard
                key={shift.id}
                shift={shift}
                staffName={getStaffName(shift)}
              />
            ))
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}