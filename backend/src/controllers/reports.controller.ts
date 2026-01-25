import { Request, Response } from 'express';
import { WorkOrder } from '../models/WorkOrder';
import Inventory from '../models/Inventory';

interface MonthlyExpenses {
  month: string;
  totalCost: number;
  itemsUsed: number;
}

interface EfficiencyMetrics {
  averageCompletionTime: number; // in hours
  completedOrders: number;
  pendingOrders: number;
  overdueOrders: number;
}

interface TopEquipmentIssue {
  equipmentId: string;
  equipmentName: string;
  issueCount: number;
  totalCost: number;
}

interface WeeklyBreakdown {
  week: string;
  count: number;
}

interface ReportSummary {
  expenses: MonthlyExpenses;
  efficiency: EfficiencyMetrics;
  topIssues: TopEquipmentIssue[];
  weeklyBreakdowns: WeeklyBreakdown[];
}

// Get report summary with analytics
export const getReportSummary = async (req: Request, res: Response) => {
  try {
    const { startDate, endDate } = req.query;
    
    // Default to current month if no dates provided
    const start = startDate 
      ? new Date(startDate as string) 
      : new Date(new Date().getFullYear(), new Date().getMonth(), 1);
    
    const end = endDate 
      ? new Date(endDate as string) 
      : new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0, 23, 59, 59);

    // 1. Calculate Monthly Expenses
    const workOrders = await WorkOrder.find({
      createdAt: { $gte: start, $lte: end }
    })
    .populate('equipmentId')
    .populate('parts.inventoryId');

    let totalCost = 0;
    let itemsUsed = 0;

    workOrders.forEach((order: any) => {
      if (order.parts && Array.isArray(order.parts)) {
        order.parts.forEach((part: any) => {
          const unitPrice = part.inventoryId?.unitPrice || 0;
          totalCost += (part.quantity || 0) * unitPrice;
          itemsUsed += part.quantity || 0;
        });
      }
    });

    const expenses: MonthlyExpenses = {
      month: start.toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
      totalCost: Math.round(totalCost * 100) / 100,
      itemsUsed
    };

    // 2. Calculate Efficiency Metrics
    const completedOrders = workOrders.filter((order: any) => order.status === 'completed');
    
    let totalCompletionTime = 0;
    completedOrders.forEach((order: any) => {
      if (order.completedAt && order.createdAt) {
        const timeDiff = new Date(order.completedAt).getTime() - new Date(order.createdAt).getTime();
        totalCompletionTime += timeDiff / (1000 * 60 * 60); // Convert to hours
      }
    });

    const averageCompletionTime = completedOrders.length > 0 
      ? Math.round((totalCompletionTime / completedOrders.length) * 10) / 10 
      : 0;

    const pendingOrders = workOrders.filter((order: any) => 
      order.status === 'pending' || order.status === 'in_progress'
    ).length;

    const overdueOrders = workOrders.filter((order: any) => {
      if (order.dueDate && order.status !== 'completed') {
        return new Date(order.dueDate) < new Date();
      }
      return false;
    }).length;

    const efficiency: EfficiencyMetrics = {
      averageCompletionTime,
      completedOrders: completedOrders.length,
      pendingOrders,
      overdueOrders
    };

    // 3. Top Equipment Issues
    const equipmentIssues = new Map<string, { name: string; count: number; cost: number }>();

    workOrders.forEach((order: any) => {
      if (order.equipmentId) {
        const equipmentId = (order.equipmentId as any)._id?.toString() || order.equipmentId.toString();
        const equipmentName = (order.equipmentId as any).name || 'Unknown Equipment';
        
        let orderCost = 0;
        if (order.parts && Array.isArray(order.parts)) {
          order.parts.forEach((part: any) => {
            const unitPrice = part.inventoryId?.unitPrice || 0;
            orderCost += (part.quantity || 0) * unitPrice;
          });
        }

        if (equipmentIssues.has(equipmentId)) {
          const existing = equipmentIssues.get(equipmentId)!;
          existing.count += 1;
          existing.cost += orderCost;
        } else {
          equipmentIssues.set(equipmentId, {
            name: equipmentName,
            count: 1,
            cost: orderCost
          });
        }
      }
    });

    const topIssues: TopEquipmentIssue[] = Array.from(equipmentIssues.entries())
      .map(([equipmentId, data]) => ({
        equipmentId,
        equipmentName: data.name,
        issueCount: data.count,
        totalCost: Math.round(data.cost * 100) / 100
      }))
      .sort((a, b) => b.totalCost - a.totalCost)
      .slice(0, 10);

    // 4. Weekly Breakdowns
    const weeklyData = new Map<string, number>();
    
    workOrders.forEach((order: any) => {
      const date = new Date(order.createdAt);
      const weekStart = new Date(date);
      weekStart.setDate(date.getDate() - date.getDay()); // Start of week (Sunday)
      const weekKey = weekStart.toISOString().split('T')[0];
      
      weeklyData.set(weekKey, (weeklyData.get(weekKey) || 0) + 1);
    });

    const weeklyBreakdowns: WeeklyBreakdown[] = Array.from(weeklyData.entries())
      .map(([week, count]) => ({ week, count }))
      .sort((a, b) => a.week.localeCompare(b.week));

    const summary: ReportSummary = {
      expenses,
      efficiency,
      topIssues,
      weeklyBreakdowns
    };

    return res.json(summary);
  } catch (error) {
    console.error('Error generating report summary:', error);
    return res.status(500).json({ message: 'Error generating report summary', error });
  }
};

// Get detailed export data for CSV
export const getExportData = async (req: Request, res: Response) => {
  try {
    const { startDate, endDate } = req.query;
    
    const start = startDate 
      ? new Date(startDate as string) 
      : new Date(new Date().getFullYear(), new Date().getMonth(), 1);
    
    const end = endDate 
      ? new Date(endDate as string) 
      : new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0, 23, 59, 59);

    const workOrders = await WorkOrder.find({
      createdAt: { $gte: start, $lte: end }
    })
    .populate('equipmentId')
    .populate('assignedToId')
    .populate('parts.inventoryId')
    .sort({ createdAt: -1 });

    const exportData = workOrders.map((order: any) => {
      const equipment = (order.equipmentId as any);
      const assignee = (order.assignedToId as any);
      
      let partsCost = 0;
      let partsDetails = '';
      
      if (order.parts && Array.isArray(order.parts)) {
        order.parts.forEach((part: any, index: number) => {
          const inventory = part.inventoryId;
          const unitPrice = inventory?.unitPrice || 0;
          const cost = (part.quantity || 0) * unitPrice;
          const partName = part.name || inventory?.name?.en || 'Unknown Part';
          partsCost += cost;
          partsDetails += `${partName} (${part.quantity}x €${unitPrice.toFixed(2)}) `;
          if (index < order.parts!.length - 1) partsDetails += '; ';
        });
      }

      return {
        orderNumber: order.orderNumber || order._id,
        title: order.title,
        equipment: equipment?.name || 'N/A',
        status: order.status,
        priority: order.priority,
        assignedTo: assignee?.name || 'Unassigned',
        createdAt: new Date(order.createdAt).toLocaleDateString(),
        completedAt: order.completedAt ? new Date(order.completedAt).toLocaleDateString() : 'N/A',
        dueDate: order.dueDate ? new Date(order.dueDate).toLocaleDateString() : 'N/A',
        partsUsed: partsDetails || 'None',
        totalCost: Math.round(partsCost * 100) / 100,
        description: order.description || ''
      };
    });

    return res.json(exportData);
  } catch (error) {
    console.error('Error generating export data:', error);
    return res.status(500).json({ message: 'Error generating export data', error });
  }
};

// Get financial report for accountants
export const getFinancialReport = async (req: Request, res: Response) => {
  try {
    const { startDate, endDate } = req.query;
    
    const start = startDate 
      ? new Date(startDate as string) 
      : new Date(new Date().getFullYear(), new Date().getMonth(), 1);
    
    const end = endDate 
      ? new Date(endDate as string) 
      : new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0, 23, 59, 59);

    // Get all work orders in period with parts used
    const workOrders = await WorkOrder.find({
      createdAt: { $gte: start, $lte: end }
    }).populate('parts.inventoryId');

    // Calculate parts consumption (расход)
    const partsUsed: any[] = [];
    const totalExpenses = { total: 0, byCategory: {} as any };

    workOrders.forEach((order: any) => {
      if (order.parts && Array.isArray(order.parts)) {
        order.parts.forEach((part: any) => {
          const inventory = part.inventoryId;
          if (inventory) {
            const unitPrice = inventory.unitPrice || 0;
            const totalCost = (part.quantity || 0) * unitPrice;
            
            partsUsed.push({
              orderNumber: order.orderNumber,
              partName: inventory.name?.ru || inventory.name?.en || 'Unknown',
              sku: inventory.sku,
              quantity: part.quantity,
              unitPrice: unitPrice,
              totalCost: Math.round(totalCost * 100) / 100,
              category: inventory.category,
              usedDate: order.createdAt
            });

            totalExpenses.total += totalCost;
            
            const category = inventory.category || 'Other';
            if (!totalExpenses.byCategory[category]) {
              totalExpenses.byCategory[category] = 0;
            }
            totalExpenses.byCategory[category] += totalCost;
          }
        });
      }
    });

    // Get current inventory status (текущие остатки)
    const allInventory = await Inventory.find({});
    const lowStockItems = allInventory.filter(item => item.quantity <= item.minQuantity);
    
    const inventoryValue = allInventory.reduce((sum, item) => {
      return sum + (item.quantity * item.unitPrice);
    }, 0);

    // Items that need to be ordered (что нужно заказать)
    const itemsToOrder = lowStockItems.map(item => ({
      sku: item.sku,
      name: item.name?.ru || item.name?.en || 'Unknown',
      currentQuantity: item.quantity,
      minQuantity: item.minQuantity,
      needToOrder: Math.max(item.minQuantity * 2 - item.quantity, 0),
      unitPrice: item.unitPrice,
      estimatedCost: Math.round(Math.max(item.minQuantity * 2 - item.quantity, 0) * item.unitPrice * 100) / 100,
      supplier: item.supplier || 'N/A'
    }));

    const totalOrderCost = itemsToOrder.reduce((sum, item) => sum + item.estimatedCost, 0);

    const report = {
      period: {
        start: start.toLocaleDateString('ru-RU'),
        end: end.toLocaleDateString('ru-RU')
      },
      expenses: {
        total: Math.round(totalExpenses.total * 100) / 100,
        byCategory: Object.entries(totalExpenses.byCategory).map(([category, amount]: [string, any]) => ({
          category,
          amount: Math.round(amount * 100) / 100
        })),
        details: partsUsed.sort((a, b) => b.totalCost - a.totalCost)
      },
      inventory: {
        totalValue: Math.round(inventoryValue * 100) / 100,
        totalItems: allInventory.length,
        lowStockCount: lowStockItems.length
      },
      ordersNeeded: {
        items: itemsToOrder.sort((a, b) => b.estimatedCost - a.estimatedCost),
        totalCost: Math.round(totalOrderCost * 100) / 100,
        itemCount: itemsToOrder.length
      }
    };

    return res.json(report);
  } catch (error) {
    console.error('Error generating financial report:', error);
    return res.status(500).json({ message: 'Error generating financial report', error });
  }
};
