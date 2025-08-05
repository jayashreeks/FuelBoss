import { createContext, useContext, useState, ReactNode } from 'react';

type ShiftType = 'morning' | 'evening' | 'night';

interface ShiftContextType {
  selectedShiftType: ShiftType;
  selectedDate: string;
  setSelectedShiftType: (shiftType: ShiftType) => void;
  setSelectedDate: (date: string) => void;
}

const ShiftContext = createContext<ShiftContextType | undefined>(undefined);

export const useShiftContext = () => {
  const context = useContext(ShiftContext);
  if (context === undefined) {
    throw new Error('useShiftContext must be used within a ShiftProvider');
  }
  return context;
};

interface ShiftProviderProps {
  children: ReactNode;
}

export const ShiftProvider = ({ children }: ShiftProviderProps) => {
  const [selectedShiftType, setSelectedShiftType] = useState<ShiftType>('morning');
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );

  return (
    <ShiftContext.Provider
      value={{
        selectedShiftType,
        selectedDate,
        setSelectedShiftType,
        setSelectedDate,
      }}
    >
      {children}
    </ShiftContext.Provider>
  );
};