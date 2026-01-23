import { Router } from 'express';
import {
  getAllEquipment,
  getEquipmentById,
  createEquipment,
  updateEquipment,
  deleteEquipment,
  updateCurrentHours,
  recordService,
  getUrgentEquipment,
  getMaintenanceStats,
} from '../controllers/equipment.controller';

const router = Router();

/**
 * @route   GET /api/equipment/urgent
 * @desc    Get urgent equipment for maintenance
 * @access  Public
 */
router.get('/urgent', getUrgentEquipment);

/**
 * @route   GET /api/equipment/stats/maintenance
 * @desc    Get maintenance statistics
 * @access  Public
 */
router.get('/stats/maintenance', getMaintenanceStats);

/**
 * @route   GET /api/equipment
 * @desc    Get all equipment
 * @access  Public
 */
router.get('/', getAllEquipment);

/**
 * @route   GET /api/equipment/:id
 * @desc    Get equipment by ID
 * @access  Public
 */
router.get('/:id', getEquipmentById);

/**
 * @route   POST /api/equipment
 * @desc    Create new equipment
 * @access  Public
 */
router.post('/', createEquipment);

/**
 * @route   PUT /api/equipment/:id
 * @desc    Update equipment
 * @access  Public
 */
router.put('/:id', updateEquipment);

/**
 * @route   DELETE /api/equipment/:id
 * @desc    Delete equipment
 * @access  Public
 */
router.delete('/:id', deleteEquipment);

/**
 * @route   PATCH /api/equipment/:id/hours
 * @desc    Update current hours for equipment
 * @access  Public
 */
router.patch('/:id/hours', updateCurrentHours);

/**
 * @route   POST /api/equipment/:id/service
 * @desc    Record service completion
 * @access  Public
 */
router.post('/:id/service', recordService);

export default router;
