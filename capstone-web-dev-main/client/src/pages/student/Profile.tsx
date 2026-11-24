import React, { useEffect, useState } from 'react';
import { User, Lock, GraduationCap } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { studentService, authService } from '../../services/api';
import { Card, CardHeader, CardBody } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { useToast } from '../../components/ui/Toast';

const StudentProfile: React.FC = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState<any>(null);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { showToast } = useToast();

  useEffect(() => {
    studentService.getMe()
      .then(res => setProfile(res.data.data))
      .catch(() => showToast('Failed to load profile', 'error'));
  }, []);

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      showToast('New passwords do not match', 'error');
      return;
    }
    if (newPassword.length < 6) {
      showToast('New password must be at least 6 characters', 'error');
      return;
    }

    setLoading(true);
    try {
      await authService.changePassword({ currentPassword, newPassword });
      showToast('Password updated successfully', 'success');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Failed to update password', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <div>
        <h2 className="text-lg font-bold text-gray-900">Student Profile & Credentials</h2>
        <p className="text-xs text-gray-500">Official matriculation data, academic standing and security settings</p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <GraduationCap className="w-5 h-5 text-[#1e2a5e]" />
            <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider">Matriculation Record</h3>
          </div>
        </CardHeader>
        <CardBody className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Student Name</p>
              <p className="text-sm font-bold text-gray-900 mt-1">{user?.name}</p>
            </div>
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Registration Number</p>
              <p className="text-sm font-mono font-bold text-[#1e2a5e] mt-1">{profile?.registrationNumber || '—'}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Department</p>
              <p className="text-sm font-semibold text-gray-800 mt-1">{profile?.department || '—'}</p>
            </div>
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Semester & Academic Year</p>
              <p className="text-sm font-semibold text-gray-800 mt-1">
                Semester {profile?.semester || '—'} ({profile?.academicYear || '—'})
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Institutional Email</p>
              <p className="text-sm text-gray-800 mt-1">{user?.email}</p>
            </div>
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Phone Number</p>
              <p className="text-sm text-gray-800 mt-1">{profile?.phone || '—'}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 pt-2 border-t border-gray-100">
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Emergency Guardian Contact</p>
              <p className="text-sm font-medium text-gray-800 mt-1">{profile?.guardianName || '—'} ({profile?.guardianPhone || '—'})</p>
            </div>
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Campus Address</p>
              <p className="text-sm text-gray-800 mt-1">{profile?.address || '—'}</p>
            </div>
          </div>
        </CardBody>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Lock className="w-5 h-5 text-[#1e2a5e]" />
            <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider">Change Portal Password</h3>
          </div>
        </CardHeader>
        <CardBody>
          <form onSubmit={handlePasswordChange} className="space-y-4">
            <Input
              label="Current Password"
              type="password"
              required
              value={currentPassword}
              onChange={e => setCurrentPassword(e.target.value)}
              placeholder="••••••••••••"
            />
            <Input
              label="New Password"
              type="password"
              required
              value={newPassword}
              onChange={e => setNewPassword(e.target.value)}
              placeholder="Minimum 6 characters"
            />
            <Input
              label="Confirm New Password"
              type="password"
              required
              value={confirmPassword}
              onChange={e => setConfirmPassword(e.target.value)}
              placeholder="Confirm new password"
            />
            <div className="pt-2">
              <Button type="submit" isLoading={loading}>
                Update Password
              </Button>
            </div>
          </form>
        </CardBody>
      </Card>
    </div>
  );
};

export default StudentProfile;
