import { useMemo, useState, useEffect } from 'react';
import { Users, Briefcase, CheckCircle2, XCircle, CalendarCheck } from 'lucide-react';
import api from '../api/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';

export default function Dashboard() {
  const [summary, setSummary] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const dateLabel = useMemo(() => {
    try {
      return new Intl.DateTimeFormat(undefined, { weekday: 'long', month: 'short', day: 'numeric' }).format(new Date());
    } catch {
      return '';
    }
  }, []);

  const formatDate = useMemo(() => {
    return (value) => {
      const d = new Date(value);
      if (Number.isNaN(d.getTime())) return String(value ?? '');
      return new Intl.DateTimeFormat(undefined, { month: 'short', day: 'numeric' }).format(d);
    };
  }, []);

  useEffect(() => {
    const fetchSummary = async () => {
      try {
        const { data } = await api.get('/dashboard/summary');
        setSummary(data);
      } catch (err) {
        setError('Failed to load dashboard data.');
      } finally {
        setIsLoading(false);
      }
    };
    fetchSummary();
  }, []);

  const safeSummary = summary ?? {
    total_employees: 0,
    total_departments: 0,
    today_present: 0,
    today_absent: 0,
    department_counts: [],
    recent_records: [],
  };

  const {
    total_employees: totalEmployees,
    total_departments: totalDepartments,
    today_present: todayPresent,
    today_absent: todayAbsent,
    department_counts: departmentCounts,
    recent_records: recentRecords,
  } = safeSummary;

  const todayTotal = todayPresent + todayAbsent;
  const attendanceRate = todayTotal > 0 ? Math.round((todayPresent / todayTotal) * 100) : 0;

  const statCards = useMemo(() => ([
    { label: 'Total Employees', value: totalEmployees, icon: Users, hint: 'All active employees' },
    { label: 'Departments', value: totalDepartments, icon: Briefcase, hint: 'Teams & functions' },
    { label: 'Present Today', value: todayPresent, icon: CheckCircle2, hint: 'Checked-in staff' },
    { label: 'Absent Today', value: todayAbsent, icon: XCircle, hint: 'Not marked present' },
  ]), [totalDepartments, totalEmployees, todayAbsent, todayPresent]);

  const departmentChart = useMemo(() => {
    const rows = Array.isArray(departmentCounts) ? departmentCounts : [];
    const max = rows.reduce((acc, r) => Math.max(acc, Number(r?.count ?? 0)), 0);
    const chartColors = ['bg-chart-1', 'bg-chart-2', 'bg-chart-3', 'bg-chart-4', 'bg-chart-5'];
    return {
      max,
      rows: rows
        .slice()
        .sort((a, b) => Number(b?.count ?? 0) - Number(a?.count ?? 0))
        .map((r, idx) => ({
          department: r?.department ?? 'Unknown',
          count: Number(r?.count ?? 0),
          colorClass: chartColors[idx % chartColors.length],
          ratio: max > 0 ? Math.min(1, Number(r?.count ?? 0) / max) : 0,
        })),
    };
  }, [departmentCounts]);

  if (isLoading) {
    return (
      <div className="space-y-8">
        <div>
          <Skeleton className="h-8 w-48 mb-2" />
          <Skeleton className="h-4 w-64" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-32 w-full rounded-xl" />)}
        </div>
        <Skeleton className="h-24 w-full rounded-xl" />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Skeleton className="h-80 w-full rounded-xl" />
          <Skeleton className="h-80 w-full rounded-xl" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <Card className="border-destructive/50 bg-destructive/10">
        <CardContent className="pt-6">
          <p className="text-sm text-destructive font-medium">{error}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-foreground">Dashboard</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            {dateLabel ? `${dateLabel} · ` : ''}Your HRMS at a glance.
          </p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {statCards.map((card) => (
          <Card key={card.label} className="border-border/50 transition-all hover:shadow-md">
            <CardContent className="p-6">
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <p className="text-sm font-medium text-muted-foreground">{card.label}</p>
                  <p className="mt-2 text-3xl font-bold tabular-nums">{card.value}</p>
                  <p className="mt-1 text-xs text-muted-foreground">{card.hint}</p>
                </div>
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <card.icon className="h-6 w-6" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Department Breakdown */}
        <Card className="border-border/50 col-span-1 border">
          <CardHeader className="bg-muted/50 py-4 px-6 border-b">
            <CardTitle className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Department Breakdown</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            {departmentChart.rows.length === 0 ? (
              <div className="py-10 text-center text-sm text-muted-foreground">No departments found.</div>
            ) : (
              <div className="space-y-4">
                {departmentChart.rows.slice(0, 8).map((dept) => (
                  <div key={dept.department} className="space-y-2">
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-sm font-medium truncate">{dept.department}</p>
                      <Badge variant="secondary" className="pointer-events-none tabular-nums">
                        {dept.count}
                      </Badge>
                    </div>
                    <div className="h-2 w-full rounded-full bg-secondary overflow-hidden">
                      <div
                        className={`h-full rounded-full ${dept.colorClass} opacity-80`}
                        style={{ width: `${Math.round(dept.ratio * 100)}%` }}
                      />
                    </div>
                  </div>
                ))}
                {departmentChart.rows.length > 8 && (
                  <p className="pt-1 text-xs text-muted-foreground">
                    Showing top 8 of {departmentChart.rows.length} departments.
                  </p>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Attendance Records */}
        <Card className="border-border/50 col-span-1 border">
          <CardHeader className="bg-muted/50 py-4 px-6 border-b">
            <CardTitle className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Recent Attendance</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {recentRecords.length === 0 ? (
              <div className="p-8 text-center text-sm text-muted-foreground flex flex-col items-center">
                <CalendarCheck className="h-8 w-8 text-muted/60 mb-2" />
                No records yet.
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent">
                    <TableHead className="px-6 h-10">Employee</TableHead>
                    <TableHead className="px-6 h-10">Date</TableHead>
                    <TableHead className="px-6 h-10 text-right">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recentRecords.map((record) => (
                    <TableRow key={record._id} className="border-b/50">
                      <TableCell className="px-6 font-medium">{record.employee_id}</TableCell>
                      <TableCell className="px-6 text-muted-foreground">{formatDate(record.date)}</TableCell>
                      <TableCell className="px-6 text-right">
                        <Badge 
                          variant={record.status === 'Present' ? 'default' : 'destructive'}
                          className={record.status === 'Present'
                            ? 'bg-primary/10 text-primary hover:bg-primary/15 border-border pointer-events-none shadow-none'
                            : 'bg-destructive/10 text-destructive hover:bg-destructive/15 border-destructive/30 pointer-events-none shadow-none'
                          }
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
  );
}
