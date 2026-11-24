import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { asyncHandler } from '../middleware/errorHandler';
import { sendPaginated } from '../utils/response';
import AuditLog from '../models/AuditLog';

export const getAuditLogs = asyncHandler(async (req: AuthRequest, res: Response) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 20;
  const action = req.query.action as string;
  const resource = req.query.resource as string;
  const skip = (page - 1) * limit;

  const query: any = {};
  if (action) query.action = action;
  if (resource) query.resource = resource;

  const [logs, total] = await Promise.all([
    AuditLog.find(query)
      .populate('userId', 'name email role')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    AuditLog.countDocuments(query),
  ]);

  sendPaginated(res, logs, total, page, limit, 'Audit logs fetched');
});
