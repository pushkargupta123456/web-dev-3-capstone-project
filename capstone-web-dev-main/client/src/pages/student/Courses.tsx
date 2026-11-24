import React, { useEffect, useState } from 'react';
import { enrolmentService } from '../../services/api';
import { Card, CardHeader, CardBody } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { BookOpen, User, MapPin } from 'lucide-react';
import { useToast } from '../../components/ui/Toast';

const StudentCourses: React.FC = () => {
  const [enrolments, setEnrolments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { showToast } = useToast();

  useEffect(() => {
    enrolmentService.getAll()
      .then(res => setEnrolments(res.data.data || []))
      .catch(() => showToast('Failed to load courses', 'error'))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-lg font-bold text-gray-900">Enrolled Courses</h2>
        <p className="text-xs text-gray-500">Your registered academic curriculum, faculty instructors, and section cohorts</p>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-pulse">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-44 bg-white rounded-xl border border-gray-200" />
          ))}
        </div>
      ) : enrolments.length === 0 ? (
        <Card>
          <div className="py-16 text-center">
            <BookOpen className="w-10 h-10 text-gray-300 mx-auto mb-3" />
            <p className="text-sm font-semibold text-gray-800">No Registered Courses</p>
            <p className="text-xs text-gray-500 mt-1">You are not currently enrolled in any academic courses.</p>
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {enrolments.map(enr => (
            <Card key={enr._id}>
              <CardHeader>
                <div className="flex items-center justify-between w-full">
                  <span className="font-mono text-xs font-bold text-[#1e2a5e] bg-blue-50 px-2 py-0.5 rounded">
                    {enr.courseId?.courseCode}
                  </span>
                  <div className="flex items-center gap-1.5">
                    <Badge variant="blue">{enr.sectionId?.sectionName}</Badge>
                    <Badge variant="gray">{enr.courseId?.credits} Credits</Badge>
                  </div>
                </div>
              </CardHeader>
              <CardBody className="space-y-3">
                <h3 className="font-bold text-base text-gray-900">{enr.courseId?.title}</h3>
                <p className="text-xs text-gray-600 line-clamp-2">{enr.courseId?.description || 'Curricular lecture syllabus'}</p>

                <div className="pt-2 border-t border-gray-100 grid grid-cols-2 gap-2 text-xs">
                  <div className="flex items-center gap-1.5 text-gray-600">
                    <User className="w-3.5 h-3.5 text-gray-400" />
                    <span>Faculty: <strong className="text-gray-800">{enr.sectionId?.facultyId?.userId?.name || 'Staff'}</strong></span>
                  </div>
                  <div className="flex items-center gap-1.5 text-gray-600">
                    <MapPin className="w-3.5 h-3.5 text-gray-400" />
                    <span>Room: <strong className="text-gray-800">{enr.sectionId?.roomNumber || 'TBA'}</strong></span>
                  </div>
                </div>
              </CardBody>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default StudentCourses;
