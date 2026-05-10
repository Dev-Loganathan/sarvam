import { Router } from 'express';
import { authenticate, requirePermission } from '../middleware/auth';
import {
  getUsers,
  getUserById,
  createUser,
  updateUser,
  resetPassword,
  deleteUser,
  getRoles,
  createRole,
  updateRole,
  getPermissions,
} from '../controllers/user.controller';

const router = Router();

// All user routes require authentication
router.use(authenticate);

// Users
router.get('/', requirePermission('user:view'), getUsers);
router.get('/:id', requirePermission('user:view'), getUserById);
router.post('/', requirePermission('user:create'), createUser);
router.put('/:id', requirePermission('user:edit'), updateUser);
router.put('/:id/reset-password', requirePermission('user:edit'), resetPassword);
router.delete('/:id', requirePermission('user:delete'), deleteUser);

// Roles & Permissions
router.get('/roles/list', requirePermission('user:view'), getRoles);
router.post('/roles', requirePermission('user:manage_roles'), createRole);
router.put('/roles/:id', requirePermission('user:manage_roles'), updateRole);
router.get('/permissions/list', requirePermission('user:view'), getPermissions);

export default router;
