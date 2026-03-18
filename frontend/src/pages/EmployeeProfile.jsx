import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft, Mail, Phone, Briefcase, Calendar as CalendarIcon,
  CheckCircle2, XCircle, PercentCircle
} from 'lucide-react';
import { format } from 'date-fns';
import api from '../api/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
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
      <div className="space-y-6">
        <Skeleton className="h-10 w-32" />
        <Skeleton className="h-[250px] w-full rounded-xl" />
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          <Skeleton className="h-[100px] w-full rounded-xl" />
          <Skeleton className="h-[100px] w-full rounded-xl" />
          <Skeleton className="h-[100px] w-full rounded-xl" />
        </div>
        <Skeleton className="h-[300px] w-full rounded-xl" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-4">
        <Button variant="ghost" onClick={() => navigate(ROUTES.EMPLOYEES)}>
          <ArrowLeft className="w-4 h-4 mr-2" /> Back to Employees
        </Button>
        <Card className="border-destructive/50 bg-destructive/10">
          <CardContent className="pt-6">
            <p className="text-sm text-destructive font-medium">{error}</p>
          </CardContent>
        </Card>
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
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Back button */}
      <Button variant="ghost" onClick={() => navigate(ROUTES.EMPLOYEES)} className="text-muted-foreground hover:text-foreground">
        <ArrowLeft className="w-4 h-4 mr-2" /> Back to Employees
      </Button>

      {/* Profile Header */}
      <Card className="overflow-hidden border-border/50">
        <div className="h-24 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600" />
        <CardContent className="px-6 pb-6 pt-0">
          <div className="flex flex-col sm:flex-row items-start sm:items-end gap-4">
            <div className="-mt-10 flex h-20 w-20 shrink-0 items-center justify-center rounded-full bg-background border-4 border-background shadow-lg text-2xl font-bold bg-gradient-to-br from-blue-500 to-indigo-600 text-white">
              {initials}
            </div>
            <div className="flex-1 pb-1">
              <h2 className="text-2xl font-bold text-foreground tracking-tight">{employee.full_name}</h2>
              <p className="text-sm text-muted-foreground font-medium">{employee.employee_id}</p>
            </div>
          </div>

          <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50 dark:bg-blue-900/20">
                <Mail className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              </div>
              <div className="overflow-hidden">
                <p className="text-xs text-muted-foreground">Email</p>
                <p className="text-sm font-medium text-foreground truncate" title={employee.email}>{employee.email}</p>
              </div>
            </div>
            {employee.phone && (
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-50 dark:bg-green-900/20">
                  <Phone className="h-4 w-4 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Phone</p>
                  <p className="text-sm font-medium text-foreground">{employee.phone}</p>
                </div>
              </div>
            )}
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-50 dark:bg-purple-900/20">
                <Briefcase className="h-4 w-4 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Department</p>
                <p className="text-sm font-medium text-foreground">{employee.department}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-50 dark:bg-amber-900/20">
                <CalendarIcon className="h-4 w-4 text-amber-600 dark:text-amber-400" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Joined</p>
                <p className="text-sm font-medium text-foreground">
                  {employee.created_at ? format(new Date(employee.created_at), 'MMM d, yyyy') : '—'}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Attendance Summary Cards */}
      {summary && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          <Card className="relative overflow-hidden border-border/50">
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Present</p>
                  <p className="mt-1 text-3xl font-bold">{summary.total_present}</p>
                </div>
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-green-50 dark:bg-green-900/20">
                  <CheckCircle2 className="h-6 w-6 text-green-600 dark:text-green-400" />
                </div>
              </div>
            </CardContent>
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-green-400 to-green-600" />
          </Card>

          <Card className="relative overflow-hidden border-border/50">
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Absent</p>
                  <p className="mt-1 text-3xl font-bold">{summary.total_absent}</p>
                </div>
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-red-50 dark:bg-red-900/20">
                  <XCircle className="h-6 w-6 text-red-600 dark:text-red-400" />
                </div>
              </div>
            </CardContent>
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-red-400 to-red-600" />
          </Card>

          <Card className="relative overflow-hidden border-border/50">
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Attendance Rate</p>
                  <p className="mt-1 text-3xl font-bold">{attendanceRate}%</p>
                </div>
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-50 dark:bg-indigo-900/20">
                  <PercentCircle className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
                </div>
              </div>
            </CardContent>
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-indigo-400 to-indigo-600" />
          </Card>
        </div>
      )}

      {/* Attendance Records */}
      <Card className="border-border/50">
        <CardHeader className="bg-muted/50 py-4 px-6 border-b">
          <CardTitle className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Attendance Records</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {isLoadingAttendance ? (
            <div className="py-12 flex justify-center">
              <span className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            </div>
          ) : attendance.length === 0 ? (
            <div className="py-12 text-center text-sm text-muted-foreground flex flex-col items-center">
              <CalendarIcon className="h-8 w-8 text-muted/60 mb-2" />
              No attendance records found.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="bg-transparent hover:bg-transparent">
                  <TableHead className="px-6 h-10">Date</TableHead>
                  <TableHead className="px-6 h-10 text-right">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {attendance.map((record) => (
                  <TableRow key={record._id} className="border-b/50">
                    <TableCell className="px-6 font-medium">
                      <div className="flex items-center gap-2">
                        <CalendarIcon className="w-4 h-4 text-muted-foreground" />
                        {format(new Date(record.date), 'MMMM d, yyyy')}
                      </div>
                    </TableCell>
                    <TableCell className="px-6 text-right">
                      <Badge 
                        variant={record.status === 'Present' ? 'default' : 'destructive'}
                        className={record.status === 'Present' ? 'bg-green-500/15 text-green-700 dark:bg-green-500/20 dark:text-green-400 pointer-events-none shadow-none hover:bg-green-500/25 border-green-200 dark:border-green-900' : 'pointer-events-none shadow-none'}
                      >
                        {record.status}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
