import { Request, Response, NextFunction } from 'express';
import Inventory from '../models/Inventory';

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

    res.status(200).json({
      success: true,
      data: {
        totalItems,
        lowStockItems,
        totalQuantity,
        // Placeholder for future data
        activeOrders: 0,
        completedOrders: 0,
      },
    });
  } catch (error) {
    next(error);
  }
};
