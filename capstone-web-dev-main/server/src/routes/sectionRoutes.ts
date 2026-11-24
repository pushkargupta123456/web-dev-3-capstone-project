import { Router } from 'express';
import { getSections, getSectionById, createSection, updateSection, deleteSection } from '../controllers/sectionController';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();

router.use(authenticate);
router.get('/', getSections);
router.post('/', authorize('ADMIN'), createSection);
router.get('/:id', authorize('ADMIN', 'FACULTY'), getSectionById);
router.patch('/:id', authorize('ADMIN'), updateSection);
router.delete('/:id', authorize('ADMIN'), deleteSection);

export default router;
