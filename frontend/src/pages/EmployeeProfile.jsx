import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft, Mail, Phone, Briefcase, Calendar as CalendarIcon,
  CheckCircle2, XCircle, PercentCircle
} from 'lucide-react';
import { format } from 'date-fns';
import api from '../api/client';
import { Button } from '../components/ui';
import { ROUTES } from '../constants/routes';

export default function EmployeeProfile() {
  const { employeeId } = useParams();
  const navigate = useNavigate();

  const [employee, setEmployee] = useState(null);
  const [attendance, setAttendance] = useState([]);
  const [summary, setSummary] = useState(null);

  const [isLoadingEmployee, setIsLoadingEmployee] = useState(true);
  const [isLoadingAttendance, setIsLoadingAttendance] = useState(true);
  const [error, setError] = useState(null);

  const fetchAttendance = useCallback(async () => {
    setIsLoadingAttendance(true);
    try {
      const { data } = await api.get(`/attendance/${employeeId}`);
      setAttendance(data);
    } catch (err) {
      console.error(err);
      setAttendance([]);
    } finally {
      setIsLoadingAttendance(false);
    }
  }, [employeeId]);

  useEffect(() => {
    const fetchEmployee = async () => {
      try {
        const { data } = await api.get(`/employees/${employeeId}`);
        setEmployee(data);
      } catch (err) {
        console.error(err);
        setError('Employee not found.');
      } finally {
        setIsLoadingEmployee(false);
      }
    };

    const fetchSummary = async () => {
      try {
        const { data } = await api.get(`/attendance/${employeeId}/summary`);
        setSummary(data);
      } catch (err) {
        console.error(err);
      }
    };

    fetchEmployee();
    fetchSummary();
    fetchAttendance();
  }, [employeeId, fetchAttendance]);


  if (isLoadingEmployee) {
    return (
      <div className="flex justify-center items-center h-64">
        <span className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-4">
        <Button variant="ghost" onClick={() => navigate(ROUTES.EMPLOYEES)}>
          <ArrowLeft className="w-4 h-4 mr-2" /> Back to Employees
        </Button>
        <div className="rounded-lg bg-red-50 p-4 border border-red-200">
          <p className="text-sm text-red-800">{error}</p>
        </div>
      </div>
    );
  }

  const attendanceRate = summary && summary.total_records > 0
    ? Math.round((summary.total_present / summary.total_records) * 100)
    : 0;

  // Generate initials from full_name
  const initials = employee.full_name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <div className="space-y-6">
      {/* Back button */}
      <Button variant="ghost" onClick={() => navigate(ROUTES.EMPLOYEES)} className="text-gray-600">
        <ArrowLeft className="w-4 h-4 mr-2" /> Back to Employees
      </Button>

      {/* Profile Header */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="h-24 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600" />
        <div className="px-6 pb-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-end gap-4">
            <div className="-mt-10 flex h-20 w-20 shrink-0 items-center justify-center rounded-full bg-white border-4 border-white shadow-lg text-2xl font-bold bg-gradient-to-br from-blue-500 to-indigo-600 text-white">
              {initials}
            </div>
            <div className="flex-1 pb-1">
              <h2 className="text-xl font-bold text-gray-900">{employee.full_name}</h2>
              <p className="text-sm text-gray-500">{employee.employee_id}</p>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="flex items-center gap-3 text-sm text-gray-600">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50">
                <Mail className="h-4 w-4 text-blue-600" />
              </div>
              <div>
                <p className="text-xs text-gray-400">Email</p>
                <p className="font-medium text-gray-900 truncate">{employee.email}</p>
              </div>
            </div>
            {employee.phone && (
              <div className="flex items-center gap-3 text-sm text-gray-600">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-green-50">
                  <Phone className="h-4 w-4 text-green-600" />
                </div>
                <div>
                  <p className="text-xs text-gray-400">Phone</p>
                  <p className="font-medium text-gray-900">{employee.phone}</p>
                </div>
              </div>
            )}
            <div className="flex items-center gap-3 text-sm text-gray-600">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-purple-50">
                <Briefcase className="h-4 w-4 text-purple-600" />
              </div>
              <div>
                <p className="text-xs text-gray-400">Department</p>
                <p className="font-medium text-gray-900">{employee.department}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 text-sm text-gray-600">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-amber-50">
                <CalendarIcon className="h-4 w-4 text-amber-600" />
              </div>
              <div>
                <p className="text-xs text-gray-400">Joined</p>
                <p className="font-medium text-gray-900">
                  {employee.created_at ? format(new Date(employee.created_at), 'MMM d, yyyy') : '—'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Attendance Summary Cards */}
      {summary && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          <div className="relative overflow-hidden rounded-xl bg-white border border-gray-200 shadow-sm p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Total Present</p>
                <p className="mt-1 text-3xl font-bold text-gray-900">{summary.total_present}</p>
              </div>
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-green-50">
                <CheckCircle2 className="h-6 w-6 text-green-600" />
              </div>
            </div>
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-green-400 to-green-600" />
          </div>

          <div className="relative overflow-hidden rounded-xl bg-white border border-gray-200 shadow-sm p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Total Absent</p>
                <p className="mt-1 text-3xl font-bold text-gray-900">{summary.total_absent}</p>
              </div>
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-red-50">
                <XCircle className="h-6 w-6 text-red-600" />
              </div>
            </div>
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-red-400 to-red-600" />
          </div>

          <div className="relative overflow-hidden rounded-xl bg-white border border-gray-200 shadow-sm p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Attendance Rate</p>
                <p className="mt-1 text-3xl font-bold text-gray-900">{attendanceRate}%</p>
              </div>
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-50">
                <PercentCircle className="h-6 w-6 text-indigo-600" />
              </div>
            </div>
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-indigo-400 to-indigo-600" />
          </div>
        </div>
      )}

      {/* Attendance Records */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 bg-gray-50">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
            <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider">Attendance Records</h3>
          </div>
        </div>

        {isLoadingAttendance ? (
          <div className="py-12 flex justify-center">
            <span className="h-6 w-6 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
          </div>
        ) : attendance.length === 0 ? (
          <div className="py-12 text-center text-sm text-gray-500">
            <CalendarIcon className="mx-auto h-8 w-8 text-gray-300 mb-2" />
            No attendance records found.
          </div>
        ) : (
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {attendance.map((record) => (
                <tr key={record._id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-3 text-sm font-medium text-gray-900">
                    <div className="flex items-center gap-2">
                      <CalendarIcon className="w-4 h-4 text-gray-400" />
                      {format(new Date(record.date), 'MMMM d, yyyy')}
                    </div>
                  </td>
                  <td className="px-6 py-3 text-right">
                    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                      record.status === 'Present'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {record.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
