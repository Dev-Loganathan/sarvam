import { Router } from 'express';
import { authenticate, requirePermission } from '../middleware/auth';
import {
  getCustomers,
  getCustomerById,
  createCustomer,
  updateCustomer,
  updateCustomerStatus,
  addNote,
  addDocument,
  removeDocument
} from '../controllers/customer.controller';

const router = Router();

// All customer routes require authentication
router.use(authenticate);

router.get('/', requirePermission('customer:view'), getCustomers);
router.get('/:id', requirePermission('customer:view'), getCustomerById);
router.post('/', requirePermission('customer:create'), createCustomer);
router.put('/:id', requirePermission('customer:edit'), updateCustomer);
router.patch('/:id/status', requirePermission('customer:edit'), updateCustomerStatus);
router.post('/:id/notes', requirePermission('customer:edit'), addNote);
router.post('/:id/documents', requirePermission('customer:edit'), addDocument);
router.delete('/:id/documents/:docId', requirePermission('customer:edit'), removeDocument);

export default router;
