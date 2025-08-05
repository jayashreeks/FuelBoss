import { useState } from "react";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";

interface ShiftDateSelectorProps {
  selectedShiftType: 'morning' | 'evening' | 'night';
  selectedDate: string;
  onShiftTypeChange: (shiftType: 'morning' | 'evening' | 'night') => void;
  onDateChange: (date: string) => void;
}

export default function ShiftDateSelector({
  selectedShiftType,
  selectedDate,
  onShiftTypeChange,
  onDateChange,
}: ShiftDateSelectorProps) {
  return (
    <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
      <h2 className="text-lg font-semibold mb-4">Select Shift & Date</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="shift-type">Shift Type</Label>
          <Select 
            value={selectedShiftType} 
            onValueChange={onShiftTypeChange}
          >
            <SelectTrigger className="mt-1" data-testid="shift-type-select">
              <SelectValue placeholder="Select shift type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="morning">Morning Shift (6 AM - 2 PM)</SelectItem>
              <SelectItem value="evening">Evening Shift (2 PM - 10 PM)</SelectItem>
              <SelectItem value="night">Night Shift (10 PM - 6 AM)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="shift-date">Date</Label>
          <Input
            id="shift-date"
            type="date"
            value={selectedDate}
            onChange={(e) => onDateChange(e.target.value)}
            className="mt-1"
            data-testid="shift-date-select"
          />
        </div>
      </div>
    </div>
  );
}