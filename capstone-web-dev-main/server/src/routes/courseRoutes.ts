import { Router } from 'express';
import { getCourses, getCourse, createCourse, updateCourse, deleteCourse } from '../controllers/courseController';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();

router.use(authenticate);
router.get('/', getCourses);
router.post('/', authorize('ADMIN'), createCourse);
router.get('/:id', getCourse);
router.patch('/:id', authorize('ADMIN'), updateCourse);
router.delete('/:id', authorize('ADMIN'), deleteCourse);

export default router;
