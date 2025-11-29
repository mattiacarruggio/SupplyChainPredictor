/**
 * Risk Event Integration Tests
 *
 * Tests CRUD operations, many-to-many relationships, and constraints for RiskEvent entity.
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { prisma, setCurrentTenant, clearCurrentTenant } from './setup';
import { riskEventService, supplierService, productService, locationService, shipmentRouteService } from '../../src/services';
import { EventType, RiskSeverity, RiskStatus, LocationType, TransportMode } from '@prisma/client';

describe('Risk Event Integration Tests', () => {
  const TEST_TENANT = 'test-tenant-001';

  beforeEach(() => {
    setCurrentTenant(TEST_TENANT);
  });

  it('should create a risk event', async () => {
    const riskEvent = await riskEventService.create({
      eventType: EventType.WEATHER,
      severity: RiskSeverity.HIGH,
      status: RiskStatus.ACTIVE,
      startDate: new Date('2024-01-15'),
      title: 'Severe Winter Storm',
      description: 'Major snowstorm affecting East Coast shipping routes',
      impactAssessment: 'Expected delays of 3-5 days for all shipments',
      mitigationPlan: 'Reroute shipments through southern routes',
    });

    expect(riskEvent.id).toBeDefined();
    expect(riskEvent.tenantId).toBe(TEST_TENANT);
    expect(riskEvent.eventType).toBe(EventType.WEATHER);
    expect(riskEvent.severity).toBe(RiskSeverity.HIGH);
    expect(riskEvent.status).toBe(RiskStatus.ACTIVE);
    expect(riskEvent.title).toBe('Severe Winter Storm');
  });

  it('should find risk event by ID', async () => {
    const created = await riskEventService.create({
      eventType: EventType.SUPPLIER_FAILURE,
      severity: RiskSeverity.CRITICAL,
      status: RiskStatus.ACTIVE,
      startDate: new Date('2024-02-01'),
      title: 'Supplier Bankruptcy',
      description: 'Major supplier filed for bankruptcy',
    });

    const found = await riskEventService.findById(created.id);

    expect(found).toBeDefined();
    expect(found?.id).toBe(created.id);
    expect(found?.eventType).toBe(EventType.SUPPLIER_FAILURE);
    expect(found?.severity).toBe(RiskSeverity.CRITICAL);
  });

  it('should find all risk events', async () => {
    await riskEventService.create({
      eventType: EventType.WEATHER,
      severity: RiskSeverity.MEDIUM,
      status: RiskStatus.ACTIVE,
      startDate: new Date('2024-03-01'),
      title: 'Event One',
      description: 'Description one',
    });

    await riskEventService.create({
      eventType: EventType.POLITICAL,
      severity: RiskSeverity.HIGH,
      status: RiskStatus.MONITORING,
      startDate: new Date('2024-03-15'),
      title: 'Event Two',
      description: 'Description two',
    });

    const riskEvents = await riskEventService.findAll();

    expect(riskEvents).toHaveLength(2);
    expect(riskEvents.every(r => r.tenantId === TEST_TENANT)).toBe(true);
  });

  it('should update a risk event', async () => {
    const created = await riskEventService.create({
      eventType: EventType.TRANSPORTATION_DISRUPTION,
      severity: RiskSeverity.MEDIUM,
      status: RiskStatus.ACTIVE,
      startDate: new Date('2024-04-01'),
      title: 'Port Congestion',
      description: 'Delays at major port',
    });

    const updated = await riskEventService.update(created.id, {
      severity: RiskSeverity.LOW,
      status: RiskStatus.MITIGATED,
      resolutionDate: new Date('2024-04-10'),
      mitigationPlan: 'Used alternative port successfully',
    });

    expect(updated.id).toBe(created.id);
    expect(updated.severity).toBe(RiskSeverity.LOW);
    expect(updated.status).toBe(RiskStatus.MITIGATED);
    expect(updated.resolutionDate).toBeDefined();
    expect(updated.mitigationPlan).toBe('Used alternative port successfully');
  });

  it('should delete a risk event', async () => {
    const created = await riskEventService.create({
      eventType: EventType.QUALITY_ISSUE,
      severity: RiskSeverity.LOW,
      status: RiskStatus.RESOLVED,
      startDate: new Date('2024-05-01'),
      resolutionDate: new Date('2024-05-05'),
      title: 'Minor Quality Issue',
      description: 'Resolved quality concern',
    });

    await riskEventService.delete(created.id);

    const found = await riskEventService.findById(created.id);
    expect(found).toBeNull();
  });

  it('should validate EventType enum', async () => {
    const eventTypes = [
      EventType.WEATHER,
      EventType.POLITICAL,
      EventType.SUPPLIER_FAILURE,
      EventType.DEMAND_SURGE,
      EventType.TRANSPORTATION_DISRUPTION,
      EventType.QUALITY_ISSUE,
      EventType.REGULATORY_CHANGE,
      EventType.NATURAL_DISASTER,
      EventType.LABOR_STRIKE,
      EventType.CYBER_ATTACK,
    ];

    for (const type of eventTypes) {
      const event = await riskEventService.create({
        eventType: type,
        severity: RiskSeverity.MEDIUM,
        status: RiskStatus.ACTIVE,
        startDate: new Date(),
        title: `Test ${type}`,
        description: `Testing ${type}`,
      });

      expect(event.eventType).toBe(type);
    }
  });

  it('should validate RiskSeverity enum', async () => {
    const severities = [
      RiskSeverity.LOW,
      RiskSeverity.MEDIUM,
      RiskSeverity.HIGH,
      RiskSeverity.CRITICAL,
    ];

    for (const severity of severities) {
      const event = await riskEventService.create({
        eventType: EventType.WEATHER,
        severity: severity,
        status: RiskStatus.ACTIVE,
        startDate: new Date(),
        title: `${severity} Risk`,
        description: `Testing ${severity} severity`,
      });

      expect(event.severity).toBe(severity);
    }
  });

  it('should validate RiskStatus enum', async () => {
    const statuses = [
      RiskStatus.ACTIVE,
      RiskStatus.MONITORING,
      RiskStatus.MITIGATED,
      RiskStatus.RESOLVED,
    ];

    for (const status of statuses) {
      const event = await riskEventService.create({
        eventType: EventType.WEATHER,
        severity: RiskSeverity.MEDIUM,
        status: status,
        startDate: new Date(),
        title: `${status} Event`,
        description: `Testing ${status} status`,
      });

      expect(event.status).toBe(status);
    }
  });

  it('should support many-to-many relationship with Suppliers', async () => {
    const supplier1 = await supplierService.create({
      code: 'SUP-RISK-1',
      name: 'Affected Supplier 1',
      country: 'USA',
      rating: 4,
    });

    const supplier2 = await supplierService.create({
      code: 'SUP-RISK-2',
      name: 'Affected Supplier 2',
      country: 'USA',
      rating: 3,
    });

    const riskEvent = await riskEventService.create({
      eventType: EventType.SUPPLIER_FAILURE,
      severity: RiskSeverity.HIGH,
      status: RiskStatus.ACTIVE,
      startDate: new Date(),
      title: 'Multiple Supplier Risk',
      description: 'Risk affecting multiple suppliers',
      suppliers: {
        create: [
          { supplier: { connect: { id: supplier1.id } } },
          { supplier: { connect: { id: supplier2.id } } },
        ],
      },
    });

    const eventWithSuppliers = await prisma.riskEvent.findUnique({
      where: { id: riskEvent.id },
      include: {
        suppliers: {
          include: { supplier: true },
        },
      },
    });

    expect(eventWithSuppliers?.suppliers).toHaveLength(2);
    expect(eventWithSuppliers?.suppliers.map(s => s.supplier.code)).toContain('SUP-RISK-1');
    expect(eventWithSuppliers?.suppliers.map(s => s.supplier.code)).toContain('SUP-RISK-2');
  });

  it('should support many-to-many relationship with Products', async () => {
    const supplier = await supplierService.create({
      code: 'SUP-PROD-RISK',
      name: 'Product Risk Supplier',
      country: 'China',
      rating: 4,
    });

    const product1 = await productService.create({
      sku: 'PROD-RISK-1',
      name: 'Affected Product 1',
      category: 'Electronics',
      leadTimeDays: 30,
      supplier: { connect: { id: supplier.id } },
    });

    const product2 = await productService.create({
      sku: 'PROD-RISK-2',
      name: 'Affected Product 2',
      category: 'Electronics',
      leadTimeDays: 30,
      supplier: { connect: { id: supplier.id } },
    });

    const riskEvent = await riskEventService.create({
      eventType: EventType.QUALITY_ISSUE,
      severity: RiskSeverity.MEDIUM,
      status: RiskStatus.ACTIVE,
      startDate: new Date(),
      title: 'Product Quality Risk',
      description: 'Quality issues affecting multiple products',
      products: {
        create: [
          { product: { connect: { id: product1.id } } },
          { product: { connect: { id: product2.id } } },
        ],
      },
    });

    const eventWithProducts = await prisma.riskEvent.findUnique({
      where: { id: riskEvent.id },
      include: {
        products: {
          include: { product: true },
        },
      },
    });

    expect(eventWithProducts?.products).toHaveLength(2);
    expect(eventWithProducts?.products.map(p => p.product.sku)).toContain('PROD-RISK-1');
    expect(eventWithProducts?.products.map(p => p.product.sku)).toContain('PROD-RISK-2');
  });

  it('should support many-to-many relationship with Locations', async () => {
    const location1 = await locationService.create({
      code: 'LOC-RISK-1',
      name: 'Affected Location 1',
      type: LocationType.WAREHOUSE,
      country: 'USA',
    });

    const location2 = await locationService.create({
      code: 'LOC-RISK-2',
      name: 'Affected Location 2',
      type: LocationType.PORT,
      country: 'USA',
    });

    const riskEvent = await riskEventService.create({
      eventType: EventType.NATURAL_DISASTER,
      severity: RiskSeverity.CRITICAL,
      status: RiskStatus.ACTIVE,
      startDate: new Date(),
      title: 'Hurricane Warning',
      description: 'Hurricane affecting coastal facilities',
      locations: {
        create: [
          { location: { connect: { id: location1.id } } },
          { location: { connect: { id: location2.id } } },
        ],
      },
    });

    const eventWithLocations = await prisma.riskEvent.findUnique({
      where: { id: riskEvent.id },
      include: {
        locations: {
          include: { location: true },
        },
      },
    });

    expect(eventWithLocations?.locations).toHaveLength(2);
    expect(eventWithLocations?.locations.map(l => l.location.code)).toContain('LOC-RISK-1');
    expect(eventWithLocations?.locations.map(l => l.location.code)).toContain('LOC-RISK-2');
  });

  it('should support many-to-many relationship with Routes', async () => {
    const origin = await locationService.create({
      code: 'LOC-ROUTE-ORIGIN',
      name: 'Route Origin',
      type: LocationType.PORT,
      country: 'China',
    });

    const destination = await locationService.create({
      code: 'LOC-ROUTE-DEST',
      name: 'Route Destination',
      type: LocationType.PORT,
      country: 'USA',
    });

    const route = await shipmentRouteService.create({
      originLocation: { connect: { id: origin.id } },
      destinationLocation: { connect: { id: destination.id } },
      transitTimeDays: 30,
      transportMode: TransportMode.SEA,
    });

    const riskEvent = await riskEventService.create({
      eventType: EventType.TRANSPORTATION_DISRUPTION,
      severity: RiskSeverity.HIGH,
      status: RiskStatus.ACTIVE,
      startDate: new Date(),
      title: 'Port Strike',
      description: 'Labor strike affecting shipping routes',
      routes: {
        create: [
          { route: { connect: { id: route.id } } },
        ],
      },
    });

    const eventWithRoutes = await prisma.riskEvent.findUnique({
      where: { id: riskEvent.id },
      include: {
        routes: {
          include: { route: true },
        },
      },
    });

    expect(eventWithRoutes?.routes).toHaveLength(1);
    expect(eventWithRoutes?.routes[0].route.id).toBe(route.id);
  });

  it('should filter risk events by severity', async () => {
    await riskEventService.create({
      eventType: EventType.WEATHER,
      severity: RiskSeverity.LOW,
      status: RiskStatus.ACTIVE,
      startDate: new Date(),
      title: 'Low Risk Event',
      description: 'Low severity event',
    });

    await riskEventService.create({
      eventType: EventType.WEATHER,
      severity: RiskSeverity.CRITICAL,
      status: RiskStatus.ACTIVE,
      startDate: new Date(),
      title: 'Critical Risk Event',
      description: 'Critical severity event',
    });

    const criticalEvents = await riskEventService.findAll({
      severity: RiskSeverity.CRITICAL,
    });

    expect(criticalEvents).toHaveLength(1);
    expect(criticalEvents[0].severity).toBe(RiskSeverity.CRITICAL);
    expect(criticalEvents[0].title).toBe('Critical Risk Event');
  });

  it('should filter risk events by status', async () => {
    await riskEventService.create({
      eventType: EventType.WEATHER,
      severity: RiskSeverity.MEDIUM,
      status: RiskStatus.ACTIVE,
      startDate: new Date(),
      title: 'Active Event',
      description: 'Active risk',
    });

    await riskEventService.create({
      eventType: EventType.WEATHER,
      severity: RiskSeverity.MEDIUM,
      status: RiskStatus.RESOLVED,
      startDate: new Date('2024-01-01'),
      resolutionDate: new Date('2024-01-10'),
      title: 'Resolved Event',
      description: 'Resolved risk',
    });

    const activeEvents = await riskEventService.findAll({
      status: RiskStatus.ACTIVE,
    });

    expect(activeEvents).toHaveLength(1);
    expect(activeEvents[0].status).toBe(RiskStatus.ACTIVE);
    expect(activeEvents[0].title).toBe('Active Event');
  });
});
