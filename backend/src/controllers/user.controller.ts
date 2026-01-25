import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import User, { UserRole } from '../models/User';

// Get all users (Admin only)
export const getAllUsers = async (_req: Request, res: Response): Promise<void> => {
  try {
    const users = await User.find().sort({ createdAt: -1 });
    res.json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ message: 'Ошибка получения пользователей', error });
  }
};

// Create new user (Admin only)
export const createUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const { username, password, name, role } = req.body;

    // Validate input
    if (!username || !password || !name) {
      res.status(400).json({ message: 'Все поля обязательны: username, password, name' });
      return;
    }

    // Check if username already exists
    const existingUser = await User.findOne({ username: username.toLowerCase() });
    if (existingUser) {
      res.status(400).json({ message: 'Пользователь с таким логином уже существует' });
      return;
    }

    // Validate role
    const userRole = role && Object.values(UserRole).includes(role) 
      ? role 
      : UserRole.MECHANIC;

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = await User.create({
      username: username.toLowerCase(),
      password: hashedPassword,
      name,
      role: userRole,
      isActive: true
    });

    // Return user without password
    res.status(201).json({
      id: user._id,
      username: user.username,
      name: user.name,
      role: user.role,
      isActive: user.isActive,
      createdAt: user.createdAt
    });
  } catch (error) {
    console.error('Error creating user:', error);
    res.status(500).json({ message: 'Ошибка создания пользователя', error });
  }
};

// Update user (Admin only)
export const updateUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { name, role, password } = req.body;

    const user = await User.findById(id);
    if (!user) {
      res.status(404).json({ message: 'Пользователь не найден' });
      return;
    }

    // Update fields
    if (name) user.name = name;
    if (role && Object.values(UserRole).includes(role)) {
      user.role = role;
    }
    if (password) {
      user.password = await bcrypt.hash(password, 10);
    }

    await user.save();

    res.json({
      id: user._id,
      username: user.username,
      name: user.name,
      role: user.role,
      isActive: user.isActive,
      updatedAt: user.updatedAt
    });
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({ message: 'Ошибка обновления пользователя', error });
  }
};

// Update user role (Admin only)
export const updateUserRole = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { role } = req.body;
    
    if (!Object.values(UserRole).includes(role)) {
      res.status(400).json({ message: 'Недопустимая роль' });
      return;
    }
    
    const user = await User.findByIdAndUpdate(
      id,
      { role },
      { new: true }
    );
    
    if (!user) {
      res.status(404).json({ message: 'Пользователь не найден' });
      return;
    }
    
    res.json({
      id: user._id,
      username: user.username,
      name: user.name,
      role: user.role,
      isActive: user.isActive
    });
  } catch (error) {
    console.error('Error updating user role:', error);
    res.status(500).json({ message: 'Ошибка обновления роли', error });
  }
};

// Toggle user active status (Admin only)
export const toggleUserStatus = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    
    const user = await User.findById(id);
    if (!user) {
      res.status(404).json({ message: 'Пользователь не найден' });
      return;
    }

    // Prevent admin from disabling themselves
    if (req.user?.id === id) {
      res.status(400).json({ message: 'Нельзя заблокировать свой собственный аккаунт' });
      return;
    }

    user.isActive = !user.isActive;
    await user.save();

    res.json({
      id: user._id,
      username: user.username,
      name: user.name,
      role: user.role,
      isActive: user.isActive
    });
  } catch (error) {
    console.error('Error toggling user status:', error);
    res.status(500).json({ message: 'Ошибка изменения статуса пользователя', error });
  }
};

// Delete user (Admin only)
export const deleteUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    // Prevent admin from deleting themselves
    if (req.user?.id === id) {
      res.status(400).json({ message: 'Нельзя удалить свой собственный аккаунт' });
      return;
    }
    
    const user = await User.findByIdAndDelete(id);
    
    if (!user) {
      res.status(404).json({ message: 'Пользователь не найден' });
      return;
    }
    
    res.json({ message: 'Пользователь успешно удален' });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ message: 'Ошибка удаления пользователя', error });
  }
};

