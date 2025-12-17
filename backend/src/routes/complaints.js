import express from 'express';
import { authJWT as authenticate } from '../middleware/authJWT.js';
import { requirePermission } from '../middleware/roleMiddleware.js';
import {
    createComplaint,
    getComplaints,
    getMyComplaints,
    getComplaintById,
    updateComplaint,
    assignComplaint,
    resolveComplaint
} from '../controllers/complaintController.js';

const router = express.Router();

// Customer routes
router.post('/', authenticate, createComplaint);
router.get('/my', authenticate, getMyComplaints);

// Staff routes
router.get('/', authenticate, requirePermission('VIEW_ALL_COMPLAINTS'), getComplaints);
router.get('/:id', authenticate, getComplaintById);
router.put('/:id', authenticate, requirePermission('VIEW_ALL_COMPLAINTS'), updateComplaint);
router.put('/:id/assign', authenticate, requirePermission('ASSIGN_COMPLAINT'), assignComplaint);
router.put('/:id/resolve', authenticate, requirePermission('RESOLVE_COMPLAINT'), resolveComplaint);

export default router;
