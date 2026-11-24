import { Router } from 'express';
import { getAnnouncements, createAnnouncement, updateAnnouncement, deleteAnnouncement } from '../controllers/announcementController';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();

router.use(authenticate);
router.get('/', getAnnouncements);
router.post('/', authorize('ADMIN', 'FACULTY'), createAnnouncement);
router.patch('/:id', authorize('ADMIN', 'FACULTY'), updateAnnouncement);
router.delete('/:id', authorize('ADMIN', 'FACULTY'), deleteAnnouncement);

export default router;
