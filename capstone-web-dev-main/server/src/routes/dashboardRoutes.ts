import { Router } from 'express';
import { getAdminDashboard, getFacultyDashboard, getStudentDashboard } from '../controllers/dashboardController';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();

router.get('/admin', authenticate, authorize('ADMIN'), getAdminDashboard);
router.get('/faculty', authenticate, authorize('FACULTY'), getFacultyDashboard);
router.get('/student', authenticate, authorize('STUDENT'), getStudentDashboard);

export default router;
