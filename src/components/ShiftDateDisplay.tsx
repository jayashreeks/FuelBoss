interface ShiftDateDisplayProps {
  selectedShiftType: 'morning' | 'evening' | 'night';
  selectedDate: string;
}

const getShiftDisplayName = (shiftType: 'morning' | 'evening' | 'night') => {
  switch (shiftType) {
    case 'morning':
      return 'Morning Shift (6 AM - 2 PM)';
    case 'evening':
      return 'Evening Shift (2 PM - 10 PM)';
    case 'night':
      return 'Night Shift (10 PM - 6 AM)';
  }
};

export default function ShiftDateDisplay({
  selectedShiftType,
  selectedDate,
}: ShiftDateDisplayProps) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      weekday: 'short', 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
      <div className="text-xs text-blue-600 font-medium">
        Viewing data for: {getShiftDisplayName(selectedShiftType)} on {formatDate(selectedDate)}
      </div>
    </div>
  );
}