import { Router } from 'express';
import {
  getAllInventory,
  getInventoryById,
  updateInventoryQuantity,
  createInventoryItem,
  updateInventoryItem,
  deleteInventoryItem,
} from '../controllers/inventory.controller';

const router = Router();

/**
 * @route   GET /api/inventory
 * @desc    Get all inventory items
 * @access  Public
 */
router.get('/', getAllInventory);

/**
 * @route   GET /api/inventory/:id
 * @desc    Get single inventory item by ID
 * @access  Public
 */
router.get('/:id', getInventoryById);

/**
 * @route   POST /api/inventory
 * @desc    Create new inventory item
 * @access  Public
 */
router.post('/', createInventoryItem);

/**
 * @route   PATCH /api/inventory/:id
 * @desc    Update inventory quantity (incoming/outgoing)
 * @access  Public
 */
router.patch('/:id', updateInventoryQuantity);

/**
 * @route   PUT /api/inventory/:id
 * @desc    Update inventory item (full update)
 * @access  Public
 */
router.put('/:id', updateInventoryItem);

/**
 * @route   DELETE /api/inventory/:id
 * @desc    Delete inventory item
 * @access  Public
 */
router.delete('/:id', deleteInventoryItem);

export default router;
