import { Router } from 'express';
import {
  createPromotionController,
  getPromotionsController,
  getPromotionByIdController,
  updatePromotionController,
  deletePromotionController,
} from './promotion.controller.js';

const router = Router();

router.post('/', createPromotionController);
router.get('/', getPromotionsController);
router.get('/:id', getPromotionByIdController);
router.put('/:id', updatePromotionController);
router.delete('/:id', deletePromotionController);

export default router;
