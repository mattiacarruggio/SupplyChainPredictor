/**
 * User Service
 *
 * Provides CRUD operations for User entity.
 */

import { prisma } from '../config/database';
import type { User, Prisma } from '@prisma/client';

export class UserService {
  /**
   * Create a new user
   */
  async create(data: Prisma.UserCreateInput): Promise<User> {
    return prisma.user.create({ data });
  }

  /**
   * Find all users with optional filtering
   */
  async findAll(where?: Prisma.UserWhereInput): Promise<User[]> {
    return prisma.user.findMany({ where });
  }

  /**
   * Find user by ID
   */
  async findById(id: string): Promise<User | null> {
    return prisma.user.findUnique({ where: { id } });
  }

  /**
   * Find user by email
   */
  async findByEmail(email: string): Promise<User | null> {
    return prisma.user.findUnique({ where: { email } });
  }

  /**
   * Update user
   */
  async update(id: string, data: Prisma.UserUpdateInput): Promise<User> {
    return prisma.user.update({ where: { id }, data });
  }

  /**
   * Delete user
   */
  async delete(id: string): Promise<User> {
    return prisma.user.delete({ where: { id } });
  }
}

export const userService = new UserService();
