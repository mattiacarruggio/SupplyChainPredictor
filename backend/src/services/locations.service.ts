/**
 * Location Service
 *
 * Provides CRUD operations for Location entity.
 */

import { prisma } from '../config/database';
import type { Location, Prisma } from '@prisma/client';

export class LocationService {
  /**
   * Create a new location
   */
  async create(data: Prisma.LocationCreateInput): Promise<Location> {
    return prisma.location.create({ data });
  }

  /**
   * Find all locations with optional filtering
   */
  async findAll(where?: Prisma.LocationWhereInput): Promise<Location[]> {
    return prisma.location.findMany({ where });
  }

  /**
   * Find location by ID
   */
  async findById(id: string): Promise<Location | null> {
    return prisma.location.findUnique({ where: { id } });
  }

  /**
   * Update location
   */
  async update(id: string, data: Prisma.LocationUpdateInput): Promise<Location> {
    return prisma.location.update({ where: { id }, data });
  }

  /**
   * Delete location
   */
  async delete(id: string): Promise<Location> {
    return prisma.location.delete({ where: { id } });
  }
}

export const locationService = new LocationService();
