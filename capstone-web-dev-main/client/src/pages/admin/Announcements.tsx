import React, { useEffect, useState } from 'react';
import { Plus, Edit2, Trash2, Megaphone } from 'lucide-react';
import { announcementService, courseService, sectionService } from '../../services/api';
import { Announcement, Course, Section } from '../../types';
import { Table, Column } from '../../components/ui/Table';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Modal } from '../../components/ui/Modal';
import { Badge } from '../../components/ui/Badge';
import { useToast } from '../../components/ui/Toast';

const AdminAnnouncements: React.FC = () => {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [sections, setSections] = useState<Section[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [loading, setLoading] = useState(true);

  const [modalOpen, setModalOpen] = useState(false);
  const [editingAnnouncement, setEditingAnnouncement] = useState<Announcement | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    scope: 'UNIVERSITY' as 'UNIVERSITY' | 'COURSE' | 'SECTION',
    courseId: '',
    sectionId: '',
  });

  const { showToast } = useToast();

  const loadData = async () => {
    setLoading(true);
    try {
      const [annRes, cRes, secRes] = await Promise.all([
        announcementService.getAll({ page, limit: 10 }),
        courseService.getAll({ limit: 100 }),
        sectionService.getAll({ limit: 100 }),
      ]);
      setAnnouncements(annRes.data.data);
      setTotal(annRes.data.pagination.total);
      setPages(annRes.data.pagination.pages);
      setCourses(cRes.data.data);
      setSections(secRes.data.data);
    } catch {
      showToast('Failed to load announcements', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [page]);

  const handleOpenAdd = () => {
    setEditingAnnouncement(null);
    setFormData({
      title: '',
      content: '',
      scope: 'UNIVERSITY',
      courseId: '',
      sectionId: '',
    });
    setModalOpen(true);
  };

  const handleOpenEdit = (ann: Announcement) => {
    setEditingAnnouncement(ann);
    setFormData({
      title: ann.title,
      content: ann.content,
      scope: ann.scope,
      courseId: (ann.courseId as any)?._id || ann.courseId || '',
      sectionId: (ann.sectionId as any)?._id || ann.sectionId || '',
    });
    setModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this announcement?')) return;
    try {
      await announcementService.delete(id);
      showToast('Announcement deleted', 'success');
      loadData();
    } catch {
      showToast('Failed to delete announcement', 'error');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload: any = {
        title: formData.title,
        content: formData.content,
        scope: formData.scope,
      };
      if (formData.scope === 'COURSE') payload.courseId = formData.courseId;
      if (formData.scope === 'SECTION') payload.sectionId = formData.sectionId;

      if (editingAnnouncement) {
        await announcementService.update(editingAnnouncement._id, payload);
        showToast('Announcement updated', 'success');
      } else {
        await announcementService.create(payload);
        showToast('Announcement broadcasted successfully', 'success');
      }
      setModalOpen(false);
      loadData();
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Operation failed', 'error');
    }
  };

  const columns: Column<Announcement>[] = [
    {
      key: 'title',
      header: 'Announcement Title',
      render: (val, row) => (
        <div>
          <p className="font-semibold text-gray-900">{val}</p>
          <p className="text-xs text-gray-500 line-clamp-1">{row.content}</p>
        </div>
      ),
    },
    {
      key: 'scope',
      header: 'Target Scope',
      render: (val, row) => {
        let badgeColor: any = 'blue';
        let detail = 'Campus-wide';
        if (val === 'COURSE') {
          badgeColor = 'green';
          detail = (row.courseId as any)?.courseCode || 'Specific Course';
        } else if (val === 'SECTION') {
          badgeColor = 'purple';
          detail = (row.sectionId as any)?.sectionName || 'Specific Section';
        }
        return (
          <div>
            <Badge variant={badgeColor}>{val}</Badge>
            <span className="text-[11px] text-gray-500 block mt-0.5">{detail}</span>
          </div>
        );
      },
    },
    {
      key: 'postedBy',
      header: 'Publisher',
      render: (val) => val?.name || 'Administrator',
    },
    {
      key: 'createdAt',
      header: 'Published Date',
      render: (val) => new Date(val).toLocaleDateString(),
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (_, row) => (
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => handleOpenEdit(row)}
            className="p-1.5 text-gray-600 hover:text-blue-700 hover:bg-blue-50 rounded transition-colors cursor-pointer"
            title="Edit"
          >
            <Edit2 className="w-4 h-4" />
          </button>
          <button
            onClick={() => handleDelete(row._id)}
            className="p-1.5 text-gray-600 hover:text-rose-700 hover:bg-rose-50 rounded transition-colors cursor-pointer"
            title="Delete"
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
          <h2 className="text-lg font-bold text-gray-900">Campus Announcements</h2>
          <p className="text-xs text-gray-500">Publish institutional circulars, academic notices and section updates</p>
        </div>
        <Button onClick={handleOpenAdd} icon={<Plus className="w-4 h-4" />}>
          New Announcement
        </Button>
      </div>

      <Table
        columns={columns}
        data={announcements}
        isLoading={loading}
        emptyMessage="No announcements published."
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
        title={editingAnnouncement ? 'Edit Announcement' : 'Publish New Announcement'}
        size="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Announcement Title"
            required
            value={formData.title}
            onChange={e => setFormData({ ...formData, title: e.target.value })}
            placeholder="e.g. Campus Holiday Schedule / Exam Notice"
          />

          <Select
            label="Audience Scope"
            required
            value={formData.scope}
            onChange={e => setFormData({ ...formData, scope: e.target.value as any })}
            options={[
              { value: 'UNIVERSITY', label: 'University-Wide (All Faculty & Students)' },
              { value: 'COURSE', label: 'Specific Course (All Enrolled Students)' },
              { value: 'SECTION', label: 'Specific Section Cohort' },
            ]}
          />

          {formData.scope === 'COURSE' && (
            <Select
              label="Select Target Course"
              required
              value={formData.courseId}
              onChange={e => setFormData({ ...formData, courseId: e.target.value })}
              options={courses.map(c => ({ value: c._id, label: `${c.courseCode} - ${c.title}` }))}
            />
          )}

          {formData.scope === 'SECTION' && (
            <Select
              label="Select Target Section"
              required
              value={formData.sectionId}
              onChange={e => setFormData({ ...formData, sectionId: e.target.value })}
              options={sections.map(s => ({ value: s._id, label: `${s.sectionName} (${(s.courseId as any)?.title || 'Course'})` }))}
            />
          )}

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Announcement Body Content</label>
            <textarea
              required
              rows={5}
              value={formData.content}
              onChange={e => setFormData({ ...formData, content: e.target.value })}
              placeholder="Write the detailed message here..."
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#1e2a5e]"
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
            <Button type="button" variant="secondary" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit">
              {editingAnnouncement ? 'Save Changes' : 'Broadcast Announcement'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default AdminAnnouncements;
