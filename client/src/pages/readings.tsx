import { ArrowLeft, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import ShiftDateDisplay from "@/components/ShiftDateDisplay";
import { useShiftContext } from "@/contexts/ShiftContext";

interface ReadingsPageProps {
  onBack?: () => void;
}

export default function ReadingsPage({ onBack }: ReadingsPageProps) {
  const { selectedShiftType, selectedDate } = useShiftContext();
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
              Tank Readings
            </h1>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="text-white hover:bg-white/20"
            data-testid="add-reading"
          >
            <Plus className="h-5 w-5" />
          </Button>
        </div>
      </div>

      <div className="p-4">
        <ShiftDateDisplay
          selectedShiftType={selectedShiftType}
          selectedDate={selectedDate}
        />

        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-lg font-semibold mb-4">
            {selectedDate === new Date().toISOString().split('T')[0] ? "Today's" : "Selected Date"} Readings
          </h2>
          <div className="space-y-4">
            <div className="text-center text-gray-500 py-8" data-testid="no-readings">
              No readings recorded for {selectedShiftType} shift on {selectedDate}
            </div>
            <Button className="w-full" data-testid="record-reading">
              Record New Reading
            </Button>
          </div>
        </div>

        <div className="mt-6 bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-lg font-semibold mb-4">Recent Readings</h2>
          <div className="space-y-3">
            <div className="text-center text-gray-500 py-8" data-testid="no-recent-readings">
              No recent readings found
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}