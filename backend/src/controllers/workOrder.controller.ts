import { Request, Response, NextFunction } from 'express';
import { WorkOrder, WorkOrderPriority, WorkOrderStatus } from '../models/WorkOrder';
import Inventory from '../models/Inventory';

/**
 * Priority sort order mapping
 */
const prioritySortOrder: Record<WorkOrderPriority, number> = {
  [WorkOrderPriority.CRITICAL]: 1,
  [WorkOrderPriority.HIGH]: 2,
  [WorkOrderPriority.MEDIUM]: 3,
  [WorkOrderPriority.LOW]: 4,
};

/**
 * Validate parts availability in inventory
 */
const validatePartsAvailability = async (parts: Array<{ inventoryId: string; quantity: number; name?: string }>) => {
  const insufficientParts: Array<{ name: string; requested: number; available: number }> = [];

  for (const part of parts) {
    const inventoryItem = await Inventory.findById(part.inventoryId);
    
    if (!inventoryItem) {
      insufficientParts.push({
        name: part.name || part.inventoryId,
        requested: part.quantity,
        available: 0,
      });
    } else if (inventoryItem.quantity < part.quantity) {
      insufficientParts.push({
        name: inventoryItem.name.en || inventoryItem.name.ru || part.name || part.inventoryId,
        requested: part.quantity,
        available: inventoryItem.quantity,
      });
    }
  }

  return insufficientParts;
};

/**
 * Get all work orders with automatic priority sorting
 */
export const getAllWorkOrders = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const {
      status,
      priority,
      assignedToId,
      equipmentId,
      page = 1,
      limit = 50,
    } = req.query;

    // Build filter
    const filter: any = {};
    if (status) filter.status = status;
    if (priority) filter.priority = priority;
    if (assignedToId) filter.assignedToId = assignedToId;
    if (equipmentId) filter.equipmentId = equipmentId;

    const skip = (Number(page) - 1) * Number(limit);

    // Fetch all work orders
    const workOrders = await WorkOrder.find(filter)
      .populate('equipmentId', 'name type model')
      .populate('assignedToId', 'name email')
      .skip(skip)
      .limit(Number(limit));

    // Sort by priority (Critical/High first), then by creation date
    const sortedWorkOrders = workOrders.sort((a, b) => {
      const priorityDiff = prioritySortOrder[a.priority] - prioritySortOrder[b.priority];
      if (priorityDiff !== 0) return priorityDiff;
      // If same priority, sort by creation date (newest first)
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

    const total = await WorkOrder.countDocuments(filter);

    res.status(200).json({
      data: sortedWorkOrders,
      total,
      page: Number(page),
      limit: Number(limit),
      totalPages: Math.ceil(total / Number(limit)),
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get a single work order by ID
 */
export const getWorkOrderById = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;

    const workOrder = await WorkOrder.findById(id)
      .populate('equipmentId', 'name type model')
      .populate('assignedToId', 'name email');

    if (!workOrder) {
      res.status(404).json({ message: 'Work order not found' });
      return;
    }

    res.status(200).json(workOrder);
  } catch (error) {
    next(error);
  }
};

/**
 * Create a new work order
 */
export const createWorkOrder = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const {
      title,
      description,
      equipmentId,
      assignedToId,
      priority = WorkOrderPriority.MEDIUM,
      parts = [],
      estimatedHours,
      dueDate,
      notes,
    } = req.body;

    // Validation
    if (!title || !description) {
      res.status(400).json({ message: 'Title and description are required' });
      return;
    }

    // Check parts availability if parts are specified
    let insufficientParts: Array<{ name: string; requested: number; available: number }> = [];
    if (parts && parts.length > 0) {
      insufficientParts = await validatePartsAvailability(parts);
    }

    const workOrder = new WorkOrder({
      title,
      description,
      equipmentId,
      assignedToId,
      priority,
      status: WorkOrderStatus.PENDING,
      parts,
      estimatedHours,
      dueDate,
      notes,
    });

    await workOrder.save();

    // Return response with warning if parts are insufficient
    const response: any = { data: workOrder };
    if (insufficientParts.length > 0) {
      response.warning = {
        message: 'Some parts have insufficient stock',
        insufficientParts,
      };
    }

    res.status(201).json(response);
  } catch (error) {
    next(error);
  }
};

/**
 * Deduct parts from inventory
 */
const deductPartsFromInventory = async (parts: Array<{ inventoryId: string; quantity: number }>) => {
  for (const part of parts) {
    const inventoryItem = await Inventory.findById(part.inventoryId);
    
    if (inventoryItem && inventoryItem.quantity >= part.quantity) {
      inventoryItem.quantity -= part.quantity;
      await inventoryItem.save();
    } else {
      console.warn(
        `Could not deduct part ${part.inventoryId}: insufficient stock (requested: ${part.quantity}, available: ${inventoryItem?.quantity || 0})`
      );
    }
  }
};

/**
 * Update a work order
 */
export const updateWorkOrder = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const updates = req.body;

    // Don't allow updating createdAt
    delete updates.createdAt;

    // Get the old work order to check status change
    const oldWorkOrder = await WorkOrder.findById(id);

    const workOrder = await WorkOrder.findByIdAndUpdate(
      id,
      updates,
      { new: true, runValidators: true }
    )
      .populate('equipmentId', 'name type model')
      .populate('assignedToId', 'name email');

    if (!workOrder) {
      res.status(404).json({ message: 'Work order not found' });
      return;
    }

    // Automatically deduct parts if status changed to COMPLETED
    if (
      oldWorkOrder &&
      oldWorkOrder.status !== WorkOrderStatus.COMPLETED &&
      workOrder.status === WorkOrderStatus.COMPLETED &&
      workOrder.parts &&
      workOrder.parts.length > 0
    ) {
      console.log(`Work order ${id} completed. Deducting parts from inventory...`);
      await deductPartsFromInventory(workOrder.parts as any);
      
      // Set completedAt timestamp
      workOrder.completedAt = new Date();
      await workOrder.save();
    }

    res.status(200).json(workOrder);
  } catch (error) {
    next(error);
  }
};

/**
 * Delete a work order
 */
export const deleteWorkOrder = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;

    console.log('Attempting to delete work order with ID:', id);

    const workOrder = await WorkOrder.findByIdAndDelete(id);

    console.log('Found work order:', workOrder);

    if (!workOrder) {
      res.status(404).json({ message: 'Work order not found' });
      return;
    }

    res.status(200).json({ message: 'Work order deleted successfully' });
  } catch (error) {
    console.error('Error deleting work order:', error);
    next(error);
  }
};

/**
 * Update work order status
 */
export const updateWorkOrderStatus = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!status || !Object.values(WorkOrderStatus).includes(status)) {
      res.status(400).json({ message: 'Invalid status' });
      return;
    }

    const updates: any = { status };
    
    // If status is completed, set completedAt
    if (status === WorkOrderStatus.COMPLETED) {
      updates.completedAt = new Date();
    }

    const workOrder = await WorkOrder.findByIdAndUpdate(
      id,
      updates,
      { new: true, runValidators: true }
    )
      .populate('equipmentId', 'name type model')
      .populate('assignedToId', 'name email');

    if (!workOrder) {
      res.status(404).json({ message: 'Work order not found' });
      return;
    }

    res.status(200).json(workOrder);
  } catch (error) {
    next(error);
  }
};

/**
 * Assign mechanic to work order
 */
export const assignMechanic = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const { mechanicId } = req.body;

    if (!mechanicId) {
      res.status(400).json({ message: 'Mechanic ID is required' });
      return;
    }

    const workOrder = await WorkOrder.findByIdAndUpdate(
      id,
      { assignedToId: mechanicId },
      { new: true, runValidators: true }
    )
      .populate('equipmentId', 'name type model')
      .populate('assignedToId', 'name email');

    if (!workOrder) {
      res.status(404).json({ message: 'Work order not found' });
      return;
    }

    res.status(200).json(workOrder);
  } catch (error) {
    next(error);
  }
};
