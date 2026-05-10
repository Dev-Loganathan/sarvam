import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';

const connectionString = process.env.DATABASE_URL;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

const JWT_SECRET = process.env.JWT_SECRET || 'sarvam-finance-jwt-secret-change-in-production';
const ACCESS_TOKEN_EXPIRY = '15m';
const REFRESH_TOKEN_DAYS = 7;

function generateAccessToken(userId: string): string {
  return jwt.sign({ userId }, JWT_SECRET, { expiresIn: ACCESS_TOKEN_EXPIRY });
}

function generateRefreshToken(): string {
  return crypto.randomBytes(64).toString('hex');
}

/**
 * POST /api/auth/login
 * Body: { email, password }
 * Returns access token in response body, sets refresh token as HttpOnly cookie
 */
export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    // Find user with role and permissions
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() },
      include: {
        role: {
          include: {
            permissions: {
              include: { permission: true }
            }
          }
        }
      }
    });

    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    if (!user.isActive) {
      return res.status(403).json({ error: 'Your account has been deactivated. Contact your administrator.' });
    }

    // Verify password
    const isValid = await bcrypt.compare(password, user.passwordHash);
    if (!isValid) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // Single session: delete ALL existing refresh tokens for this user
    await prisma.refreshToken.deleteMany({ where: { userId: user.id } });

    // Generate new tokens
    const accessToken = generateAccessToken(user.id);
    const refreshToken = generateRefreshToken();
    const expiresAt = new Date(Date.now() + REFRESH_TOKEN_DAYS * 24 * 60 * 60 * 1000);

    // Store refresh token in DB
    await prisma.refreshToken.create({
      data: {
        token: refreshToken,
        userId: user.id,
        expiresAt,
      }
    });

    // Update last login
    await prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() }
    });

    // Set refresh token as HttpOnly cookie
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: REFRESH_TOKEN_DAYS * 24 * 60 * 60 * 1000,
      path: '/api/auth',
    });

    // Return access token and user info
    res.json({
      accessToken,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: {
          id: user.role.id,
          name: user.role.name,
          displayName: user.role.displayName,
        },
        permissions: user.role.permissions.map(rp => rp.permission.code),
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
};

/**
 * POST /api/auth/refresh
 * Reads refresh token from HttpOnly cookie, returns new access token
 */
export const refresh = async (req: Request, res: Response) => {
  try {
    const token = req.cookies?.refreshToken;

    if (!token) {
      return res.status(401).json({ error: 'No refresh token', code: 'NO_REFRESH_TOKEN' });
    }

    // Find the refresh token
    const stored = await prisma.refreshToken.findUnique({
      where: { token },
      include: {
        user: {
          include: {
            role: {
              include: {
                permissions: {
                  include: { permission: true }
                }
              }
            }
          }
        }
      }
    });

    if (!stored) {
      // Token was invalidated (e.g., user logged in from another device)
      res.clearCookie('refreshToken', { path: '/api/auth' });
      return res.status(401).json({ error: 'Session expired. Please log in again.', code: 'TOKEN_INVALIDATED' });
    }

    if (stored.expiresAt < new Date()) {
      await prisma.refreshToken.delete({ where: { id: stored.id } });
      res.clearCookie('refreshToken', { path: '/api/auth' });
      return res.status(401).json({ error: 'Session expired. Please log in again.', code: 'TOKEN_EXPIRED' });
    }

    if (!stored.user.isActive) {
      await prisma.refreshToken.deleteMany({ where: { userId: stored.user.id } });
      res.clearCookie('refreshToken', { path: '/api/auth' });
      return res.status(403).json({ error: 'Account deactivated' });
    }

    // Issue new access token
    const accessToken = generateAccessToken(stored.user.id);
    const user = stored.user;

    res.json({
      accessToken,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: {
          id: user.role.id,
          name: user.role.name,
          displayName: user.role.displayName,
        },
        permissions: user.role.permissions.map(rp => rp.permission.code),
      }
    });
  } catch (error) {
    console.error('Refresh error:', error);
    res.status(500).json({ error: 'Token refresh failed' });
  }
};

/**
 * POST /api/auth/logout
 * Clears refresh token cookie and deletes from DB
 */
export const logout = async (req: Request, res: Response) => {
  try {
    const token = req.cookies?.refreshToken;

    if (token) {
      await prisma.refreshToken.deleteMany({ where: { token } });
    }

    res.clearCookie('refreshToken', { path: '/api/auth' });
    res.json({ message: 'Logged out successfully' });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({ error: 'Logout failed' });
  }
};

/**
 * GET /api/auth/me
 * Returns current user profile (requires authentication)
 */
export const me = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    res.json({
      id: req.user.id,
      email: req.user.email,
      firstName: req.user.firstName,
      lastName: req.user.lastName,
      role: {
        id: req.user.roleId,
        name: req.user.roleName,
      },
      permissions: req.user.permissions,
    });
  } catch (error) {
    console.error('Me error:', error);
    res.status(500).json({ error: 'Failed to get user profile' });
  }
};
