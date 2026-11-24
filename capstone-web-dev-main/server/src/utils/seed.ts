import 'dotenv/config';
import mongoose from 'mongoose';
import connectDB from '../config/database';
import User from '../models/User';
import Student from '../models/Student';
import Faculty from '../models/Faculty';
import Course from '../models/Course';
import Section from '../models/Section';
import Enrolment from '../models/Enrolment';
import ClassSession from '../models/ClassSession';
import Attendance from '../models/Attendance';
import Announcement from '../models/Announcement';

export const seedData = async (disconnectAfter = false): Promise<void> => {
  console.log('🌱 Starting database seed for University Campus Management System...');

  await Promise.all([
    User.deleteMany({}),
    Student.deleteMany({}),
    Faculty.deleteMany({}),
    Course.deleteMany({}),
    Section.deleteMany({}),
    Enrolment.deleteMany({}),
    ClassSession.deleteMany({}),
    Attendance.deleteMany({}),
    Announcement.deleteMany({}),
  ]);

  console.log('✅ Cleared existing collections');

  const adminEmail = process.env.ADMIN_EMAIL || 'admin@university.edu';
  const adminPassword = process.env.ADMIN_PASSWORD || 'Admin@123456';
  const adminUser = await User.create({
    name: process.env.ADMIN_NAME || 'System Administrator',
    email: adminEmail.toLowerCase(),
    password: adminPassword,
    role: 'ADMIN',
  });
  console.log('✅ Administrator created:', adminUser.email);

  const coursesData = [
    { courseCode: 'CS101', title: 'Introduction to Computer Science', department: 'Computer Science', credits: 4, semester: 1, description: 'Foundations of computer systems, programming concepts, and logic.' },
    { courseCode: 'CS201', title: 'Data Structures and Algorithms', department: 'Computer Science', credits: 4, semester: 2, description: 'Core data structures: trees, graphs, dynamic programming, hashing.' },
    { courseCode: 'CS301', title: 'Database Management Systems', department: 'Computer Science', credits: 3, semester: 3, description: 'Relational database design, SQL, indexing, and NoSQL fundamentals.' },
    { courseCode: 'CS401', title: 'Full Stack Web Development', department: 'Computer Science', credits: 4, semester: 4, description: 'Modern web architecture, REST APIs, SPA frontend and reactive state.' },
    { courseCode: 'MATH101', title: 'Engineering Calculus I', department: 'Mathematics', credits: 3, semester: 1, description: 'Limits, differential calculus, and introductory integration.' },
    { courseCode: 'MATH201', title: 'Linear Algebra and Applications', department: 'Mathematics', credits: 3, semester: 2, description: 'Vector spaces, matrix decomposition, eigenvalues, and eigenvectors.' },
    { courseCode: 'PHY101', title: 'Applied Physics for Engineers', department: 'Physics', credits: 3, semester: 1, description: 'Electromagnetism, mechanics, optics, and thermodynamics principles.' },
    { courseCode: 'ENG101', title: 'Technical Communication', department: 'English', credits: 2, semester: 1, description: 'Professional documentation, reports, presentations, and technical writing.' },
  ];

  const courses = await Course.insertMany(coursesData);
  console.log(`✅ ${courses.length} courses created`);

  const facultyData = [
    { name: 'Dr. James Wilson', email: 'james.wilson@university.edu', employeeId: 'FAC001', department: 'Computer Science', designation: 'Professor', qualification: 'Ph.D. in Computer Science', phone: '+1-555-0101' },
    { name: 'Prof. Sarah Chen', email: 'sarah.chen@university.edu', employeeId: 'FAC002', department: 'Computer Science', designation: 'Associate Professor', qualification: 'M.S. in Software Engineering', phone: '+1-555-0102' },
    { name: 'Dr. Michael Brown', email: 'michael.brown@university.edu', employeeId: 'FAC003', department: 'Mathematics', designation: 'Professor', qualification: 'Ph.D. in Applied Mathematics', phone: '+1-555-0103' },
    { name: 'Dr. Emily Davis', email: 'emily.davis@university.edu', employeeId: 'FAC004', department: 'Physics', designation: 'Assistant Professor', qualification: 'Ph.D. in Quantum Physics', phone: '+1-555-0104' },
    { name: 'Prof. Robert Taylor', email: 'robert.taylor@university.edu', employeeId: 'FAC005', department: 'English', designation: 'Associate Professor', qualification: 'M.A. in Linguistics & Rhetoric', phone: '+1-555-0105' },
  ];

  const facultyRecords: any[] = [];
  for (const f of facultyData) {
    const user = await User.create({ name: f.name, email: f.email.toLowerCase(), password: 'Faculty@123', role: 'FACULTY' });
    const faculty = await Faculty.create({
      userId: user._id,
      employeeId: f.employeeId,
      department: f.department,
      designation: f.designation,
      qualification: f.qualification,
      phone: f.phone,
      joiningDate: new Date('2021-08-15'),
    });
    facultyRecords.push(faculty);
  }
  console.log(`✅ ${facultyRecords.length} faculty members created`);

  const sectionsData = [
    { sectionName: 'CS-101-A', courseIdx: 0, facultyIdx: 0, roomNumber: 'Hall 101', schedule: [{ day: 'Monday', startTime: '09:00', endTime: '10:30' }, { day: 'Wednesday', startTime: '09:00', endTime: '10:30' }] },
    { sectionName: 'CS-201-A', courseIdx: 1, facultyIdx: 1, roomNumber: 'Hall 102', schedule: [{ day: 'Tuesday', startTime: '10:00', endTime: '11:30' }, { day: 'Thursday', startTime: '10:00', endTime: '11:30' }] },
    { sectionName: 'MATH-101-A', courseIdx: 4, facultyIdx: 2, roomNumber: 'Hall 201', schedule: [{ day: 'Monday', startTime: '11:00', endTime: '12:30' }, { day: 'Friday', startTime: '11:00', endTime: '12:30' }] },
    { sectionName: 'CS-401-A', courseIdx: 3, facultyIdx: 1, roomNumber: 'Lab 305', schedule: [{ day: 'Wednesday', startTime: '14:00', endTime: '16:00' }, { day: 'Friday', startTime: '14:00', endTime: '16:00' }] },
  ];

  const sections: any[] = [];
  for (const s of sectionsData) {
    const section = await Section.create({
      sectionName: s.sectionName,
      courseId: courses[s.courseIdx]._id,
      facultyId: facultyRecords[s.facultyIdx]._id,
      academicYear: '2024-2025',
      semester: courses[s.courseIdx].semester,
      roomNumber: s.roomNumber,
      schedule: s.schedule,
      maxStudents: 50,
    });
    sections.push(section);
  }
  console.log(`✅ ${sections.length} sections created`);

  const departments = ['Computer Science', 'Mathematics', 'Physics'];
  const studentRecords: any[] = [];

  for (let i = 1; i <= 30; i++) {
    const padded = i.toString().padStart(2, '0');
    const dept = departments[(i - 1) % 3];
    const sem = ((i - 1) % 4) + 1;
    const user = await User.create({
      name: `Student ${padded}`,
      email: `student${padded}@university.edu`,
      password: 'Student@123',
      role: 'STUDENT',
    });

    const student = await Student.create({
      userId: user._id,
      registrationNumber: `REG2024${padded}`,
      department: dept,
      semester: sem,
      academicYear: '2024-2025',
      phone: `+1-555-02${padded}`,
      dateOfBirth: new Date(2003, (i % 12), (i % 28) + 1),
      guardianName: `Guardian ${padded}`,
      guardianPhone: `+1-555-03${padded}`,
      address: `${100 + i} Campus Drive, City, State`,
    });
    studentRecords.push(student);
  }
  console.log(`✅ ${studentRecords.length} students created`);

  const enrolments: any[] = [];
  for (let i = 0; i < studentRecords.length; i++) {
    const s1 = sections[i % sections.length];
    const e1 = await Enrolment.create({
      studentId: studentRecords[i]._id,
      courseId: s1.courseId,
      sectionId: s1._id,
      academicYear: '2024-2025',
      semester: s1.semester,
    });
    enrolments.push(e1);

    if (i < 20) {
      const s2 = sections[(i + 1) % sections.length];
      if (s1._id.toString() !== s2._id.toString()) {
        try {
          const e2 = await Enrolment.create({
            studentId: studentRecords[i]._id,
            courseId: s2.courseId,
            sectionId: s2._id,
            academicYear: '2024-2025',
            semester: s2.semester,
          });
          enrolments.push(e2);
        } catch { /* duplicate ignore */ }
      }
    }
  }
  console.log(`✅ ${enrolments.length} enrolments created`);

  const now = new Date();
  let sessionCount = 0;
  let attendanceCount = 0;

  for (const section of sections) {
    const secEnrolments = enrolments.filter(e => e.sectionId.toString() === section._id.toString());
    if (secEnrolments.length === 0) continue;

    for (let dayOffset = 28; dayOffset >= 2; dayOffset -= 4) {
      const sessionDate = new Date(now);
      sessionDate.setDate(now.getDate() - dayOffset);

      const session = await ClassSession.create({
        courseId: section.courseId,
        sectionId: section._id,
        facultyId: section.facultyId,
        date: sessionDate,
        startTime: '09:00',
        endTime: '10:30',
        academicYear: '2024-2025',
        semester: section.semester,
        topic: `Session on Unit ${Math.floor((30 - dayOffset) / 4) + 1}`,
        isCompleted: true,
      });
      sessionCount++;

      for (let sIdx = 0; sIdx < secEnrolments.length; sIdx++) {
        const enr = secEnrolments[sIdx];
        const seedVal = (sIdx + dayOffset) % 10;
        let status: 'PRESENT' | 'ABSENT' | 'LATE' = 'PRESENT';
        if (sIdx % 7 === 0 && seedVal > 6) {
          status = 'ABSENT';
        } else if (seedVal === 9) {
          status = 'LATE';
        }

        await Attendance.create({
          studentId: enr.studentId,
          classSessionId: session._id,
          courseId: section.courseId,
          sectionId: section._id,
          status,
          markedBy: adminUser._id,
        });
        attendanceCount++;
      }
    }
  }
  console.log(`✅ ${sessionCount} class sessions and ${attendanceCount} attendance records created`);

  await Announcement.insertMany([
    {
      title: 'Welcome to Academic Year 2024-2025',
      content: 'Welcome all students and faculty! The semester orientation and campus tour commences this Monday. Please verify your section schedules.',
      scope: 'UNIVERSITY',
      postedBy: adminUser._id,
      isPublished: true,
    },
    {
      title: 'Mid-Term Examination Dates Announced',
      content: 'Mid-term examinations are scheduled from Dec 15 to Dec 22. The detailed examination timetable is now accessible on the student portal.',
      scope: 'UNIVERSITY',
      postedBy: adminUser._id,
      isPublished: true,
    },
    {
      title: 'CS101 Lab Assignment 1 Due Notice',
      content: 'Please submit Lab Assignment 1 (Algorithms and Flowcharts) before Friday at 11:59 PM. Late submissions will attract a 10% penalty.',
      scope: 'COURSE',
      courseId: courses[0]._id,
      postedBy: adminUser._id,
      isPublished: true,
    },
    {
      title: 'Central Library Extended Study Hours',
      content: 'The campus digital library and physical study wings will remain open until midnight during reading week and midterm examinations.',
      scope: 'UNIVERSITY',
      postedBy: adminUser._id,
      isPublished: true,
    },
  ]);
  console.log('✅ Announcements published');

  console.log(`
========================================================================
✨ DATABASE SEEDING COMPLETED SUCCESSFULLY!

Demo Accounts Ready for Testing:
------------------------------------------------------------------------
👑 Administrator:
   Email:    admin@university.edu
   Password: Admin@123456

👨‍🏫 Faculty:
   Email:    james.wilson@university.edu
   Password: Faculty@123

👨‍🎓 Student:
   Email:    student01@university.edu
   Password: Student@123
========================================================================
  `);

  if (disconnectAfter) {
    await mongoose.disconnect();
    process.exit(0);
  }
};

// If run directly from CLI
if (require.main === module) {
  connectDB().then(() => seedData(true)).catch((err) => {
    console.error('❌ Database seed error:', err);
    process.exit(1);
  });
}

export default seedData;
