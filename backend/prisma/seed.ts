/**
 * Comprehensive Seed Data Script for Supply Chain Predictor
 *
 * This script generates realistic test data using Faker.js for all entities:
 * - 20 Suppliers
 * - 50 Products
 * - 10 Locations
 * - 15 Shipment Routes
 * - 30 Risk Events
 * - 80 Inventory Records
 * - 5 Users
 *
 * Implements tenant isolation and proper relationship handling.
 */

import { PrismaClient } from '@prisma/client';
import { faker } from '@faker-js/faker';
import { setCurrentTenant, clearCurrentTenant } from '../src/middleware/tenantIsolation';

const prisma = new PrismaClient();

// Helper function to get random item from array
function randomItem<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)];
}

// Helper function to get random items from array
function randomItems<T>(array: T[], count: number): T[] {
  const shuffled = [...array].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, Math.min(count, array.length));
}

// Helper function to get random date in past days
function randomPastDate(days: number): Date {
  const now = new Date();
  const pastDate = new Date(now.getTime() - Math.random() * days * 24 * 60 * 60 * 1000);
  return pastDate;
}

async function main() {
  const TENANT_ID = 'tenant-demo-001';
  setCurrentTenant(TENANT_ID);

  console.log('🌱 Starting database seed...');
  console.log(`📋 Tenant: ${TENANT_ID}\n`);

  // =============================
  // Clean existing data
  // =============================
  console.log('🧹 Cleaning existing data...');

  // Delete junction tables first (due to foreign key constraints)
  await prisma.riskEventRoute.deleteMany({});
  await prisma.riskEventLocation.deleteMany({});
  await prisma.riskEventProduct.deleteMany({});
  await prisma.riskEventSupplier.deleteMany({});

  // Delete main entities
  await prisma.inventory.deleteMany({});
  await prisma.riskEvent.deleteMany({});
  await prisma.shipmentRoute.deleteMany({});
  await prisma.location.deleteMany({});
  await prisma.product.deleteMany({});
  await prisma.supplier.deleteMany({});
  await prisma.user.deleteMany({});

  console.log('   ✓ Existing data cleaned\n');

  // =============================
  // T043: Generate 20 Suppliers
  // =============================
  console.log('👥 Creating 20 suppliers...');

  const countries = [
    'United States', 'China', 'Germany', 'Japan', 'United Kingdom',
    'France', 'India', 'South Korea', 'Canada', 'Italy',
    'Mexico', 'Brazil', 'Taiwan', 'Vietnam', 'Thailand'
  ];

  const suppliers = [];
  for (let i = 1; i <= 20; i++) {
    const supplier = await prisma.supplier.create({
      data: {
        tenantId: TENANT_ID,
        code: `SUP-${String(i).padStart(3, '0')}`,
        name: faker.company.name(),
        country: randomItem(countries),
        contactEmail: faker.internet.email().toLowerCase(),
        contactPhone: faker.phone.number(),
        address: Math.random() > 0.3 ? faker.location.streetAddress(true) : undefined,
        rating: Math.floor(Math.random() * 5) + 1, // 1-5
        notes: Math.random() > 0.5 ? faker.lorem.sentences(2) : undefined,
      },
    });
    suppliers.push(supplier);
  }

  console.log(`   ✓ Created ${suppliers.length} suppliers\n`);

  // =============================
  // T044: Generate 50 Products
  // =============================
  console.log('📦 Creating 50 products...');

  const categories = [
    'Electronics',
    'Automotive',
    'Industrial',
    'Consumer Goods',
    'Raw Materials'
  ];

  const products = [];
  for (let i = 1; i <= 50; i++) {
    const product = await prisma.product.create({
      data: {
        tenantId: TENANT_ID,
        sku: `PROD-${String(i).padStart(3, '0')}`,
        name: faker.commerce.productName(),
        description: Math.random() > 0.4 ? faker.commerce.productDescription() : undefined,
        category: randomItem(categories),
        unitOfMeasure: randomItem(['unit', 'kg', 'liter', 'box', 'pallet']),
        leadTimeDays: Math.floor(Math.random() * 84) + 7, // 7-90 days
        supplierId: randomItem(suppliers).id,
      },
    });
    products.push(product);
  }

  console.log(`   ✓ Created ${products.length} products\n`);

  // =============================
  // T045: Generate 10 Locations
  // =============================
  console.log('🏭 Creating 10 locations...');

  const locationTypes = [
    'WAREHOUSE',
    'FACTORY',
    'DISTRIBUTION_CENTER',
    'PORT',
    'SUPPLIER_SITE'
  ];

  const locationStatuses = ['ACTIVE', 'ACTIVE', 'ACTIVE', 'ACTIVE', 'MAINTENANCE']; // Mostly active

  const locations = [];
  for (let i = 1; i <= 10; i++) {
    const location = await prisma.location.create({
      data: {
        tenantId: TENANT_ID,
        code: `LOC-${String(i).padStart(3, '0')}`,
        name: `${randomItem(['North', 'South', 'East', 'West', 'Central'])} ${randomItem(['Warehouse', 'Distribution Center', 'Factory', 'Hub', 'Terminal'])}`,
        type: randomItem(locationTypes) as any,
        address: faker.location.streetAddress(true),
        city: faker.location.city(),
        state: faker.location.state(),
        country: randomItem(countries),
        postalCode: faker.location.zipCode(),
        latitude: parseFloat(faker.location.latitude()),
        longitude: parseFloat(faker.location.longitude()),
        capacity: Math.floor(Math.random() * 49000) + 1000, // 1000-50000
        status: randomItem(locationStatuses) as any,
      },
    });
    locations.push(location);
  }

  console.log(`   ✓ Created ${locations.length} locations\n`);

  // =============================
  // T046: Generate 15 Shipment Routes
  // =============================
  console.log('🚚 Creating 15 shipment routes...');

  const transportModes = ['AIR', 'SEA', 'RAIL', 'TRUCK', 'MULTIMODAL'];

  const routes = [];
  const routeCombinations = new Set<string>();

  while (routes.length < 15) {
    const origin = randomItem(locations);
    const destination = randomItem(locations);

    // Ensure origin and destination are different
    if (origin.id === destination.id) {
      continue;
    }

    const mode = randomItem(transportModes);
    const routeKey = `${origin.id}-${destination.id}-${mode}`;

    // Ensure no duplicate routes
    if (routeCombinations.has(routeKey)) {
      continue;
    }

    routeCombinations.add(routeKey);

    const route = await prisma.shipmentRoute.create({
      data: {
        tenantId: TENANT_ID,
        originLocationId: origin.id,
        destinationLocationId: destination.id,
        transitTimeDays: Math.floor(Math.random() * 30) + 1, // 1-30 days
        transportMode: mode as any,
        distance: parseFloat((Math.random() * 9900 + 100).toFixed(2)), // 100-10000 km
        cost: parseFloat((Math.random() * 49500 + 500).toFixed(2)), // $500-$50000
      },
    });
    routes.push(route);
  }

  console.log(`   ✓ Created ${routes.length} shipment routes\n`);

  // =============================
  // T047: Generate 30 Risk Events
  // =============================
  console.log('⚠️  Creating 30 risk events...');

  const eventTypes = [
    'WEATHER',
    'POLITICAL',
    'SUPPLIER_FAILURE',
    'DEMAND_SURGE',
    'TRANSPORTATION_DISRUPTION',
    'QUALITY_ISSUE',
    'REGULATORY_CHANGE',
    'NATURAL_DISASTER',
    'LABOR_STRIKE',
    'CYBER_ATTACK'
  ];

  const riskStatuses = ['ACTIVE', 'MONITORING', 'MITIGATED'];

  const riskEventTemplates = {
    WEATHER: {
      titles: ['Hurricane Warning', 'Severe Winter Storm', 'Flooding Alert', 'Heat Wave Impact'],
      descriptions: ['Severe weather conditions affecting transportation routes', 'Extreme temperatures impacting operations', 'Storm system disrupting supply chain'],
    },
    POLITICAL: {
      titles: ['Trade Policy Change', 'Border Restrictions', 'Political Instability', 'Tariff Implementation'],
      descriptions: ['New trade regulations affecting imports', 'Political tensions impacting cross-border shipping', 'Regulatory changes requiring compliance updates'],
    },
    SUPPLIER_FAILURE: {
      titles: ['Supplier Bankruptcy', 'Production Halt', 'Supplier Capacity Issues', 'Quality Control Failure'],
      descriptions: ['Critical supplier experiencing financial difficulties', 'Unexpected production shutdown at supplier facility', 'Supplier unable to meet demand'],
    },
    DEMAND_SURGE: {
      titles: ['Unexpected Demand Spike', 'Seasonal Surge', 'Market Shift', 'Viral Product Demand'],
      descriptions: ['Sudden increase in customer orders', 'Higher than forecasted demand', 'Market conditions driving increased consumption'],
    },
    TRANSPORTATION_DISRUPTION: {
      titles: ['Port Congestion', 'Route Closure', 'Carrier Strike', 'Shipping Delay'],
      descriptions: ['Major transportation hub experiencing delays', 'Key shipping route temporarily unavailable', 'Logistics network disruption'],
    },
    QUALITY_ISSUE: {
      titles: ['Product Recall', 'Quality Defects Found', 'Batch Contamination', 'Non-Conformance'],
      descriptions: ['Quality inspection revealed defects', 'Product failing quality standards', 'Contamination detected in production batch'],
    },
    REGULATORY_CHANGE: {
      titles: ['New Safety Standards', 'Environmental Compliance', 'Import Restrictions', 'Labeling Requirements'],
      descriptions: ['New regulations requiring process changes', 'Updated compliance standards', 'Regulatory body implementing new requirements'],
    },
    NATURAL_DISASTER: {
      titles: ['Earthquake Impact', 'Tsunami Warning', 'Wildfire Threat', 'Volcanic Eruption'],
      descriptions: ['Natural disaster affecting supply chain infrastructure', 'Emergency conditions in key region', 'Natural catastrophe disrupting operations'],
    },
    LABOR_STRIKE: {
      titles: ['Worker Strike', 'Union Negotiation', 'Labor Shortage', 'Employee Walkout'],
      descriptions: ['Labor action impacting production', 'Workforce availability issues', 'Union dispute affecting operations'],
    },
    CYBER_ATTACK: {
      titles: ['Ransomware Attack', 'System Breach', 'Network Intrusion', 'Data Security Incident'],
      descriptions: ['Cybersecurity incident affecting systems', 'IT infrastructure compromised', 'Security breach requiring response'],
    },
  };

  const riskEvents = [];

  // Generate 10 LOW severity events
  for (let i = 0; i < 10; i++) {
    const eventType = randomItem(eventTypes);
    const templates = riskEventTemplates[eventType as keyof typeof riskEventTemplates];
    const status = randomItem(riskStatuses);
    const startDate = randomPastDate(90);

    const event = await prisma.riskEvent.create({
      data: {
        tenantId: TENANT_ID,
        eventType: eventType as any,
        severity: 'LOW',
        status: status as any,
        startDate,
        resolutionDate: status === 'MITIGATED' ? new Date(startDate.getTime() + Math.random() * 30 * 24 * 60 * 60 * 1000) : undefined,
        title: randomItem(templates.titles),
        description: randomItem(templates.descriptions),
        impactAssessment: Math.random() > 0.5 ? faker.lorem.paragraph() : undefined,
        mitigationPlan: status === 'MITIGATED' ? faker.lorem.paragraph() : undefined,
      },
    });
    riskEvents.push(event);
  }

  // Generate 15 MEDIUM severity events
  for (let i = 0; i < 15; i++) {
    const eventType = randomItem(eventTypes);
    const templates = riskEventTemplates[eventType as keyof typeof riskEventTemplates];
    const status = randomItem(riskStatuses);
    const startDate = randomPastDate(90);

    const event = await prisma.riskEvent.create({
      data: {
        tenantId: TENANT_ID,
        eventType: eventType as any,
        severity: 'MEDIUM',
        status: status as any,
        startDate,
        resolutionDate: status === 'MITIGATED' ? new Date(startDate.getTime() + Math.random() * 30 * 24 * 60 * 60 * 1000) : undefined,
        title: randomItem(templates.titles),
        description: randomItem(templates.descriptions),
        impactAssessment: Math.random() > 0.3 ? faker.lorem.paragraph() : undefined,
        mitigationPlan: status === 'MITIGATED' ? faker.lorem.paragraph() : undefined,
      },
    });
    riskEvents.push(event);
  }

  // Generate 5 HIGH severity events
  for (let i = 0; i < 5; i++) {
    const eventType = randomItem(eventTypes);
    const templates = riskEventTemplates[eventType as keyof typeof riskEventTemplates];
    const status = randomItem(riskStatuses);
    const startDate = randomPastDate(90);

    const event = await prisma.riskEvent.create({
      data: {
        tenantId: TENANT_ID,
        eventType: eventType as any,
        severity: 'HIGH',
        status: status as any,
        startDate,
        resolutionDate: status === 'MITIGATED' ? new Date(startDate.getTime() + Math.random() * 30 * 24 * 60 * 60 * 1000) : undefined,
        title: randomItem(templates.titles),
        description: randomItem(templates.descriptions),
        impactAssessment: faker.lorem.paragraph(),
        mitigationPlan: status === 'MITIGATED' ? faker.lorem.paragraph() : undefined,
      },
    });
    riskEvents.push(event);
  }

  console.log(`   ✓ Created ${riskEvents.length} risk events (10 LOW, 15 MEDIUM, 5 HIGH)\n`);

  // Link risk events to entities via junction tables
  console.log('🔗 Linking risk events to entities...');

  for (const event of riskEvents) {
    const relationshipCount = Math.floor(Math.random() * 4) + 2; // 2-5 relationships

    // Link to random suppliers
    const eventSuppliers = randomItems(suppliers, Math.min(relationshipCount, 3));
    for (const supplier of eventSuppliers) {
      await prisma.riskEventSupplier.create({
        data: {
          tenantId: TENANT_ID,
          riskEventId: event.id,
          supplierId: supplier.id,
        },
      });
    }

    // Link to random products
    const eventProducts = randomItems(products, Math.min(relationshipCount, 3));
    for (const product of eventProducts) {
      await prisma.riskEventProduct.create({
        data: {
          tenantId: TENANT_ID,
          riskEventId: event.id,
          productId: product.id,
        },
      });
    }

    // Link to random locations
    const eventLocations = randomItems(locations, Math.min(relationshipCount, 2));
    for (const location of eventLocations) {
      await prisma.riskEventLocation.create({
        data: {
          tenantId: TENANT_ID,
          riskEventId: event.id,
          locationId: location.id,
        },
      });
    }

    // Link to random routes (if applicable)
    if (Math.random() > 0.5 && routes.length > 0) {
      const eventRoutes = randomItems(routes, Math.min(relationshipCount, 2));
      for (const route of eventRoutes) {
        await prisma.riskEventRoute.create({
          data: {
            tenantId: TENANT_ID,
            riskEventId: event.id,
            routeId: route.id,
          },
        });
      }
    }
  }

  console.log('   ✓ Risk events linked to entities\n');

  // =============================
  // T048: Generate 80 Inventory Records
  // =============================
  console.log('📊 Creating 80 inventory records...');

  const inventoryRecords = [];
  const inventoryCombinations = new Set<string>();

  while (inventoryRecords.length < 80) {
    const product = randomItem(products);
    const location = randomItem(locations);
    const inventoryKey = `${product.id}-${location.id}`;

    // Ensure unique product-location combinations
    if (inventoryCombinations.has(inventoryKey)) {
      continue;
    }

    inventoryCombinations.add(inventoryKey);

    const quantityOnHand = Math.floor(Math.random() * 5001); // 0-5000
    const quantityReserved = Math.floor(Math.random() * Math.min(501, quantityOnHand + 1)); // 0-500, but not more than on hand

    const inventory = await prisma.inventory.create({
      data: {
        tenantId: TENANT_ID,
        productId: product.id,
        locationId: location.id,
        quantityOnHand,
        quantityReserved,
        reorderPoint: Math.floor(Math.random() * 901) + 100, // 100-1000
        lastCountDate: randomPastDate(30),
      },
    });
    inventoryRecords.push(inventory);
  }

  console.log(`   ✓ Created ${inventoryRecords.length} inventory records\n`);

  // =============================
  // T049: Generate 5 Users
  // =============================
  console.log('👤 Creating 5 users...');

  const userConfigs = [
    { role: 'ADMIN', name: 'Admin User' },
    { role: 'ANALYST', name: 'Analyst User 1' },
    { role: 'ANALYST', name: 'Analyst User 2' },
    { role: 'VIEWER', name: 'Viewer User' },
    { role: 'PLANNER', name: 'Planner User' },
  ];

  const users = [];
  for (const config of userConfigs) {
    const firstName = faker.person.firstName();
    const lastName = faker.person.lastName();

    const user = await prisma.user.create({
      data: {
        tenantId: TENANT_ID,
        email: faker.internet.email({ firstName, lastName }).toLowerCase(),
        name: `${firstName} ${lastName}`,
        role: config.role as any,
        status: 'ACTIVE',
        lastLoginAt: randomPastDate(7),
      },
    });
    users.push(user);
  }

  console.log(`   ✓ Created ${users.length} users\n`);

  // =============================
  // Summary
  // =============================
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('✅ Seed completed successfully!\n');
  console.log(`   📊 Summary for tenant: ${TENANT_ID}`);
  console.log('   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`   👥 ${suppliers.length} Suppliers`);
  console.log(`   📦 ${products.length} Products`);
  console.log(`   🏭 ${locations.length} Locations`);
  console.log(`   🚚 ${routes.length} Shipment Routes`);
  console.log(`   ⚠️  ${riskEvents.length} Risk Events`);
  console.log(`   📊 ${inventoryRecords.length} Inventory Records`);
  console.log(`   👤 ${users.length} Users`);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    clearCurrentTenant();
    await prisma.$disconnect();
  });
