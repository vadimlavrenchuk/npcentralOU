import { Router } from 'express';
import { getStats } from '../controllers/stats.controller';

const router = Router();

/**
 * @route   GET /api/stats
 * @desc    Get dashboard statistics
 * @access  Public
 */
router.get('/', getStats);

export default router;
