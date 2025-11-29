/**
 * ShipmentRoute Service
 *
 * Provides CRUD operations for ShipmentRoute entity.
 */

import { prisma } from '../config/database';
import type { ShipmentRoute, Prisma } from '@prisma/client';

export class ShipmentRouteService {
  /**
   * Create a new shipment route
   */
  async create(data: Prisma.ShipmentRouteCreateInput): Promise<ShipmentRoute> {
    return prisma.shipmentRoute.create({ data });
  }

  /**
   * Find all shipment routes with optional filtering
   * Includes origin and destination location relationships by default
   */
  async findAll(where?: Prisma.ShipmentRouteWhereInput): Promise<ShipmentRoute[]> {
    return prisma.shipmentRoute.findMany({
      where,
      include: {
        originLocation: true,
        destinationLocation: true
      }
    });
  }

  /**
   * Find shipment route by ID
   */
  async findById(id: string): Promise<ShipmentRoute | null> {
    return prisma.shipmentRoute.findUnique({
      where: { id },
      include: {
        originLocation: true,
        destinationLocation: true
      }
    });
  }

  /**
   * Update shipment route
   */
  async update(id: string, data: Prisma.ShipmentRouteUpdateInput): Promise<ShipmentRoute> {
    return prisma.shipmentRoute.update({ where: { id }, data });
  }

  /**
   * Delete shipment route
   */
  async delete(id: string): Promise<ShipmentRoute> {
    return prisma.shipmentRoute.delete({ where: { id } });
  }
}

export const shipmentRouteService = new ShipmentRouteService();
