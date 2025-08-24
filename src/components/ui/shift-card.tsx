import { Card, CardContent } from "@/components/ui/card";
import { useTranslation } from "react-i18next";
import type { ShiftSales } from "@/types";
import { format } from "date-fns";

interface ShiftCardProps {
  shift: ShiftSales;
  staffName?: string;
}

export function ShiftCard({ shift, staffName }: ShiftCardProps) {
  const { t } = useTranslation();
  
const totalSales = shift.totalSales || 0;
const cashSales = shift.cashSales || 0;
const creditSales = shift.creditSales || 0;
const upiSales = shift.upiSales || 0;
const cardSales = shift.cardSales || 0;

  const formatCurrency = (amount: number) => {
    return `₹${amount.toLocaleString()}`;
  };

  const formatShiftTime = (startTime: string | Date, endTime: string | Date) => {
    const start = new Date(startTime);
    const end = new Date(endTime);
    return `${format(start, 'h:mm a')} - ${format(end, 'h:mm a')}`;
  };

  return (
    <Card className="shadow-sm border border-gray-200" data-testid={`shift-card-${shift.id}`}>
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div>
            <span className="font-medium text-sm" data-testid={`shift-time-${shift.id}`}>
              {format(new Date(shift.shiftDate), 'MMM dd, yyyy')} • {formatShiftTime(shift.startTime, shift.endTime)}
            </span>
            {staffName && (
              <p className="text-xs text-gray-500" data-testid={`shift-manager-${shift.id}`}>
                {t("dataEntry.manager")}: {staffName}
              </p>
            )}
          </div>
          <span className="text-lg font-bold text-primary" data-testid={`shift-total-${shift.id}`}>
            {formatCurrency(totalSales)}
          </span>
        </div>
        
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-600">{t("common.cash")}</span>
            <span data-testid={`shift-cash-${shift.id}`}>{formatCurrency(cashSales)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">{t("common.credit")}</span>
            <span data-testid={`shift-credit-${shift.id}`}>{formatCurrency(creditSales)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">{t("common.upi")}</span>
            <span data-testid={`shift-upi-${shift.id}`}>{formatCurrency(upiSales)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">{t("common.card")}</span>
            <span data-testid={`shift-card-${shift.id}`}>{formatCurrency(cardSales)}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
