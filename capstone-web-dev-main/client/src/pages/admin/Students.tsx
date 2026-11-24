import React, { useEffect, useState } from 'react';
import { Plus, Edit2, Trash2, Search, Filter } from 'lucide-react';
import { studentService } from '../../services/api';
import { Student } from '../../types';
import { Table, Column } from '../../components/ui/Table';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Modal } from '../../components/ui/Modal';
import { Badge } from '../../components/ui/Badge';
import { SearchBar } from '../../components/ui/SearchBar';
import { useToast } from '../../components/ui/Toast';

const AdminStudents: React.FC = () => {
  const [students, setStudents] = useState<Student[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [search, setSearch] = useState('');
  const [department, setDepartment] = useState('');
  const [semester, setSemester] = useState('');
  const [loading, setLoading] = useState(true);

  const [modalOpen, setModalOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    registrationNumber: '',
    department: 'Computer Science',
    semester: '1',
    academicYear: '2024-2025',
    phone: '',
    dateOfBirth: '',
    guardianName: '',
    guardianPhone: '',
    address: '',
  });

  const { showToast } = useToast();

  const fetchStudents = async () => {
    setLoading(true);
    try {
      const res = await studentService.getAll({
        page,
        limit: 10,
        search: search || undefined,
        department: department || undefined,
        semester: semester || undefined,
      });
      setStudents(res.data.data);
      setTotal(res.data.pagination.total);
      setPages(res.data.pagination.pages);
    } catch {
      showToast('Failed to load student records', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, [page, search, department, semester]);

  const handleOpenAdd = () => {
    setEditingStudent(null);
    setFormData({
      name: '',
      email: '',
      password: '',
      registrationNumber: '',
      department: 'Computer Science',
      semester: '1',
      academicYear: '2024-2025',
      phone: '',
      dateOfBirth: '',
      guardianName: '',
      guardianPhone: '',
      address: '',
    });
    setModalOpen(true);
  };

  const handleOpenEdit = (student: Student) => {
    setEditingStudent(student);
    setFormData({
      name: student.userId?.name || '',
      email: student.userId?.email || '',
      password: '',
      registrationNumber: student.registrationNumber,
      department: student.department,
      semester: student.semester.toString(),
      academicYear: student.academicYear,
      phone: student.phone || '',
      dateOfBirth: student.dateOfBirth ? student.dateOfBirth.split('T')[0] : '',
      guardianName: student.guardianName || '',
      guardianPhone: student.guardianPhone || '',
      address: student.address || '',
    });
    setModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to deactivate this student account?')) return;
    try {
      await studentService.delete(id);
      showToast('Student deactivated successfully', 'success');
      fetchStudents();
    } catch {
      showToast('Failed to deactivate student', 'error');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingStudent) {
        await studentService.update(editingStudent._id, {
          name: formData.name,
          email: formData.email,
          department: formData.department,
          semester: parseInt(formData.semester),
          academicYear: formData.academicYear,
          phone: formData.phone,
          dateOfBirth: formData.dateOfBirth ? new Date(formData.dateOfBirth) : undefined,
          guardianName: formData.guardianName,
          guardianPhone: formData.guardianPhone,
          address: formData.address,
        });
        showToast('Student updated successfully', 'success');
      } else {
        await studentService.create({
          ...formData,
          semester: parseInt(formData.semester),
          dateOfBirth: formData.dateOfBirth ? new Date(formData.dateOfBirth) : undefined,
        });
        showToast('Student enrolled successfully', 'success');
      }
      setModalOpen(false);
      fetchStudents();
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Operation failed', 'error');
    }
  };

  const columns: Column<Student>[] = [
    {
      key: 'name',
      header: 'Student Name',
      render: (_, row) => (
        <div>
          <p className="font-semibold text-gray-900">{row.userId?.name || 'Unnamed'}</p>
          <p className="text-xs text-gray-500">{row.userId?.email}</p>
        </div>
      ),
    },
    {
      key: 'registrationNumber',
      header: 'Registration No.',
      render: (val) => <span className="font-mono text-xs font-semibold text-gray-700 bg-gray-100 px-2 py-0.5 rounded">{val}</span>,
    },
    {
      key: 'department',
      header: 'Department',
    },
    {
      key: 'semester',
      header: 'Semester',
      render: (val) => `Sem ${val}`,
    },
    {
      key: 'academicYear',
      header: 'Academic Year',
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
      {/* Action Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-gray-900">Student Directory</h2>
          <p className="text-xs text-gray-500">Manage institutional student records, credentials and enrolments</p>
        </div>
        <Button onClick={handleOpenAdd} icon={<Plus className="w-4 h-4" />}>
          Add New Student
        </Button>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-3.5 rounded-xl border border-gray-200 shadow-sm flex flex-wrap gap-3 items-center">
        <SearchBar
          value={search}
          onChange={(val) => { setSearch(val); setPage(1); }}
          placeholder="Search by name, email or reg..."
          className="w-full sm:w-64"
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
        <select
          value={semester}
          onChange={(e) => { setSemester(e.target.value); setPage(1); }}
          className="px-3 py-2 border border-gray-200 rounded-lg text-xs bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#1e2a5e]"
        >
          <option value="">All Semesters</option>
          {[1, 2, 3, 4, 5, 6, 7, 8].map(s => (
            <option key={s} value={s}>Semester {s}</option>
          ))}
        </select>
      </div>

      {/* Data Table */}
      <Table
        columns={columns}
        data={students}
        isLoading={loading}
        emptyMessage="No students match the criteria."
        pagination={{
          page,
          pages,
          total,
          limit: 10,
          onPageChange: (p) => setPage(p),
        }}
      />

      {/* Add / Edit Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingStudent ? 'Edit Student Record' : 'Register New Student'}
        size="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Full Name"
              required
              value={formData.name}
              onChange={e => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g. Alex Morgan"
            />
            <Input
              label="Email Address"
              type="email"
              required
              value={formData.email}
              onChange={e => setFormData({ ...formData, email: e.target.value })}
              placeholder="alex@university.edu"
            />
          </div>

          {!editingStudent && (
            <Input
              label="Initial Password"
              type="password"
              required
              value={formData.password}
              onChange={e => setFormData({ ...formData, password: e.target.value })}
              placeholder="Minimum 6 characters"
            />
          )}

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Input
              label="Registration Number"
              required
              value={formData.registrationNumber}
              onChange={e => setFormData({ ...formData, registrationNumber: e.target.value })}
              placeholder="REG2024099"
              disabled={!!editingStudent}
            />
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
              label="Semester"
              required
              value={formData.semester}
              onChange={e => setFormData({ ...formData, semester: e.target.value })}
              options={[1, 2, 3, 4, 5, 6, 7, 8].map(s => ({ value: s.toString(), label: `Semester ${s}` }))}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Academic Year"
              required
              value={formData.academicYear}
              onChange={e => setFormData({ ...formData, academicYear: e.target.value })}
              placeholder="2024-2025"
            />
            <Input
              label="Phone Number"
              value={formData.phone}
              onChange={e => setFormData({ ...formData, phone: e.target.value })}
              placeholder="+1-555-0199"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Guardian Name"
              value={formData.guardianName}
              onChange={e => setFormData({ ...formData, guardianName: e.target.value })}
              placeholder="Guardian Full Name"
            />
            <Input
              label="Guardian Phone"
              value={formData.guardianPhone}
              onChange={e => setFormData({ ...formData, guardianPhone: e.target.value })}
              placeholder="+1-555-0200"
            />
          </div>

          <Input
            label="Home / Campus Address"
            value={formData.address}
            onChange={e => setFormData({ ...formData, address: e.target.value })}
            placeholder="Street address, city"
          />

          <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
            <Button type="button" variant="secondary" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit">
              {editingStudent ? 'Save Changes' : 'Enroll Student'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default AdminStudents;
