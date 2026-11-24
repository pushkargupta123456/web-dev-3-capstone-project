import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { asyncHandler } from '../middleware/errorHandler';
import { sendSuccess, sendError } from '../utils/response';
import Notification from '../models/Notification';

export const getNotifications = asyncHandler(async (req: AuthRequest, res: Response) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 20;
  const skip = (page - 1) * limit;

  const [notifications, total, unreadCount] = await Promise.all([
    Notification.find({ userId: req.user?.id })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    Notification.countDocuments({ userId: req.user?.id }),
    Notification.countDocuments({ userId: req.user?.id, isRead: false }),
  ]);

  sendSuccess(res, { notifications, unreadCount, pagination: { total, page, limit, pages: Math.ceil(total / limit) } }, 'Notifications fetched');
});

export const markAsRead = asyncHandler(async (req: AuthRequest, res: Response) => {
  const notification = await Notification.findOneAndUpdate(
    { _id: req.params.id, userId: req.user?.id },
    { isRead: true },
    { new: true }
  );
  if (!notification) return sendError(res, 'Notification not found', 404);
  sendSuccess(res, notification, 'Notification marked as read');
});

export const markAllAsRead = asyncHandler(async (req: AuthRequest, res: Response) => {
  await Notification.updateMany({ userId: req.user?.id, isRead: false }, { isRead: true });
  sendSuccess(res, null, 'All notifications marked as read');
});
