import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ShiftPageProps {
  onBack?: () => void;
}

export default function ShiftPage({ onBack }: ShiftPageProps) {
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
            Shift Management
          </h1>
        </div>
      </div>

      <div className="p-4">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-lg font-semibold mb-4">Current Shift</h2>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="text-sm font-medium text-gray-600">Shift Start</h3>
                <p className="text-lg font-semibold" data-testid="shift-start">
                  Not Started
                </p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="text-sm font-medium text-gray-600">Duration</h3>
                <p className="text-lg font-semibold" data-testid="shift-duration">
                  --:--
                </p>
              </div>
            </div>
            
            <div className="flex space-x-3">
              <Button className="flex-1" data-testid="start-shift">
                Start Shift
              </Button>
              <Button variant="outline" className="flex-1" disabled data-testid="end-shift">
                End Shift
              </Button>
            </div>
          </div>
        </div>

        <div className="mt-6 bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-lg font-semibold mb-4">Recent Shifts</h2>
          <div className="space-y-3">
            <div className="text-center text-gray-500 py-8" data-testid="no-shifts">
              No shift records found
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}