export type UserRole = 'ADMIN' | 'FACULTY' | 'STUDENT';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
}

export interface AuthState {
  user: User | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export interface Student {
  _id: string;
  userId: { _id: string; name: string; email: string; isActive?: boolean; lastLogin?: string };
  registrationNumber: string;
  department: string;
  semester: number;
  academicYear: string;
  phone?: string;
  dateOfBirth?: string;
  guardianName?: string;
  guardianPhone?: string;
  address?: string;
  isActive: boolean;
  createdAt: string;
}

export interface Faculty {
  _id: string;
  userId: { _id: string; name: string; email: string; isActive?: boolean; lastLogin?: string };
  employeeId: string;
  department: string;
  designation: string;
  qualification?: string;
  phone?: string;
  joiningDate?: string;
  isActive: boolean;
  createdAt: string;
}

export interface Course {
  _id: string;
  courseCode: string;
  title: string;
  department: string;
  credits: number;
  semester: number;
  description?: string;
  isActive: boolean;
  createdAt?: string;
}

export interface Section {
  _id: string;
  sectionName: string;
  courseId: Course;
  facultyId: Faculty;
  academicYear: string;
  semester: number;
  roomNumber?: string;
  schedule?: Array<{ day: string; startTime: string; endTime: string }>;
  maxStudents: number;
  isActive: boolean;
  createdAt?: string;
}

export interface Enrolment {
  _id: string;
  studentId: Student;
  courseId: Course;
  sectionId: Section;
  academicYear: string;
  semester: number;
  enrolledAt: string;
  isActive: boolean;
}

export interface ClassSession {
  _id: string;
  courseId: Course | string;
  sectionId: Section | string;
  facultyId: Faculty | string;
  date: string;
  startTime: string;
  endTime: string;
  academicYear: string;
  semester: number;
  topic?: string;
  isCompleted: boolean;
  createdAt?: string;
}

export interface Attendance {
  _id: string;
  studentId: Student | string;
  classSessionId: ClassSession | string;
  courseId: Course | string;
  sectionId: Section | string;
  status: 'PRESENT' | 'ABSENT' | 'LATE';
  markedBy: string;
  remark?: string;
  createdAt: string;
}

export interface Announcement {
  _id: string;
  title: string;
  content: string;
  scope: 'UNIVERSITY' | 'COURSE' | 'SECTION';
  courseId?: Course;
  sectionId?: Section;
  postedBy: { _id: string; name: string; role: string };
  isPublished: boolean;
  createdAt: string;
}

export interface Notification {
  _id: string;
  userId: string;
  title: string;
  message: string;
  type: string;
  isRead: boolean;
  createdAt: string;
}

export interface PaginatedResponse<T> {
  success: boolean;
  message: string;
  data: T[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    pages: number;
  };
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}


