import React, { useEffect, useState } from 'react';
import { Megaphone } from 'lucide-react';
import { announcementService } from '../../services/api';
import { Announcement } from '../../types';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { useToast } from '../../components/ui/Toast';

const StudentAnnouncements: React.FC = () => {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const { showToast } = useToast();

  useEffect(() => {
    announcementService.getAll()
      .then(res => setAnnouncements(res.data.data || []))
      .catch(() => showToast('Failed to load notices', 'error'))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-4 max-w-4xl mx-auto">
      <div>
        <h2 className="text-lg font-bold text-gray-900">Campus & Course Notices</h2>
        <p className="text-xs text-gray-500">Official circulars from university administration and enrolled course instructors</p>
      </div>

      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-28 bg-white rounded-xl border border-gray-200 animate-pulse" />
          ))}
        </div>
      ) : announcements.length === 0 ? (
        <Card>
          <div className="py-16 text-center">
            <Megaphone className="w-10 h-10 text-gray-300 mx-auto mb-3" />
            <p className="text-sm font-semibold text-gray-800">No Announcements</p>
            <p className="text-xs text-gray-500 mt-1">There are no circulars currently published for your section or cohort.</p>
          </div>
        </Card>
      ) : (
        <div className="space-y-3">
          {announcements.map(a => (
            <div key={a._id} className="p-5 bg-white rounded-xl border border-gray-200 shadow-sm space-y-2">
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-base text-gray-900">{a.title}</h3>
                  <Badge variant={a.scope === 'UNIVERSITY' ? 'blue' : a.scope === 'COURSE' ? 'green' : 'purple'}>
                    {a.scope}
                  </Badge>
                </div>
                <span className="text-xs text-gray-400 whitespace-nowrap">
                  {new Date(a.createdAt).toLocaleDateString()}
                </span>
              </div>
              <p className="text-xs text-gray-700 leading-relaxed whitespace-pre-line">{a.content}</p>
              <div className="pt-2 border-t border-gray-100 flex items-center justify-between text-[11px] text-gray-400">
                <span>Published by: <strong className="text-gray-600">{a.postedBy?.name || 'Administrator'}</strong></span>
                {a.courseId && <span>Course: {(a.courseId as any)?.title || 'Course'}</span>}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default StudentAnnouncements;
