import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken');
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config;
    if (error.response?.status === 401 && !original._retry && !original.url?.includes('/auth/login') && !original.url?.includes('/auth/refresh')) {
      original._retry = true;
      try {
        const { data } = await axios.post(
          `${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/auth/refresh`,
          {},
          { withCredentials: true }
        );
        const newToken = data.data.accessToken;
        localStorage.setItem('accessToken', newToken);
        original.headers.Authorization = `Bearer ${newToken}`;
        return api(original);
      } catch {
        localStorage.removeItem('accessToken');
        if (window.location.pathname !== '/login') {
          window.location.href = '/login';
        }
      }
    }
    return Promise.reject(error);
  }
);

export default api;

export const authService = {
  login: (email: string, password: string, rememberMe?: boolean) => api.post('/auth/login', { email, password, rememberMe }),
  register: (data: any) => api.post('/auth/register', data),
  logout: () => api.post('/auth/logout'),
  getMe: () => api.get('/auth/me'),
  forgotPassword: (email: string) => api.post('/auth/forgot-password', { email }),
  resetPassword: (data: { token: string; newPassword: string }) => api.post('/auth/reset-password', data),
  changePassword: (data: { currentPassword: string; newPassword: string }) => api.post('/auth/change-password', data),
};

export const studentService = {
  getAll: (params?: any) => api.get('/students', { params }),
  getById: (id: string) => api.get(`/students/${id}`),
  getMe: () => api.get('/students/me'),
  create: (data: any) => api.post('/students', data),
  update: (id: string, data: any) => api.patch(`/students/${id}`, data),
  delete: (id: string) => api.delete(`/students/${id}`),
};

export const facultyService = {
  getAll: (params?: any) => api.get('/faculty', { params }),
  getById: (id: string) => api.get(`/faculty/${id}`),
  getMe: () => api.get('/faculty/me'),
  create: (data: any) => api.post('/faculty', data),
  update: (id: string, data: any) => api.patch(`/faculty/${id}`, data),
  delete: (id: string) => api.delete(`/faculty/${id}`),
};

export const courseService = {
  getAll: (params?: any) => api.get('/courses', { params }),
  getById: (id: string) => api.get(`/courses/${id}`),
  create: (data: any) => api.post('/courses', data),
  update: (id: string, data: any) => api.patch(`/courses/${id}`, data),
  delete: (id: string) => api.delete(`/courses/${id}`),
};

export const sectionService = {
  getAll: (params?: any) => api.get('/sections', { params }),
  getById: (id: string) => api.get(`/sections/${id}`),
  create: (data: any) => api.post('/sections', data),
  update: (id: string, data: any) => api.patch(`/sections/${id}`, data),
  delete: (id: string) => api.delete(`/sections/${id}`),
};

export const enrolmentService = {
  getAll: (params?: any) => api.get('/enrolments', { params }),
  create: (data: any) => api.post('/enrolments', data),
  delete: (id: string) => api.delete(`/enrolments/${id}`),
};

export const attendanceService = {
  createSession: (data: any) => api.post('/attendance/sessions', data),
  getSessions: (params?: any) => api.get('/attendance/sessions', { params }),
  mark: (data: any) => api.post('/attendance/mark', data),
  update: (id: string, data: any) => api.patch(`/attendance/${id}`, data),
  getStudentAttendance: (studentId: string, params?: any) => api.get(`/attendance/student/${studentId}`, { params }),
  getCourseAttendance: (courseId: string, params?: any) => api.get(`/attendance/course/${courseId}`, { params }),
  getReports: (params?: any) => api.get('/attendance/reports', { params }),
};

export const announcementService = {
  getAll: (params?: any) => api.get('/announcements', { params }),
  create: (data: any) => api.post('/announcements', data),
  update: (id: string, data: any) => api.patch(`/announcements/${id}`, data),
  delete: (id: string) => api.delete(`/announcements/${id}`),
};

export const notificationService = {
  getAll: (params?: any) => api.get('/notifications', { params }),
  markRead: (id: string) => api.patch(`/notifications/${id}/read`),
  markAllRead: () => api.patch('/notifications/read-all'),
};

export const dashboardService = {
  getAdmin: () => api.get('/dashboard/admin'),
  getFaculty: () => api.get('/dashboard/faculty'),
  getStudent: () => api.get('/dashboard/student'),
};

export const reportService = {
  exportStudentsCSV: () => api.get('/reports/students/csv', { responseType: 'blob' }),
  exportAttendanceCSV: (params?: any) => api.get('/reports/attendance/csv', { params, responseType: 'blob' }),
};

export const auditService = {
  getLogs: (params?: any) => api.get('/audit', { params }),
};
