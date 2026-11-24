import { Router } from 'express';
import {
  getStudents, getStudent, createStudent, updateStudent, deleteStudent, getMyProfile
} from '../controllers/studentController';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();

router.use(authenticate);
router.get('/me', authorize('STUDENT'), getMyProfile);
router.get('/', authorize('ADMIN', 'FACULTY'), getStudents);
router.post('/', authorize('ADMIN'), createStudent);
router.get('/:id', authorize('ADMIN', 'FACULTY', 'STUDENT'), getStudent);
router.patch('/:id', authorize('ADMIN'), updateStudent);
router.delete('/:id', authorize('ADMIN'), deleteStudent);

export default router;
