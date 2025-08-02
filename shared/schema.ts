import { sql, relations } from "drizzle-orm";
import {
  index,
  jsonb,
  pgTable,
  timestamp,
  varchar,
  text,
  integer,
  decimal,
  boolean,
  pgEnum,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Session storage table - mandatory for Replit Auth
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User storage table - mandatory for Replit Auth
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  role: varchar("role").default("owner"), // owner, manager, operator
  language: varchar("language").default("en"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Retail Outlets
export const retailOutlets = pgTable("retail_outlets", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  ownerId: varchar("owner_id").references(() => users.id).notNull(),
  name: text("name").notNull(),
  sapcode: varchar("sapcode"),
  oilCompany: varchar("oil_company"),
  address: text("address"),
  phoneNumber: varchar("phone_number"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Fuel Types
export const fuelTypeEnum = pgEnum("fuel_type", ["petrol", "diesel", "premium"]);

// Tanks
export const tanks = pgTable("tanks", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  retailOutletId: varchar("retail_outlet_id").references(() => retailOutlets.id).notNull(),
  productId: varchar("product_id").references(() => products.id).notNull(),
  tankNumber: varchar("tank_number").notNull(),
  capacity: decimal("capacity", { precision: 10, scale: 2 }).notNull(),
  currentStock: decimal("current_stock", { precision: 10, scale: 2 }).default("0"),
  minimumLevel: decimal("minimum_level", { precision: 10, scale: 2 }).default("500"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Dispensing Units
export const dispensingUnits = pgTable("dispensing_units", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  retailOutletId: varchar("retail_outlet_id").references(() => retailOutlets.id).notNull(),
  tankId: varchar("tank_id").references(() => tanks.id).notNull(),
  unitNumber: varchar("unit_number").notNull(),
  brand: varchar("brand"),
  model: varchar("model"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Products
export const products = pgTable("products", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  retailOutletId: varchar("retail_outlet_id").references(() => retailOutlets.id).notNull(),
  name: text("name").notNull(),
  type: fuelTypeEnum("type").notNull(),
  pricePerLiter: decimal("price_per_liter", { precision: 10, scale: 2 }).notNull(),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Staff Members
export const staff = pgTable("staff", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  retailOutletId: varchar("retail_outlet_id").references(() => retailOutlets.id).notNull(),
  userId: varchar("user_id").references(() => users.id),
  name: text("name").notNull(),
  phoneNumber: varchar("phone_number"),
  role: varchar("role").notNull(), // manager, operator, attendant
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Payment Methods
export const paymentMethodEnum = pgEnum("payment_method", ["cash", "credit", "upi", "card"]);

// Shift Sales
export const shiftSales = pgTable("shift_sales", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  retailOutletId: varchar("retail_outlet_id").references(() => retailOutlets.id).notNull(),
  staffId: varchar("staff_id").references(() => staff.id).notNull(),
  shiftDate: timestamp("shift_date").notNull(),
  shiftType: varchar("shift_type").notNull(), // morning, afternoon, night
  startTime: timestamp("start_time").notNull(),
  endTime: timestamp("end_time").notNull(),
  cashSales: decimal("cash_sales", { precision: 10, scale: 2 }).default("0"),
  creditSales: decimal("credit_sales", { precision: 10, scale: 2 }).default("0"),
  upiSales: decimal("upi_sales", { precision: 10, scale: 2 }).default("0"),
  cardSales: decimal("card_sales", { precision: 10, scale: 2 }).default("0"),
  totalSales: decimal("total_sales", { precision: 10, scale: 2 }).default("0"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  retailOutlets: many(retailOutlets),
  staff: many(staff),
}));

export const retailOutletsRelations = relations(retailOutlets, ({ one, many }) => ({
  owner: one(users, {
    fields: [retailOutlets.ownerId],
    references: [users.id],
  }),
  products: many(products),
  tanks: many(tanks),
  dispensingUnits: many(dispensingUnits),
  staff: many(staff),
  shiftSales: many(shiftSales),
}));

export const productsRelations = relations(products, ({ one, many }) => ({
  retailOutlet: one(retailOutlets, {
    fields: [products.retailOutletId],
    references: [retailOutlets.id],
  }),
  tanks: many(tanks),
}));

export const tanksRelations = relations(tanks, ({ one, many }) => ({
  retailOutlet: one(retailOutlets, {
    fields: [tanks.retailOutletId],
    references: [retailOutlets.id],
  }),
  product: one(products, {
    fields: [tanks.productId],
    references: [products.id],
  }),
  dispensingUnits: many(dispensingUnits),
}));

export const dispensingUnitsRelations = relations(dispensingUnits, ({ one }) => ({
  retailOutlet: one(retailOutlets, {
    fields: [dispensingUnits.retailOutletId],
    references: [retailOutlets.id],
  }),
  tank: one(tanks, {
    fields: [dispensingUnits.tankId],
    references: [tanks.id],
  }),
}));

export const staffRelations = relations(staff, ({ one, many }) => ({
  retailOutlet: one(retailOutlets, {
    fields: [staff.retailOutletId],
    references: [retailOutlets.id],
  }),
  user: one(users, {
    fields: [staff.userId],
    references: [users.id],
  }),
  shiftSales: many(shiftSales),
}));

export const shiftSalesRelations = relations(shiftSales, ({ one }) => ({
  retailOutlet: one(retailOutlets, {
    fields: [shiftSales.retailOutletId],
    references: [retailOutlets.id],
  }),
  staff: one(staff, {
    fields: [shiftSales.staffId],
    references: [staff.id],
  }),
}));

// Insert schemas
export const insertRetailOutletSchema = createInsertSchema(retailOutlets).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertTankSchema = createInsertSchema(tanks).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertDispensingUnitSchema = createInsertSchema(dispensingUnits).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertStaffSchema = createInsertSchema(staff).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertShiftSalesSchema = createInsertSchema(shiftSales).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertProductSchema = createInsertSchema(products).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Types
export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;
export type InsertRetailOutlet = z.infer<typeof insertRetailOutletSchema>;
export type RetailOutlet = typeof retailOutlets.$inferSelect;
export type InsertTank = z.infer<typeof insertTankSchema>;
export type Tank = typeof tanks.$inferSelect;
export type InsertDispensingUnit = z.infer<typeof insertDispensingUnitSchema>;
export type DispensingUnit = typeof dispensingUnits.$inferSelect;
export type InsertStaff = z.infer<typeof insertStaffSchema>;
export type Staff = typeof staff.$inferSelect;
export type InsertShiftSales = z.infer<typeof insertShiftSalesSchema>;
export type ShiftSales = typeof shiftSales.$inferSelect;
export type InsertProduct = z.infer<typeof insertProductSchema>;
export type Product = typeof products.$inferSelect;
