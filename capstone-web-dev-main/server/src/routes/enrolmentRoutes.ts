import { Router } from 'express';
import { getEnrolments, createEnrolment, deleteEnrolment } from '../controllers/enrolmentController';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();

router.use(authenticate);
router.get('/', getEnrolments);
router.post('/', authorize('ADMIN'), createEnrolment);
router.delete('/:id', authorize('ADMIN'), deleteEnrolment);

export default router;
