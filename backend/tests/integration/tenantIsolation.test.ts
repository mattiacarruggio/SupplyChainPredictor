/**
 * Tenant Isolation Integration Tests
 *
 * Tests that tenant isolation middleware properly enforces data segregation
 * across all entities in the system.
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { prisma, setCurrentTenant, clearCurrentTenant } from './setup';
import {
  supplierService,
  productService,
  locationService,
  shipmentRouteService,
  riskEventService,
  inventoryService,
  userService,
} from '../../src/services';
import { LocationType, TransportMode, EventType, RiskSeverity, RiskStatus, UserRole, UserStatus } from '@prisma/client';

describe('Tenant Isolation Integration Tests', () => {
  const TENANT_A = 'tenant-a-001';
  const TENANT_B = 'tenant-b-001';

  beforeEach(() => {
    // Clear any existing tenant context
    clearCurrentTenant();
  });

  describe('Supplier Tenant Isolation', () => {
    it('should only return suppliers for current tenant', async () => {
      // Create supplier for Tenant A
      setCurrentTenant(TENANT_A);
      const supplierA = await supplierService.create({
        code: 'SUP-TENANT-A',
        name: 'Tenant A Supplier',
        country: 'USA',
        rating: 4,
      });

      // Create supplier for Tenant B
      setCurrentTenant(TENANT_B);
      const supplierB = await supplierService.create({
        code: 'SUP-TENANT-B',
        name: 'Tenant B Supplier',
        country: 'USA',
        rating: 5,
      });

      // Verify Tenant A can only see their supplier
      setCurrentTenant(TENANT_A);
      const suppliersA = await supplierService.findAll();
      expect(suppliersA).toHaveLength(1);
      expect(suppliersA[0].id).toBe(supplierA.id);
      expect(suppliersA[0].tenantId).toBe(TENANT_A);

      // Verify Tenant B can only see their supplier
      setCurrentTenant(TENANT_B);
      const suppliersB = await supplierService.findAll();
      expect(suppliersB).toHaveLength(1);
      expect(suppliersB[0].id).toBe(supplierB.id);
      expect(suppliersB[0].tenantId).toBe(TENANT_B);
    });

    it('should block cross-tenant access by ID', async () => {
      // Create supplier for Tenant A
      setCurrentTenant(TENANT_A);
      const supplierA = await supplierService.create({
        code: 'SUP-CROSS-A',
        name: 'Cross Access Test Supplier',
        country: 'USA',
        rating: 4,
      });

      // Tenant B should not be able to access Tenant A's supplier
      setCurrentTenant(TENANT_B);
      const supplierB = await supplierService.findById(supplierA.id);
      expect(supplierB).toBeNull();
    });

    it('should auto-assign tenantId on create', async () => {
      setCurrentTenant(TENANT_A);
      const supplier = await supplierService.create({
        code: 'SUP-AUTO-TENANT',
        name: 'Auto Tenant Assignment',
        country: 'USA',
        rating: 4,
      });

      expect(supplier.tenantId).toBe(TENANT_A);
    });
  });

  describe('Product Tenant Isolation', () => {
    it('should only return products for current tenant', async () => {
      // Create products for each tenant
      setCurrentTenant(TENANT_A);
      const supplierA = await supplierService.create({
        code: 'SUP-PROD-A',
        name: 'Supplier A',
        country: 'USA',
        rating: 4,
      });
      const productA = await productService.create({
        sku: 'PROD-TENANT-A',
        name: 'Tenant A Product',
        category: 'Electronics',
        leadTimeDays: 30,
        supplier: { connect: { id: supplierA.id } },
      });

      setCurrentTenant(TENANT_B);
      const supplierB = await supplierService.create({
        code: 'SUP-PROD-B',
        name: 'Supplier B',
        country: 'USA',
        rating: 5,
      });
      const productB = await productService.create({
        sku: 'PROD-TENANT-B',
        name: 'Tenant B Product',
        category: 'Hardware',
        leadTimeDays: 20,
        supplier: { connect: { id: supplierB.id } },
      });

      // Verify isolation
      setCurrentTenant(TENANT_A);
      const productsA = await productService.findAll();
      expect(productsA).toHaveLength(1);
      expect(productsA[0].id).toBe(productA.id);

      setCurrentTenant(TENANT_B);
      const productsB = await productService.findAll();
      expect(productsB).toHaveLength(1);
      expect(productsB[0].id).toBe(productB.id);
    });
  });

  describe('Location Tenant Isolation', () => {
    it('should only return locations for current tenant', async () => {
      setCurrentTenant(TENANT_A);
      const locationA = await locationService.create({
        code: 'LOC-TENANT-A',
        name: 'Tenant A Location',
        type: LocationType.WAREHOUSE,
        country: 'USA',
      });

      setCurrentTenant(TENANT_B);
      const locationB = await locationService.create({
        code: 'LOC-TENANT-B',
        name: 'Tenant B Location',
        type: LocationType.WAREHOUSE,
        country: 'USA',
      });

      // Verify isolation
      setCurrentTenant(TENANT_A);
      const locationsA = await locationService.findAll();
      expect(locationsA).toHaveLength(1);
      expect(locationsA[0].id).toBe(locationA.id);

      setCurrentTenant(TENANT_B);
      const locationsB = await locationService.findAll();
      expect(locationsB).toHaveLength(1);
      expect(locationsB[0].id).toBe(locationB.id);
    });
  });

  describe('Shipment Route Tenant Isolation', () => {
    it('should only return routes for current tenant', async () => {
      // Tenant A routes
      setCurrentTenant(TENANT_A);
      const originA = await locationService.create({
        code: 'LOC-ROUTE-A1',
        name: 'Origin A',
        type: LocationType.PORT,
        country: 'USA',
      });
      const destA = await locationService.create({
        code: 'LOC-ROUTE-A2',
        name: 'Dest A',
        type: LocationType.WAREHOUSE,
        country: 'USA',
      });
      const routeA = await shipmentRouteService.create({
        originLocation: { connect: { id: originA.id } },
        destinationLocation: { connect: { id: destA.id } },
        transitTimeDays: 5,
        transportMode: TransportMode.TRUCK,
      });

      // Tenant B routes
      setCurrentTenant(TENANT_B);
      const originB = await locationService.create({
        code: 'LOC-ROUTE-B1',
        name: 'Origin B',
        type: LocationType.PORT,
        country: 'China',
      });
      const destB = await locationService.create({
        code: 'LOC-ROUTE-B2',
        name: 'Dest B',
        type: LocationType.WAREHOUSE,
        country: 'China',
      });
      const routeB = await shipmentRouteService.create({
        originLocation: { connect: { id: originB.id } },
        destinationLocation: { connect: { id: destB.id } },
        transitTimeDays: 7,
        transportMode: TransportMode.TRUCK,
      });

      // Verify isolation
      setCurrentTenant(TENANT_A);
      const routesA = await shipmentRouteService.findAll();
      expect(routesA).toHaveLength(1);
      expect(routesA[0].id).toBe(routeA.id);

      setCurrentTenant(TENANT_B);
      const routesB = await shipmentRouteService.findAll();
      expect(routesB).toHaveLength(1);
      expect(routesB[0].id).toBe(routeB.id);
    });
  });

  describe('Risk Event Tenant Isolation', () => {
    it('should only return risk events for current tenant', async () => {
      setCurrentTenant(TENANT_A);
      const eventA = await riskEventService.create({
        eventType: EventType.WEATHER,
        severity: RiskSeverity.HIGH,
        status: RiskStatus.ACTIVE,
        startDate: new Date(),
        title: 'Tenant A Event',
        description: 'Risk event for Tenant A',
      });

      setCurrentTenant(TENANT_B);
      const eventB = await riskEventService.create({
        eventType: EventType.POLITICAL,
        severity: RiskSeverity.MEDIUM,
        status: RiskStatus.ACTIVE,
        startDate: new Date(),
        title: 'Tenant B Event',
        description: 'Risk event for Tenant B',
      });

      // Verify isolation
      setCurrentTenant(TENANT_A);
      const eventsA = await riskEventService.findAll();
      expect(eventsA).toHaveLength(1);
      expect(eventsA[0].id).toBe(eventA.id);

      setCurrentTenant(TENANT_B);
      const eventsB = await riskEventService.findAll();
      expect(eventsB).toHaveLength(1);
      expect(eventsB[0].id).toBe(eventB.id);
    });
  });

  describe('Inventory Tenant Isolation', () => {
    it('should only return inventory for current tenant', async () => {
      // Tenant A inventory
      setCurrentTenant(TENANT_A);
      const supplierA = await supplierService.create({
        code: 'SUP-INV-A',
        name: 'Supplier A',
        country: 'USA',
        rating: 4,
      });
      const productA = await productService.create({
        sku: 'PROD-INV-A',
        name: 'Product A',
        category: 'Category',
        leadTimeDays: 30,
        supplier: { connect: { id: supplierA.id } },
      });
      const locationA = await locationService.create({
        code: 'LOC-INV-A',
        name: 'Location A',
        type: LocationType.WAREHOUSE,
        country: 'USA',
      });
      const inventoryA = await inventoryService.create({
        product: { connect: { id: productA.id } },
        location: { connect: { id: locationA.id } },
        quantityOnHand: 100,
      });

      // Tenant B inventory
      setCurrentTenant(TENANT_B);
      const supplierB = await supplierService.create({
        code: 'SUP-INV-B',
        name: 'Supplier B',
        country: 'China',
        rating: 5,
      });
      const productB = await productService.create({
        sku: 'PROD-INV-B',
        name: 'Product B',
        category: 'Category',
        leadTimeDays: 20,
        supplier: { connect: { id: supplierB.id } },
      });
      const locationB = await locationService.create({
        code: 'LOC-INV-B',
        name: 'Location B',
        type: LocationType.WAREHOUSE,
        country: 'China',
      });
      const inventoryB = await inventoryService.create({
        product: { connect: { id: productB.id } },
        location: { connect: { id: locationB.id } },
        quantityOnHand: 200,
      });

      // Verify isolation
      setCurrentTenant(TENANT_A);
      const inventoriesA = await inventoryService.findAll();
      expect(inventoriesA).toHaveLength(1);
      expect(inventoriesA[0].id).toBe(inventoryA.id);

      setCurrentTenant(TENANT_B);
      const inventoriesB = await inventoryService.findAll();
      expect(inventoriesB).toHaveLength(1);
      expect(inventoriesB[0].id).toBe(inventoryB.id);
    });
  });

  describe('User Tenant Isolation', () => {
    it('should only return users for current tenant', async () => {
      setCurrentTenant(TENANT_A);
      const userA = await userService.create({
        email: 'user-a@tenant-a.com',
        name: 'Tenant A User',
        role: UserRole.ANALYST,
        status: UserStatus.ACTIVE,
      });

      setCurrentTenant(TENANT_B);
      const userB = await userService.create({
        email: 'user-b@tenant-b.com',
        name: 'Tenant B User',
        role: UserRole.ADMIN,
        status: UserStatus.ACTIVE,
      });

      // Verify isolation
      setCurrentTenant(TENANT_A);
      const usersA = await userService.findAll();
      expect(usersA).toHaveLength(1);
      expect(usersA[0].id).toBe(userA.id);

      setCurrentTenant(TENANT_B);
      const usersB = await userService.findAll();
      expect(usersB).toHaveLength(1);
      expect(usersB[0].id).toBe(userB.id);
    });

    it('should block cross-tenant user access', async () => {
      setCurrentTenant(TENANT_A);
      const userA = await userService.create({
        email: 'cross-test@tenant-a.com',
        name: 'Cross Test User',
        role: UserRole.VIEWER,
        status: UserStatus.ACTIVE,
      });

      // Tenant B should not be able to access Tenant A's user
      setCurrentTenant(TENANT_B);
      const userB = await userService.findById(userA.id);
      expect(userB).toBeNull();
    });
  });

  describe('Update and Delete Operations', () => {
    it('should prevent cross-tenant updates', async () => {
      // Create supplier for Tenant A
      setCurrentTenant(TENANT_A);
      const supplier = await supplierService.create({
        code: 'SUP-UPDATE-TEST',
        name: 'Update Test Supplier',
        country: 'USA',
        rating: 4,
      });

      // Tenant B should not be able to update Tenant A's supplier
      setCurrentTenant(TENANT_B);
      await expect(
        supplierService.update(supplier.id, {
          name: 'Hacked Name',
        })
      ).rejects.toThrow();

      // Verify supplier remains unchanged
      setCurrentTenant(TENANT_A);
      const unchanged = await supplierService.findById(supplier.id);
      expect(unchanged?.name).toBe('Update Test Supplier');
    });

    it('should prevent cross-tenant deletes', async () => {
      // Create location for Tenant A
      setCurrentTenant(TENANT_A);
      const location = await locationService.create({
        code: 'LOC-DELETE-TEST',
        name: 'Delete Test Location',
        type: LocationType.WAREHOUSE,
        country: 'USA',
      });

      // Tenant B should not be able to delete Tenant A's location
      setCurrentTenant(TENANT_B);
      await expect(
        locationService.delete(location.id)
      ).rejects.toThrow();

      // Verify location still exists for Tenant A
      setCurrentTenant(TENANT_A);
      const stillExists = await locationService.findById(location.id);
      expect(stillExists).toBeDefined();
      expect(stillExists?.id).toBe(location.id);
    });
  });

  describe('No Tenant Context Error Handling', () => {
    it('should throw error when no tenant is set', async () => {
      clearCurrentTenant();

      // Attempt operations without tenant context should fail
      await expect(
        supplierService.create({
          code: 'SUP-NO-TENANT',
          name: 'No Tenant Supplier',
          country: 'USA',
          rating: 4,
        })
      ).rejects.toThrow(/Tenant ID required/);

      await expect(
        supplierService.findAll()
      ).rejects.toThrow(/Tenant ID required/);
    });
  });

  describe('Complex Multi-Entity Isolation', () => {
    it('should maintain isolation across related entities', async () => {
      // Setup Tenant A ecosystem
      setCurrentTenant(TENANT_A);
      const supplierA = await supplierService.create({
        code: 'SUP-COMPLEX-A',
        name: 'Complex Test Supplier A',
        country: 'USA',
        rating: 4,
      });
      const productA = await productService.create({
        sku: 'PROD-COMPLEX-A',
        name: 'Complex Test Product A',
        category: 'Electronics',
        leadTimeDays: 30,
        supplier: { connect: { id: supplierA.id } },
      });
      const locationA = await locationService.create({
        code: 'LOC-COMPLEX-A',
        name: 'Complex Test Location A',
        type: LocationType.WAREHOUSE,
        country: 'USA',
      });
      const inventoryA = await inventoryService.create({
        product: { connect: { id: productA.id } },
        location: { connect: { id: locationA.id } },
        quantityOnHand: 500,
      });

      // Setup Tenant B ecosystem
      setCurrentTenant(TENANT_B);
      const supplierB = await supplierService.create({
        code: 'SUP-COMPLEX-B',
        name: 'Complex Test Supplier B',
        country: 'China',
        rating: 5,
      });
      const productB = await productService.create({
        sku: 'PROD-COMPLEX-B',
        name: 'Complex Test Product B',
        category: 'Hardware',
        leadTimeDays: 20,
        supplier: { connect: { id: supplierB.id } },
      });
      const locationB = await locationService.create({
        code: 'LOC-COMPLEX-B',
        name: 'Complex Test Location B',
        type: LocationType.FACTORY,
        country: 'China',
      });
      const inventoryB = await inventoryService.create({
        product: { connect: { id: productB.id } },
        location: { connect: { id: locationB.id } },
        quantityOnHand: 1000,
      });

      // Verify complete isolation for Tenant A
      setCurrentTenant(TENANT_A);
      const suppliersA = await supplierService.findAll();
      const productsA = await productService.findAll();
      const locationsA = await locationService.findAll();
      const inventoriesA = await inventoryService.findAll();

      expect(suppliersA).toHaveLength(1);
      expect(productsA).toHaveLength(1);
      expect(locationsA).toHaveLength(1);
      expect(inventoriesA).toHaveLength(1);

      expect(suppliersA[0].code).toBe('SUP-COMPLEX-A');
      expect(productsA[0].sku).toBe('PROD-COMPLEX-A');
      expect(locationsA[0].code).toBe('LOC-COMPLEX-A');
      expect(inventoriesA[0].quantityOnHand).toBe(500);

      // Verify complete isolation for Tenant B
      setCurrentTenant(TENANT_B);
      const suppliersB = await supplierService.findAll();
      const productsB = await productService.findAll();
      const locationsB = await locationService.findAll();
      const inventoriesB = await inventoryService.findAll();

      expect(suppliersB).toHaveLength(1);
      expect(productsB).toHaveLength(1);
      expect(locationsB).toHaveLength(1);
      expect(inventoriesB).toHaveLength(1);

      expect(suppliersB[0].code).toBe('SUP-COMPLEX-B');
      expect(productsB[0].sku).toBe('PROD-COMPLEX-B');
      expect(locationsB[0].code).toBe('LOC-COMPLEX-B');
      expect(inventoriesB[0].quantityOnHand).toBe(1000);
    });
  });
});
