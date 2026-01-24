import { Request, Response } from 'express';
import User, { UserRole } from '../models/User';

export const getUserByEmail = async (req: Request, res: Response) => {
  try {
    const { email } = req.params;
    
    let user = await User.findOne({ email: email.toLowerCase() });
    
    // Auto-create user if doesn't exist (first-time Firebase login)
    if (!user) {
      const { name, firebaseUid, photoURL } = req.body;
      
      // Auto-assign admin role for specific email
      const role = email.toLowerCase() === 'vadimlavrenchuk@yahoo.com' 
        ? UserRole.ADMIN 
        : UserRole.MECHANIC;
      
      user = await User.create({
        email: email.toLowerCase(),
        name: name || email.split('@')[0],
        role,
        firebaseUid,
        photoURL
      });
    }
    
    res.json(user);
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ message: 'Error fetching user', error });
  }
};

export const createOrUpdateUser = async (req: Request, res: Response) => {
  try {
    const { email, name, role, firebaseUid, photoURL } = req.body;
    
    // Auto-assign admin role for specific email
    const userRole = email.toLowerCase() === 'vadimlavrenchuk@yahoo.com' 
      ? UserRole.ADMIN 
      : (role || UserRole.MECHANIC);
    
    const user = await User.findOneAndUpdate(
      { email: email.toLowerCase() },
      { 
        name, 
        role: userRole, 
        firebaseUid,
        photoURL
      },
      { 
        new: true, 
        upsert: true,
        setDefaultsOnInsert: true
      }
    );
    
    res.json(user);
  } catch (error) {
    console.error('Error creating/updating user:', error);
    res.status(500).json({ message: 'Error creating/updating user', error });
  }
};

export const getAllUsers = async (_req: Request, res: Response) => {
  try {
    const users = await User.find().sort({ createdAt: -1 });
    res.json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ message: 'Error fetching users', error });
  }
};

export const updateUserRole = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { role } = req.body;
    
    if (!Object.values(UserRole).includes(role)) {
      return res.status(400).json({ message: 'Invalid role' });
    }
    
    const user = await User.findByIdAndUpdate(
      id,
      { role },
      { new: true }
    );
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    return res.json(user);
  } catch (error) {
    console.error('Error updating user role:', error);
    return res.status(500).json({ message: 'Error updating user role', error });
  }
};

export const deleteUser = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    const user = await User.findByIdAndDelete(id);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    return res.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Error deleting user:', error);
    return res.status(500).json({ message: 'Error deleting user', error });
  }
};
