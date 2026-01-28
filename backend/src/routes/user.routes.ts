import express from 'express';
import {
  getAllUsers,
  createUser,
  updateUser,
  updateUserRole,
  toggleUserStatus,
  deleteUser
} from '../controllers/user.controller';
import { authenticateToken, requireAdmin } from '../middleware/auth.middleware';

const router = express.Router();

// All routes require authentication
router.use(authenticateToken);

// Get all users - доступно всем (для dropdown в Schedule)
router.get('/', getAllUsers);

// Create, update, delete - только для admin
router.post('/', requireAdmin, createUser);
router.patch('/:id', requireAdmin, updateUser);
router.patch('/:id/role', requireAdmin, updateUserRole);
router.patch('/:id/toggle-status', requireAdmin, toggleUserStatus);
router.delete('/:id', requireAdmin, deleteUser);

export default router;
