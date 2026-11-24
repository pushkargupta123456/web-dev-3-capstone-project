import React, { useEffect, useState } from 'react';
import { Plus, Megaphone } from 'lucide-react';
import { announcementService, facultyService } from '../../services/api';
import { Announcement } from '../../types';
import { Table, Column } from '../../components/ui/Table';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Modal } from '../../components/ui/Modal';
import { Badge } from '../../components/ui/Badge';
import { useToast } from '../../components/ui/Toast';

const FacultyAnnouncements: React.FC = () => {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [sections, setSections] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    sectionId: '',
  });

  const { showToast } = useToast();

  const loadData = async () => {
    setLoading(true);
    try {
      const [annRes, facRes] = await Promise.all([
        announcementService.getAll(),
        facultyService.getMe(),
      ]);
      setAnnouncements(annRes.data.data);
      const secList = facRes.data.data.sections || [];
      setSections(secList);
      if (secList.length > 0) {
        setFormData(prev => ({ ...prev, sectionId: secList[0]._id }));
      }
    } catch {
      showToast('Failed to load announcements', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const sec = sections.find(s => s._id === formData.sectionId);
      await announcementService.create({
        title: formData.title,
        content: formData.content,
        scope: 'SECTION',
        sectionId: formData.sectionId,
        courseId: sec?.courseId?._id || sec?.courseId,
      });
      showToast('Section announcement posted successfully', 'success');
      setModalOpen(false);
      setFormData({ title: '', content: '', sectionId: sections[0]?._id || '' });
      loadData();
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Failed to post announcement', 'error');
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
      header: 'Scope',
      render: (val, row) => (
        <Badge variant={val === 'UNIVERSITY' ? 'blue' : val === 'COURSE' ? 'green' : 'purple'}>
          {val === 'SECTION' ? (row.sectionId as any)?.sectionName || 'Section' : val}
        </Badge>
      ),
    },
    {
      key: 'postedBy',
      header: 'Posted By',
      render: (p) => p?.name || 'Faculty',
    },
    {
      key: 'createdAt',
      header: 'Date',
      render: (val) => new Date(val).toLocaleDateString(),
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-gray-900">Class & Course Announcements</h2>
          <p className="text-xs text-gray-500">Communicate exam syllabus, reading assignments, and class reschedule updates</p>
        </div>
        <Button onClick={() => setModalOpen(true)} icon={<Plus className="w-4 h-4" />}>
          New Section Announcement
        </Button>
      </div>

      <Table
        columns={columns}
        data={announcements}
        isLoading={loading}
        emptyMessage="No announcements found."
      />

      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Post New Section Announcement"
        size="md"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Announcement Title"
            required
            value={formData.title}
            onChange={e => setFormData({ ...formData, title: e.target.value })}
            placeholder="e.g. Next Class Lab Assignment Requirements"
          />

          <Select
            label="Target Section Cohort"
            required
            value={formData.sectionId}
            onChange={e => setFormData({ ...formData, sectionId: e.target.value })}
            options={sections.map(s => ({
              value: s._id,
              label: `${s.sectionName} — ${s.courseId?.title}`,
            }))}
          />

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Detailed Message Content</label>
            <textarea
              required
              rows={4}
              value={formData.content}
              onChange={e => setFormData({ ...formData, content: e.target.value })}
              placeholder="Write the announcement for enrolled students..."
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#1e2a5e]"
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
            <Button type="button" variant="secondary" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit">
              Post Announcement
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default FacultyAnnouncements;
