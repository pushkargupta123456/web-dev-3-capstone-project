import { Router } from 'express';
import {
  createSession, getSessions, markAttendance, updateAttendance,
  getStudentAttendance, getCourseAttendance, getAttendanceReports
} from '../controllers/attendanceController';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();

router.use(authenticate);
router.post('/sessions', authorize('ADMIN', 'FACULTY'), createSession);
router.get('/sessions', authorize('ADMIN', 'FACULTY'), getSessions);
router.post('/mark', authorize('ADMIN', 'FACULTY'), markAttendance);
router.patch('/:id', authorize('ADMIN', 'FACULTY'), updateAttendance);
router.get('/reports', authorize('ADMIN', 'FACULTY'), getAttendanceReports);
router.get('/student/:studentId', getStudentAttendance);
router.get('/course/:courseId', authorize('ADMIN', 'FACULTY'), getCourseAttendance);

export default router;
