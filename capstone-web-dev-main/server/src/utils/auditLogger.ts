import AuditLog from '../models/AuditLog';
import mongoose from 'mongoose';

export const createAuditLog = async (params: {
  userId: string;
  action: string;
  resource: string;
  resourceId?: string;
  details?: object;
  ipAddress?: string;
  userAgent?: string;
}): Promise<void> => {
  try {
    await AuditLog.create({
      userId: new mongoose.Types.ObjectId(params.userId),
      action: params.action,
      resource: params.resource,
      resourceId: params.resourceId ? new mongoose.Types.ObjectId(params.resourceId) : undefined,
      details: params.details,
      ipAddress: params.ipAddress,
      userAgent: params.userAgent,
    });
  } catch (error) {
    console.error('Audit log error:', error);
  }
};
