import { Request, Response } from 'express';
import Schedule from '../models/Schedule';

// Get all schedule entries
export const getAllSchedules = async (req: Request, res: Response): Promise<void> => {
  try {
    const { startDate, endDate, userId } = req.query;
    
    const filter: any = {};
    
    if (startDate || endDate) {
      filter.startDate = {};
      if (startDate) filter.startDate.$gte = new Date(startDate as string);
      if (endDate) filter.endDate = { $lte: new Date(endDate as string) };
    }
    
    if (userId) {
      filter.userId = userId;
    }
    
    const schedules = await Schedule.find(filter)
      .populate('userId', 'name role')
      .populate('createdBy', 'name')
      .sort({ startDate: 1 });
    
    // Фильтруем записи с удалёнными пользователями
    const validSchedules = schedules.filter(schedule => schedule.userId !== null);
      
    res.json(validSchedules);
  } catch (error) {
    console.error('Error fetching schedules:', error);
    res.status(500).json({ message: 'Ошибка получения графика', error });
  }
};

// Create new schedule entry (Admin only)
export const createSchedule = async (req: Request, res: Response): Promise<void> => {
  try {
    const { userId, type, startDate, endDate, shiftHours, notes } = req.body;
    const createdBy = req.user?.id;

    if (!userId || !type || !startDate || !endDate) {
      res.status(400).json({ message: 'Обязательные поля: userId, type, startDate, endDate' });
      return;
    }

    const schedule = await Schedule.create({
      userId,
      type,
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      shiftHours,
      notes,
      createdBy
    });

    const populatedSchedule = await Schedule.findById(schedule._id)
      .populate('userId', 'name role')
      .populate('createdBy', 'name');

    res.status(201).json(populatedSchedule);
  } catch (error) {
    console.error('Error creating schedule:', error);
    res.status(500).json({ message: 'Ошибка создания записи графика', error });
  }
};

// Update schedule entry (Admin only)
export const updateSchedule = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { userId, type, startDate, endDate, shiftHours, notes } = req.body;

    const schedule = await Schedule.findById(id);
    if (!schedule) {
      res.status(404).json({ message: 'Запись графика не найдена' });
      return;
    }

    schedule.userId = userId || schedule.userId;
    schedule.type = type || schedule.type;
    schedule.startDate = startDate ? new Date(startDate) : schedule.startDate;
    schedule.endDate = endDate ? new Date(endDate) : schedule.endDate;
    schedule.shiftHours = shiftHours !== undefined ? shiftHours : schedule.shiftHours;
    schedule.notes = notes !== undefined ? notes : schedule.notes;

    await schedule.save();

    const populatedSchedule = await Schedule.findById(schedule._id)
      .populate('userId', 'name role')
      .populate('createdBy', 'name');

    res.json(populatedSchedule);
  } catch (error) {
    console.error('Error updating schedule:', error);
    res.status(500).json({ message: 'Ошибка обновления записи графика', error });
  }
};

// Delete schedule entry (Admin only)
export const deleteSchedule = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const schedule = await Schedule.findByIdAndDelete(id);
    if (!schedule) {
      res.status(404).json({ message: 'Запись графика не найдена' });
      return;
    }

    res.json({ message: 'Запись графика удалена', schedule });
  } catch (error) {
    console.error('Error deleting schedule:', error);
    res.status(500).json({ message: 'Ошибка удаления записи графика', error });
  }
};

// Clean up orphaned schedule entries (entries with deleted users)
export const cleanupOrphanedSchedules = async (req: Request, res: Response): Promise<void> => {
  try {
    // Находим все записи графика
    const allSchedules = await Schedule.find().populate('userId');
    
    // Фильтруем записи с null userId (удалённые пользователи)
    const orphanedSchedules = allSchedules.filter(schedule => schedule.userId === null);
    
    if (orphanedSchedules.length === 0) {
      res.json({ message: 'Осиротевших записей не найдено', deletedCount: 0 });
      return;
    }
    
    // Удаляем записи с несуществующими пользователями
    const orphanedIds = orphanedSchedules.map(s => s._id);
    const result = await Schedule.deleteMany({ _id: { $in: orphanedIds } });
    
    res.json({ 
      message: `Удалено ${result.deletedCount} осиротевших записей графика`, 
      deletedCount: result.deletedCount 
    });
  } catch (error) {
    console.error('Error cleaning up orphaned schedules:', error);
    res.status(500).json({ message: 'Ошибка очистки осиротевших записей', error });
  }
};
