import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { username, password } = req.body;

    // Validate input
    if (!username || !password) {
      res.status(400).json({ message: 'Введите логин и пароль' });
      return;
    }

    // Find user (need to explicitly select password since it's excluded by default)
    const user = await User.findOne({ 
      username: username.toLowerCase() 
    }).select('+password');

    if (!user) {
      res.status(401).json({ message: 'Неверный логин или пароль' });
      return;
    }

    // Check if user is active
    if (!user.isActive) {
      res.status(403).json({ message: 'Ваш аккаунт заблокирован. Обратитесь к администратору.' });
      return;
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      res.status(401).json({ message: 'Неверный логин или пароль' });
      return;
    }

    // Generate JWT token
    const token = jwt.sign(
      {
        id: user._id,
        username: user.username,
        role: user.role
      },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN } as jwt.SignOptions
    );

    // Return user info and token
    res.json({
      token,
      user: {
        id: user._id,
        username: user.username,
        name: user.name,
        role: user.role,
        isActive: user.isActive
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Ошибка сервера при входе' });
  }
};

export const getCurrentUser = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: 'Не авторизован' });
      return;
    }

    const user = await User.findById(req.user.id);
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
    console.error('Get current user error:', error);
    res.status(500).json({ message: 'Ошибка получения данных пользователя' });
  }
};

export const logout = async (_req: Request, res: Response): Promise<void> => {
  // With JWT, logout is handled on the client side by removing the token
  // We just send a success response
  res.json({ message: 'Успешный выход' });
};
