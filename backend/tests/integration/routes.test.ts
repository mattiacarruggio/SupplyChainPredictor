/**
 * Shipment Route Integration Tests
 *
 * Tests CRUD operations, relationships, and constraints for ShipmentRoute entity.
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { prisma, setCurrentTenant, clearCurrentTenant } from './setup';
import { shipmentRouteService, locationService } from '../../src/services';
import { LocationType, TransportMode } from '@prisma/client';

describe('Shipment Route Integration Tests', () => {
  const TEST_TENANT = 'test-tenant-001';

  beforeEach(() => {
    setCurrentTenant(TEST_TENANT);
  });

  it('should create a shipment route', async () => {
    // Create origin and destination locations
    const origin = await locationService.create({
      code: 'LOC-ORIGIN-1',
      name: 'Los Angeles Port',
      type: LocationType.PORT,
      country: 'USA',
    });

    const destination = await locationService.create({
      code: 'LOC-DEST-1',
      name: 'New York Warehouse',
      type: LocationType.WAREHOUSE,
      country: 'USA',
    });

    const route = await shipmentRouteService.create({
      originLocation: { connect: { id: origin.id } },
      destinationLocation: { connect: { id: destination.id } },
      transitTimeDays: 7,
      transportMode: TransportMode.TRUCK,
      distance: 2800,
      cost: 5000,
    });

    expect(route.id).toBeDefined();
    expect(route.tenantId).toBe(TEST_TENANT);
    expect(route.originLocationId).toBe(origin.id);
    expect(route.destinationLocationId).toBe(destination.id);
    expect(route.transitTimeDays).toBe(7);
    expect(route.transportMode).toBe(TransportMode.TRUCK);
    expect(Number(route.distance)).toBe(2800);
    expect(Number(route.cost)).toBe(5000);
  });

  it('should find route by ID', async () => {
    const origin = await locationService.create({
      code: 'LOC-ORIGIN-2',
      name: 'Shanghai Port',
      type: LocationType.PORT,
      country: 'China',
    });

    const destination = await locationService.create({
      code: 'LOC-DEST-2',
      name: 'Singapore Port',
      type: LocationType.PORT,
      country: 'Singapore',
    });

    const created = await shipmentRouteService.create({
      originLocation: { connect: { id: origin.id } },
      destinationLocation: { connect: { id: destination.id } },
      transitTimeDays: 14,
      transportMode: TransportMode.SEA,
    });

    const found = await shipmentRouteService.findById(created.id);

    expect(found).toBeDefined();
    expect(found?.id).toBe(created.id);
    expect(found?.transportMode).toBe(TransportMode.SEA);
    expect(found?.transitTimeDays).toBe(14);
  });

  it('should find all routes', async () => {
    const loc1 = await locationService.create({
      code: 'LOC-1',
      name: 'Location 1',
      type: LocationType.WAREHOUSE,
      country: 'USA',
    });

    const loc2 = await locationService.create({
      code: 'LOC-2',
      name: 'Location 2',
      type: LocationType.WAREHOUSE,
      country: 'USA',
    });

    const loc3 = await locationService.create({
      code: 'LOC-3',
      name: 'Location 3',
      type: LocationType.PORT,
      country: 'Canada',
    });

    await shipmentRouteService.create({
      originLocation: { connect: { id: loc1.id } },
      destinationLocation: { connect: { id: loc2.id } },
      transitTimeDays: 5,
      transportMode: TransportMode.TRUCK,
    });

    await shipmentRouteService.create({
      originLocation: { connect: { id: loc2.id } },
      destinationLocation: { connect: { id: loc3.id } },
      transitTimeDays: 10,
      transportMode: TransportMode.RAIL,
    });

    const routes = await shipmentRouteService.findAll();

    expect(routes).toHaveLength(2);
    expect(routes.every(r => r.tenantId === TEST_TENANT)).toBe(true);
  });

  it('should update a route', async () => {
    const origin = await locationService.create({
      code: 'LOC-ORIGIN-3',
      name: 'Origin Location',
      type: LocationType.FACTORY,
      country: 'China',
    });

    const destination = await locationService.create({
      code: 'LOC-DEST-3',
      name: 'Destination Location',
      type: LocationType.WAREHOUSE,
      country: 'USA',
    });

    const created = await shipmentRouteService.create({
      originLocation: { connect: { id: origin.id } },
      destinationLocation: { connect: { id: destination.id } },
      transitTimeDays: 30,
      transportMode: TransportMode.SEA,
      distance: 10000,
      cost: 15000,
    });

    const updated = await shipmentRouteService.update(created.id, {
      transitTimeDays: 25,
      cost: 12000,
      distance: 9500,
    });

    expect(updated.id).toBe(created.id);
    expect(updated.transitTimeDays).toBe(25);
    expect(Number(updated.cost)).toBe(12000);
    expect(Number(updated.distance)).toBe(9500);
    expect(updated.transportMode).toBe(TransportMode.SEA); // Unchanged
  });

  it('should delete a route', async () => {
    const origin = await locationService.create({
      code: 'LOC-ORIGIN-4',
      name: 'Origin',
      type: LocationType.PORT,
      country: 'USA',
    });

    const destination = await locationService.create({
      code: 'LOC-DEST-4',
      name: 'Destination',
      type: LocationType.PORT,
      country: 'Japan',
    });

    const created = await shipmentRouteService.create({
      originLocation: { connect: { id: origin.id } },
      destinationLocation: { connect: { id: destination.id } },
      transitTimeDays: 20,
      transportMode: TransportMode.SEA,
    });

    await shipmentRouteService.delete(created.id);

    const found = await shipmentRouteService.findById(created.id);
    expect(found).toBeNull();
  });

  it('should enforce unique constraint on route combination', async () => {
    const origin = await locationService.create({
      code: 'LOC-ORIGIN-UNIQUE',
      name: 'Unique Origin',
      type: LocationType.WAREHOUSE,
      country: 'USA',
    });

    const destination = await locationService.create({
      code: 'LOC-DEST-UNIQUE',
      name: 'Unique Destination',
      type: LocationType.WAREHOUSE,
      country: 'USA',
    });

    await shipmentRouteService.create({
      originLocation: { connect: { id: origin.id } },
      destinationLocation: { connect: { id: destination.id } },
      transitTimeDays: 5,
      transportMode: TransportMode.TRUCK,
    });

    // Same origin, destination, and transport mode should fail
    await expect(
      shipmentRouteService.create({
        originLocation: { connect: { id: origin.id } },
        destinationLocation: { connect: { id: destination.id } },
        transitTimeDays: 6,
        transportMode: TransportMode.TRUCK,
      })
    ).rejects.toThrow();
  });

  it('should allow multiple routes with different transport modes', async () => {
    const origin = await locationService.create({
      code: 'LOC-ORIGIN-MULTI',
      name: 'Multi-mode Origin',
      type: LocationType.PORT,
      country: 'China',
    });

    const destination = await locationService.create({
      code: 'LOC-DEST-MULTI',
      name: 'Multi-mode Destination',
      type: LocationType.PORT,
      country: 'USA',
    });

    const seaRoute = await shipmentRouteService.create({
      originLocation: { connect: { id: origin.id } },
      destinationLocation: { connect: { id: destination.id } },
      transitTimeDays: 30,
      transportMode: TransportMode.SEA,
    });

    const airRoute = await shipmentRouteService.create({
      originLocation: { connect: { id: origin.id } },
      destinationLocation: { connect: { id: destination.id } },
      transitTimeDays: 2,
      transportMode: TransportMode.AIR,
    });

    expect(seaRoute.id).toBeDefined();
    expect(airRoute.id).toBeDefined();
    expect(seaRoute.id).not.toBe(airRoute.id);
    expect(seaRoute.transportMode).toBe(TransportMode.SEA);
    expect(airRoute.transportMode).toBe(TransportMode.AIR);
  });

  it('should include origin and destination relationships', async () => {
    const origin = await locationService.create({
      code: 'LOC-ORIGIN-REL',
      name: 'Origin with Relationships',
      type: LocationType.FACTORY,
      country: 'Germany',
    });

    const destination = await locationService.create({
      code: 'LOC-DEST-REL',
      name: 'Destination with Relationships',
      type: LocationType.DISTRIBUTION_CENTER,
      country: 'France',
    });

    const route = await shipmentRouteService.create({
      originLocation: { connect: { id: origin.id } },
      destinationLocation: { connect: { id: destination.id } },
      transitTimeDays: 3,
      transportMode: TransportMode.TRUCK,
    });

    const routeWithLocations = await prisma.shipmentRoute.findUnique({
      where: { id: route.id },
      include: {
        originLocation: true,
        destinationLocation: true,
      },
    });

    expect(routeWithLocations).toBeDefined();
    expect(routeWithLocations?.originLocation.id).toBe(origin.id);
    expect(routeWithLocations?.originLocation.name).toBe('Origin with Relationships');
    expect(routeWithLocations?.destinationLocation.id).toBe(destination.id);
    expect(routeWithLocations?.destinationLocation.name).toBe('Destination with Relationships');
  });

  it('should validate TransportMode enum', async () => {
    const origin = await locationService.create({
      code: 'LOC-ORIGIN-MODES',
      name: 'Modes Origin',
      type: LocationType.PORT,
      country: 'USA',
    });

    const destination = await locationService.create({
      code: 'LOC-DEST-MODES',
      name: 'Modes Destination',
      type: LocationType.PORT,
      country: 'Japan',
    });

    const modes = [
      TransportMode.AIR,
      TransportMode.SEA,
      TransportMode.RAIL,
      TransportMode.TRUCK,
      TransportMode.MULTIMODAL,
    ];

    for (const mode of modes) {
      const route = await shipmentRouteService.create({
        originLocation: { connect: { id: origin.id } },
        destinationLocation: { connect: { id: destination.id } },
        transitTimeDays: 10,
        transportMode: mode,
      });

      expect(route.transportMode).toBe(mode);

      // Clean up for next iteration
      await shipmentRouteService.delete(route.id);
    }
  });

  it('should filter routes by transport mode', async () => {
    const origin = await locationService.create({
      code: 'LOC-ORIGIN-FILTER',
      name: 'Filter Origin',
      type: LocationType.PORT,
      country: 'USA',
    });

    const dest1 = await locationService.create({
      code: 'LOC-DEST-SEA',
      name: 'Sea Destination',
      type: LocationType.PORT,
      country: 'China',
    });

    const dest2 = await locationService.create({
      code: 'LOC-DEST-AIR',
      name: 'Air Destination',
      type: LocationType.PORT,
      country: 'China',
    });

    await shipmentRouteService.create({
      originLocation: { connect: { id: origin.id } },
      destinationLocation: { connect: { id: dest1.id } },
      transitTimeDays: 30,
      transportMode: TransportMode.SEA,
    });

    await shipmentRouteService.create({
      originLocation: { connect: { id: origin.id } },
      destinationLocation: { connect: { id: dest2.id } },
      transitTimeDays: 2,
      transportMode: TransportMode.AIR,
    });

    const seaRoutes = await shipmentRouteService.findAll({
      transportMode: TransportMode.SEA,
    });

    expect(seaRoutes).toHaveLength(1);
    expect(seaRoutes[0].transportMode).toBe(TransportMode.SEA);
  });
});
