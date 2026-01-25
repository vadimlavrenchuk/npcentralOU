import express from 'express';
import { getReportSummary, getExportData, getFinancialReport } from '../controllers/reports.controller';

const router = express.Router();

// Get analytics summary
router.get('/summary', getReportSummary);

// Get export data
router.get('/export', getExportData);

// Get financial report for accountants
router.get('/financial', getFinancialReport);

export default router;
