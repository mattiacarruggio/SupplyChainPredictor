-- CreateEnum
CREATE TYPE "LocationType" AS ENUM ('WAREHOUSE', 'FACTORY', 'DISTRIBUTION_CENTER', 'PORT', 'SUPPLIER_SITE');

-- CreateEnum
CREATE TYPE "LocationStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'MAINTENANCE');

-- CreateEnum
CREATE TYPE "TransportMode" AS ENUM ('AIR', 'SEA', 'RAIL', 'TRUCK', 'MULTIMODAL');

-- CreateEnum
CREATE TYPE "EventType" AS ENUM ('WEATHER', 'POLITICAL', 'SUPPLIER_FAILURE', 'DEMAND_SURGE', 'TRANSPORTATION_DISRUPTION', 'QUALITY_ISSUE', 'REGULATORY_CHANGE', 'NATURAL_DISASTER', 'LABOR_STRIKE', 'CYBER_ATTACK');

-- CreateEnum
CREATE TYPE "RiskSeverity" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL');

-- CreateEnum
CREATE TYPE "RiskStatus" AS ENUM ('ACTIVE', 'MONITORING', 'MITIGATED', 'RESOLVED');

-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('ADMIN', 'ANALYST', 'VIEWER', 'PLANNER');

-- CreateEnum
CREATE TYPE "UserStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'SUSPENDED');

-- CreateTable
CREATE TABLE "suppliers" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "country" TEXT NOT NULL,
    "contact_email" TEXT,
    "contact_phone" TEXT,
    "address" TEXT,
    "rating" INTEGER NOT NULL DEFAULT 3,
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "suppliers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "products" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "sku" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "category" TEXT NOT NULL,
    "unit_of_measure" TEXT NOT NULL DEFAULT 'unit',
    "lead_time_days" INTEGER NOT NULL,
    "supplier_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "products_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "locations" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" "LocationType" NOT NULL,
    "address" TEXT,
    "city" TEXT,
    "state" TEXT,
    "country" TEXT NOT NULL,
    "postal_code" TEXT,
    "latitude" DECIMAL(10,7),
    "longitude" DECIMAL(10,7),
    "capacity" INTEGER,
    "status" "LocationStatus" NOT NULL DEFAULT 'ACTIVE',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "locations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "shipment_routes" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "origin_location_id" TEXT NOT NULL,
    "destination_location_id" TEXT NOT NULL,
    "transit_time_days" INTEGER NOT NULL,
    "transport_mode" "TransportMode" NOT NULL,
    "distance" DECIMAL(10,2),
    "cost" DECIMAL(12,2),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "shipment_routes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "risk_events" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "event_type" "EventType" NOT NULL,
    "severity" "RiskSeverity" NOT NULL,
    "status" "RiskStatus" NOT NULL DEFAULT 'ACTIVE',
    "start_date" TIMESTAMP(3) NOT NULL,
    "resolution_date" TIMESTAMP(3),
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "impact_assessment" TEXT,
    "mitigation_plan" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "risk_events_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "inventory" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "product_id" TEXT NOT NULL,
    "location_id" TEXT NOT NULL,
    "quantity_on_hand" INTEGER NOT NULL DEFAULT 0,
    "quantity_reserved" INTEGER NOT NULL DEFAULT 0,
    "reorder_point" INTEGER NOT NULL DEFAULT 0,
    "last_count_date" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "inventory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "role" "UserRole" NOT NULL,
    "status" "UserStatus" NOT NULL DEFAULT 'ACTIVE',
    "last_login_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "risk_event_suppliers" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "risk_event_id" TEXT NOT NULL,
    "supplier_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "risk_event_suppliers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "risk_event_products" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "risk_event_id" TEXT NOT NULL,
    "product_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "risk_event_products_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "risk_event_locations" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "risk_event_id" TEXT NOT NULL,
    "location_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "risk_event_locations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "risk_event_routes" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "risk_event_id" TEXT NOT NULL,
    "route_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "risk_event_routes_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "suppliers_code_key" ON "suppliers"("code");

-- CreateIndex
CREATE INDEX "suppliers_tenant_id_idx" ON "suppliers"("tenant_id");

-- CreateIndex
CREATE INDEX "suppliers_country_idx" ON "suppliers"("country");

-- CreateIndex
CREATE INDEX "suppliers_rating_idx" ON "suppliers"("rating");

-- CreateIndex
CREATE UNIQUE INDEX "products_sku_key" ON "products"("sku");

-- CreateIndex
CREATE INDEX "products_tenant_id_idx" ON "products"("tenant_id");

-- CreateIndex
CREATE INDEX "products_supplier_id_idx" ON "products"("supplier_id");

-- CreateIndex
CREATE INDEX "products_category_idx" ON "products"("category");

-- CreateIndex
CREATE UNIQUE INDEX "locations_code_key" ON "locations"("code");

-- CreateIndex
CREATE INDEX "locations_tenant_id_idx" ON "locations"("tenant_id");

-- CreateIndex
CREATE INDEX "locations_type_idx" ON "locations"("type");

-- CreateIndex
CREATE INDEX "locations_country_idx" ON "locations"("country");

-- CreateIndex
CREATE INDEX "locations_status_idx" ON "locations"("status");

-- CreateIndex
CREATE INDEX "shipment_routes_tenant_id_idx" ON "shipment_routes"("tenant_id");

-- CreateIndex
CREATE INDEX "shipment_routes_origin_location_id_idx" ON "shipment_routes"("origin_location_id");

-- CreateIndex
CREATE INDEX "shipment_routes_destination_location_id_idx" ON "shipment_routes"("destination_location_id");

-- CreateIndex
CREATE INDEX "shipment_routes_transport_mode_idx" ON "shipment_routes"("transport_mode");

-- CreateIndex
CREATE UNIQUE INDEX "shipment_routes_tenant_id_origin_location_id_destination_lo_key" ON "shipment_routes"("tenant_id", "origin_location_id", "destination_location_id", "transport_mode");

-- CreateIndex
CREATE INDEX "risk_events_tenant_id_idx" ON "risk_events"("tenant_id");

-- CreateIndex
CREATE INDEX "risk_events_event_type_idx" ON "risk_events"("event_type");

-- CreateIndex
CREATE INDEX "risk_events_severity_idx" ON "risk_events"("severity");

-- CreateIndex
CREATE INDEX "risk_events_status_idx" ON "risk_events"("status");

-- CreateIndex
CREATE INDEX "risk_events_start_date_idx" ON "risk_events"("start_date");

-- CreateIndex
CREATE INDEX "inventory_tenant_id_idx" ON "inventory"("tenant_id");

-- CreateIndex
CREATE INDEX "inventory_product_id_idx" ON "inventory"("product_id");

-- CreateIndex
CREATE INDEX "inventory_location_id_idx" ON "inventory"("location_id");

-- CreateIndex
CREATE INDEX "inventory_quantity_on_hand_idx" ON "inventory"("quantity_on_hand");

-- CreateIndex
CREATE UNIQUE INDEX "inventory_tenant_id_product_id_location_id_key" ON "inventory"("tenant_id", "product_id", "location_id");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE INDEX "users_tenant_id_idx" ON "users"("tenant_id");

-- CreateIndex
CREATE INDEX "users_role_idx" ON "users"("role");

-- CreateIndex
CREATE INDEX "users_status_idx" ON "users"("status");

-- CreateIndex
CREATE INDEX "risk_event_suppliers_tenant_id_idx" ON "risk_event_suppliers"("tenant_id");

-- CreateIndex
CREATE UNIQUE INDEX "risk_event_suppliers_risk_event_id_supplier_id_key" ON "risk_event_suppliers"("risk_event_id", "supplier_id");

-- CreateIndex
CREATE INDEX "risk_event_products_tenant_id_idx" ON "risk_event_products"("tenant_id");

-- CreateIndex
CREATE UNIQUE INDEX "risk_event_products_risk_event_id_product_id_key" ON "risk_event_products"("risk_event_id", "product_id");

-- CreateIndex
CREATE INDEX "risk_event_locations_tenant_id_idx" ON "risk_event_locations"("tenant_id");

-- CreateIndex
CREATE UNIQUE INDEX "risk_event_locations_risk_event_id_location_id_key" ON "risk_event_locations"("risk_event_id", "location_id");

-- CreateIndex
CREATE INDEX "risk_event_routes_tenant_id_idx" ON "risk_event_routes"("tenant_id");

-- CreateIndex
CREATE UNIQUE INDEX "risk_event_routes_risk_event_id_route_id_key" ON "risk_event_routes"("risk_event_id", "route_id");

-- AddForeignKey
ALTER TABLE "products" ADD CONSTRAINT "products_supplier_id_fkey" FOREIGN KEY ("supplier_id") REFERENCES "suppliers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "shipment_routes" ADD CONSTRAINT "shipment_routes_origin_location_id_fkey" FOREIGN KEY ("origin_location_id") REFERENCES "locations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "shipment_routes" ADD CONSTRAINT "shipment_routes_destination_location_id_fkey" FOREIGN KEY ("destination_location_id") REFERENCES "locations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inventory" ADD CONSTRAINT "inventory_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inventory" ADD CONSTRAINT "inventory_location_id_fkey" FOREIGN KEY ("location_id") REFERENCES "locations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "risk_event_suppliers" ADD CONSTRAINT "risk_event_suppliers_risk_event_id_fkey" FOREIGN KEY ("risk_event_id") REFERENCES "risk_events"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "risk_event_suppliers" ADD CONSTRAINT "risk_event_suppliers_supplier_id_fkey" FOREIGN KEY ("supplier_id") REFERENCES "suppliers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "risk_event_products" ADD CONSTRAINT "risk_event_products_risk_event_id_fkey" FOREIGN KEY ("risk_event_id") REFERENCES "risk_events"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "risk_event_products" ADD CONSTRAINT "risk_event_products_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "risk_event_locations" ADD CONSTRAINT "risk_event_locations_risk_event_id_fkey" FOREIGN KEY ("risk_event_id") REFERENCES "risk_events"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "risk_event_locations" ADD CONSTRAINT "risk_event_locations_location_id_fkey" FOREIGN KEY ("location_id") REFERENCES "locations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "risk_event_routes" ADD CONSTRAINT "risk_event_routes_risk_event_id_fkey" FOREIGN KEY ("risk_event_id") REFERENCES "risk_events"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "risk_event_routes" ADD CONSTRAINT "risk_event_routes_route_id_fkey" FOREIGN KEY ("route_id") REFERENCES "shipment_routes"("id") ON DELETE CASCADE ON UPDATE CASCADE;
