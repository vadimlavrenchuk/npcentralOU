import { Request, Response, NextFunction } from 'express';
import Inventory from '../models/Inventory';
import { WorkOrder } from '../models/WorkOrder';
import Equipment from '../models/Equipment';

/**
 * Get dashboard statistics
 * GET /api/stats
 */
export const getStats = async (
  _req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // Get total inventory count
    const totalItems = await Inventory.countDocuments();

    // Get low stock items (quantity <= minQuantity)
    const lowStockItems = await Inventory.countDocuments({
      $expr: { $lte: ['$quantity', '$minQuantity'] }
    });

    // Calculate total quantity across all items
    const inventoryAggregation = await Inventory.aggregate([
      {
        $group: {
          _id: null,
          totalQuantity: { $sum: '$quantity' }
        }
      }
    ]);

    const totalQuantity = inventoryAggregation.length > 0 
      ? inventoryAggregation[0].totalQuantity 
      : 0;

    // Get work orders statistics
    const totalWorkOrders = await WorkOrder.countDocuments();
    const activeOrders = await WorkOrder.countDocuments({ 
      status: { $in: ['pending', 'in_progress'] } 
    });
    const completedOrders = await WorkOrder.countDocuments({ 
      status: 'completed' 
    });

    // Get equipment statistics
    const totalEquipment = await Equipment.countDocuments();
    const operationalEquipment = await Equipment.countDocuments({ 
      status: 'operational' 
    });

    res.status(200).json({
      success: true,
      data: {
        // Inventory stats
        totalItems,
        lowStockItems,
        totalQuantity,
        // Work orders stats
        totalWorkOrders,
        activeOrders,
        completedOrders,
        // Equipment stats
        totalEquipment,
        operationalEquipment,
      },
    });
  } catch (error) {
    next(error);
  }
};
