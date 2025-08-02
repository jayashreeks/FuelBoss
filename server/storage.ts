import {
  users,
  retailOutlets,
  tanks,
  dispensingUnits,
  staff,
  shiftSales,
  type User,
  type UpsertUser,
  type RetailOutlet,
  type InsertRetailOutlet,
  type Tank,
  type InsertTank,
  type DispensingUnit,
  type InsertDispensingUnit,
  type Staff,
  type InsertStaff,
  type ShiftSales,
  type InsertShiftSales,
} from "@shared/schema";
import { db } from "./db";
import { eq, and, desc, sql } from "drizzle-orm";

export interface IStorage {
  // User operations - mandatory for Replit Auth
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  
  // Retail Outlet operations
  getRetailOutletByOwnerId(ownerId: string): Promise<RetailOutlet | undefined>;
  createRetailOutlet(outlet: InsertRetailOutlet): Promise<RetailOutlet>;
  updateRetailOutlet(id: string, outlet: Partial<InsertRetailOutlet>): Promise<RetailOutlet>;
  
  // Tank operations
  getTanksByRetailOutletId(retailOutletId: string): Promise<Tank[]>;
  createTank(tank: InsertTank): Promise<Tank>;
  updateTank(id: string, tank: Partial<InsertTank>): Promise<Tank>;
  deleteTank(id: string): Promise<void>;
  
  // Dispensing Unit operations
  getDispensingUnitsByRetailOutletId(retailOutletId: string): Promise<DispensingUnit[]>;
  createDispensingUnit(unit: InsertDispensingUnit): Promise<DispensingUnit>;
  updateDispensingUnit(id: string, unit: Partial<InsertDispensingUnit>): Promise<DispensingUnit>;
  deleteDispensingUnit(id: string): Promise<void>;
  
  // Staff operations
  getStaffByRetailOutletId(retailOutletId: string): Promise<Staff[]>;
  createStaff(staffMember: InsertStaff): Promise<Staff>;
  updateStaff(id: string, staffMember: Partial<InsertStaff>): Promise<Staff>;
  deleteStaff(id: string): Promise<void>;
  
  // Shift Sales operations
  getShiftSalesByRetailOutletId(retailOutletId: string, limit?: number): Promise<ShiftSales[]>;
  createShiftSales(sales: InsertShiftSales): Promise<ShiftSales>;
  updateShiftSales(id: string, sales: Partial<InsertShiftSales>): Promise<ShiftSales>;
  getShiftSalesStats(retailOutletId: string): Promise<{
    weeklySales: number;
    monthlySales: number;
    paymentMethodBreakdown: {
      cash: number;
      credit: number;
      upi: number;
      card: number;
    };
  }>;
}

export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  // Retail Outlet operations
  async getRetailOutletByOwnerId(ownerId: string): Promise<RetailOutlet | undefined> {
    const [outlet] = await db
      .select()
      .from(retailOutlets)
      .where(eq(retailOutlets.ownerId, ownerId));
    return outlet;
  }

  async createRetailOutlet(outlet: InsertRetailOutlet): Promise<RetailOutlet> {
    const [newOutlet] = await db
      .insert(retailOutlets)
      .values(outlet)
      .returning();
    return newOutlet;
  }

  async updateRetailOutlet(id: string, outlet: Partial<InsertRetailOutlet>): Promise<RetailOutlet> {
    const [updatedOutlet] = await db
      .update(retailOutlets)
      .set({ ...outlet, updatedAt: new Date() })
      .where(eq(retailOutlets.id, id))
      .returning();
    return updatedOutlet;
  }

  // Tank operations
  async getTanksByRetailOutletId(retailOutletId: string): Promise<Tank[]> {
    return await db
      .select()
      .from(tanks)
      .where(and(eq(tanks.retailOutletId, retailOutletId), eq(tanks.isActive, true)))
      .orderBy(tanks.tankNumber);
  }

  async createTank(tank: InsertTank): Promise<Tank> {
    const [newTank] = await db
      .insert(tanks)
      .values(tank)
      .returning();
    return newTank;
  }

  async updateTank(id: string, tank: Partial<InsertTank>): Promise<Tank> {
    const [updatedTank] = await db
      .update(tanks)
      .set({ ...tank, updatedAt: new Date() })
      .where(eq(tanks.id, id))
      .returning();
    return updatedTank;
  }

  async deleteTank(id: string): Promise<void> {
    await db
      .update(tanks)
      .set({ isActive: false, updatedAt: new Date() })
      .where(eq(tanks.id, id));
  }

  // Dispensing Unit operations
  async getDispensingUnitsByRetailOutletId(retailOutletId: string): Promise<DispensingUnit[]> {
    return await db
      .select()
      .from(dispensingUnits)
      .where(and(eq(dispensingUnits.retailOutletId, retailOutletId), eq(dispensingUnits.isActive, true)))
      .orderBy(dispensingUnits.unitNumber);
  }

  async createDispensingUnit(unit: InsertDispensingUnit): Promise<DispensingUnit> {
    const [newUnit] = await db
      .insert(dispensingUnits)
      .values(unit)
      .returning();
    return newUnit;
  }

  async updateDispensingUnit(id: string, unit: Partial<InsertDispensingUnit>): Promise<DispensingUnit> {
    const [updatedUnit] = await db
      .update(dispensingUnits)
      .set({ ...unit, updatedAt: new Date() })
      .where(eq(dispensingUnits.id, id))
      .returning();
    return updatedUnit;
  }

  async deleteDispensingUnit(id: string): Promise<void> {
    await db
      .update(dispensingUnits)
      .set({ isActive: false, updatedAt: new Date() })
      .where(eq(dispensingUnits.id, id));
  }

  // Staff operations
  async getStaffByRetailOutletId(retailOutletId: string): Promise<Staff[]> {
    return await db
      .select()
      .from(staff)
      .where(and(eq(staff.retailOutletId, retailOutletId), eq(staff.isActive, true)))
      .orderBy(staff.name);
  }

  async createStaff(staffMember: InsertStaff): Promise<Staff> {
    const [newStaff] = await db
      .insert(staff)
      .values(staffMember)
      .returning();
    return newStaff;
  }

  async updateStaff(id: string, staffMember: Partial<InsertStaff>): Promise<Staff> {
    const [updatedStaff] = await db
      .update(staff)
      .set({ ...staffMember, updatedAt: new Date() })
      .where(eq(staff.id, id))
      .returning();
    return updatedStaff;
  }

  async deleteStaff(id: string): Promise<void> {
    await db
      .update(staff)
      .set({ isActive: false, updatedAt: new Date() })
      .where(eq(staff.id, id));
  }

  // Shift Sales operations
  async getShiftSalesByRetailOutletId(retailOutletId: string, limit = 10): Promise<ShiftSales[]> {
    return await db
      .select()
      .from(shiftSales)
      .where(eq(shiftSales.retailOutletId, retailOutletId))
      .orderBy(desc(shiftSales.shiftDate))
      .limit(limit);
  }

  async createShiftSales(sales: InsertShiftSales): Promise<ShiftSales> {
    const totalSales = Number(sales.cashSales || 0) + 
                     Number(sales.creditSales || 0) + 
                     Number(sales.upiSales || 0) + 
                     Number(sales.cardSales || 0);
    
    const [newSales] = await db
      .insert(shiftSales)
      .values({ ...sales, totalSales: totalSales.toString() })
      .returning();
    return newSales;
  }

  async updateShiftSales(id: string, sales: Partial<InsertShiftSales>): Promise<ShiftSales> {
    const [updatedSales] = await db
      .update(shiftSales)
      .set({ ...sales, updatedAt: new Date() })
      .where(eq(shiftSales.id, id))
      .returning();
    return updatedSales;
  }

  async getShiftSalesStats(retailOutletId: string): Promise<{
    weeklySales: number;
    monthlySales: number;
    paymentMethodBreakdown: {
      cash: number;
      credit: number;
      upi: number;
      card: number;
    };
  }> {
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    
    const monthAgo = new Date();
    monthAgo.setMonth(monthAgo.getMonth() - 1);

    const [weeklyResult] = await db
      .select({
        totalSales: sql<number>`SUM(CAST(total_sales AS DECIMAL))`,
      })
      .from(shiftSales)
      .where(
        and(
          eq(shiftSales.retailOutletId, retailOutletId),
          sql`shift_date >= ${weekAgo}`
        )
      );

    const [monthlyResult] = await db
      .select({
        totalSales: sql<number>`SUM(CAST(total_sales AS DECIMAL))`,
      })
      .from(shiftSales)
      .where(
        and(
          eq(shiftSales.retailOutletId, retailOutletId),
          sql`shift_date >= ${monthAgo}`
        )
      );

    const [paymentBreakdown] = await db
      .select({
        cash: sql<number>`SUM(CAST(cash_sales AS DECIMAL))`,
        credit: sql<number>`SUM(CAST(credit_sales AS DECIMAL))`,
        upi: sql<number>`SUM(CAST(upi_sales AS DECIMAL))`,
        card: sql<number>`SUM(CAST(card_sales AS DECIMAL))`,
      })
      .from(shiftSales)
      .where(
        and(
          eq(shiftSales.retailOutletId, retailOutletId),
          sql`shift_date >= ${monthAgo}`
        )
      );

    return {
      weeklySales: weeklyResult?.totalSales || 0,
      monthlySales: monthlyResult?.totalSales || 0,
      paymentMethodBreakdown: {
        cash: paymentBreakdown?.cash || 0,
        credit: paymentBreakdown?.credit || 0,
        upi: paymentBreakdown?.upi || 0,
        card: paymentBreakdown?.card || 0,
      },
    };
  }
}

export const storage = new DatabaseStorage();
