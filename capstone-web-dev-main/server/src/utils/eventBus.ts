import { EventEmitter } from 'events';
import Notification from '../models/Notification';
import Student from '../models/Student';
import Enrolment from '../models/Enrolment';
import { createAuditLog } from './auditLogger';

export class AppEventEmitter extends EventEmitter {}

export const eventBus = new AppEventEmitter();

// Configure max listeners to avoid warnings on high concurrency
eventBus.setMaxListeners(30);

/**
 * Register Event Listeners for domain events
 * Demonstrates decoupled, event-driven architecture using Node.js EventEmitter
 */
export const initializeEventListeners = (io?: any) => {
  // 1. EVENT: ANNOUNCEMENT_CREATED
  // Purpose: When an announcement is published, notify target students/faculty via database notifications and real-time Socket.IO
  eventBus.on('ANNOUNCEMENT_CREATED', async (data: { announcement: any; userId?: string }) => {
    try {
      const { announcement, userId } = data;
      console.log(`📡 [EventEmitter] Event received: ANNOUNCEMENT_CREATED - "${announcement.title}"`);

      // A. Real-time push via Socket.IO
      if (io) {
        if (announcement.scope === 'UNIVERSITY') {
          io.to('university').emit('announcement', announcement);
        } else if (announcement.scope === 'COURSE' && announcement.courseId) {
          io.to(`course_${announcement.courseId}`).emit('announcement', announcement);
        } else if (announcement.scope === 'SECTION' && announcement.sectionId) {
          io.to(`section_${announcement.sectionId}`).emit('announcement', announcement);
        }
      }

      // B. Create persistent notification in database for affected users
      let targetUserIds: string[] = [];
      if (announcement.scope === 'COURSE' && announcement.courseId) {
        const enrolments = await Enrolment.find({ courseId: announcement.courseId, isActive: true }).populate('studentId');
        targetUserIds = enrolments.map((e: any) => e.studentId?.userId?.toString()).filter(Boolean);
      } else if (announcement.scope === 'SECTION' && announcement.sectionId) {
        const enrolments = await Enrolment.find({ sectionId: announcement.sectionId, isActive: true }).populate('studentId');
        targetUserIds = enrolments.map((e: any) => e.studentId?.userId?.toString()).filter(Boolean);
      }

      if (targetUserIds.length > 0) {
        const notificationsToInsert = targetUserIds.slice(0, 50).map((uid) => ({
          userId: uid,
          title: `New Announcement: ${announcement.title}`,
          message: announcement.content.substring(0, 140) + '...',
          type: 'ANNOUNCEMENT',
          data: { announcementId: announcement._id },
        }));
        await Notification.insertMany(notificationsToInsert);
      }

      // C. Audit logging
      if (userId) {
        await createAuditLog({
          userId,
          action: 'DISPATCH_ANNOUNCEMENT_EVENT',
          resource: 'announcements',
          details: { announcementId: announcement._id, scope: announcement.scope },
        });
      }
    } catch (err: any) {
      console.error('❌ [EventEmitter] Error handling ANNOUNCEMENT_CREATED:', err.message);
    }
  });

  // 2. EVENT: ATTENDANCE_MARKED
  // Purpose: Decoupled notification dispatch to absent students & low-attendance alerts
  eventBus.on('ATTENDANCE_MARKED', async (data: { session: any; attendanceRecords: any[]; facultyUserId: string }) => {
    try {
      const { session, attendanceRecords, facultyUserId } = data;
      console.log(`📡 [EventEmitter] Event received: ATTENDANCE_MARKED - Session: ${session._id}`);

      // Notify absent students
      const absentRecords = attendanceRecords.filter((r) => r.status === 'ABSENT' || r.status === 'LATE');
      for (const rec of absentRecords) {
        const student = await Student.findById(rec.studentId);
        if (student && student.userId) {
          await Notification.create({
            userId: student.userId,
            title: `Attendance Notice: ${rec.status}`,
            message: `You were marked ${rec.status} for class on ${new Date(session.date).toLocaleDateString()}.`,
            type: 'ATTENDANCE',
            data: { sessionId: session._id, status: rec.status },
          });

          // Push real-time Socket.IO notification to student's personal room
          if (io) {
            io.to(`user_${student.userId}`).emit('notification', {
              title: `Attendance Notice: ${rec.status}`,
              status: rec.status,
            });
          }
        }
      }

      await createAuditLog({
        userId: facultyUserId,
        action: 'SUBMIT_ATTENDANCE_EVENT',
        resource: 'attendance',
        details: { sessionId: session._id, totalMarked: attendanceRecords.length },
      });
    } catch (err: any) {
      console.error('❌ [EventEmitter] Error handling ATTENDANCE_MARKED:', err.message);
    }
  });

  // 3. EVENT: USER_REGISTERED
  // Purpose: Dispatches welcome notification and logs security event on user onboarding
  eventBus.on('USER_REGISTERED', async (data: { user: any; role: string }) => {
    try {
      const { user, role } = data;
      console.log(`📡 [EventEmitter] Event received: USER_REGISTERED - "${user.email}" (${role})`);

      await Notification.create({
        userId: user._id,
        title: 'Welcome to K.R. Mangalam University!',
        message: 'Your campus account has been established. You may now access your dashboard, courses, and timetables.',
        type: 'SYSTEM',
      });
    } catch (err: any) {
      console.error('❌ [EventEmitter] Error handling USER_REGISTERED:', err.message);
    }
  });
};

export default eventBus;
