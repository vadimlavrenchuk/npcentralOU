import express from 'express';
import {
  getAllUsers,
  createUser,
  updateUser,
  updateUserRole,
  toggleUserStatus,
  deleteUser
} from '../controllers/user.controller';
import { authenticateToken, requireAdminOrChiefMechanic } from '../middleware/auth.middleware';

const router = express.Router();

// All routes require authentication
router.use(authenticateToken);

// Get all users - доступно всем (для dropdown в Schedule)
router.get('/', getAllUsers);

// Create, update, delete - только для admin и chief mechanic
router.post('/', requireAdminOrChiefMechanic, createUser);
router.patch('/:id', requireAdminOrChiefMechanic, updateUser);
router.patch('/:id/role', requireAdminOrChiefMechanic, updateUserRole);
router.patch('/:id/toggle-status', requireAdminOrChiefMechanic, toggleUserStatus);
router.delete('/:id', requireAdminOrChiefMechanic, deleteUser);

export default router;
