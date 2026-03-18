import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft, Mail, Phone, Briefcase, Calendar as CalendarIcon,
  CheckCircle2, XCircle, PercentCircle, IdCard
} from 'lucide-react';
import { format } from 'date-fns';
import api from '../api/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
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
      <div className="flex">
        <Button
          variant="ghost"
          onClick={() => navigate(ROUTES.EMPLOYEES)}
          className="w-fit text-muted-foreground hover:text-foreground cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4 mr-2" /> Back to Employees
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[360px_1fr]">
        {/* Profile */}
        <Card className="border-border/50 overflow-hidden">
          <CardContent className="px-6 py-6">
            <div className="flex items-center gap-4">
              <Avatar size="lg" className="size-20 ring-4 ring-background shadow-sm">
                <AvatarFallback className="text-lg font-semibold text-foreground bg-muted">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0 pb-1">
                <h2 className="truncate text-2xl font-bold tracking-tight text-foreground">
                  {employee.full_name}
                </h2>
              </div>
            </div>

            <Separator className="my-5" />

            <div className="space-y-4">
              <div className="grid grid-cols-1 gap-3">
                <div className="flex items-start gap-3 rounded-lg border border-border/60 bg-muted/30 p-3">
                  <div className="mt-0.5 flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10">
                    <Mail className="h-4 w-4 text-primary" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-medium text-muted-foreground">Email</p>
                    <a
                      className="mt-0.5 block truncate text-sm font-medium text-foreground hover:underline underline-offset-4"
                      href={`mailto:${employee.email}`}
                      title={employee.email}
                    >
                      {employee.email}
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-3 rounded-lg border border-border/60 bg-muted/30 p-3">
                  <div className="mt-0.5 flex h-9 w-9 items-center justify-center rounded-lg bg-secondary">
                    <Briefcase className="h-4 w-4 text-foreground" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-medium text-muted-foreground">Department</p>
                    <p className="mt-0.5 truncate text-sm font-medium text-foreground">
                      {employee.department}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 rounded-lg border border-border/60 bg-muted/30 p-3">
                  <div className="mt-0.5 flex h-9 w-9 items-center justify-center rounded-lg bg-muted">
                    <IdCard className="h-4 w-4 text-foreground" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-medium text-muted-foreground">Employee ID</p>
                    <p className="mt-0.5 truncate text-sm font-medium text-foreground">
                      {employee.employee_id}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 rounded-lg border border-border/60 bg-muted/30 p-3">
                  <div className="mt-0.5 flex h-9 w-9 items-center justify-center rounded-lg bg-muted">
                    <CalendarIcon className="h-4 w-4 text-foreground" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-medium text-muted-foreground">Joined</p>
                    <p className="mt-0.5 truncate text-sm font-medium text-foreground">
                      {employee.created_at ? format(new Date(employee.created_at), 'MMM d, yyyy') : '—'}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 rounded-lg border border-border/60 bg-muted/30 p-3">
                  <div className="mt-0.5 flex h-9 w-9 items-center justify-center rounded-lg bg-muted">
                    <Phone className="h-4 w-4 text-foreground" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-medium text-muted-foreground">Phone</p>
                    {employee.phone ? (
                      <a
                        className="mt-0.5 block truncate text-sm font-medium text-foreground hover:underline underline-offset-4"
                        href={`tel:${employee.phone}`}
                        title={employee.phone}
                      >
                        {employee.phone}
                      </a>
                    ) : (
                      <p className="mt-0.5 text-sm font-medium text-muted-foreground">—</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Attendance */}
        <div className="space-y-6">
          <Card className="border-border/50 gap-0!">
            <CardHeader className="py-4 px-6 border-b bg-muted/30">
              <CardTitle className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                Attendance summary
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              {!summary ? (
                <div className="text-sm text-muted-foreground">No summary available.</div>
              ) : (
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                  <div className="rounded-xl border border-border/60 bg-card p-4">
                    <div className="flex items-center justify-between gap-4">
                      <div>
                        <p className="text-xs font-medium text-muted-foreground">Total Present</p>
                        <p className="mt-2 text-3xl font-bold text-foreground">{summary.total_present}</p>
                      </div>
                      <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10">
                        <CheckCircle2 className="h-5 w-5 text-primary" />
                      </div>
                    </div>
                  </div>

                  <div className="rounded-xl border border-border/60 bg-card p-4">
                    <div className="flex items-center justify-between gap-4">
                      <div>
                        <p className="text-xs font-medium text-muted-foreground">Total Absent</p>
                        <p className="mt-2 text-3xl font-bold text-foreground">{summary.total_absent}</p>
                      </div>
                      <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-destructive/10">
                        <XCircle className="h-5 w-5 text-destructive" />
                      </div>
                    </div>
                  </div>

                  <div className="rounded-xl border border-border/60 bg-card p-4">
                    <div className="flex items-center justify-between gap-4">
                      <div>
                        <p className="text-xs font-medium text-muted-foreground">Attendance Rate</p>
                        <p className="mt-2 text-3xl font-bold text-foreground">{attendanceRate}%</p>
                      </div>
                      <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-secondary">
                        <PercentCircle className="h-5 w-5 text-foreground" />
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="border-border/50 gap-0!">
            <CardHeader className="py-4 px-6 border-b bg-muted/30">
              <CardTitle className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                Attendance records
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {isLoadingAttendance ? (
                <div className="py-12 flex justify-center">
                  <span className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                </div>
              ) : attendance.length === 0 ? (
                <div className="py-12 text-center text-sm text-muted-foreground flex flex-col items-center">
                  <CalendarIcon className="h-8 w-8 text-muted-foreground/60 mb-2" />
                  No attendance records found.
                </div>
              ) : (
                <Table>
                  <TableHeader className="bg-muted/20">
                    <TableRow className="hover:bg-transparent">
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
                            variant={record.status === 'Present' ? 'secondary' : 'destructive'}
                            className="pointer-events-none shadow-none"
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
      </div>
    </div>
  );
}
