import React, { useEffect, useState } from 'react';
import { CalendarDays, Clock, MapPin, User, BookOpen } from 'lucide-react';
import { enrolmentService } from '../../services/api';
import { Card, CardHeader, CardBody } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { useToast } from '../../components/ui/Toast';

const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

const StudentTimetable: React.FC = () => {
  const [enrolments, setEnrolments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { showToast } = useToast();

  useEffect(() => {
    enrolmentService.getAll()
      .then(res => setEnrolments(res.data.data || []))
      .catch(() => showToast('Failed to load timetable', 'error'))
      .finally(() => setLoading(false));
  }, []);

  const scheduleMap: Record<string, any[]> = {
    Monday: [],
    Tuesday: [],
    Wednesday: [],
    Thursday: [],
    Friday: [],
    Saturday: [],
  };

  enrolments.forEach(enr => {
    const sec = enr.sectionId;
    if (sec && sec.schedule && sec.schedule.length > 0) {
      sec.schedule.forEach((item: any) => {
        if (scheduleMap[item.day]) {
          scheduleMap[item.day].push({
            ...item,
            courseCode: enr.courseId?.courseCode,
            courseTitle: enr.courseId?.title,
            sectionName: sec.sectionName,
            roomNumber: sec.roomNumber || 'TBA',
            facultyName: sec.facultyId?.userId?.name || 'Staff',
          });
        }
      });
    } else if (sec) {
      // If no explicit schedule array, create default distribution based on section ID
      const defaultDay = daysOfWeek[parseInt(sec._id.slice(-1), 16) % 5];
      scheduleMap[defaultDay].push({
        day: defaultDay,
        startTime: '09:00',
        endTime: '10:30',
        courseCode: enr.courseId?.courseCode,
        courseTitle: enr.courseId?.title,
        sectionName: sec.sectionName,
        roomNumber: sec.roomNumber || 'LH-101',
        facultyName: sec.facultyId?.userId?.name || 'Staff',
      });
    }
  });

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-bold text-gray-900">Weekly Lecture Timetable</h2>
        <p className="text-xs text-gray-500">Scheduled classroom lectures, lab hours, instructors and hall numbers</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {daysOfWeek.map(day => {
          const classes = scheduleMap[day] || [];
          return (
            <Card key={day} className="flex flex-col">
              <CardHeader className="bg-slate-50/80 py-3">
                <div className="flex items-center justify-between w-full">
                  <h3 className="font-bold text-xs uppercase tracking-wider text-gray-700">{day}</h3>
                  <Badge variant={classes.length > 0 ? 'blue' : 'gray'}>
                    {classes.length} {classes.length === 1 ? 'Class' : 'Classes'}
                  </Badge>
                </div>
              </CardHeader>
              <CardBody className="p-3 flex-1">
                {classes.length === 0 ? (
                  <div className="py-8 text-center text-xs text-gray-400">
                    No scheduled lectures
                  </div>
                ) : (
                  <div className="space-y-2.5">
                    {classes.map((cls, idx) => (
                      <div key={idx} className="p-3 bg-white rounded-lg border border-gray-200 shadow-xs space-y-1.5 hover:border-blue-400 transition-colors">
                        <div className="flex items-center justify-between">
                          <span className="font-mono text-xs font-bold text-[#1e2a5e] bg-blue-50 px-1.5 py-0.5 rounded">
                            {cls.courseCode}
                          </span>
                          <span className="text-[11px] font-semibold text-gray-600 flex items-center gap-1">
                            <Clock className="w-3 h-3 text-gray-400" />
                            {cls.startTime} - {cls.endTime}
                          </span>
                        </div>
                        <p className="text-xs font-semibold text-gray-800 leading-snug">{cls.courseTitle}</p>
                        <div className="flex items-center justify-between text-[11px] text-gray-500 pt-1 border-t border-gray-50">
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3 h-3 text-gray-400" /> {cls.roomNumber}
                          </span>
                          <span className="truncate max-w-[120px]">{cls.facultyName}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardBody>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

export default StudentTimetable;
