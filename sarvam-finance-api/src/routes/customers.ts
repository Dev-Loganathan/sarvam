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
import {
  saveDraft,
  getDrafts,
  getDraftById,
  deleteDraft
} from '../controllers/customer-draft.controller';

const router = Router();

// All customer routes require authentication
router.use(authenticate);

router.get('/', requirePermission('customer:view'), getCustomers);
router.get('/drafts', requirePermission('customer:view'), getDrafts);
router.post('/drafts', requirePermission('customer:create'), saveDraft);
router.get('/drafts/:id', requirePermission('customer:view'), getDraftById);
router.delete('/drafts/:id', requirePermission('customer:create'), deleteDraft);
router.get('/:id', requirePermission('customer:view'), getCustomerById);
router.post('/', requirePermission('customer:create'), createCustomer);
router.put('/:id', requirePermission('customer:edit'), updateCustomer);
router.patch('/:id/status', requirePermission('customer:edit'), updateCustomerStatus);
router.post('/:id/notes', requirePermission('customer:edit'), addNote);
router.post('/:id/documents', requirePermission('customer:edit'), addDocument);
router.delete('/:id/documents/:docId', requirePermission('customer:edit'), removeDocument);

export default router;
