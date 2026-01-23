import { Router } from 'express';
import {
  getAllWorkOrders,
  getWorkOrderById,
  createWorkOrder,
  updateWorkOrder,
  deleteWorkOrder,
  updateWorkOrderStatus,
  assignMechanic,
} from '../controllers/workOrder.controller';

const router = Router();

/**
 * @route   GET /api/work-orders
 * @desc    Get all work orders with automatic priority sorting (Critical/High first)
 * @access  Public
 */
router.get('/', getAllWorkOrders);

/**
 * @route   GET /api/work-orders/:id
 * @desc    Get work order by ID
 * @access  Public
 */
router.get('/:id', getWorkOrderById);

/**
 * @route   POST /api/work-orders
 * @desc    Create a new work order
 * @access  Public
 */
router.post('/', createWorkOrder);

/**
 * @route   PATCH /api/work-orders/:id
 * @desc    Update a work order
 * @access  Public
 */
router.patch('/:id', updateWorkOrder);

/**
 * @route   DELETE /api/work-orders/:id
 * @desc    Delete a work order
 * @access  Public
 */
router.delete('/:id', deleteWorkOrder);

/**
 * @route   PATCH /api/work-orders/:id/status
 * @desc    Update work order status
 * @access  Public
 */
router.patch('/:id/status', updateWorkOrderStatus);

/**
 * @route   PATCH /api/work-orders/:id/assign
 * @desc    Assign mechanic to work order
 * @access  Public
 */
router.patch('/:id/assign', assignMechanic);

export default router;
