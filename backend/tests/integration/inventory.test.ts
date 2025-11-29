/**
 * Inventory Integration Tests
 *
 * Tests CRUD operations and constraints for Inventory entity.
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { prisma, setCurrentTenant, clearCurrentTenant } from './setup';
import { inventoryService, productService, locationService, supplierService } from '../../src/services';
import { LocationType } from '@prisma/client';

describe('Inventory Integration Tests', () => {
  const TEST_TENANT = 'test-tenant-001';

  beforeEach(() => {
    setCurrentTenant(TEST_TENANT);
  });

  it('should create an inventory record', async () => {
    // Create dependencies
    const supplier = await supplierService.create({
      code: 'SUP-INV-1',
      name: 'Inventory Test Supplier',
      country: 'USA',
      rating: 4,
    });

    const product = await productService.create({
      sku: 'PROD-INV-1',
      name: 'Inventory Test Product',
      category: 'Electronics',
      leadTimeDays: 30,
      supplier: { connect: { id: supplier.id } },
    });

    const location = await locationService.create({
      code: 'LOC-INV-1',
      name: 'Inventory Test Location',
      type: LocationType.WAREHOUSE,
      country: 'USA',
    });

    const inventory = await inventoryService.create({
      product: { connect: { id: product.id } },
      location: { connect: { id: location.id } },
      quantityOnHand: 1000,
      quantityReserved: 200,
      reorderPoint: 300,
      lastCountDate: new Date('2024-01-15'),
    });

    expect(inventory.id).toBeDefined();
    expect(inventory.tenantId).toBe(TEST_TENANT);
    expect(inventory.productId).toBe(product.id);
    expect(inventory.locationId).toBe(location.id);
    expect(inventory.quantityOnHand).toBe(1000);
    expect(inventory.quantityReserved).toBe(200);
    expect(inventory.reorderPoint).toBe(300);
  });

  it('should find inventory by ID', async () => {
    const supplier = await supplierService.create({
      code: 'SUP-INV-2',
      name: 'Test Supplier 2',
      country: 'China',
      rating: 5,
    });

    const product = await productService.create({
      sku: 'PROD-INV-2',
      name: 'Test Product 2',
      category: 'Hardware',
      leadTimeDays: 45,
      supplier: { connect: { id: supplier.id } },
    });

    const location = await locationService.create({
      code: 'LOC-INV-2',
      name: 'Test Location 2',
      type: LocationType.WAREHOUSE,
      country: 'USA',
    });

    const created = await inventoryService.create({
      product: { connect: { id: product.id } },
      location: { connect: { id: location.id } },
      quantityOnHand: 500,
      quantityReserved: 50,
      reorderPoint: 100,
    });

    const found = await inventoryService.findById(created.id);

    expect(found).toBeDefined();
    expect(found?.id).toBe(created.id);
    expect(found?.quantityOnHand).toBe(500);
    expect(found?.quantityReserved).toBe(50);
  });

  it('should find all inventory records', async () => {
    const supplier = await supplierService.create({
      code: 'SUP-INV-3',
      name: 'Test Supplier 3',
      country: 'Germany',
      rating: 4,
    });

    const product1 = await productService.create({
      sku: 'PROD-INV-3A',
      name: 'Product 3A',
      category: 'Category',
      leadTimeDays: 20,
      supplier: { connect: { id: supplier.id } },
    });

    const product2 = await productService.create({
      sku: 'PROD-INV-3B',
      name: 'Product 3B',
      category: 'Category',
      leadTimeDays: 25,
      supplier: { connect: { id: supplier.id } },
    });

    const location = await locationService.create({
      code: 'LOC-INV-3',
      name: 'Test Location 3',
      type: LocationType.WAREHOUSE,
      country: 'USA',
    });

    await inventoryService.create({
      product: { connect: { id: product1.id } },
      location: { connect: { id: location.id } },
      quantityOnHand: 100,
    });

    await inventoryService.create({
      product: { connect: { id: product2.id } },
      location: { connect: { id: location.id } },
      quantityOnHand: 200,
    });

    const inventories = await inventoryService.findAll();

    expect(inventories).toHaveLength(2);
    expect(inventories.every(i => i.tenantId === TEST_TENANT)).toBe(true);
  });

  it('should update inventory', async () => {
    const supplier = await supplierService.create({
      code: 'SUP-INV-4',
      name: 'Test Supplier 4',
      country: 'Japan',
      rating: 5,
    });

    const product = await productService.create({
      sku: 'PROD-INV-4',
      name: 'Test Product 4',
      category: 'Category',
      leadTimeDays: 30,
      supplier: { connect: { id: supplier.id } },
    });

    const location = await locationService.create({
      code: 'LOC-INV-4',
      name: 'Test Location 4',
      type: LocationType.WAREHOUSE,
      country: 'USA',
    });

    const created = await inventoryService.create({
      product: { connect: { id: product.id } },
      location: { connect: { id: location.id } },
      quantityOnHand: 500,
      quantityReserved: 50,
      reorderPoint: 100,
    });

    const updated = await inventoryService.update(created.id, {
      quantityOnHand: 750,
      quantityReserved: 100,
      reorderPoint: 150,
      lastCountDate: new Date('2024-02-01'),
    });

    expect(updated.id).toBe(created.id);
    expect(updated.quantityOnHand).toBe(750);
    expect(updated.quantityReserved).toBe(100);
    expect(updated.reorderPoint).toBe(150);
    expect(updated.lastCountDate).toBeDefined();
  });

  it('should delete inventory', async () => {
    const supplier = await supplierService.create({
      code: 'SUP-INV-5',
      name: 'Test Supplier 5',
      country: 'USA',
      rating: 3,
    });

    const product = await productService.create({
      sku: 'PROD-INV-5',
      name: 'Test Product 5',
      category: 'Category',
      leadTimeDays: 15,
      supplier: { connect: { id: supplier.id } },
    });

    const location = await locationService.create({
      code: 'LOC-INV-5',
      name: 'Test Location 5',
      type: LocationType.WAREHOUSE,
      country: 'USA',
    });

    const created = await inventoryService.create({
      product: { connect: { id: product.id } },
      location: { connect: { id: location.id } },
      quantityOnHand: 100,
    });

    await inventoryService.delete(created.id);

    const found = await inventoryService.findById(created.id);
    expect(found).toBeNull();
  });

  it('should enforce unique constraint on product-location combination', async () => {
    const supplier = await supplierService.create({
      code: 'SUP-INV-UNIQUE',
      name: 'Unique Test Supplier',
      country: 'USA',
      rating: 4,
    });

    const product = await productService.create({
      sku: 'PROD-INV-UNIQUE',
      name: 'Unique Test Product',
      category: 'Category',
      leadTimeDays: 20,
      supplier: { connect: { id: supplier.id } },
    });

    const location = await locationService.create({
      code: 'LOC-INV-UNIQUE',
      name: 'Unique Test Location',
      type: LocationType.WAREHOUSE,
      country: 'USA',
    });

    await inventoryService.create({
      product: { connect: { id: product.id } },
      location: { connect: { id: location.id } },
      quantityOnHand: 100,
    });

    // Attempt to create duplicate inventory for same product-location should fail
    await expect(
      inventoryService.create({
        product: { connect: { id: product.id } },
        location: { connect: { id: location.id } },
        quantityOnHand: 200,
      })
    ).rejects.toThrow();
  });

  it('should allow same product in different locations', async () => {
    const supplier = await supplierService.create({
      code: 'SUP-INV-MULTI',
      name: 'Multi Location Supplier',
      country: 'USA',
      rating: 4,
    });

    const product = await productService.create({
      sku: 'PROD-INV-MULTI',
      name: 'Multi Location Product',
      category: 'Category',
      leadTimeDays: 20,
      supplier: { connect: { id: supplier.id } },
    });

    const location1 = await locationService.create({
      code: 'LOC-INV-MULTI-1',
      name: 'Location 1',
      type: LocationType.WAREHOUSE,
      country: 'USA',
    });

    const location2 = await locationService.create({
      code: 'LOC-INV-MULTI-2',
      name: 'Location 2',
      type: LocationType.WAREHOUSE,
      country: 'USA',
    });

    const inventory1 = await inventoryService.create({
      product: { connect: { id: product.id } },
      location: { connect: { id: location1.id } },
      quantityOnHand: 100,
    });

    const inventory2 = await inventoryService.create({
      product: { connect: { id: product.id } },
      location: { connect: { id: location2.id } },
      quantityOnHand: 200,
    });

    expect(inventory1.productId).toBe(product.id);
    expect(inventory2.productId).toBe(product.id);
    expect(inventory1.locationId).not.toBe(inventory2.locationId);
  });

  it('should include product and location relationships', async () => {
    const supplier = await supplierService.create({
      code: 'SUP-INV-REL',
      name: 'Relationship Test Supplier',
      country: 'Canada',
      rating: 5,
    });

    const product = await productService.create({
      sku: 'PROD-INV-REL',
      name: 'Relationship Test Product',
      category: 'Category',
      leadTimeDays: 25,
      supplier: { connect: { id: supplier.id } },
    });

    const location = await locationService.create({
      code: 'LOC-INV-REL',
      name: 'Relationship Test Location',
      type: LocationType.DISTRIBUTION_CENTER,
      country: 'Canada',
    });

    const inventory = await inventoryService.create({
      product: { connect: { id: product.id } },
      location: { connect: { id: location.id } },
      quantityOnHand: 150,
    });

    const inventoryWithRelations = await prisma.inventory.findUnique({
      where: { id: inventory.id },
      include: {
        product: true,
        location: true,
      },
    });

    expect(inventoryWithRelations).toBeDefined();
    expect(inventoryWithRelations?.product.id).toBe(product.id);
    expect(inventoryWithRelations?.product.sku).toBe('PROD-INV-REL');
    expect(inventoryWithRelations?.location.id).toBe(location.id);
    expect(inventoryWithRelations?.location.code).toBe('LOC-INV-REL');
  });

  it('should default quantities to 0 when not specified', async () => {
    const supplier = await supplierService.create({
      code: 'SUP-INV-DEFAULT',
      name: 'Default Test Supplier',
      country: 'USA',
      rating: 4,
    });

    const product = await productService.create({
      sku: 'PROD-INV-DEFAULT',
      name: 'Default Test Product',
      category: 'Category',
      leadTimeDays: 20,
      supplier: { connect: { id: supplier.id } },
    });

    const location = await locationService.create({
      code: 'LOC-INV-DEFAULT',
      name: 'Default Test Location',
      type: LocationType.WAREHOUSE,
      country: 'USA',
    });

    const inventory = await inventoryService.create({
      product: { connect: { id: product.id } },
      location: { connect: { id: location.id } },
    });

    expect(inventory.quantityOnHand).toBe(0);
    expect(inventory.quantityReserved).toBe(0);
    expect(inventory.reorderPoint).toBe(0);
  });

  it('should filter inventory by product', async () => {
    const supplier = await supplierService.create({
      code: 'SUP-INV-FILTER',
      name: 'Filter Test Supplier',
      country: 'USA',
      rating: 4,
    });

    const product1 = await productService.create({
      sku: 'PROD-INV-F1',
      name: 'Filter Product 1',
      category: 'Category',
      leadTimeDays: 20,
      supplier: { connect: { id: supplier.id } },
    });

    const product2 = await productService.create({
      sku: 'PROD-INV-F2',
      name: 'Filter Product 2',
      category: 'Category',
      leadTimeDays: 25,
      supplier: { connect: { id: supplier.id } },
    });

    const location = await locationService.create({
      code: 'LOC-INV-FILTER',
      name: 'Filter Test Location',
      type: LocationType.WAREHOUSE,
      country: 'USA',
    });

    await inventoryService.create({
      product: { connect: { id: product1.id } },
      location: { connect: { id: location.id } },
      quantityOnHand: 100,
    });

    await inventoryService.create({
      product: { connect: { id: product2.id } },
      location: { connect: { id: location.id } },
      quantityOnHand: 200,
    });

    const product1Inventory = await inventoryService.findAll({
      productId: product1.id,
    });

    expect(product1Inventory).toHaveLength(1);
    expect(product1Inventory[0].productId).toBe(product1.id);
    expect(product1Inventory[0].quantityOnHand).toBe(100);
  });

  it('should filter inventory by location', async () => {
    const supplier = await supplierService.create({
      code: 'SUP-INV-LOC-FILTER',
      name: 'Location Filter Supplier',
      country: 'USA',
      rating: 4,
    });

    const product = await productService.create({
      sku: 'PROD-INV-LOC-FILTER',
      name: 'Location Filter Product',
      category: 'Category',
      leadTimeDays: 20,
      supplier: { connect: { id: supplier.id } },
    });

    const location1 = await locationService.create({
      code: 'LOC-INV-LF1',
      name: 'Location Filter 1',
      type: LocationType.WAREHOUSE,
      country: 'USA',
    });

    const location2 = await locationService.create({
      code: 'LOC-INV-LF2',
      name: 'Location Filter 2',
      type: LocationType.WAREHOUSE,
      country: 'USA',
    });

    await inventoryService.create({
      product: { connect: { id: product.id } },
      location: { connect: { id: location1.id } },
      quantityOnHand: 100,
    });

    await inventoryService.create({
      product: { connect: { id: product.id } },
      location: { connect: { id: location2.id } },
      quantityOnHand: 200,
    });

    const location1Inventory = await inventoryService.findAll({
      locationId: location1.id,
    });

    expect(location1Inventory).toHaveLength(1);
    expect(location1Inventory[0].locationId).toBe(location1.id);
    expect(location1Inventory[0].quantityOnHand).toBe(100);
  });
});
