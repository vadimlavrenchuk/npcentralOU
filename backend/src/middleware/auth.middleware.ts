import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import User, { UserRole } from '../models/User';

// Extend Express Request type to include user
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        username: string;
        role: UserRole;
      };
    }
  }
}

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

export const authenticateToken = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // Get token from Authorization header (Bearer token)
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];

    console.log('🔐 Auth check for:', req.method, req.path, '| Token:', token ? 'present' : 'missing');

    if (!token) {
      console.log('❌ No token provided');
      res.status(401).json({ message: 'Отсутствует токен авторизации' });
      return;
    }

    // Verify token
    const decoded = jwt.verify(token, JWT_SECRET) as {
      id: string;
      username: string;
      role: UserRole;
    };

    // Check if user still exists and is active
    const user = await User.findById(decoded.id);
    if (!user) {
      console.log('❌ User not found:', decoded.username);
      res.status(401).json({ message: 'Пользователь не найден' });
      return;
    }

    if (!user.isActive) {
      console.log('❌ User inactive:', decoded.username);
      res.status(403).json({ message: 'Аккаунт заблокирован' });
      return;
    }

    // Attach user info to request
    req.user = {
      id: decoded.id,
      username: decoded.username,
      role: decoded.role
    };

    console.log('✅ Auth success:', decoded.username, '|', decoded.role);
    next();
  } catch (error) {
    console.log('❌ Auth error:', error instanceof jwt.JsonWebTokenError ? error.message : 'Unknown');
    if (error instanceof jwt.JsonWebTokenError) {
      res.status(403).json({ message: 'Недействительный токен' });
      return;
    }
    res.status(500).json({ message: 'Ошибка авторизации' });
  }
};

export const requireAdmin = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  if (req.user?.role !== UserRole.ADMIN) {
    res.status(403).json({ message: 'Требуются права администратора' });
    return;
  }
  next();
};

// Admin + Chief Mechanic have full access
export const requireAdminOrChiefMechanic = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  if (req.user?.role !== UserRole.ADMIN && req.user?.role !== UserRole.CHIEF_MECHANIC) {
    res.status(403).json({ message: 'Требуются права администратора или главного механика' });
    return;
  }
  next();
};

export const requireRole = (...roles: UserRole[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user || !roles.includes(req.user.role)) {
      res.status(403).json({ message: 'Недостаточно прав доступа' });
      return;
    }
    next();
  };
};
