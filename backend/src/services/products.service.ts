/**
 * Product Service
 *
 * Provides CRUD operations for Product entity.
 */

import { prisma } from '../config/database';
import type { Product, Prisma } from '@prisma/client';

export class ProductService {
  /**
   * Create a new product
   */
  async create(data: Prisma.ProductCreateInput): Promise<Product> {
    return prisma.product.create({ data });
  }

  /**
   * Find all products with optional filtering
   * Includes supplier relationship by default
   */
  async findAll(where?: Prisma.ProductWhereInput): Promise<Product[]> {
    return prisma.product.findMany({
      where,
      include: {
        supplier: true
      }
    });
  }

  /**
   * Find product by ID
   */
  async findById(id: string): Promise<Product | null> {
    return prisma.product.findUnique({
      where: { id },
      include: {
        supplier: true
      }
    });
  }

  /**
   * Update product
   */
  async update(id: string, data: Prisma.ProductUpdateInput): Promise<Product> {
    return prisma.product.update({ where: { id }, data });
  }

  /**
   * Delete product
   */
  async delete(id: string): Promise<Product> {
    return prisma.product.delete({ where: { id } });
  }
}

export const productService = new ProductService();
