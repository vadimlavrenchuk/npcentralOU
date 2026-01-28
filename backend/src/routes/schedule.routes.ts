import express from 'express';
import {
  getAllSchedules,
  createSchedule,
  updateSchedule,
  deleteSchedule
} from '../controllers/schedule.controller';
import { authenticateToken, requireAdmin } from '../middleware/auth.middleware';

const router = express.Router();

// All routes require authentication
router.use(authenticateToken);

// Get all schedules - доступно всем ролям
router.get('/', getAllSchedules);

// Create, update, delete - только для admin
router.post('/', requireAdmin, createSchedule);
router.patch('/:id', requireAdmin, updateSchedule);
router.delete('/:id', requireAdmin, deleteSchedule);

export default router;
