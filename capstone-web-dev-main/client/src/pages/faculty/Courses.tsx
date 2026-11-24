import React, { useEffect, useState } from 'react';
import { facultyService } from '../../services/api';
import { Card, CardHeader, CardBody } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { BookOpen } from 'lucide-react';
import { useToast } from '../../components/ui/Toast';

const FacultyCourses: React.FC = () => {
  const [sections, setSections] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { showToast } = useToast();

  useEffect(() => {
    facultyService.getMe()
      .then(res => setSections(res.data.data.sections || []))
      .catch(() => showToast('Failed to load assigned courses', 'error'))
      .finally(() => setLoading(false));
  }, []);

  const coursesMap = new Map<string, any>();
  sections.forEach(sec => {
    const c = sec.courseId;
    if (c && !coursesMap.has(c._id)) {
      coursesMap.set(c._id, { ...c, sections: [sec.sectionName] });
    } else if (c) {
      coursesMap.get(c._id).sections.push(sec.sectionName);
    }
  });
  const courses = Array.from(coursesMap.values());

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-lg font-bold text-gray-900">My Assigned Courses</h2>
        <p className="text-xs text-gray-500">Curriculum subjects and course outlines assigned to you for teaching</p>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-pulse">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-40 bg-white rounded-xl border border-gray-200" />
          ))}
        </div>
      ) : courses.length === 0 ? (
        <Card>
          <div className="py-16 text-center">
            <BookOpen className="w-10 h-10 text-gray-300 mx-auto mb-3" />
            <p className="text-sm font-semibold text-gray-800">No Courses Assigned</p>
            <p className="text-xs text-gray-500 mt-1">Please contact your academic department head for course allocations.</p>
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {courses.map(course => (
            <Card key={course._id}>
              <CardHeader>
                <div className="flex items-center justify-between w-full">
                  <span className="font-mono text-xs font-bold text-[#1e2a5e] bg-blue-50 px-2 py-1 rounded">
                    {course.courseCode}
                  </span>
                  <Badge variant="blue">{course.credits} Credits</Badge>
                </div>
              </CardHeader>
              <CardBody className="space-y-3">
                <h3 className="font-bold text-base text-gray-900">{course.title}</h3>
                <p className="text-xs text-gray-600 line-clamp-2">{course.description || 'No description provided.'}</p>
                
                <div className="pt-2 border-t border-gray-100 flex items-center justify-between text-xs">
                  <span className="text-gray-500">Department: <strong className="text-gray-800">{course.department}</strong></span>
                  <span className="text-gray-500">Sections: {course.sections?.map((s: string) => (
                    <span key={s} className="ml-1 font-semibold text-gray-800 bg-gray-100 px-1.5 py-0.5 rounded">{s}</span>
                  ))}</span>
                </div>
              </CardBody>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default FacultyCourses;
