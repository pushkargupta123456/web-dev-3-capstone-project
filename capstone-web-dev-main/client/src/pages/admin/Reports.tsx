import React, { useState } from 'react';
import { Download, FileText, Users, UserCheck } from 'lucide-react';
import { reportService } from '../../services/api';
import { Card, CardHeader, CardBody } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { useToast } from '../../components/ui/Toast';

const AdminReports: React.FC = () => {
  const [loadingSt, setLoadingSt] = useState(false);
  const [loadingAtt, setLoadingAtt] = useState(false);
  const { showToast } = useToast();

  const handleExportStudents = async () => {
    setLoadingSt(true);
    try {
      const res = await reportService.exportStudentsCSV();
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'institutional_students_report.csv');
      document.body.appendChild(link);
      link.click();
      link.remove();
      showToast('Student report exported', 'success');
    } catch {
      showToast('Failed to export student report', 'error');
    } finally {
      setLoadingSt(false);
    }
  };

  const handleExportAttendance = async () => {
    setLoadingAtt(true);
    try {
      const res = await reportService.exportAttendanceCSV({ threshold: 75 });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'campus_attendance_report.csv');
      document.body.appendChild(link);
      link.click();
      link.remove();
      showToast('Attendance report exported', 'success');
    } catch {
      showToast('Failed to export attendance report', 'error');
    } finally {
      setLoadingAtt(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-bold text-gray-900">Institutional Reporting Engine</h2>
        <p className="text-xs text-gray-500">Generate and export official accreditation, registrar and attendance audit datasets in standard CSV format</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-blue-700" />
              <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider">Student Registry Report</h3>
            </div>
          </CardHeader>
          <CardBody className="space-y-4">
            <p className="text-xs text-gray-600 leading-relaxed">
              Export complete institutional roster including registration numbers, full student names, institutional emails, enrolled departments, active semesters, and academic cohorts.
            </p>
            <div className="pt-2">
              <Button
                onClick={handleExportStudents}
                isLoading={loadingSt}
                icon={<Download className="w-4 h-4" />}
                className="w-full sm:w-auto"
              >
                Download Students CSV (.csv)
              </Button>
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <UserCheck className="w-5 h-5 text-emerald-700" />
              <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider">Cumulative Attendance Audit</h3>
            </div>
          </CardHeader>
          <CardBody className="space-y-4">
            <p className="text-xs text-gray-600 leading-relaxed">
              Export aggregated student attendance by subject with total classes held, attended sessions, calculated attendance percentage, and regulatory compliance flags (&gt;= 75% threshold).
            </p>
            <div className="pt-2">
              <Button
                onClick={handleExportAttendance}
                isLoading={loadingAtt}
                icon={<Download className="w-4 h-4" />}
                className="w-full sm:w-auto"
              >
                Download Attendance Audit (.csv)
              </Button>
            </div>
          </CardBody>
        </Card>
      </div>
    </div>
  );
};

export default AdminReports;
