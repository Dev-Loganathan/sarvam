import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import { validatePassword, checkPasswordHistory } from '../utils/password-validator';

const connectionString = process.env.DATABASE_URL;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

// ─── Users ────────────────────────────────────────────────────

export const getUsers = async (req: Request, res: Response) => {
  try {
    const users = await prisma.user.findMany({
      include: { role: true },
      orderBy: { createdAt: 'desc' },
    });

    // Strip passwordHash from response
    const sanitized = users.map(({ passwordHash, ...u }) => u);
    res.json(sanitized);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
};

export const getUserById = async (req: Request, res: Response) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.params.id as string },
      include: { role: true },
    });

    if (!user) return res.status(404).json({ error: 'User not found' });

    const { passwordHash, ...sanitized } = user;
    res.json(sanitized);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch user' });
  }
};

export const createUser = async (req: Request, res: Response) => {
  try {
    const { email, password, firstName, lastName, mobile, roleId } = req.body;

    if (!email || !password || !firstName || !mobile || !roleId) {
      return res.status(400).json({ error: 'Email, password, first name, mobile, and role are required' });
    }

    // Check if email already exists
    const existing = await prisma.user.findUnique({ where: { email: email.toLowerCase().trim() } });
    if (existing) {
      return res.status(409).json({ error: 'A user with this email already exists' });
    }

    // Validate role exists
    const role = await prisma.role.findUnique({ where: { id: roleId } });
    if (!role) {
      return res.status(400).json({ error: 'Invalid role' });
    }

    // Validate password
    const validation = validatePassword(password, email);
    if (!validation.valid) {
      return res.status(400).json({ error: 'Password does not meet requirements', details: validation.errors });
    }

    const passwordHash = await bcrypt.hash(password, 12);

    const user = await prisma.user.create({
      data: {
        email: email.toLowerCase().trim(),
        passwordHash,
        firstName,
        lastName: lastName || null,
        mobile: mobile || null,
        roleId,
      },
      include: { role: true },
    });

    // Store in password history
    await prisma.passwordHistory.create({
      data: { userId: user.id, passwordHash },
    });

    const { passwordHash: _, ...sanitized } = user;
    res.status(201).json(sanitized);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to create user' });
  }
};

export const updateUser = async (req: Request, res: Response) => {
  try {
    const { firstName, lastName, mobile, roleId, isActive } = req.body;

    const user = await prisma.user.update({
      where: { id: req.params.id as string },
      data: {
        ...(firstName !== undefined && { firstName }),
        ...(lastName !== undefined && { lastName }),
        ...(mobile !== undefined && { mobile }),
        ...(roleId !== undefined && { roleId }),
        ...(isActive !== undefined && { isActive }),
      },
      include: { role: true },
    });

    // If user is deactivated, invalidate all their sessions
    if (isActive === false) {
      await prisma.refreshToken.deleteMany({ where: { userId: user.id } });
    }

    const { passwordHash, ...sanitized } = user;
    res.json(sanitized);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to update user' });
  }
};

export const resetPassword = async (req: Request, res: Response) => {
  try {
    const { password } = req.body;
    const userId = req.params.id as string;

    if (!password) {
      return res.status(400).json({ error: 'New password is required' });
    }

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) return res.status(404).json({ error: 'User not found' });

    // Validate password policy
    const validation = validatePassword(password, user.email);
    if (!validation.valid) {
      return res.status(400).json({ error: 'Password does not meet requirements', details: validation.errors });
    }

    // Check password history (last 5)
    const history = await prisma.passwordHistory.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 5,
    });

    const wasPreviouslyUsed = await checkPasswordHistory(
      password,
      history.map(h => h.passwordHash)
    );

    if (wasPreviouslyUsed) {
      return res.status(400).json({ error: 'Password was previously used. Please choose a new one.' });
    }

    const passwordHash = await bcrypt.hash(password, 12);

    await prisma.user.update({
      where: { id: userId },
      data: { passwordHash },
    });

    // Store in password history
    await prisma.passwordHistory.create({
      data: { userId, passwordHash },
    });

    // Invalidate all sessions so user must re-login
    await prisma.refreshToken.deleteMany({ where: { userId } });

    res.json({ message: 'Password reset successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to reset password' });
  }
};

export const deleteUser = async (req: Request, res: Response) => {
  try {
    const userId = req.params.id as string;

    // Prevent self-deletion
    if (req.user?.id === userId) {
      return res.status(400).json({ error: 'You cannot deactivate your own account' });
    }

    // Soft-delete: deactivate the user
    await prisma.user.update({
      where: { id: userId },
      data: { isActive: false },
    });

    // Invalidate all sessions
    await prisma.refreshToken.deleteMany({ where: { userId } });

    res.json({ message: 'User deactivated successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to deactivate user' });
  }
};

// ─── Roles ────────────────────────────────────────────────────

export const getRoles = async (req: Request, res: Response) => {
  try {
    const roles = await prisma.role.findMany({
      include: {
        permissions: { include: { permission: true } },
        _count: { select: { users: true } },
      },
      orderBy: { createdAt: 'asc' },
    });

    res.json(roles);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch roles' });
  }
};

export const createRole = async (req: Request, res: Response) => {
  try {
    const { name, displayName, description, permissionIds } = req.body;

    if (!name || !displayName) {
      return res.status(400).json({ error: 'Name and display name are required' });
    }

    const role = await prisma.role.create({
      data: {
        name: name.toLowerCase().replace(/\s+/g, '_'),
        displayName,
        description: description || null,
        permissions: {
          create: (permissionIds || []).map((pid: string) => ({
            permissionId: pid,
          })),
        },
      },
      include: {
        permissions: { include: { permission: true } },
      },
    });

    res.status(201).json(role);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to create role' });
  }
};

export const updateRole = async (req: Request, res: Response) => {
  try {
    const roleId = req.params.id as string;
    const { displayName, description, permissionIds } = req.body;

    // Update role metadata
    const role = await prisma.role.update({
      where: { id: roleId },
      data: {
        ...(displayName !== undefined && { displayName }),
        ...(description !== undefined && { description }),
      },
    });

    // If permissionIds provided, replace all permissions
    if (permissionIds !== undefined) {
      await prisma.rolePermission.deleteMany({ where: { roleId } });
      for (const pid of permissionIds) {
        await prisma.rolePermission.create({
          data: { roleId, permissionId: pid },
        });
      }
    }

    // Return updated role with permissions
    const updated = await prisma.role.findUnique({
      where: { id: roleId },
      include: {
        permissions: { include: { permission: true } },
        _count: { select: { users: true } },
      },
    });

    res.json(updated);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to update role' });
  }
};

// ─── Permissions ──────────────────────────────────────────────

export const getPermissions = async (req: Request, res: Response) => {
  try {
    const permissions = await prisma.permission.findMany({
      orderBy: [{ module: 'asc' }, { code: 'asc' }],
    });
    res.json(permissions);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch permissions' });
  }
};
