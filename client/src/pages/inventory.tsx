import { useState } from "react";
import { ArrowLeft, Warehouse, TrendingUp, TrendingDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import ShiftDateSelector from "@/components/ShiftDateSelector";

interface InventoryPageProps {
  onBack?: () => void;
}

export default function InventoryPage({ onBack }: InventoryPageProps) {
  const [selectedShiftType, setSelectedShiftType] = useState<'morning' | 'evening' | 'night'>('morning');
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
  return (
    <div className="min-h-screen bg-surface pb-20">
      <div className="bg-primary text-white p-4">
        <div className="flex items-center space-x-3">
          {onBack && (
            <Button
              variant="ghost"
              size="icon"
              onClick={onBack}
              className="text-white hover:bg-white/20"
              data-testid="back-button"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
          )}
          <h1 className="text-xl font-semibold" data-testid="page-title">
            Inventory Overview
          </h1>
        </div>
      </div>

      <div className="p-4">
        <ShiftDateSelector
          selectedShiftType={selectedShiftType}
          selectedDate={selectedDate}
          onShiftTypeChange={setSelectedShiftType}
          onDateChange={setSelectedDate}
        />

        <div className="grid grid-cols-1 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow-sm p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Warehouse className="h-8 w-8 text-primary" />
                <div>
                  <h3 className="text-sm font-medium text-gray-600">Total Inventory</h3>
                  <p className="text-xl font-semibold" data-testid="total-inventory">0 L</p>
                </div>
              </div>
              <TrendingUp className="h-6 w-6 text-green-500" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4">Tank Status</h2>
          <div className="space-y-4">
            <div className="text-center text-gray-500 py-8" data-testid="no-tanks">
              No tanks configured
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-lg font-semibold mb-4">Recent Movements</h2>
          <div className="space-y-3">
            <div className="text-center text-gray-500 py-8" data-testid="no-movements">
              No recent inventory movements
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}