import { Router } from 'express';
import { getAllUsageStats, getUsageStatsById, createUsageStats, updateUsageStats, deleteUsageStats } from './usageStats.controller.js';

const router = Router();

router.get('/', getAllUsageStats);
router.get('/:id', getUsageStatsById);
router.post('/', createUsageStats);
router.put('/:id', updateUsageStats);
router.delete('/:id', deleteUsageStats);

export default router;
