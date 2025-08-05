import { useState } from "react";
import { ArrowLeft, Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import ShiftDateSelector from "@/components/ShiftDateSelector";

interface StockPageProps {
  onBack?: () => void;
}

export default function StockPage({ onBack }: StockPageProps) {
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
            Stock Management
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

        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow-sm p-4">
            <div className="flex items-center space-x-3">
              <Package className="h-8 w-8 text-primary" />
              <div>
                <h3 className="text-sm font-medium text-gray-600">Total Products</h3>
                <p className="text-xl font-semibold" data-testid="total-products">0</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-4">
            <div className="flex items-center space-x-3">
              <Package className="h-8 w-8 text-orange-500" />
              <div>
                <h3 className="text-sm font-medium text-gray-600">Low Stock</h3>
                <p className="text-xl font-semibold" data-testid="low-stock">0</p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-lg font-semibold mb-4">Stock Levels</h2>
          <div className="space-y-4">
            <div className="text-center text-gray-500 py-8" data-testid="no-stock">
              No stock data available
            </div>
            <Button className="w-full" data-testid="update-stock">
              Update Stock Levels
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}