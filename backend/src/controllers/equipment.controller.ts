import { Request, Response, NextFunction } from 'express';
import Equipment from '../models/Equipment';

/**
 * Get all equipment
 * GET /api/equipment
 */
export const getAllEquipment = async (
  _req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const equipment = await Equipment.find().sort({ createdAt: -1 });

    // Transform MongoDB documents to match frontend expectations
    const transformedData = equipment.map(item => ({
      id: item._id.toString(),
      name: item.name,
      type: item.type,
      model: item.model,
      serialNumber: item.serialNumber,
      manufacturer: item.manufacturer,
      status: item.status,
      location: item.location,
      installDate: item.installDate?.toISOString(),
      lastMaintenanceDate: item.lastMaintenanceDate?.toISOString(),
      nextMaintenanceDate: item.nextMaintenanceDate?.toISOString(),
      notes: item.notes,
      // PM fields
      maintenanceInterval: item.maintenanceInterval,
      lastService: item.lastService ? {
        date: item.lastService.date?.toISOString(),
        hours: item.lastService.hours,
      } : undefined,
      currentHours: item.currentHours,
      checklistTemplate: item.checklistTemplate,
      // Virtual fields
      nextServiceData: item.nextServiceData,
      isUrgent: item.isUrgent,
      createdAt: item.createdAt.toISOString(),
      updatedAt: item.updatedAt.toISOString(),
    }));

    res.status(200).json({
      success: true,
      total: transformedData.length,
      data: transformedData,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get single equipment by ID
 * GET /api/equipment/:id
 */
export const getEquipmentById = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;

    const equipment = await Equipment.findById(id);

    if (!equipment) {
      res.status(404).json({
        success: false,
        message: 'Equipment not found',
      });
      return;
    }

    const transformedData = {
      id: equipment._id.toString(),
      name: equipment.name,
      type: equipment.type,
      model: equipment.model,
      serialNumber: equipment.serialNumber,
      manufacturer: equipment.manufacturer,
      status: equipment.status,
      location: equipment.location,
      installDate: equipment.installDate?.toISOString(),
      lastMaintenanceDate: equipment.lastMaintenanceDate?.toISOString(),
      nextMaintenanceDate: equipment.nextMaintenanceDate?.toISOString(),
      notes: equipment.notes,
      // PM fields
      maintenanceInterval: equipment.maintenanceInterval,
      lastService: equipment.lastService ? {
        date: equipment.lastService.date?.toISOString(),
        hours: equipment.lastService.hours,
      } : undefined,
      currentHours: equipment.currentHours,
      checklistTemplate: equipment.checklistTemplate,
      // Virtual fields
      nextServiceData: equipment.nextServiceData,
      isUrgent: equipment.isUrgent,
      createdAt: equipment.createdAt.toISOString(),
      updatedAt: equipment.updatedAt.toISOString(),
    };

    res.status(200).json({
      success: true,
      data: transformedData,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Create new equipment
 * POST /api/equipment
 */
export const createEquipment = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const equipment = await Equipment.create(req.body);

    res.status(201).json({
      success: true,
      message: 'Equipment created successfully',
      data: {
        id: equipment._id.toString(),
        ...equipment.toObject(),
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update equipment
 * PUT /api/equipment/:id
 */
export const updateEquipment = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;

    const equipment = await Equipment.findByIdAndUpdate(
      id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!equipment) {
      res.status(404).json({
        success: false,
        message: 'Equipment not found',
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: 'Equipment updated successfully',
      data: {
        id: equipment._id.toString(),
        ...equipment.toObject(),
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Delete equipment
 * DELETE /api/equipment/:id
 */
export const deleteEquipment = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;

    const equipment = await Equipment.findByIdAndDelete(id);

    if (!equipment) {
      res.status(404).json({
        success: false,
        message: 'Equipment not found',
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: 'Equipment deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update current hours for equipment
 * PATCH /api/equipment/:id/hours
 */
export const updateCurrentHours = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const { hours } = req.body;

    if (hours === undefined || hours < 0) {
      res.status(400).json({
        success: false,
        message: 'Valid hours value is required',
      });
      return;
    }

    const equipment = await Equipment.findById(id);

    if (!equipment) {
      res.status(404).json({
        success: false,
        message: 'Equipment not found',
      });
      return;
    }

    equipment.currentHours = hours;
    await equipment.save();

    res.status(200).json({
      success: true,
      message: 'Current hours updated successfully',
      data: {
        id: equipment._id.toString(),
        currentHours: equipment.currentHours,
        nextServiceData: equipment.nextServiceData,
        isUrgent: equipment.isUrgent,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Record service completion for equipment
 * POST /api/equipment/:id/service
 */
export const recordService = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const { serviceHours } = req.body;

    const equipment = await Equipment.findById(id);

    if (!equipment) {
      res.status(404).json({
        success: false,
        message: 'Equipment not found',
      });
      return;
    }

    // @ts-ignore - method exists on the model
    await equipment.recordService(serviceHours);

    res.status(200).json({
      success: true,
      message: 'Service recorded successfully',
      data: {
        id: equipment._id.toString(),
        lastService: equipment.lastService,
        lastMaintenanceDate: equipment.lastMaintenanceDate,
        nextMaintenanceDate: equipment.nextMaintenanceDate,
        nextServiceData: equipment.nextServiceData,
        isUrgent: equipment.isUrgent,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get urgent equipment (for dashboard)
 * GET /api/equipment/urgent
 */
export const getUrgentEquipment = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const limit = parseInt(req.query.limit as string) || 5;

    // @ts-ignore - static method exists on the model
    const urgentEquipment = await Equipment.getUrgentEquipment(limit);

    const transformedData = urgentEquipment.map((item: any) => ({
      id: item._id.toString(),
      name: item.name,
      type: item.type,
      model: item.model,
      location: item.location,
      status: item.status,
      currentHours: item.currentHours,
      nextServiceData: item.nextServiceData,
      isUrgent: item.isUrgent,
      maintenanceInterval: item.maintenanceInterval,
    }));

    res.status(200).json({
      success: true,
      total: transformedData.length,
      data: transformedData,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get equipment maintenance statistics
 * GET /api/equipment/stats/maintenance
 */
export const getMaintenanceStats = async (
  _req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const allEquipment = await Equipment.find({
      maintenanceInterval: { $exists: true },
    });

    const stats = {
      total: allEquipment.length,
      urgent: 0,
      dueThisWeek: 0,
      dueThisMonth: 0,
      overdue: 0,
    };

    const now = new Date();
    const weekFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    const monthFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

    allEquipment.forEach(equipment => {
      if (equipment.isUrgent) {
        stats.urgent++;
      }

      const nextService = equipment.nextServiceData;
      if (nextService?.date) {
        const nextDate = new Date(nextService.date);

        if (nextDate < now) {
          stats.overdue++;
        } else if (nextDate <= weekFromNow) {
          stats.dueThisWeek++;
        } else if (nextDate <= monthFromNow) {
          stats.dueThisMonth++;
        }
      }

      if (nextService?.hoursRemaining !== null && nextService?.hoursRemaining !== undefined) {
        if (nextService.hoursRemaining < 0) {
          stats.overdue++;
        }
      }
    });

    res.status(200).json({
      success: true,
      data: stats,
    });
  } catch (error) {
    next(error);
  }
};
