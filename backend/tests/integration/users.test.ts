/**
 * User Integration Tests
 *
 * Tests CRUD operations and constraints for User entity.
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { prisma, setCurrentTenant, clearCurrentTenant } from './setup';
import { userService } from '../../src/services';
import { UserRole, UserStatus } from '@prisma/client';

describe('User Integration Tests', () => {
  const TEST_TENANT = 'test-tenant-001';

  beforeEach(() => {
    setCurrentTenant(TEST_TENANT);
  });

  it('should create a user', async () => {
    const user = await userService.create({
      email: 'john.doe@example.com',
      name: 'John Doe',
      role: UserRole.ANALYST,
      status: UserStatus.ACTIVE,
    });

    expect(user.id).toBeDefined();
    expect(user.tenantId).toBe(TEST_TENANT);
    expect(user.email).toBe('john.doe@example.com');
    expect(user.name).toBe('John Doe');
    expect(user.role).toBe(UserRole.ANALYST);
    expect(user.status).toBe(UserStatus.ACTIVE);
  });

  it('should find user by ID', async () => {
    const created = await userService.create({
      email: 'jane.smith@example.com',
      name: 'Jane Smith',
      role: UserRole.ADMIN,
      status: UserStatus.ACTIVE,
    });

    const found = await userService.findById(created.id);

    expect(found).toBeDefined();
    expect(found?.id).toBe(created.id);
    expect(found?.email).toBe('jane.smith@example.com');
    expect(found?.name).toBe('Jane Smith');
    expect(found?.role).toBe(UserRole.ADMIN);
  });

  it('should find all users', async () => {
    await userService.create({
      email: 'user1@example.com',
      name: 'User One',
      role: UserRole.VIEWER,
      status: UserStatus.ACTIVE,
    });

    await userService.create({
      email: 'user2@example.com',
      name: 'User Two',
      role: UserRole.PLANNER,
      status: UserStatus.ACTIVE,
    });

    const users = await userService.findAll();

    expect(users).toHaveLength(2);
    expect(users.every(u => u.tenantId === TEST_TENANT)).toBe(true);
  });

  it('should update a user', async () => {
    const created = await userService.create({
      email: 'original@example.com',
      name: 'Original Name',
      role: UserRole.VIEWER,
      status: UserStatus.ACTIVE,
    });

    const updated = await userService.update(created.id, {
      name: 'Updated Name',
      role: UserRole.ANALYST,
      lastLoginAt: new Date('2024-01-15T10:30:00Z'),
    });

    expect(updated.id).toBe(created.id);
    expect(updated.name).toBe('Updated Name');
    expect(updated.role).toBe(UserRole.ANALYST);
    expect(updated.lastLoginAt).toBeDefined();
    expect(updated.email).toBe('original@example.com'); // Unchanged
  });

  it('should delete a user', async () => {
    const created = await userService.create({
      email: 'delete@example.com',
      name: 'To Be Deleted',
      role: UserRole.VIEWER,
      status: UserStatus.ACTIVE,
    });

    await userService.delete(created.id);

    const found = await userService.findById(created.id);
    expect(found).toBeNull();
  });

  it('should enforce unique constraint on email', async () => {
    await userService.create({
      email: 'unique@example.com',
      name: 'First User',
      role: UserRole.ANALYST,
      status: UserStatus.ACTIVE,
    });

    // Attempt to create user with same email should fail
    await expect(
      userService.create({
        email: 'unique@example.com',
        name: 'Second User',
        role: UserRole.VIEWER,
        status: UserStatus.ACTIVE,
      })
    ).rejects.toThrow();
  });

  it('should validate UserRole enum', async () => {
    const roles = [
      UserRole.ADMIN,
      UserRole.ANALYST,
      UserRole.VIEWER,
      UserRole.PLANNER,
    ];

    for (let i = 0; i < roles.length; i++) {
      const role = roles[i];
      const user = await userService.create({
        email: `${role.toLowerCase()}@example.com`,
        name: `${role} User`,
        role: role,
        status: UserStatus.ACTIVE,
      });

      expect(user.role).toBe(role);
    }
  });

  it('should validate UserStatus enum', async () => {
    const activeUser = await userService.create({
      email: 'active@example.com',
      name: 'Active User',
      role: UserRole.ANALYST,
      status: UserStatus.ACTIVE,
    });

    const inactiveUser = await userService.create({
      email: 'inactive@example.com',
      name: 'Inactive User',
      role: UserRole.VIEWER,
      status: UserStatus.INACTIVE,
    });

    const suspendedUser = await userService.create({
      email: 'suspended@example.com',
      name: 'Suspended User',
      role: UserRole.VIEWER,
      status: UserStatus.SUSPENDED,
    });

    expect(activeUser.status).toBe(UserStatus.ACTIVE);
    expect(inactiveUser.status).toBe(UserStatus.INACTIVE);
    expect(suspendedUser.status).toBe(UserStatus.SUSPENDED);
  });

  it('should default to ACTIVE status when not specified', async () => {
    const user = await userService.create({
      email: 'default@example.com',
      name: 'Default Status User',
      role: UserRole.VIEWER,
    });

    expect(user.status).toBe(UserStatus.ACTIVE);
  });

  it('should filter users by role', async () => {
    await userService.create({
      email: 'admin1@example.com',
      name: 'Admin User',
      role: UserRole.ADMIN,
      status: UserStatus.ACTIVE,
    });

    await userService.create({
      email: 'viewer1@example.com',
      name: 'Viewer User',
      role: UserRole.VIEWER,
      status: UserStatus.ACTIVE,
    });

    const admins = await userService.findAll({ role: UserRole.ADMIN });

    expect(admins).toHaveLength(1);
    expect(admins[0].role).toBe(UserRole.ADMIN);
    expect(admins[0].email).toBe('admin1@example.com');
  });

  it('should filter users by status', async () => {
    await userService.create({
      email: 'active-user@example.com',
      name: 'Active User',
      role: UserRole.ANALYST,
      status: UserStatus.ACTIVE,
    });

    await userService.create({
      email: 'suspended-user@example.com',
      name: 'Suspended User',
      role: UserRole.ANALYST,
      status: UserStatus.SUSPENDED,
    });

    const activeUsers = await userService.findAll({ status: UserStatus.ACTIVE });

    expect(activeUsers).toHaveLength(1);
    expect(activeUsers[0].status).toBe(UserStatus.ACTIVE);
    expect(activeUsers[0].email).toBe('active-user@example.com');
  });

  it('should handle lastLoginAt timestamp', async () => {
    const user = await userService.create({
      email: 'login-test@example.com',
      name: 'Login Test User',
      role: UserRole.ANALYST,
      status: UserStatus.ACTIVE,
    });

    // Initially null
    expect(user.lastLoginAt).toBeNull();

    // Update with login time
    const loginTime = new Date('2024-01-20T14:30:00Z');
    const updated = await userService.update(user.id, {
      lastLoginAt: loginTime,
    });

    expect(updated.lastLoginAt).toBeDefined();
    expect(updated.lastLoginAt?.toISOString()).toBe(loginTime.toISOString());
  });

  it('should validate email format (basic validation)', async () => {
    // Valid email formats should work
    const validEmails = [
      'user@example.com',
      'john.doe@company.co.uk',
      'test+tag@subdomain.example.org',
    ];

    for (const email of validEmails) {
      const user = await userService.create({
        email: email,
        name: 'Test User',
        role: UserRole.VIEWER,
        status: UserStatus.ACTIVE,
      });

      expect(user.email).toBe(email);

      // Clean up for next iteration
      await userService.delete(user.id);
    }
  });

  it('should support different user roles with different permissions context', async () => {
    const admin = await userService.create({
      email: 'admin@example.com',
      name: 'Administrator',
      role: UserRole.ADMIN,
      status: UserStatus.ACTIVE,
    });

    const analyst = await userService.create({
      email: 'analyst@example.com',
      name: 'Data Analyst',
      role: UserRole.ANALYST,
      status: UserStatus.ACTIVE,
    });

    const viewer = await userService.create({
      email: 'viewer@example.com',
      name: 'Viewer',
      role: UserRole.VIEWER,
      status: UserStatus.ACTIVE,
    });

    const planner = await userService.create({
      email: 'planner@example.com',
      name: 'Supply Chain Planner',
      role: UserRole.PLANNER,
      status: UserStatus.ACTIVE,
    });

    expect(admin.role).toBe(UserRole.ADMIN);
    expect(analyst.role).toBe(UserRole.ANALYST);
    expect(viewer.role).toBe(UserRole.VIEWER);
    expect(planner.role).toBe(UserRole.PLANNER);

    const allUsers = await userService.findAll();
    expect(allUsers).toHaveLength(4);
  });

  it('should support updating user status for account management', async () => {
    const user = await userService.create({
      email: 'status-test@example.com',
      name: 'Status Test User',
      role: UserRole.ANALYST,
      status: UserStatus.ACTIVE,
    });

    // Suspend user
    let updated = await userService.update(user.id, {
      status: UserStatus.SUSPENDED,
    });
    expect(updated.status).toBe(UserStatus.SUSPENDED);

    // Reactivate user
    updated = await userService.update(user.id, {
      status: UserStatus.ACTIVE,
    });
    expect(updated.status).toBe(UserStatus.ACTIVE);

    // Deactivate user
    updated = await userService.update(user.id, {
      status: UserStatus.INACTIVE,
    });
    expect(updated.status).toBe(UserStatus.INACTIVE);
  });

  it('should track user creation and update timestamps', async () => {
    const beforeCreate = new Date();

    const user = await userService.create({
      email: 'timestamp@example.com',
      name: 'Timestamp User',
      role: UserRole.VIEWER,
      status: UserStatus.ACTIVE,
    });

    const afterCreate = new Date();

    expect(user.createdAt).toBeDefined();
    expect(user.updatedAt).toBeDefined();
    expect(user.createdAt.getTime()).toBeGreaterThanOrEqual(beforeCreate.getTime());
    expect(user.createdAt.getTime()).toBeLessThanOrEqual(afterCreate.getTime());

    // Small delay to ensure different timestamp
    await new Promise(resolve => setTimeout(resolve, 10));

    const updated = await userService.update(user.id, {
      name: 'Updated Timestamp User',
    });

    expect(updated.updatedAt.getTime()).toBeGreaterThan(user.updatedAt.getTime());
  });
});
