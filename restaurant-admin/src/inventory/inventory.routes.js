import { Router } from 'express';
import {
  createInventoryController,
  getInventoryController,
  getInventoryByIdController,
  updateInventoryController,
  deleteInventoryController,
} from './inventory.controller.js';

const router = Router();

router.post('/', createInventoryController);
router.get('/', getInventoryController);
router.get('/:id', getInventoryByIdController);
router.put('/:id', updateInventoryController);
router.delete('/:id', deleteInventoryController);

export default router;
