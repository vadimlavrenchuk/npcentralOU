import express from 'express';
import {
  getUserByEmail,
  createOrUpdateUser,
  getAllUsers,
  updateUserRole,
  deleteUser
} from '../controllers/user.controller';

const router = express.Router();

// Get all users
router.get('/', getAllUsers);

// Get user by email
router.get('/email/:email', getUserByEmail);

// Create or update user
router.post('/', createOrUpdateUser);

// Update user role
router.patch('/:id/role', updateUserRole);

// Delete user
router.delete('/:id', deleteUser);

export default router;
