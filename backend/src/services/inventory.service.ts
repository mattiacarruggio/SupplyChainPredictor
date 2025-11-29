/**
 * Inventory Service
 *
 * Provides CRUD operations for Inventory entity.
 */

import { prisma } from '../config/database';
import type { Inventory, Prisma } from '@prisma/client';

export class InventoryService {
  /**
   * Create a new inventory record
   */
  async create(data: Prisma.InventoryCreateInput): Promise<Inventory> {
    return prisma.inventory.create({ data });
  }

  /**
   * Find all inventory records with optional filtering
   * Includes product and location relationships by default
   */
  async findAll(where?: Prisma.InventoryWhereInput): Promise<Inventory[]> {
    return prisma.inventory.findMany({
      where,
      include: {
        product: true,
        location: true
      }
    });
  }

  /**
   * Find inventory record by ID
   */
  async findById(id: string): Promise<Inventory | null> {
    return prisma.inventory.findUnique({
      where: { id },
      include: {
        product: true,
        location: true
      }
    });
  }

  /**
   * Update inventory record
   */
  async update(id: string, data: Prisma.InventoryUpdateInput): Promise<Inventory> {
    return prisma.inventory.update({ where: { id }, data });
  }

  /**
   * Delete inventory record
   */
  async delete(id: string): Promise<Inventory> {
    return prisma.inventory.delete({ where: { id } });
  }
}

export const inventoryService = new InventoryService();
