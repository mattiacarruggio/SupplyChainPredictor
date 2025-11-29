/**
 * Supplier Service
 *
 * Provides CRUD operations for Supplier entity.
 */

import { prisma } from '../config/database';
import type { Supplier, Prisma } from '@prisma/client';

export class SupplierService {
  /**
   * Create a new supplier
   */
  async create(data: Prisma.SupplierCreateInput): Promise<Supplier> {
    return prisma.supplier.create({ data });
  }

  /**
   * Find all suppliers with optional filtering
   */
  async findAll(where?: Prisma.SupplierWhereInput): Promise<Supplier[]> {
    return prisma.supplier.findMany({ where });
  }

  /**
   * Find supplier by ID
   */
  async findById(id: string): Promise<Supplier | null> {
    return prisma.supplier.findUnique({ where: { id } });
  }

  /**
   * Update supplier
   */
  async update(id: string, data: Prisma.SupplierUpdateInput): Promise<Supplier> {
    return prisma.supplier.update({ where: { id }, data });
  }

  /**
   * Delete supplier
   */
  async delete(id: string): Promise<Supplier> {
    return prisma.supplier.delete({ where: { id } });
  }
}

export const supplierService = new SupplierService();
