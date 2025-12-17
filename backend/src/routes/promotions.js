import express from 'express';
import { authJWT as authenticate } from '../middleware/authJWT.js';
import { requirePermission } from '../middleware/roleMiddleware.js';
import {
    createPromotion,
    getPromotions,
    getActivePromotions,
    getPromotionById,
    updatePromotion,
    deletePromotion,
    applyPromotion
} from '../controllers/promotionController.js';

const router = express.Router();

// Public routes
router.get('/active', getActivePromotions);
router.post('/apply', applyPromotion);

// Protected routes
router.post('/', authenticate, requirePermission('CREATE_PROMOTION'), createPromotion);
router.get('/', authenticate, getPromotions);
router.get('/:id', authenticate, getPromotionById);
router.put('/:id', authenticate, requirePermission('MANAGE_PROMOTIONS'), updatePromotion);
router.delete('/:id', authenticate, requirePermission('MANAGE_PROMOTIONS'), deletePromotion);

export default router;
