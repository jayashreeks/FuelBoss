import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { useTranslation } from "react-i18next";
import { ReportData } from "@/types";

export default function Reports() {
  const { t } = useTranslation();

  const { data: stats, isLoading, error } = useQuery<ReportData>({
    queryKey: ["/api/sales-stats"],
  });

  const formatCurrency = (amount: number) => {
    return `₹${amount.toLocaleString()}`;
  };

  // Explicitly type the breakdown parameter to avoid errors
  const calculatePercentages = (breakdown: ReportData['paymentMethodBreakdown']) => {
    const total = breakdown.cash + breakdown.credit + breakdown.upi + breakdown.card;
    if (total === 0) return { cash: 0, credit: 0, upi: 0, card: 0 };
    
    return {
      cash: (breakdown.cash / total) * 100,
      credit: (breakdown.credit / total) * 100,
      upi: (breakdown.upi / total) * 100,
      card: (breakdown.card / total) * 100,
    };
  };

  if (error) {
    return (
      <div className="p-4">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Failed to load reports data. Please try again.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="p-4 pb-20 space-y-4">
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-48 w-full" />
      </div>
    );
  }

  // Calculate totals from arrays as defined in your types.ts
  const weeklyTotal = Array.isArray(stats?.weeklySales)
  ? stats.weeklySales.reduce((acc, sale) => acc + sale.total, 0)
  : 0;

  const monthlyTotal = Array.isArray(stats?.monthlySales)
  ? stats.monthlySales.reduce((acc, sale) => acc + sale.total, 0)
  : 0;

  // Check if stats and paymentMethodBreakdown exist before calculating percentages
  const percentages = stats && stats.paymentMethodBreakdown ? calculatePercentages(stats.paymentMethodBreakdown) : null;
  const hasBreakdownData = stats && Object.values(stats.paymentMethodBreakdown).some(value => value > 0);

  return (
    <div className="p-4 pb-20">
      <h3 className="font-medium text-lg mb-4" data-testid="reports-title">
        {t("reports.title")}
      </h3>

      <div className="space-y-4">
        <Card className="shadow-sm border border-gray-200">
          <CardHeader>
            <CardTitle className="text-base font-medium" data-testid="sales-overview-title">
              {t("reports.salesOverview")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4 text-center">
              <div>
                <p className="text-2xl font-bold text-primary" data-testid="weekly-sales">
                  {formatCurrency(weeklyTotal)}
                </p>
                <p className="text-sm text-gray-600">{t("reports.thisWeek")}</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-secondary" data-testid="monthly-sales">
                  {formatCurrency(monthlyTotal)}
                </p>
                <p className="text-sm text-gray-600">{t("reports.thisMonth")}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm border border-gray-200">
          <CardHeader>
            <CardTitle className="text-base font-medium" data-testid="payment-methods-title">
              {t("reports.paymentMethods")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {!hasBreakdownData ? (
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  No sales data available for payment method breakdown.
                </AlertDescription>
              </Alert>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">{t("common.upi")}</span>
                  <div className="flex items-center space-x-2">
                    <Progress value={percentages?.upi} className="w-20 h-2" data-testid="progress-upi" />
                    <span className="text-sm font-medium w-10 text-right" data-testid="percentage-upi">
                      {percentages?.upi.toFixed(0)}%
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">{t("common.cash")}</span>
                  <div className="flex items-center space-x-2">
                    <Progress value={percentages?.cash} className="w-20 h-2" data-testid="progress-cash" />
                    <span className="text-sm font-medium w-10 text-right" data-testid="percentage-cash">
                      {percentages?.cash.toFixed(0)}%
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">{t("common.card")}</span>
                  <div className="flex items-center space-x-2">
                    <Progress value={percentages?.card} className="w-20 h-2" data-testid="progress-card" />
                    <span className="text-sm font-medium w-10 text-right" data-testid="percentage-card">
                      {percentages?.card.toFixed(0)}%
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">{t("common.credit")}</span>
                  <div className="flex items-center space-x-2">
                    <Progress value={percentages?.credit} className="w-20 h-2" data-testid="progress-credit" />
                    <span className="text-sm font-medium w-10 text-right" data-testid="percentage-credit">
                      {percentages?.credit.toFixed(0)}%
                    </span>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}