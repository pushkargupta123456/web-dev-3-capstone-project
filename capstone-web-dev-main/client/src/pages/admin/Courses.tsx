import React, { useEffect, useState } from 'react';
import { Plus, Edit2, Trash2 } from 'lucide-react';
import { courseService } from '../../services/api';
import { Course } from '../../types';
import { Table, Column } from '../../components/ui/Table';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Modal } from '../../components/ui/Modal';
import { Badge } from '../../components/ui/Badge';
import { SearchBar } from '../../components/ui/SearchBar';
import { useToast } from '../../components/ui/Toast';

const AdminCourses: React.FC = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [search, setSearch] = useState('');
  const [department, setDepartment] = useState('');
  const [loading, setLoading] = useState(true);

  const [modalOpen, setModalOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const [formData, setFormData] = useState({
    courseCode: '',
    title: '',
    department: 'Computer Science',
    credits: '3',
    semester: '1',
    description: '',
  });

  const { showToast } = useToast();

  const fetchCourses = async () => {
    setLoading(true);
    try {
      const res = await courseService.getAll({
        page,
        limit: 10,
        search: search || undefined,
        department: department || undefined,
      });
      setCourses(res.data.data);
      setTotal(res.data.pagination.total);
      setPages(res.data.pagination.pages);
    } catch {
      showToast('Failed to load course list', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourses();
  }, [page, search, department]);

  const handleOpenAdd = () => {
    setEditingCourse(null);
    setFormData({
      courseCode: '',
      title: '',
      department: 'Computer Science',
      credits: '3',
      semester: '1',
      description: '',
    });
    setModalOpen(true);
  };

  const handleOpenEdit = (course: Course) => {
    setEditingCourse(course);
    setFormData({
      courseCode: course.courseCode,
      title: course.title,
      department: course.department,
      credits: course.credits.toString(),
      semester: course.semester.toString(),
      description: course.description || '',
    });
    setModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to deactivate this course?')) return;
    try {
      await courseService.delete(id);
      showToast('Course deactivated', 'success');
      fetchCourses();
    } catch {
      showToast('Failed to deactivate course', 'error');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        ...formData,
        credits: parseInt(formData.credits),
        semester: parseInt(formData.semester),
      };
      if (editingCourse) {
        await courseService.update(editingCourse._id, payload);
        showToast('Course updated', 'success');
      } else {
        await courseService.create(payload);
        showToast('Course created successfully', 'success');
      }
      setModalOpen(false);
      fetchCourses();
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Operation failed', 'error');
    }
  };

  const columns: Column<Course>[] = [
    {
      key: 'courseCode',
      header: 'Course Code',
      render: (val) => <span className="font-mono text-xs font-bold text-[#1e2a5e] bg-blue-50 px-2 py-1 rounded">{val}</span>,
    },
    {
      key: 'title',
      header: 'Course Title',
      render: (val, row) => (
        <div>
          <p className="font-semibold text-gray-900">{val}</p>
          {row.description && <p className="text-xs text-gray-500 line-clamp-1">{row.description}</p>}
        </div>
      ),
    },
    {
      key: 'department',
      header: 'Department',
    },
    {
      key: 'credits',
      header: 'Credits',
      render: (val) => `${val} Credits`,
    },
    {
      key: 'semester',
      header: 'Semester',
      render: (val) => `Sem ${val}`,
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
          <h2 className="text-lg font-bold text-gray-900">Course Catalog</h2>
          <p className="text-xs text-gray-500">Configure academic subjects, credits, and curricular pathways</p>
        </div>
        <Button onClick={handleOpenAdd} icon={<Plus className="w-4 h-4" />}>
          Create New Course
        </Button>
      </div>

      <div className="bg-white p-3.5 rounded-xl border border-gray-200 shadow-sm flex flex-wrap gap-3 items-center">
        <SearchBar
          value={search}
          onChange={(val) => { setSearch(val); setPage(1); }}
          placeholder="Search by code or title..."
          className="w-full sm:w-72"
        />
        <select
          value={department}
          onChange={(e) => { setDepartment(e.target.value); setPage(1); }}
          className="px-3 py-2 border border-gray-200 rounded-lg text-xs bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#1e2a5e]"
        >
          <option value="">All Departments</option>
          <option value="Computer Science">Computer Science</option>
          <option value="Mathematics">Mathematics</option>
          <option value="Physics">Physics</option>
          <option value="English">English</option>
        </select>
      </div>

      <Table
        columns={columns}
        data={courses}
        isLoading={loading}
        emptyMessage="No courses registered yet."
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
        title={editingCourse ? 'Edit Course' : 'Create New Course'}
        size="md"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Course Code"
            required
            value={formData.courseCode}
            onChange={e => setFormData({ ...formData, courseCode: e.target.value.toUpperCase() })}
            placeholder="e.g. CS101"
            disabled={!!editingCourse}
          />
          <Input
            label="Course Title"
            required
            value={formData.title}
            onChange={e => setFormData({ ...formData, title: e.target.value })}
            placeholder="e.g. Introduction to Programming"
          />

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <Select
              label="Department"
              required
              value={formData.department}
              onChange={e => setFormData({ ...formData, department: e.target.value })}
              options={[
                { value: 'Computer Science', label: 'Computer Science' },
                { value: 'Mathematics', label: 'Mathematics' },
                { value: 'Physics', label: 'Physics' },
                { value: 'English', label: 'English' },
              ]}
            />
            <Select
              label="Credits"
              required
              value={formData.credits}
              onChange={e => setFormData({ ...formData, credits: e.target.value })}
              options={[1, 2, 3, 4, 5, 6].map(c => ({ value: c.toString(), label: `${c} Credits` }))}
            />
            <Select
              label="Semester"
              required
              value={formData.semester}
              onChange={e => setFormData({ ...formData, semester: e.target.value })}
              options={[1, 2, 3, 4, 5, 6, 7, 8].map(s => ({ value: s.toString(), label: `Semester ${s}` }))}
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Course Description</label>
            <textarea
              value={formData.description}
              onChange={e => setFormData({ ...formData, description: e.target.value })}
              placeholder="Summary of course contents, prerequisites, objectives..."
              rows={3}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#1e2a5e]"
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
            <Button type="button" variant="secondary" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit">
              {editingCourse ? 'Save Changes' : 'Create Course'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default AdminCourses;
