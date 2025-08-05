import { ArrowLeft, Droplets, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

interface DensityPageProps {
  onBack?: () => void;
}

export default function DensityPage({ onBack }: DensityPageProps) {
  return (
    <div className="min-h-screen bg-surface pb-20">
      <div className="bg-primary text-white p-4">
        <div className="flex items-center justify-between">
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
              Density Testing
            </h1>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="text-white hover:bg-white/20"
            data-testid="add-density"
          >
            <Plus className="h-5 w-5" />
          </Button>
        </div>
      </div>

      <div className="p-4">
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4">Today's Tests</h2>
          <div className="space-y-4">
            <div className="text-center text-gray-500 py-8" data-testid="no-tests">
              No density tests recorded today
            </div>
            <Button className="w-full" data-testid="record-density">
              Record Density Test
            </Button>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-lg font-semibold mb-4">Test Guidelines</h2>
          <div className="space-y-3 text-sm text-gray-600">
            <div className="flex items-center space-x-3">
              <Droplets className="h-4 w-4 text-primary" />
              <span>Record density at 15°C temperature</span>
            </div>
            <div className="flex items-center space-x-3">
              <Droplets className="h-4 w-4 text-primary" />
              <span>Test each tank at least once per shift</span>
            </div>
            <div className="flex items-center space-x-3">
              <Droplets className="h-4 w-4 text-primary" />
              <span>Normal range: 0.72-0.78 g/ml</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}