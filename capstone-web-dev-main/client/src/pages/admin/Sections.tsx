import React, { useEffect, useState } from 'react';
import { Plus, Edit2, Trash2 } from 'lucide-react';
import { sectionService, courseService, facultyService } from '../../services/api';
import { Section, Course, Faculty } from '../../types';
import { Table, Column } from '../../components/ui/Table';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Modal } from '../../components/ui/Modal';
import { Badge } from '../../components/ui/Badge';
import { useToast } from '../../components/ui/Toast';

const AdminSections: React.FC = () => {
  const [sections, setSections] = useState<Section[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [facultyList, setFacultyList] = useState<Faculty[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [loading, setLoading] = useState(true);

  const [modalOpen, setModalOpen] = useState(false);
  const [editingSection, setEditingSection] = useState<Section | null>(null);
  const [formData, setFormData] = useState({
    sectionName: '',
    courseId: '',
    facultyId: '',
    academicYear: '2024-2025',
    semester: '1',
    roomNumber: '',
    maxStudents: '50',
  });

  const { showToast } = useToast();

  const loadData = async () => {
    setLoading(true);
    try {
      const [secRes, cRes, fRes] = await Promise.all([
        sectionService.getAll({ page, limit: 10 }),
        courseService.getAll({ limit: 100 }),
        facultyService.getAll({ limit: 100 }),
      ]);
      setSections(secRes.data.data);
      setTotal(secRes.data.pagination.total);
      setPages(secRes.data.pagination.pages);
      setCourses(cRes.data.data);
      setFacultyList(fRes.data.data);
    } catch {
      showToast('Failed to load sections data', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [page]);

  const handleOpenAdd = () => {
    setEditingSection(null);
    setFormData({
      sectionName: '',
      courseId: courses[0]?._id || '',
      facultyId: facultyList[0]?._id || '',
      academicYear: '2024-2025',
      semester: '1',
      roomNumber: 'Hall 101',
      maxStudents: '50',
    });
    setModalOpen(true);
  };

  const handleOpenEdit = (section: Section) => {
    setEditingSection(section);
    setFormData({
      sectionName: section.sectionName,
      courseId: (section.courseId as any)?._id || section.courseId,
      facultyId: (section.facultyId as any)?._id || section.facultyId,
      academicYear: section.academicYear,
      semester: section.semester.toString(),
      roomNumber: section.roomNumber || '',
      maxStudents: section.maxStudents.toString(),
    });
    setModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to deactivate this section?')) return;
    try {
      await sectionService.delete(id);
      showToast('Section deactivated', 'success');
      loadData();
    } catch {
      showToast('Failed to deactivate section', 'error');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        ...formData,
        semester: parseInt(formData.semester),
        maxStudents: parseInt(formData.maxStudents),
      };
      if (editingSection) {
        await sectionService.update(editingSection._id, payload);
        showToast('Section updated', 'success');
      } else {
        await sectionService.create(payload);
        showToast('Section created successfully', 'success');
      }
      setModalOpen(false);
      loadData();
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Operation failed', 'error');
    }
  };

  const columns: Column<Section>[] = [
    {
      key: 'sectionName',
      header: 'Section Name',
      render: (val) => <span className="font-bold text-gray-900">{val}</span>,
    },
    {
      key: 'courseId',
      header: 'Assigned Course',
      render: (course: Course) => (
        <div>
          <span className="font-mono text-xs font-bold text-[#1e2a5e] bg-blue-50 px-1.5 py-0.5 rounded mr-1.5">
            {course?.courseCode}
          </span>
          <span className="font-medium text-xs text-gray-800">{course?.title}</span>
        </div>
      ),
    },
    {
      key: 'facultyId',
      header: 'Assigned Faculty',
      render: (faculty: Faculty) => (
        <span className="font-medium text-xs text-gray-900">
          {faculty?.userId?.name || 'Unassigned'}
        </span>
      ),
    },
    {
      key: 'roomNumber',
      header: 'Room',
      render: (val) => val || 'TBA',
    },
    {
      key: 'maxStudents',
      header: 'Capacity',
      render: (val) => `${val} seats`,
    },
    {
      key: 'isActive',
      header: 'Status',
      render: (val) => <Badge variant={val ? 'green' : 'red'}>{val ? 'Active' : 'Inactive'}</Badge>,
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (_, row) => (
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => handleOpenEdit(row)}
            className="p-1.5 text-gray-600 hover:text-blue-700 hover:bg-blue-50 rounded transition-colors"
            title="Edit"
          >
            <Edit2 className="w-4 h-4" />
          </button>
          <button
            onClick={() => handleDelete(row._id)}
            className="p-1.5 text-gray-600 hover:text-rose-700 hover:bg-rose-50 rounded transition-colors"
            title="Deactivate"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-gray-900">Academic Sections</h2>
          <p className="text-xs text-gray-500">Configure class cohorts, room scheduling and faculty instructor assignments</p>
        </div>
        <Button onClick={handleOpenAdd} icon={<Plus className="w-4 h-4" />}>
          Create New Section
        </Button>
      </div>

      <Table
        columns={columns}
        data={sections}
        isLoading={loading}
        emptyMessage="No academic sections created."
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
        title={editingSection ? 'Edit Section' : 'Create Academic Section'}
        size="md"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Section Identifier / Name"
            required
            value={formData.sectionName}
            onChange={e => setFormData({ ...formData, sectionName: e.target.value })}
            placeholder="e.g. CS-101-A"
          />

          <Select
            label="Associated Course"
            required
            value={formData.courseId}
            onChange={e => setFormData({ ...formData, courseId: e.target.value })}
            options={courses.map(c => ({ value: c._id, label: `${c.courseCode} - ${c.title}` }))}
          />

          <Select
            label="Assigned Faculty"
            required
            value={formData.facultyId}
            onChange={e => setFormData({ ...formData, facultyId: e.target.value })}
            options={facultyList.map(f => ({ value: f._id, label: `${f.userId?.name || 'Faculty'} (${f.employeeId})` }))}
          />

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Room / Lab Location"
              value={formData.roomNumber}
              onChange={e => setFormData({ ...formData, roomNumber: e.target.value })}
              placeholder="e.g. Room 204"
            />
            <Input
              label="Max Student Capacity"
              type="number"
              value={formData.maxStudents}
              onChange={e => setFormData({ ...formData, maxStudents: e.target.value })}
              placeholder="50"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Academic Year"
              required
              value={formData.academicYear}
              onChange={e => setFormData({ ...formData, academicYear: e.target.value })}
              placeholder="2024-2025"
            />
            <Select
              label="Semester"
              required
              value={formData.semester}
              onChange={e => setFormData({ ...formData, semester: e.target.value })}
              options={[1, 2, 3, 4, 5, 6, 7, 8].map(s => ({ value: s.toString(), label: `Semester ${s}` }))}
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
            <Button type="button" variant="secondary" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit">
              {editingSection ? 'Save Changes' : 'Create Section'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default AdminSections;
