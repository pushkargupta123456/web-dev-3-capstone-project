import React, { useEffect, useState } from 'react';
import { Plus, Edit2, Trash2 } from 'lucide-react';
import { facultyService } from '../../services/api';
import { Faculty } from '../../types';
import { Table, Column } from '../../components/ui/Table';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Modal } from '../../components/ui/Modal';
import { Badge } from '../../components/ui/Badge';
import { SearchBar } from '../../components/ui/SearchBar';
import { useToast } from '../../components/ui/Toast';

const AdminFaculty: React.FC = () => {
  const [facultyList, setFacultyList] = useState<Faculty[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [search, setSearch] = useState('');
  const [department, setDepartment] = useState('');
  const [loading, setLoading] = useState(true);

  const [modalOpen, setModalOpen] = useState(false);
  const [editingFaculty, setEditingFaculty] = useState<Faculty | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    employeeId: '',
    department: 'Computer Science',
    designation: 'Assistant Professor',
    qualification: '',
    phone: '',
    joiningDate: '',
  });

  const { showToast } = useToast();

  const fetchFaculty = async () => {
    setLoading(true);
    try {
      const res = await facultyService.getAll({
        page,
        limit: 10,
        search: search || undefined,
        department: department || undefined,
      });
      setFacultyList(res.data.data);
      setTotal(res.data.pagination.total);
      setPages(res.data.pagination.pages);
    } catch {
      showToast('Failed to load faculty records', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFaculty();
  }, [page, search, department]);

  const handleOpenAdd = () => {
    setEditingFaculty(null);
    setFormData({
      name: '',
      email: '',
      password: '',
      employeeId: '',
      department: 'Computer Science',
      designation: 'Assistant Professor',
      qualification: '',
      phone: '',
      joiningDate: new Date().toISOString().split('T')[0],
    });
    setModalOpen(true);
  };

  const handleOpenEdit = (faculty: Faculty) => {
    setEditingFaculty(faculty);
    setFormData({
      name: faculty.userId?.name || '',
      email: faculty.userId?.email || '',
      password: '',
      employeeId: faculty.employeeId,
      department: faculty.department,
      designation: faculty.designation,
      qualification: faculty.qualification || '',
      phone: faculty.phone || '',
      joiningDate: faculty.joiningDate ? faculty.joiningDate.split('T')[0] : '',
    });
    setModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to deactivate this faculty member?')) return;
    try {
      await facultyService.delete(id);
      showToast('Faculty member deactivated', 'success');
      fetchFaculty();
    } catch {
      showToast('Failed to deactivate faculty', 'error');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingFaculty) {
        await facultyService.update(editingFaculty._id, {
          name: formData.name,
          email: formData.email,
          department: formData.department,
          designation: formData.designation,
          qualification: formData.qualification,
          phone: formData.phone,
          joiningDate: formData.joiningDate ? new Date(formData.joiningDate) : undefined,
        });
        showToast('Faculty details updated', 'success');
      } else {
        await facultyService.create(formData);
        showToast('Faculty member added successfully', 'success');
      }
      setModalOpen(false);
      fetchFaculty();
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Operation failed', 'error');
    }
  };

  const columns: Column<Faculty>[] = [
    {
      key: 'name',
      header: 'Faculty Name',
      render: (_, row) => (
        <div>
          <p className="font-semibold text-gray-900">{row.userId?.name || 'Unnamed'}</p>
          <p className="text-xs text-gray-500">{row.userId?.email}</p>
        </div>
      ),
    },
    {
      key: 'employeeId',
      header: 'Employee ID',
      render: (val) => <span className="font-mono text-xs font-semibold text-gray-700 bg-gray-100 px-2 py-0.5 rounded">{val}</span>,
    },
    {
      key: 'designation',
      header: 'Designation',
    },
    {
      key: 'department',
      header: 'Department',
    },
    {
      key: 'qualification',
      header: 'Qualification',
      render: (val) => val || '—',
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
          <h2 className="text-lg font-bold text-gray-900">Faculty Directory</h2>
          <p className="text-xs text-gray-500">Manage academic professors, instructors and departmental assignments</p>
        </div>
        <Button onClick={handleOpenAdd} icon={<Plus className="w-4 h-4" />}>
          Add New Faculty
        </Button>
      </div>

      <div className="bg-white p-3.5 rounded-xl border border-gray-200 shadow-sm flex flex-wrap gap-3 items-center">
        <SearchBar
          value={search}
          onChange={(val) => { setSearch(val); setPage(1); }}
          placeholder="Search by name, email or employee ID..."
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
        data={facultyList}
        isLoading={loading}
        emptyMessage="No faculty records found."
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
        title={editingFaculty ? 'Edit Faculty Details' : 'Add New Faculty Member'}
        size="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Full Name"
              required
              value={formData.name}
              onChange={e => setFormData({ ...formData, name: e.target.value })}
              placeholder="Dr. / Prof. Full Name"
            />
            <Input
              label="Institutional Email"
              type="email"
              required
              value={formData.email}
              onChange={e => setFormData({ ...formData, email: e.target.value })}
              placeholder="name@university.edu"
            />
          </div>

          {!editingFaculty && (
            <Input
              label="Account Password"
              type="password"
              required
              value={formData.password}
              onChange={e => setFormData({ ...formData, password: e.target.value })}
              placeholder="Minimum 6 characters"
            />
          )}

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Input
              label="Employee ID"
              required
              value={formData.employeeId}
              onChange={e => setFormData({ ...formData, employeeId: e.target.value })}
              placeholder="FAC101"
              disabled={!!editingFaculty}
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
              label="Designation"
              required
              value={formData.designation}
              onChange={e => setFormData({ ...formData, designation: e.target.value })}
              options={[
                { value: 'Professor', label: 'Professor' },
                { value: 'Associate Professor', label: 'Associate Professor' },
                { value: 'Assistant Professor', label: 'Assistant Professor' },
                { value: 'Lecturer', label: 'Lecturer' },
              ]}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Input
              label="Qualification"
              value={formData.qualification}
              onChange={e => setFormData({ ...formData, qualification: e.target.value })}
              placeholder="Ph.D. in Computer Science"
            />
            <Input
              label="Phone Number"
              value={formData.phone}
              onChange={e => setFormData({ ...formData, phone: e.target.value })}
              placeholder="+1-555-0100"
            />
            <Input
              label="Joining Date"
              type="date"
              value={formData.joiningDate}
              onChange={e => setFormData({ ...formData, joiningDate: e.target.value })}
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
            <Button type="button" variant="secondary" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit">
              {editingFaculty ? 'Update Faculty' : 'Register Faculty'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default AdminFaculty;
