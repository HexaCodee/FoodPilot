import { Router } from 'express';
import { getAllSalesReports, getSalesReportById, createSalesReport, updateSalesReport, deleteSalesReport } from './salesReport.controller.js';

const router = Router();

router.get('/', getAllSalesReports);
router.get('/:id', getSalesReportById);
router.post('/', createSalesReport);
router.put('/:id', updateSalesReport);
router.delete('/:id', deleteSalesReport);

export default router;
