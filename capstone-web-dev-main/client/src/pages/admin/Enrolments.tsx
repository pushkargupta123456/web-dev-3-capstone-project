import React, { useEffect, useState } from 'react';
import { Plus, Trash2, UserPlus } from 'lucide-react';
import { enrolmentService, studentService, sectionService } from '../../services/api';
import { Enrolment, Student, Section } from '../../types';
import { Table, Column } from '../../components/ui/Table';
import { Button } from '../../components/ui/Button';
import { Select } from '../../components/ui/Select';
import { Modal } from '../../components/ui/Modal';
import { Badge } from '../../components/ui/Badge';
import { useToast } from '../../components/ui/Toast';

const AdminEnrolments: React.FC = () => {
  const [enrolments, setEnrolments] = useState<Enrolment[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [sections, setSections] = useState<Section[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [loading, setLoading] = useState(true);

  const [modalOpen, setModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    studentId: '',
    sectionId: '',
  });

  const { showToast } = useToast();

  const loadData = async () => {
    setLoading(true);
    try {
      const [enrRes, stRes, secRes] = await Promise.all([
        enrolmentService.getAll({ page, limit: 10 }),
        studentService.getAll({ limit: 100 }),
        sectionService.getAll({ limit: 100 }),
      ]);
      setEnrolments(enrRes.data.data);
      setTotal(enrRes.data.pagination.total);
      setPages(enrRes.data.pagination.pages);
      setStudents(stRes.data.data);
      setSections(secRes.data.data);
    } catch {
      showToast('Failed to load enrolments', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [page]);

  const handleOpenAdd = () => {
    setFormData({
      studentId: students[0]?._id || '',
      sectionId: sections[0]?._id || '',
    });
    setModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to drop this student from the section?')) return;
    try {
      await enrolmentService.delete(id);
      showToast('Enrolment removed', 'success');
      loadData();
    } catch {
      showToast('Failed to remove enrolment', 'error');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await enrolmentService.create(formData);
      showToast('Student enrolled successfully', 'success');
      setModalOpen(false);
      loadData();
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Enrolment failed', 'error');
    }
  };

  const columns: Column<Enrolment>[] = [
    {
      key: 'studentId',
      header: 'Enrolled Student',
      render: (st: Student) => (
        <div>
          <p className="font-semibold text-gray-900">{st?.userId?.name || 'Student'}</p>
          <span className="font-mono text-[11px] text-gray-500">{st?.registrationNumber}</span>
        </div>
      ),
    },
    {
      key: 'courseId',
      header: 'Course',
      render: (c: any) => (
        <div>
          <span className="font-mono text-xs font-bold text-[#1e2a5e] bg-blue-50 px-1.5 py-0.5 rounded mr-1.5">
            {c?.courseCode}
          </span>
          <span className="font-medium text-xs text-gray-800">{c?.title}</span>
        </div>
      ),
    },
    {
      key: 'sectionId',
      header: 'Section',
      render: (sec: any) => (
        <div>
          <span className="font-semibold text-xs text-gray-900">{sec?.sectionName}</span>
          <span className="text-[11px] text-gray-500 block">
            Faculty: {sec?.facultyId?.userId?.name || 'Staff'}
          </span>
        </div>
      ),
    },
    {
      key: 'academicYear',
      header: 'Academic Year',
    },
    {
      key: 'enrolledAt',
      header: 'Enrolled Date',
      render: (val) => new Date(val).toLocaleDateString(),
    },
    {
      key: 'isActive',
      header: 'Status',
      render: (val) => <Badge variant={val ? 'green' : 'red'}>{val ? 'Active' : 'Dropped'}</Badge>,
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (_, row) => (
        <button
          onClick={() => handleDelete(row._id)}
          className="p-1.5 text-gray-600 hover:text-rose-700 hover:bg-rose-50 rounded transition-colors cursor-pointer"
          title="Drop Enrolment"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-gray-900">Enrolment Management</h2>
          <p className="text-xs text-gray-500">Assign students to sections, manage roster quotas and course registrations</p>
        </div>
        <Button onClick={handleOpenAdd} icon={<UserPlus className="w-4 h-4" />}>
          Enrol Student in Section
        </Button>
      </div>

      <Table
        columns={columns}
        data={enrolments}
        isLoading={loading}
        emptyMessage="No student enrolments found."
        pagination={{
          page,
          pages,
          total,
          limit: 10,
          onPageChange: (p) => setPage(p),
        }}
      />

      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Enrol Student in Course Section"
        size="md"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Select
            label="Select Student"
            required
            value={formData.studentId}
            onChange={e => setFormData({ ...formData, studentId: e.target.value })}
            options={students.map(s => ({
              value: s._id,
              label: `${s.userId?.name || 'Student'} (${s.registrationNumber} - ${s.department})`,
            }))}
          />

          <Select
            label="Select Target Section"
            required
            value={formData.sectionId}
            onChange={e => setFormData({ ...formData, sectionId: e.target.value })}
            options={sections.map(sec => ({
              value: sec._id,
              label: `${sec.sectionName} — ${(sec.courseId as any)?.title || 'Course'} (${sec.academicYear})`,
            }))}
          />

          <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
            <Button type="button" variant="secondary" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit">
              Confirm Enrolment
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default AdminEnrolments;
