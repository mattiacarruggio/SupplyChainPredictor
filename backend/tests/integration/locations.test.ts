/**
 * Location Integration Tests
 *
 * Tests CRUD operations, enum validation, and constraints for Location entity.
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { prisma, setCurrentTenant, clearCurrentTenant } from './setup';
import { locationService } from '../../src/services';
import { LocationType, LocationStatus } from '@prisma/client';

describe('Location Integration Tests', () => {
  const TEST_TENANT = 'test-tenant-001';

  beforeEach(() => {
    setCurrentTenant(TEST_TENANT);
  });

  it('should create a location', async () => {
    const location = await locationService.create({
      code: 'LOC-001',
      name: 'New York Warehouse',
      type: LocationType.WAREHOUSE,
      address: '100 Industrial Blvd',
      city: 'New York',
      state: 'NY',
      country: 'USA',
      postalCode: '10001',
      latitude: 40.7128,
      longitude: -74.0060,
      capacity: 50000,
      status: LocationStatus.ACTIVE,
    });

    expect(location.id).toBeDefined();
    expect(location.tenantId).toBe(TEST_TENANT);
    expect(location.code).toBe('LOC-001');
    expect(location.name).toBe('New York Warehouse');
    expect(location.type).toBe(LocationType.WAREHOUSE);
    expect(location.status).toBe(LocationStatus.ACTIVE);
    expect(location.country).toBe('USA');
    expect(location.capacity).toBe(50000);
  });

  it('should find location by ID', async () => {
    const created = await locationService.create({
      code: 'LOC-002',
      name: 'Shanghai Factory',
      type: LocationType.FACTORY,
      country: 'China',
      city: 'Shanghai',
      status: LocationStatus.ACTIVE,
    });

    const found = await locationService.findById(created.id);

    expect(found).toBeDefined();
    expect(found?.id).toBe(created.id);
    expect(found?.code).toBe('LOC-002');
    expect(found?.name).toBe('Shanghai Factory');
    expect(found?.type).toBe(LocationType.FACTORY);
  });

  it('should find all locations', async () => {
    await locationService.create({
      code: 'LOC-003',
      name: 'Location One',
      type: LocationType.WAREHOUSE,
      country: 'USA',
    });

    await locationService.create({
      code: 'LOC-004',
      name: 'Location Two',
      type: LocationType.PORT,
      country: 'USA',
    });

    const locations = await locationService.findAll();

    expect(locations).toHaveLength(2);
    expect(locations.every(l => l.tenantId === TEST_TENANT)).toBe(true);
  });

  it('should update a location', async () => {
    const created = await locationService.create({
      code: 'LOC-005',
      name: 'Original Name',
      type: LocationType.WAREHOUSE,
      country: 'USA',
      status: LocationStatus.ACTIVE,
    });

    const updated = await locationService.update(created.id, {
      name: 'Updated Name',
      status: LocationStatus.MAINTENANCE,
      capacity: 75000,
    });

    expect(updated.id).toBe(created.id);
    expect(updated.name).toBe('Updated Name');
    expect(updated.status).toBe(LocationStatus.MAINTENANCE);
    expect(updated.capacity).toBe(75000);
    expect(updated.code).toBe('LOC-005'); // Unchanged
  });

  it('should delete a location', async () => {
    const created = await locationService.create({
      code: 'LOC-006',
      name: 'To Be Deleted',
      type: LocationType.DISTRIBUTION_CENTER,
      country: 'Canada',
    });

    await locationService.delete(created.id);

    const found = await locationService.findById(created.id);
    expect(found).toBeNull();
  });

  it('should enforce unique constraint on location code', async () => {
    await locationService.create({
      code: 'LOC-UNIQUE',
      name: 'First Location',
      type: LocationType.WAREHOUSE,
      country: 'USA',
    });

    // Attempt to create location with same code should fail
    await expect(
      locationService.create({
        code: 'LOC-UNIQUE',
        name: 'Second Location',
        type: LocationType.PORT,
        country: 'Canada',
      })
    ).rejects.toThrow();
  });

  it('should validate LocationType enum', async () => {
    const validTypes = [
      LocationType.WAREHOUSE,
      LocationType.FACTORY,
      LocationType.DISTRIBUTION_CENTER,
      LocationType.PORT,
      LocationType.SUPPLIER_SITE,
    ];

    for (const type of validTypes) {
      const location = await locationService.create({
        code: `LOC-${type}`,
        name: `Test ${type}`,
        type: type,
        country: 'USA',
      });

      expect(location.type).toBe(type);
    }

    const locations = await locationService.findAll();
    expect(locations).toHaveLength(validTypes.length);
  });

  it('should validate LocationStatus enum', async () => {
    const activeLocation = await locationService.create({
      code: 'LOC-ACTIVE',
      name: 'Active Location',
      type: LocationType.WAREHOUSE,
      country: 'USA',
      status: LocationStatus.ACTIVE,
    });

    const inactiveLocation = await locationService.create({
      code: 'LOC-INACTIVE',
      name: 'Inactive Location',
      type: LocationType.WAREHOUSE,
      country: 'USA',
      status: LocationStatus.INACTIVE,
    });

    const maintenanceLocation = await locationService.create({
      code: 'LOC-MAINTENANCE',
      name: 'Maintenance Location',
      type: LocationType.WAREHOUSE,
      country: 'USA',
      status: LocationStatus.MAINTENANCE,
    });

    expect(activeLocation.status).toBe(LocationStatus.ACTIVE);
    expect(inactiveLocation.status).toBe(LocationStatus.INACTIVE);
    expect(maintenanceLocation.status).toBe(LocationStatus.MAINTENANCE);
  });

  it('should default to ACTIVE status when not specified', async () => {
    const location = await locationService.create({
      code: 'LOC-DEFAULT',
      name: 'Default Status Location',
      type: LocationType.WAREHOUSE,
      country: 'USA',
    });

    expect(location.status).toBe(LocationStatus.ACTIVE);
  });

  it('should filter locations by type', async () => {
    await locationService.create({
      code: 'LOC-W1',
      name: 'Warehouse 1',
      type: LocationType.WAREHOUSE,
      country: 'USA',
    });

    await locationService.create({
      code: 'LOC-F1',
      name: 'Factory 1',
      type: LocationType.FACTORY,
      country: 'USA',
    });

    const warehouses = await locationService.findAll({
      type: LocationType.WAREHOUSE,
    });

    expect(warehouses).toHaveLength(1);
    expect(warehouses[0].type).toBe(LocationType.WAREHOUSE);
    expect(warehouses[0].code).toBe('LOC-W1');
  });

  it('should filter locations by status', async () => {
    await locationService.create({
      code: 'LOC-A1',
      name: 'Active Location',
      type: LocationType.WAREHOUSE,
      country: 'USA',
      status: LocationStatus.ACTIVE,
    });

    await locationService.create({
      code: 'LOC-I1',
      name: 'Inactive Location',
      type: LocationType.WAREHOUSE,
      country: 'USA',
      status: LocationStatus.INACTIVE,
    });

    const activeLocations = await locationService.findAll({
      status: LocationStatus.ACTIVE,
    });

    expect(activeLocations).toHaveLength(1);
    expect(activeLocations[0].status).toBe(LocationStatus.ACTIVE);
    expect(activeLocations[0].code).toBe('LOC-A1');
  });

  it('should filter locations by country', async () => {
    await locationService.create({
      code: 'LOC-USA',
      name: 'USA Location',
      type: LocationType.WAREHOUSE,
      country: 'USA',
    });

    await locationService.create({
      code: 'LOC-CHN',
      name: 'China Location',
      type: LocationType.FACTORY,
      country: 'China',
    });

    const usaLocations = await locationService.findAll({ country: 'USA' });

    expect(usaLocations).toHaveLength(1);
    expect(usaLocations[0].country).toBe('USA');
    expect(usaLocations[0].code).toBe('LOC-USA');
  });

  it('should store decimal coordinates', async () => {
    const location = await locationService.create({
      code: 'LOC-COORDS',
      name: 'Location with Coordinates',
      type: LocationType.PORT,
      country: 'Singapore',
      latitude: 1.3521,
      longitude: 103.8198,
    });

    expect(location.latitude).toBeDefined();
    expect(location.longitude).toBeDefined();
    expect(Number(location.latitude)).toBeCloseTo(1.3521, 4);
    expect(Number(location.longitude)).toBeCloseTo(103.8198, 4);
  });
});
