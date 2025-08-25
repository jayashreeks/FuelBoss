// Client-side types extracted from shared schema
// These types are used by the client components and pages

export type User = {
  id: string;
  email?: string | null;
  firstName?: string | null;
  lastName?: string | null;
  profileImageUrl?: string | null;
  role?: string | null;
  language?: string | null;
  createdAt?: Date | null;
  updatedAt?: Date | null;
};

export type Manager = {
  id: string;
  email?: string | null;
  firstName?: string | null;
  role?: string | null;
  profileImageUrl?: string | null;
  language?: string | null;
  // Add other manager-specific fields as needed
};

export type RetailOutlet = {
  id: string;
  ownerId: string;
  name: string;
  sapcode?: string | null;
  oilCompany?: string | null;
  address?: string | null;
  phoneNumber?: string | null;
  createdAt?: Date | null;
  updatedAt?: Date | null;
};

export type Product = {
  id: string;
  retailOutletId: string;
  name: string;
  pricePerLiter: number; // Changed from string to number
  isActive?: boolean | null;
  createdAt?: Date | null;
  updatedAt?: Date | null;
};

export type InsertProduct = {
  retailOutletId: string;
  name: string;
  pricePerLiter: number; // Changed from string to number
  isActive?: boolean | null;
};

export type Tank = {
  id: string;
  retailOutletId: string;
  productId: string;
  tankNumber: number; // Changed from string to number
  capacity: number; // Changed from string to number
  length: number; // Changed from string to number
  diameter: number; // Changed from string to number
  isActive?: boolean | null;
  createdAt?: Date | null;
  updatedAt?: Date | null;
  currentStock?: number; // Changed from string to number
  productName?: string;
  fuelType?: string; // Added to match the tank-card.tsx error
};

interface FuelPrices {
  petrolPrice: number;
  dieselPrice: number;
  cngPrice: number;
}

interface AppSettings {
  enableNotifications: boolean;
  autoBackup: boolean;
  showLowStockAlerts: boolean;
  requireShiftConfirmation: boolean;
}

export type SettingsData = {
  fuelPrices: FuelPrices;
  appSettings: AppSettings;
};

export type Staff = {
  id: string;
  retailOutletId: string;
  userId?: string | null;
  name: string;
  phoneNumber?: string | null;
  role: string;
  password?: string | null;
  isActive?: boolean | null;
  createdAt?: Date | null;
  updatedAt?: Date | null;
};

export type ShiftSales = {
  id: string;
  retailOutletId: string;
  staffId: string;
  shiftDate: Date;
  shiftType: string;
  startTime: Date;
  endTime: Date;
  cashSales?: number | null; // Changed from string to number
  creditSales?: number | null; // Changed from string to number
  upiSales?: number | null; // Changed from string to number
  cardSales?: number | null; // Changed from string to number
  totalSales?: number | null; // Changed from string to number
  notes?: string | null;
  createdAt?: Date | null;
  updatedAt?: Date | null;
};

export type DispensingUnit = {
  id: string;
  retailOutletId: string;
  name: string;
  numberOfNozzles: number;
  isActive?: boolean | null;
  createdAt?: Date | null;
  updatedAt?: Date | null;
};

export type Nozzle = {
  id: string;
  dispensingUnitId: string;
  tankId: string;
  nozzleNumber: number;
  calibrationValidUntil: Date;
  isActive?: boolean | null;
  createdAt?: Date | null;
  updatedAt?: Date | null;
};

export type NozzleReading = {
  id: string;
  retailOutletId: string;
  nozzleId: string;
  attendantId: string;
  shiftType: string;
  shiftDate: string;
  previousReading: number; // Changed from string to number
  currentReading: number; // Changed from string to number
  testing?: number | null; // Changed from string to number
  totalSale: number; // Changed from string to number
  cashSales?: number | null; // Changed from string to number
  creditSales?: number | null; // Changed from string to number
  upiSales?: number | null; // Changed from string to number
  cardSales?: number | null; // Changed from string to number
  createdAt?: Date | null;
  updatedAt?: Date | null;
};

export type Shift = {
  id: string;
  managerId: string;
  shiftType: "morning" | "evening" | "night";
  shiftDate?: string | null;
  startTime?: Date | null;
  endTime?: Date | null;
  status: "not-started" | "active" | "completed" | "submitted";
  productRates: Array<{
    productId: string;
    productName: string;
    rate: number;
    observedDensity?: number;
    observedTemperature?: number;
    densityAt15C?: number;
  }>;
  submittedAt?: Date | null;
  createdAt?: Date | null;
  updatedAt?: Date | null;
};

export type StockEntry = {
  id: string;
  retailOutletId: string;
  tankId: string;
  managerId: string;
  shiftType: "morning" | "evening" | "night";
  shiftDate: string;
  openingStock: number; // Changed from string to number
  receipt: number; // Changed from string to number
  invoiceValue: number; // Changed from string to number
  createdAt?: Date | null;
  updatedAt?: Date | null;
};

export interface ReportData {
  paymentMethodBreakdown: {
    cash: number;
    card: number;
    upi: number;
    credit: number;
  };
  weeklySales: Array<{ date: string; total: number }>;
  monthlySales: Array<{ month: string; total: number }>;
}