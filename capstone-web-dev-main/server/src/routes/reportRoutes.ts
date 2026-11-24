import { Router } from 'express';
import { exportStudentsCSV, exportAttendanceCSV } from '../controllers/reportController';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();

router.use(authenticate, authorize('ADMIN', 'FACULTY'));
router.get('/students/csv', exportStudentsCSV);
router.get('/attendance/csv', exportAttendanceCSV);

export default router;
