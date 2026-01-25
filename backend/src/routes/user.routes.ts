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

// All routes require authentication and admin role
router.use(authenticateToken, requireAdmin);

// Get all users
router.get('/', getAllUsers);

// Create new user
router.post('/', createUser);

// Update user
router.patch('/:id', updateUser);

// Update user role
router.patch('/:id/role', updateUserRole);

// Toggle user active status
router.patch('/:id/toggle-status', toggleUserStatus);

// Delete user
router.delete('/:id', deleteUser);

export default router;
