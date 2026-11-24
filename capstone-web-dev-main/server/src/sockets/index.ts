import { Server as SocketServer } from 'socket.io';
import jwt from 'jsonwebtoken';
import { jwtConfig } from '../config/jwt';

export const initializeSocket = (io: SocketServer): void => {
  io.use((socket, next) => {
    const token = socket.handshake.auth?.token;
    if (!token) {
      return next(new Error('Authentication error: Token required'));
    }
    try {
      const decoded = jwt.verify(token, jwtConfig.secret) as any;
      socket.data.user = decoded;
      next();
    } catch {
      next(new Error('Authentication error: Invalid token'));
    }
  });

  io.on('connection', (socket) => {
    const user = socket.data.user;
    if (user) {
      socket.join(`role:${user.role}`);
      socket.join(`user:${user.id}`);
    }

    socket.on('join:course', (courseId: string) => {
      socket.join(`course:${courseId}`);
    });

    socket.on('join:section', (sectionId: string) => {
      socket.join(`section:${sectionId}`);
    });
  });
};

export const emitAnnouncement = (io: SocketServer, announcement: any): void => {
  if (announcement.scope === 'UNIVERSITY') {
    io.emit('announcement:new', announcement);
  } else if (announcement.scope === 'COURSE' && announcement.courseId) {
    io.to(`course:${announcement.courseId}`).emit('announcement:new', announcement);
  } else if (announcement.scope === 'SECTION' && announcement.sectionId) {
    io.to(`section:${announcement.sectionId}`).emit('announcement:new', announcement);
  }
};
