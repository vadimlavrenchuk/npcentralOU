import express from 'express';
import {
  getAllSchedules,
  createSchedule,
  updateSchedule,
  deleteSchedule,
  cleanupOrphanedSchedules
} from '../controllers/schedule.controller';
import { authenticateToken, requireAdminOrChiefMechanic } from '../middleware/auth.middleware';

const router = express.Router();

// All routes require authentication
router.use(authenticateToken);

// Get all schedules - доступно всем ролям
router.get('/', getAllSchedules);

// Cleanup orphaned schedules - только для admin и chief mechanic
router.delete('/cleanup-orphaned', requireAdminOrChiefMechanic, cleanupOrphanedSchedules);

// Create, update, delete - только для admin и chief mechanic
router.post('/', requireAdminOrChiefMechanic, createSchedule);
router.patch('/:id', requireAdminOrChiefMechanic, updateSchedule);
router.delete('/:id', requireAdminOrChiefMechanic, deleteSchedule);

export default router;
