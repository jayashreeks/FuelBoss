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
  pricePerLiter: string;
  isActive?: boolean | null;
  createdAt?: Date | null;
  updatedAt?: Date | null;
};

export type InsertProduct = {
  retailOutletId: string;
  name: string;
  pricePerLiter: string;
  isActive?: boolean | null;
};

export type Tank = {
  id: string;
  retailOutletId: string;
  productId: string;
  tankNumber: string;
  capacity: string;
  length: string;
  diameter: string;
  isActive?: boolean | null;
  createdAt?: Date | null;
  updatedAt?: Date | null;
  currentStock?: string;
  productName?: string;
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
  cashSales?: string | null;
  creditSales?: string | null;
  upiSales?: string | null;
  cardSales?: string | null;
  totalSales?: string | null;
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
  previousReading: string;
  currentReading: string;
  testing?: string | null;
  totalSale: string;
  cashSales?: string | null;
  creditSales?: string | null;
  upiSales?: string | null;
  cardSales?: string | null;
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
  openingStock: string;
  receipt: string;
  invoiceValue: string;
  createdAt?: Date | null;
  updatedAt?: Date | null;
};
