import { Request, Response, NextFunction } from 'express';
import Inventory from '../models/Inventory';

/**
 * Get all inventory items
 * GET /api/inventory
 */
export const getAllInventory = async (
  _req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const inventory = await Inventory.find().sort({ createdAt: -1 });

    // Transform MongoDB documents to match frontend expectations
    const transformedData = inventory.map(item => ({
      id: item._id.toString(),
      sku: item.sku,
      name: item.name.en,
      nameTranslations: {
        en: item.name.en,
        et: item.name.et || item.name.en,
        fi: item.name.fi || item.name.en,
        ru: item.name.ru || item.name.en,
      },
      category: item.category,
      quantity: item.quantity,
      minQuantity: item.minQuantity,
      unit: item.unit,
      unitPrice: item.unitPrice,
      location: item.location || '',
      supplier: item.supplier || '',
      description: item.description || '',
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
 * Get single inventory item by ID
 * GET /api/inventory/:id
 */
export const getInventoryById = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;

    const item = await Inventory.findById(id);

    if (!item) {
      res.status(404).json({
        success: false,
        message: 'Inventory item not found',
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: item,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update inventory quantity (incoming/outgoing)
 * PATCH /api/inventory/:id
 * Body: { quantityChange: number, operation: 'add' | 'subtract' }
 */
export const updateInventoryQuantity = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const { quantityChange, operation } = req.body;

    // Validate input
    if (quantityChange === undefined || !operation) {
      res.status(400).json({
        success: false,
        message: 'quantityChange and operation are required',
      });
      return;
    }

    if (!['add', 'subtract'].includes(operation)) {
      res.status(400).json({
        success: false,
        message: 'operation must be either "add" or "subtract"',
      });
      return;
    }

    if (typeof quantityChange !== 'number' || quantityChange < 0) {
      res.status(400).json({
        success: false,
        message: 'quantityChange must be a positive number',
      });
      return;
    }

    // Find the item
    const item = await Inventory.findById(id);

    if (!item) {
      res.status(404).json({
        success: false,
        message: 'Inventory item not found',
      });
      return;
    }

    // Calculate new quantity
    let newQuantity: number;
    if (operation === 'add') {
      newQuantity = item.quantity + quantityChange;
    } else {
      newQuantity = item.quantity - quantityChange;
    }

    // Check if quantity goes below zero
    if (newQuantity < 0) {
      res.status(400).json({
        success: false,
        message: 'Insufficient quantity. Operation would result in negative stock.',
        currentQuantity: item.quantity,
        requestedChange: quantityChange,
      });
      return;
    }

    // Update the quantity
    item.quantity = newQuantity;
    await item.save();

    // Transform response to match frontend expectations
    const transformedData = {
      id: item._id.toString(),
      sku: item.sku,
      name: item.name.en,
      nameTranslations: {
        en: item.name.en,
        et: item.name.et || item.name.en,
        fi: item.name.fi || item.name.en,
        ru: item.name.ru || item.name.en,
      },
      category: item.category,
      quantity: item.quantity,
      minQuantity: item.minQuantity,
      unit: item.unit,
      unitPrice: item.unitPrice,
      location: item.location || '',
      supplier: item.supplier || '',
      description: item.description || '',
      createdAt: item.createdAt.toISOString(),
      updatedAt: item.updatedAt.toISOString(),
    };

    res.status(200).json({
      success: true,
      message: `Quantity ${operation === 'add' ? 'increased' : 'decreased'} successfully`,
      data: transformedData,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Create new inventory item
 * POST /api/inventory
 */
export const createInventoryItem = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const item = await Inventory.create(req.body);

    // Transform MongoDB document to match frontend expectations
    const transformedItem = {
      id: item._id.toString(),
      sku: item.sku,
      name: item.name.en,
      nameTranslations: {
        en: item.name.en,
        et: item.name.et || item.name.en,
        fi: item.name.fi || item.name.en,
        ru: item.name.ru || item.name.en,
      },
      category: item.category,
      quantity: item.quantity,
      minQuantity: item.minQuantity,
      unit: item.unit,
      unitPrice: item.unitPrice,
      location: item.location || '',
      supplier: item.supplier || '',
      description: item.description || '',
      createdAt: item.createdAt.toISOString(),
      updatedAt: item.updatedAt.toISOString(),
    };

    res.status(201).json({
      success: true,
      message: 'Inventory item created successfully',
      data: transformedItem,
    });
  } catch (error: any) {
    // Handle duplicate SKU error
    if (error.code === 11000) {
      res.status(400).json({
        success: false,
        message: 'SKU already exists',
      });
      return;
    }
    next(error);
  }
};

/**
 * Update inventory item
 * PUT /api/inventory/:id
 */
export const updateInventoryItem = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;

    const item = await Inventory.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!item) {
      res.status(404).json({
        success: false,
        message: 'Inventory item not found',
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: 'Inventory item updated successfully',
      data: item,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Delete inventory item
 * DELETE /api/inventory/:id
 */
export const deleteInventoryItem = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;

    const item = await Inventory.findByIdAndDelete(id);

    if (!item) {
      res.status(404).json({
        success: false,
        message: 'Inventory item not found',
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: 'Inventory item deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};
