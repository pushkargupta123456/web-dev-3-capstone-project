import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Check, X, Clock, UserCheck, Calendar, BookOpen, Layers } from 'lucide-react';
import { facultyService, sectionService, attendanceService } from '../../services/api';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Card, CardHeader, CardBody } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { useToast } from '../../components/ui/Toast';

type AttendanceState = Record<string, 'PRESENT' | 'ABSENT' | 'LATE'>;

const MarkAttendance: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [sections, setSections] = useState<any[]>([]);
  const [selectedSection, setSelectedSection] = useState(searchParams.get('sectionId') || '');
  const [sectionDetails, setSectionDetails] = useState<any>(null);
  const [enrolledStudents, setEnrolledStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Session inputs
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('10:30');
  const [topic, setTopic] = useState('');

  // Attendance status mapping
  const [attendance, setAttendance] = useState<AttendanceState>({});

  useEffect(() => {
    facultyService.getMe()
      .then(res => {
        const secList = res.data.data.sections || [];
        setSections(secList);
        if (!selectedSection && secList.length > 0) {
          setSelectedSection(secList[0]._id);
        }
      })
      .catch(() => showToast('Failed to load faculty sections', 'error'));
  }, []);

  useEffect(() => {
    if (!selectedSection) {
      setLoading(false);
      return;
    }
    setLoading(true);
    sectionService.getById(selectedSection)
      .then(res => {
        setSectionDetails(res.data.data.section);
        const enr = res.data.data.enrolments || [];
        setEnrolledStudents(enr);

        // Default all enrolled students to PRESENT
        const initialMap: AttendanceState = {};
        enr.forEach((item: any) => {
          if (item.studentId?._id) {
            initialMap[item.studentId._id] = 'PRESENT';
          }
        });
        setAttendance(initialMap);
      })
      .catch(() => showToast('Failed to load section students', 'error'))
      .finally(() => setLoading(false));
  }, [selectedSection]);

  const handleSetStatus = (studentId: string, status: 'PRESENT' | 'ABSENT' | 'LATE') => {
    setAttendance(prev => ({ ...prev, [studentId]: status }));
  };

  const handleMarkAll = (status: 'PRESENT' | 'ABSENT') => {
    const updated: AttendanceState = {};
    enrolledStudents.forEach(item => {
      if (item.studentId?._id) updated[item.studentId._id] = status;
    });
    setAttendance(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sectionDetails) return;
    if (enrolledStudents.length === 0) {
      showToast('No students enrolled in this section to take attendance', 'error');
      return;
    }

    setSubmitting(true);
    try {
      // 1. Create Class Session
      const sessionRes = await attendanceService.createSession({
        courseId: (sectionDetails.courseId as any)?._id || sectionDetails.courseId,
        sectionId: sectionDetails._id,
        date,
        startTime,
        endTime,
        topic: topic || 'Regular Lecture Session',
      });
      const sessionId = sessionRes.data.data._id;

      // 2. Mark Attendance records
      const attendanceData = Object.entries(attendance).map(([studentId, status]) => ({
        studentId,
        status,
      }));

      await attendanceService.mark({
        classSessionId: sessionId,
        attendanceData,
      });

      showToast(`Attendance marked successfully for ${attendanceData.length} students`, 'success');
      navigate('/faculty/attendance/history');
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Failed to submit attendance session', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const presentCount = Object.values(attendance).filter(v => v === 'PRESENT').length;
  const lateCount = Object.values(attendance).filter(v => v === 'LATE').length;
  const absentCount = Object.values(attendance).filter(v => v === 'ABSENT').length;

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h2 className="text-lg font-bold text-gray-900">Mark Class Attendance</h2>
        <p className="text-xs text-gray-500">Record session roll call, register lecture details and submit institutional compliance logs</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Section & Lecture Metadata Card */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-[#1e2a5e]" />
              <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider">Session Details</h3>
            </div>
          </CardHeader>
          <CardBody className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Select Teaching Section</label>
                <select
                  value={selectedSection}
                  onChange={(e) => setSelectedSection(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#1e2a5e]"
                >
                  {sections.map(s => (
                    <option key={s._id} value={s._id}>
                      {s.sectionName} — {s.courseId?.courseCode} ({s.courseId?.title})
                    </option>
                  ))}
                </select>
              </div>

              <Input
                label="Session Date"
                type="date"
                required
                value={date}
                onChange={e => setDate(e.target.value)}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Input
                label="Start Time"
                type="time"
                required
                value={startTime}
                onChange={e => setStartTime(e.target.value)}
              />
              <Input
                label="End Time"
                type="time"
                required
                value={endTime}
                onChange={e => setEndTime(e.target.value)}
              />
              <Input
                label="Lecture Topic / Module"
                placeholder="e.g. Unit 3: Dynamic Programming"
                value={topic}
                onChange={e => setTopic(e.target.value)}
              />
            </div>
          </CardBody>
        </Card>

        {/* Student Roster Roll Call Card */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between w-full">
              <div className="flex items-center gap-2">
                <UserCheck className="w-4 h-4 text-[#1e2a5e]" />
                <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider">
                  Enrolled Students ({enrolledStudents.length})
                </h3>
              </div>

              <div className="flex items-center gap-2">
                <Button type="button" variant="outline" size="sm" onClick={() => handleMarkAll('PRESENT')}>
                  All Present
                </Button>
                <Button type="button" variant="outline" size="sm" onClick={() => handleMarkAll('ABSENT')}>
                  All Absent
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardBody className="p-0">
            {/* Quick Roll-Call Summary Bar */}
            <div className="bg-slate-50 px-5 py-3 border-b border-gray-100 flex items-center justify-between text-xs">
              <span className="font-semibold text-gray-600">Quick Stats:</span>
              <div className="flex items-center gap-4">
                <span className="text-emerald-700 font-bold">Present: {presentCount}</span>
                <span className="text-amber-700 font-bold">Late: {lateCount}</span>
                <span className="text-rose-700 font-bold">Absent: {absentCount}</span>
              </div>
            </div>

            {loading ? (
              <div className="p-8 space-y-3">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="h-12 bg-gray-100 rounded animate-pulse" />
                ))}
              </div>
            ) : enrolledStudents.length === 0 ? (
              <div className="py-12 text-center text-sm text-gray-400">
                No students enrolled in this section.
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {enrolledStudents.map((enr) => {
                  const student = enr.studentId;
                  const currentStatus = attendance[student?._id] || 'PRESENT';

                  return (
                    <div key={student?._id} className="p-4 flex items-center justify-between gap-4 hover:bg-slate-50/50">
                      <div>
                        <p className="font-semibold text-sm text-gray-900">{student?.userId?.name || 'Unnamed'}</p>
                        <p className="text-xs text-gray-500 font-mono mt-0.5">{student?.registrationNumber}</p>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleSetStatus(student._id, 'PRESENT')}
                          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1 cursor-pointer ${
                            currentStatus === 'PRESENT'
                              ? 'bg-emerald-600 text-white shadow-sm'
                              : 'bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100'
                          }`}
                        >
                          <Check className="w-3.5 h-3.5" /> Present
                        </button>

                        <button
                          type="button"
                          onClick={() => handleSetStatus(student._id, 'LATE')}
                          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1 cursor-pointer ${
                            currentStatus === 'LATE'
                              ? 'bg-amber-600 text-white shadow-sm'
                              : 'bg-amber-50 text-amber-700 border border-amber-200 hover:bg-amber-100'
                          }`}
                        >
                          <Clock className="w-3.5 h-3.5" /> Late
                        </button>

                        <button
                          type="button"
                          onClick={() => handleSetStatus(student._id, 'ABSENT')}
                          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1 cursor-pointer ${
                            currentStatus === 'ABSENT'
                              ? 'bg-rose-600 text-white shadow-sm'
                              : 'bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100'
                          }`}
                        >
                          <X className="w-3.5 h-3.5" /> Absent
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardBody>
        </Card>

        {/* Submit Action */}
        <div className="flex justify-end gap-3 pt-2">
          <Button
            type="submit"
            isLoading={submitting}
            size="lg"
            className="w-full sm:w-auto px-8"
          >
            Submit Official Attendance Roll
          </Button>
        </div>
      </form>
    </div>
  );
};

export default MarkAttendance;
