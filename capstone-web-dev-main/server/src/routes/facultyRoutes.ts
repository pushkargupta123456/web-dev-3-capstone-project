import { Router } from 'express';
import {
  getFaculty, getFacultyById, createFaculty, updateFaculty, deleteFaculty, getMyFacultyProfile
} from '../controllers/facultyController';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();

router.use(authenticate);
router.get('/me', authorize('FACULTY'), getMyFacultyProfile);
router.get('/', authorize('ADMIN'), getFaculty);
router.post('/', authorize('ADMIN'), createFaculty);
router.get('/:id', authorize('ADMIN', 'FACULTY'), getFacultyById);
router.patch('/:id', authorize('ADMIN'), updateFaculty);
router.delete('/:id', authorize('ADMIN'), deleteFaculty);

export default router;
