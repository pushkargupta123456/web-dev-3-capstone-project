import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { facultyService, sectionService } from '../../services/api';
import { Student } from '../../types';
import { Table, Column } from '../../components/ui/Table';
import { Badge } from '../../components/ui/Badge';
import { SearchBar } from '../../components/ui/SearchBar';
import { useToast } from '../../components/ui/Toast';

const FacultyStudents: React.FC = () => {
  const [searchParams] = useSearchParams();
  const [sections, setSections] = useState<any[]>([]);
  const [selectedSection, setSelectedSection] = useState(searchParams.get('sectionId') || '');
  const [students, setStudents] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  const { showToast } = useToast();

  useEffect(() => {
    facultyService.getMe()
      .then(res => {
        const secList = res.data.data.sections || [];
        setSections(secList);
        if (!selectedSection && secList.length > 0) {
          setSelectedSection(secList[0]._id);
        }
      })
      .catch(() => showToast('Failed to load sections', 'error'));
  }, []);

  useEffect(() => {
    if (!selectedSection) {
      setLoading(false);
      return;
    }
    setLoading(true);
    sectionService.getById(selectedSection)
      .then(res => {
        setStudents(res.data.data.enrolments || []);
      })
      .catch(() => showToast('Failed to load student roster', 'error'))
      .finally(() => setLoading(false));
  }, [selectedSection]);

  const filteredStudents = students.filter((item: any) => {
    const s = item.studentId;
    const q = search.toLowerCase();
    return (
      s?.userId?.name?.toLowerCase().includes(q) ||
      s?.userId?.email?.toLowerCase().includes(q) ||
      s?.registrationNumber?.toLowerCase().includes(q)
    );
  });

  const columns: Column<any>[] = [
    {
      key: 'name',
      header: 'Student Name',
      render: (_, row) => (
        <div>
          <p className="font-semibold text-gray-900">{row.studentId?.userId?.name || 'Student'}</p>
          <p className="text-xs text-gray-500">{row.studentId?.userId?.email}</p>
        </div>
      ),
    },
    {
      key: 'registrationNumber',
      header: 'Registration No.',
      render: (_, row) => (
        <span className="font-mono text-xs font-semibold text-gray-700 bg-gray-100 px-2 py-0.5 rounded">
          {row.studentId?.registrationNumber}
        </span>
      ),
    },
    {
      key: 'department',
      header: 'Department',
      render: (_, row) => row.studentId?.department,
    },
    {
      key: 'enrolledAt',
      header: 'Enrolment Date',
      render: (val) => new Date(val).toLocaleDateString(),
    },
    {
      key: 'isActive',
      header: 'Status',
      render: (val) => <Badge variant={val ? 'green' : 'red'}>{val ? 'Active' : 'Dropped'}</Badge>,
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-gray-900">Enrolled Students Roster</h2>
          <p className="text-xs text-gray-500">View registered students and academic profiles across your assigned teaching sections</p>
        </div>
      </div>

      <div className="bg-white p-3.5 rounded-xl border border-gray-200 shadow-sm flex flex-wrap gap-3 items-center">
        <SearchBar
          value={search}
          onChange={setSearch}
          placeholder="Filter roster by student name or reg..."
          className="w-full sm:w-72"
        />

        <select
          value={selectedSection}
          onChange={(e) => setSelectedSection(e.target.value)}
          className="px-3 py-2 border border-gray-200 rounded-lg text-xs bg-white text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#1e2a5e]"
        >
          {sections.map(s => (
            <option key={s._id} value={s._id}>
              {s.sectionName} — {s.courseId?.title}
            </option>
          ))}
        </select>
      </div>

      <Table
        columns={columns}
        data={filteredStudents}
        isLoading={loading}
        emptyMessage="No students currently enrolled in this section."
      />
    </div>
  );
};

export default FacultyStudents;
