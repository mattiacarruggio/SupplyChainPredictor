/**
 * RiskEvent Service
 *
 * Provides CRUD operations for RiskEvent entity and manages many-to-many relationships.
 */

import { prisma } from '../config/database';
import type { RiskEvent, Prisma } from '@prisma/client';

export class RiskEventService {
  /**
   * Create a new risk event
   */
  async create(data: Prisma.RiskEventCreateInput): Promise<RiskEvent> {
    return prisma.riskEvent.create({ data });
  }

  /**
   * Find all risk events with optional filtering
   */
  async findAll(where?: Prisma.RiskEventWhereInput): Promise<RiskEvent[]> {
    return prisma.riskEvent.findMany({
      where,
      include: {
        suppliers: {
          include: {
            supplier: true
          }
        },
        products: {
          include: {
            product: true
          }
        },
        locations: {
          include: {
            location: true
          }
        },
        routes: {
          include: {
            route: true
          }
        }
      }
    });
  }

  /**
   * Find risk event by ID
   */
  async findById(id: string): Promise<RiskEvent | null> {
    return prisma.riskEvent.findUnique({
      where: { id },
      include: {
        suppliers: {
          include: {
            supplier: true
          }
        },
        products: {
          include: {
            product: true
          }
        },
        locations: {
          include: {
            location: true
          }
        },
        routes: {
          include: {
            route: true
          }
        }
      }
    });
  }

  /**
   * Update risk event
   */
  async update(id: string, data: Prisma.RiskEventUpdateInput): Promise<RiskEvent> {
    return prisma.riskEvent.update({ where: { id }, data });
  }

  /**
   * Delete risk event
   */
  async delete(id: string): Promise<RiskEvent> {
    return prisma.riskEvent.delete({ where: { id } });
  }

  /**
   * Add supplier to risk event
   */
  async addSupplier(riskEventId: string, supplierId: string, tenantId: string): Promise<void> {
    await prisma.riskEventSupplier.create({
      data: {
        tenantId,
        riskEventId,
        supplierId
      }
    });
  }

  /**
   * Remove supplier from risk event
   */
  async removeSupplier(riskEventId: string, supplierId: string): Promise<void> {
    await prisma.riskEventSupplier.deleteMany({
      where: {
        riskEventId,
        supplierId
      }
    });
  }

  /**
   * Add product to risk event
   */
  async addProduct(riskEventId: string, productId: string, tenantId: string): Promise<void> {
    await prisma.riskEventProduct.create({
      data: {
        tenantId,
        riskEventId,
        productId
      }
    });
  }

  /**
   * Remove product from risk event
   */
  async removeProduct(riskEventId: string, productId: string): Promise<void> {
    await prisma.riskEventProduct.deleteMany({
      where: {
        riskEventId,
        productId
      }
    });
  }

  /**
   * Add location to risk event
   */
  async addLocation(riskEventId: string, locationId: string, tenantId: string): Promise<void> {
    await prisma.riskEventLocation.create({
      data: {
        tenantId,
        riskEventId,
        locationId
      }
    });
  }

  /**
   * Remove location from risk event
   */
  async removeLocation(riskEventId: string, locationId: string): Promise<void> {
    await prisma.riskEventLocation.deleteMany({
      where: {
        riskEventId,
        locationId
      }
    });
  }

  /**
   * Add route to risk event
   */
  async addRoute(riskEventId: string, routeId: string, tenantId: string): Promise<void> {
    await prisma.riskEventRoute.create({
      data: {
        tenantId,
        riskEventId,
        routeId
      }
    });
  }

  /**
   * Remove route from risk event
   */
  async removeRoute(riskEventId: string, routeId: string): Promise<void> {
    await prisma.riskEventRoute.deleteMany({
      where: {
        riskEventId,
        routeId
      }
    });
  }
}

export const riskEventService = new RiskEventService();
