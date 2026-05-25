import { Router } from 'express';
import {
    createRatingController,
    getRatingsController,
    deleteRatingController,
} from './rating.controller.js';

const router = Router();

router.post('/',      createRatingController);
router.get('/',       getRatingsController);
router.delete('/:id', deleteRatingController);

export default router;
