import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import {
  insertRetailOutletSchema,
  insertProductSchema,
  insertTankSchema,
  insertDispensingUnitSchema,
  insertNozzleSchema,
  insertStaffSchema,
  insertShiftSalesSchema,
} from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  await setupAuth(app);

  // Auth routes
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Retail Outlet routes
  app.get('/api/retail-outlet', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const outlet = await storage.getRetailOutletByOwnerId(userId);
      res.json(outlet);
    } catch (error) {
      console.error("Error fetching retail outlet:", error);
      res.status(500).json({ message: "Failed to fetch retail outlet" });
    }
  });

  app.post('/api/retail-outlet', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const validatedData = insertRetailOutletSchema.parse({
        ...req.body,
        ownerId: userId,
      });
      const outlet = await storage.createRetailOutlet(validatedData);
      res.json(outlet);
    } catch (error) {
      console.error("Error creating retail outlet:", error);
      res.status(400).json({ message: "Failed to create retail outlet" });
    }
  });

  app.put('/api/retail-outlet/:id', isAuthenticated, async (req: any, res) => {
    try {
      const { id } = req.params;
      const validatedData = insertRetailOutletSchema.partial().parse(req.body);
      const outlet = await storage.updateRetailOutlet(id, validatedData);
      res.json(outlet);
    } catch (error) {
      console.error("Error updating retail outlet:", error);
      res.status(400).json({ message: "Failed to update retail outlet" });
    }
  });

  // Product routes
  app.get('/api/products', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const outlet = await storage.getRetailOutletByOwnerId(userId);
      if (!outlet) {
        return res.status(404).json({ message: "Retail outlet not found" });
      }
      const products = await storage.getProductsByRetailOutletId(outlet.id);
      res.json(products);
    } catch (error) {
      console.error("Error fetching products:", error);
      res.status(500).json({ message: "Failed to fetch products" });
    }
  });

  // Manager-accessible products endpoint
  app.get('/api/manager/products', async (req: any, res) => {
    try {
      const managerId = req.session?.managerId;
      if (!managerId) {
        return res.status(401).json({ message: "Manager authentication required" });
      }
      
      // Get manager details to find their retail outlet
      const manager = await storage.getStaffById(managerId);
      if (!manager || !manager.retailOutletId) {
        return res.status(404).json({ message: "Manager or retail outlet not found" });
      }
      
      const products = await storage.getProductsByRetailOutletId(manager.retailOutletId);
      res.json(products);
    } catch (error) {
      console.error("Error fetching products for manager:", error);
      res.status(500).json({ message: "Failed to fetch products" });
    }
  });

  app.post('/api/products', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const outlet = await storage.getRetailOutletByOwnerId(userId);
      if (!outlet) {
        return res.status(404).json({ message: "Retail outlet not found" });
      }
      const validatedData = insertProductSchema.parse({
        ...req.body,
        retailOutletId: outlet.id,
      });
      const product = await storage.createProduct(validatedData);
      res.json(product);
    } catch (error) {
      console.error("Error creating product:", error);
      res.status(400).json({ message: "Failed to create product" });
    }
  });

  app.put('/api/products/:id', isAuthenticated, async (req: any, res) => {
    try {
      const { id } = req.params;
      const validatedData = insertProductSchema.partial().parse(req.body);
      const product = await storage.updateProduct(id, validatedData);
      res.json(product);
    } catch (error) {
      console.error("Error updating product:", error);
      res.status(400).json({ message: "Failed to update product" });
    }
  });

  app.delete('/api/products/:id', isAuthenticated, async (req: any, res) => {
    try {
      const { id } = req.params;
      await storage.deleteProduct(id);
      res.json({ message: "Product deleted successfully" });
    } catch (error) {
      console.error("Error deleting product:", error);
      res.status(500).json({ message: "Failed to delete product" });
    }
  });

  // Tank routes
  app.get('/api/tanks', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const outlet = await storage.getRetailOutletByOwnerId(userId);
      if (!outlet) {
        return res.status(404).json({ message: "Retail outlet not found" });
      }
      const tanks = await storage.getTanksByRetailOutletId(outlet.id);
      res.json(tanks);
    } catch (error) {
      console.error("Error fetching tanks:", error);
      res.status(500).json({ message: "Failed to fetch tanks" });
    }
  });

  app.post('/api/tanks', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const outlet = await storage.getRetailOutletByOwnerId(userId);
      if (!outlet) {
        return res.status(404).json({ message: "Retail outlet not found" });
      }
      console.log("Raw tank data:", req.body);
      const validatedData = insertTankSchema.parse({
        ...req.body,
        retailOutletId: outlet.id,
      });
      console.log("Validated tank data:", validatedData);
      const tank = await storage.createTank(validatedData);
      res.json(tank);
    } catch (error) {
      console.error("Error creating tank:", error);
      if (error instanceof Error) {
        res.status(400).json({ message: error.message });
      } else {
        res.status(400).json({ message: "Failed to create tank" });
      }
    }
  });

  app.put('/api/tanks/:id', isAuthenticated, async (req: any, res) => {
    try {
      const { id } = req.params;
      const validatedData = insertTankSchema.partial().parse(req.body);
      const tank = await storage.updateTank(id, validatedData);
      res.json(tank);
    } catch (error) {
      console.error("Error updating tank:", error);
      res.status(400).json({ message: "Failed to update tank" });
    }
  });

  app.delete('/api/tanks/:id', isAuthenticated, async (req: any, res) => {
    try {
      const { id } = req.params;
      await storage.deleteTank(id);
      res.json({ message: "Tank deleted successfully" });
    } catch (error) {
      console.error("Error deleting tank:", error);
      res.status(500).json({ message: "Failed to delete tank" });
    }
  });

  // Dispensing Unit routes
  app.get('/api/dispensing-units', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const outlet = await storage.getRetailOutletByOwnerId(userId);
      if (!outlet) {
        return res.status(404).json({ message: "Retail outlet not found" });
      }
      const units = await storage.getDispensingUnitsByRetailOutletId(outlet.id);
      res.json(units);
    } catch (error) {
      console.error("Error fetching dispensing units:", error);
      res.status(500).json({ message: "Failed to fetch dispensing units" });
    }
  });

  app.post('/api/dispensing-units', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const outlet = await storage.getRetailOutletByOwnerId(userId);
      if (!outlet) {
        return res.status(404).json({ message: "Retail outlet not found" });
      }
      
      const { nozzles, ...duData } = req.body;
      
      // Create dispensing unit
      const validatedDUData = insertDispensingUnitSchema.parse({
        ...duData,
        retailOutletId: outlet.id,
      });
      const unit = await storage.createDispensingUnit(validatedDUData);
      
      // Create nozzles for the dispensing unit
      if (nozzles && nozzles.length > 0) {
        for (let i = 0; i < nozzles.length; i++) {
          const nozzle = nozzles[i];
          const validatedNozzleData = insertNozzleSchema.parse({
            ...nozzle,
            dispensingUnitId: unit.id,
            nozzleNumber: i + 1,
            calibrationValidUntil: new Date(nozzle.calibrationValidUntil),
          });
          await storage.createNozzle(validatedNozzleData);
        }
      }
      
      res.json(unit);
    } catch (error) {
      console.error("Error creating dispensing unit:", error);
      res.status(400).json({ message: "Failed to create dispensing unit" });
    }
  });

  app.put('/api/dispensing-units/:id', isAuthenticated, async (req: any, res) => {
    try {
      const { id } = req.params;
      const validatedData = insertDispensingUnitSchema.partial().parse(req.body);
      const unit = await storage.updateDispensingUnit(id, validatedData);
      res.json(unit);
    } catch (error) {
      console.error("Error updating dispensing unit:", error);
      res.status(400).json({ message: "Failed to update dispensing unit" });
    }
  });

  app.delete('/api/dispensing-units/:id', isAuthenticated, async (req: any, res) => {
    try {
      const { id } = req.params;
      await storage.deleteDispensingUnit(id);
      res.json({ message: "Dispensing unit deleted successfully" });
    } catch (error) {
      console.error("Error deleting dispensing unit:", error);
      res.status(500).json({ message: "Failed to delete dispensing unit" });
    }
  });

  // Staff routes
  app.get('/api/staff', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const outlet = await storage.getRetailOutletByOwnerId(userId);
      if (!outlet) {
        return res.status(404).json({ message: "Retail outlet not found" });
      }
      const staffMembers = await storage.getStaffByRetailOutletId(outlet.id);
      res.json(staffMembers);
    } catch (error) {
      console.error("Error fetching staff:", error);
      res.status(500).json({ message: "Failed to fetch staff" });
    }
  });

  app.post('/api/staff', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const outlet = await storage.getRetailOutletByOwnerId(userId);
      if (!outlet) {
        return res.status(404).json({ message: "Retail outlet not found" });
      }
      const validatedData = insertStaffSchema.parse({
        ...req.body,
        retailOutletId: outlet.id,
      });
      const staffMember = await storage.createStaff(validatedData);
      res.json(staffMember);
    } catch (error) {
      console.error("Error creating staff member:", error);
      res.status(400).json({ message: "Failed to create staff member" });
    }
  });

  app.put('/api/staff/:id', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const outlet = await storage.getRetailOutletByOwnerId(userId);
      if (!outlet) {
        return res.status(404).json({ message: "Retail outlet not found" });
      }
      
      const staffId = req.params.id;
      const existingStaff = await storage.getStaffById(staffId);
      if (!existingStaff || existingStaff.retailOutletId !== outlet.id) {
        return res.status(404).json({ message: "Staff member not found" });
      }

      // For soft delete, only allow isActive field
      if (req.body.isActive !== undefined) {
        const updatedStaff = await storage.updateStaff(staffId, { isActive: req.body.isActive });
        return res.json(updatedStaff);
      }

      // For full update, validate all fields
      const validatedData = insertStaffSchema.omit({ retailOutletId: true }).parse(req.body);
      const updatedStaff = await storage.updateStaff(staffId, validatedData);
      res.json(updatedStaff);
    } catch (error) {
      console.error("Error updating staff member:", error);
      res.status(400).json({ message: "Failed to update staff member" });
    }
  });

  app.delete('/api/staff/:id', isAuthenticated, async (req: any, res) => {
    try {
      const { id } = req.params;
      await storage.deleteStaff(id);
      res.json({ message: "Staff member deleted successfully" });
    } catch (error) {
      console.error("Error deleting staff member:", error);
      res.status(500).json({ message: "Failed to delete staff member" });
    }
  });

  // Shift Sales routes
  app.get('/api/shift-sales', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const outlet = await storage.getRetailOutletByOwnerId(userId);
      if (!outlet) {
        return res.status(404).json({ message: "Retail outlet not found" });
      }
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;
      const shiftSales = await storage.getShiftSalesByRetailOutletId(outlet.id, limit);
      res.json(shiftSales);
    } catch (error) {
      console.error("Error fetching shift sales:", error);
      res.status(500).json({ message: "Failed to fetch shift sales" });
    }
  });

  app.post('/api/shift-sales', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const outlet = await storage.getRetailOutletByOwnerId(userId);
      if (!outlet) {
        return res.status(404).json({ message: "Retail outlet not found" });
      }
      const validatedData = insertShiftSalesSchema.parse({
        ...req.body,
        retailOutletId: outlet.id,
      });
      const shiftSales = await storage.createShiftSales(validatedData);
      res.json(shiftSales);
    } catch (error) {
      console.error("Error creating shift sales:", error);
      res.status(400).json({ message: "Failed to create shift sales" });
    }
  });

  app.get('/api/sales-stats', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const outlet = await storage.getRetailOutletByOwnerId(userId);
      if (!outlet) {
        return res.status(404).json({ message: "Retail outlet not found" });
      }
      const stats = await storage.getShiftSalesStats(outlet.id);
      res.json(stats);
    } catch (error) {
      console.error("Error fetching sales stats:", error);
      res.status(500).json({ message: "Failed to fetch sales stats" });
    }
  });

  // Managers routes - simple mock endpoints for now


  // Settings routes - simple mock endpoints for now
  app.get('/api/settings', isAuthenticated, async (req: any, res) => {
    try {
      // Return default settings
      res.json({
        id: "default-settings",
        fuelPrices: {
          petrol: 100.00,
          diesel: 95.00,
          premium: 105.00
        },
        appSettings: {
          enableNotifications: true,
          autoBackup: true,
          showLowStockAlerts: true,
          requireShiftConfirmation: false
        }
      });
    } catch (error) {
      console.error("Error fetching settings:", error);
      res.status(500).json({ message: "Failed to fetch settings" });
    }
  });

  app.put('/api/settings', isAuthenticated, async (req: any, res) => {
    try {
      // Mock successful update
      res.json({ 
        id: "default-settings",
        ...req.body,
        updatedAt: new Date()
      });
    } catch (error) {
      console.error("Error updating settings:", error);
      res.status(400).json({ message: "Failed to update settings" });
    }
  });

  // Manager login endpoint
  app.post("/api/manager/login", async (req, res) => {
    try {
      const { phoneNumber, password } = req.body;
      
      if (!phoneNumber || !password) {
        return res.status(400).json({ 
          success: false, 
          message: "Phone number and password are required" 
        });
      }

      // Find manager with matching phone number and password
      const manager = await storage.getManagerByCredentials(phoneNumber, password);
      
      if (!manager) {
        return res.status(401).json({ 
          success: false, 
          message: "Invalid credentials" 
        });
      }

      // Create manager session (simplified for now)
      (req.session as any).managerId = manager.id;
      (req.session as any).userType = "manager";
      
      res.json({ 
        success: true, 
        message: "Login successful",
        user: {
          id: manager.id,
          name: manager.name,
          role: "manager",
          phoneNumber: manager.phoneNumber
        }
      });
    } catch (error) {
      console.error("Manager login error:", error);
      res.status(500).json({ 
        success: false, 
        message: "Login failed" 
      });
    }
  });

  // Manager auth check
  app.get('/api/auth/manager', async (req, res) => {
    try {
      const session = req.session as any;
      if (!session.managerId || session.userType !== "manager") {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const manager = await storage.getStaffById(session.managerId);
      if (!manager || manager.role !== "manager" || !manager.isActive) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      res.json({
        id: manager.id,
        name: manager.name,
        role: "manager",
        phoneNumber: manager.phoneNumber
      });
    } catch (error) {
      console.error("Manager auth error:", error);
      res.status(500).json({ message: "Authentication failed" });
    }
  });

  // Manager logout endpoint
  app.post('/api/manager/logout', async (req, res) => {
    try {
      const session = req.session as any;
      session.managerId = null;
      session.userType = null;
      
      req.session.destroy((err) => {
        if (err) {
          console.error("Session destruction error:", err);
          return res.status(500).json({ success: false, message: "Logout failed" });
        }
        res.clearCookie('connect.sid');
        res.json({ success: true, message: "Logged out successfully" });
      });
    } catch (error) {
      console.error("Manager logout error:", error);
      res.status(500).json({ success: false, message: "Logout failed" });
    }
  });

  // Shift routes for managers
  app.get('/api/shifts/current', async (req: any, res) => {
    try {
      // Get current manager from session (assuming manager auth middleware)
      const managerId = req.session?.managerId;
      if (!managerId) {
        return res.status(401).json({ message: "Manager authentication required" });
      }
      
      const currentShift = await storage.getCurrentShift(managerId);
      res.json(currentShift);
    } catch (error) {
      console.error("Error fetching current shift:", error);
      res.status(500).json({ message: "Failed to fetch current shift" });
    }
  });

  app.get('/api/shifts/last-rates', async (req: any, res) => {
    try {
      const managerId = req.session?.managerId;
      if (!managerId) {
        return res.status(401).json({ message: "Manager authentication required" });
      }
      
      const lastRates = await storage.getLastProductRates(managerId);
      res.json(lastRates);
    } catch (error) {
      console.error("Error fetching last rates:", error);
      res.status(500).json({ message: "Failed to fetch last rates" });
    }
  });

  app.post('/api/shifts/rates', async (req: any, res) => {
    try {
      const managerId = req.session?.managerId;
      if (!managerId) {
        return res.status(401).json({ message: "Manager authentication required" });
      }
      
      const { shiftType, rates } = req.body;
      console.log('Saving rates for manager:', managerId, 'shift:', shiftType, 'rates:', rates);
      await storage.saveProductRates(managerId, shiftType, rates);
      res.json({ message: "Rates saved successfully", success: true });
    } catch (error) {
      console.error("Error saving rates:", error);
      res.status(500).json({ message: "Failed to save rates", error: error.message });
    }
  });

  app.post('/api/shifts/start', async (req: any, res) => {
    try {
      const managerId = req.session?.managerId;
      if (!managerId) {
        return res.status(401).json({ message: "Manager authentication required" });
      }
      
      const { shiftType, productRates } = req.body;
      const shift = await storage.startShift(managerId, shiftType, productRates);
      res.json(shift);
    } catch (error) {
      console.error("Error starting shift:", error);
      res.status(500).json({ message: "Failed to start shift" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
