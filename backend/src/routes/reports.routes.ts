import express from 'express';
import { getReportSummary, getExportData } from '../controllers/reports.controller';

const router = express.Router();

// Get analytics summary
router.get('/summary', getReportSummary);

// Get export data
router.get('/export', getExportData);

export default router;
