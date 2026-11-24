import React, { useEffect, useState } from 'react';
import { facultyService } from '../../services/api';
import { Card, CardHeader, CardBody } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Layers, ArrowRight, UserCheck } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useToast } from '../../components/ui/Toast';

const FacultySections: React.FC = () => {
  const [sections, setSections] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { showToast } = useToast();

  useEffect(() => {
    facultyService.getMe()
      .then(res => setSections(res.data.data.sections || []))
      .catch(() => showToast('Failed to load teaching sections', 'error'))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-lg font-bold text-gray-900">My Teaching Sections</h2>
        <p className="text-xs text-gray-500">Assigned cohorts, class timings, room locations, and attendance access</p>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-pulse">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-44 bg-white rounded-xl border border-gray-200" />
          ))}
        </div>
      ) : sections.length === 0 ? (
        <Card>
          <div className="py-16 text-center">
            <Layers className="w-10 h-10 text-gray-300 mx-auto mb-3" />
            <p className="text-sm font-semibold text-gray-800">No Sections Assigned</p>
            <p className="text-xs text-gray-500 mt-1">You are currently not assigned to any active academic section.</p>
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {sections.map(sec => (
            <Card key={sec._id}>
              <CardHeader>
                <div className="flex items-center justify-between w-full">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-[#1e2a5e] bg-blue-50 px-2 py-0.5 rounded">
                      {sec.courseId?.courseCode}
                    </span>
                    <h3 className="font-bold text-sm text-gray-900">{sec.sectionName}</h3>
                  </div>
                  <Badge variant="blue">Sem {sec.semester}</Badge>
                </div>
              </CardHeader>
              <CardBody className="space-y-3">
                <p className="text-sm font-semibold text-gray-800">{sec.courseId?.title}</p>
                <div className="grid grid-cols-2 gap-2 text-xs text-gray-600 bg-slate-50 p-3 rounded-lg border border-slate-100">
                  <div>
                    <span className="text-gray-400 block">Class Location</span>
                    <strong className="text-gray-800">{sec.roomNumber || 'TBA'}</strong>
                  </div>
                  <div>
                    <span className="text-gray-400 block">Academic Year</span>
                    <strong className="text-gray-800">{sec.academicYear}</strong>
                  </div>
                </div>

                <div className="pt-2 flex items-center justify-between">
                  <Link
                    to={`/faculty/students?sectionId=${sec._id}`}
                    className="text-xs font-semibold text-gray-600 hover:text-gray-900"
                  >
                    View Roster
                  </Link>
                  <Link to={`/faculty/attendance/mark?sectionId=${sec._id}`}>
                    <Button size="sm" icon={<UserCheck className="w-3.5 h-3.5" />}>
                      Mark Attendance
                    </Button>
                  </Link>
                </div>
              </CardBody>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default FacultySections;
