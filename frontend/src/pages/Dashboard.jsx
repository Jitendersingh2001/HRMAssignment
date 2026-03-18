import { useState, useEffect } from 'react';
import { Users, Briefcase, CheckCircle2, XCircle, CalendarCheck, TrendingUp } from 'lucide-react';
import api from '../api/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';

export default function Dashboard() {
  const [summary, setSummary] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchSummary = async () => {
      try {
        const { data } = await api.get('/dashboard/summary');
        setSummary(data);
      } catch (err) {
        console.error(err);
        setError('Failed to load dashboard data.');
      } finally {
        setIsLoading(false);
      }
    };
    fetchSummary();
  }, []);

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

  const attendanceRate = summary.today_present + summary.today_absent > 0
    ? Math.round((summary.today_present / (summary.today_present + summary.today_absent)) * 100)
    : 0;

  const statCards = [
    {
      label: 'Total Employees',
      value: summary.total_employees,
      icon: Users,
      gradient: 'from-blue-500 to-blue-600',
      bgLight: 'bg-blue-50 dark:bg-blue-900/20',
      textColor: 'text-blue-700 dark:text-blue-400',
    },
    {
      label: 'Departments',
      value: summary.total_departments,
      icon: Briefcase,
      gradient: 'from-purple-500 to-purple-600',
      bgLight: 'bg-purple-50 dark:bg-purple-900/20',
      textColor: 'text-purple-700 dark:text-purple-400',
    },
    {
      label: 'Present Today',
      value: summary.today_present,
      icon: CheckCircle2,
      gradient: 'from-green-500 to-green-600',
      bgLight: 'bg-green-50 dark:bg-green-900/20',
      textColor: 'text-green-700 dark:text-green-400',
    },
    {
      label: 'Absent Today',
      value: summary.today_absent,
      icon: XCircle,
      gradient: 'from-red-500 to-red-600',
      bgLight: 'bg-red-50 dark:bg-red-900/20',
      textColor: 'text-red-700 dark:text-red-400',
    },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Overview of your HRMS at a glance.
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {statCards.map((card) => (
          <Card key={card.label} className="relative overflow-hidden border-border/50 transition-all hover:shadow-md">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">{card.label}</p>
                  <p className="mt-2 text-3xl font-bold">{card.value}</p>
                </div>
                <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${card.bgLight}`}>
                  <card.icon className={`h-6 w-6 ${card.textColor}`} />
                </div>
              </div>
            </CardContent>
            <div className={`absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r ${card.gradient}`} />
          </Card>
        ))}
      </div>

      {/* Attendance Rate Bar */}
      <Card className="border-border/50">
        <CardContent className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <TrendingUp className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h3 className="text-sm font-semibold">Today's Attendance Rate</h3>
              <p className="text-xs text-muted-foreground">{summary.today_present + summary.today_absent} records today</p>
            </div>
            <span className="ml-auto text-3xl font-bold">{attendanceRate}%</span>
          </div>
          <div className="h-3 w-full rounded-full bg-secondary overflow-hidden">
            <div
              className="h-full rounded-full bg-primary transition-all duration-1000 ease-out"
              style={{ width: `${attendanceRate}%` }}
            />
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Department Breakdown */}
        <Card className="border-border/50 col-span-1 border">
          <CardHeader className="bg-muted/50 py-4 px-6 border-b">
            <CardTitle className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Department Breakdown</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {summary.department_counts.length === 0 ? (
              <div className="p-8 text-center text-sm text-muted-foreground">No departments found.</div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent">
                    <TableHead className="px-6 h-10">Department</TableHead>
                    <TableHead className="px-6 h-10 text-right">Employees</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {summary.department_counts.map((dept) => (
                    <TableRow key={dept.department} className="border-b/50">
                      <TableCell className="px-6 font-medium">{dept.department}</TableCell>
                      <TableCell className="px-6 text-right">
                        <Badge variant="secondary" className="px-2.5 py-0.5 pointer-events-none">
                          {dept.count}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {/* Recent Attendance Records */}
        <Card className="border-border/50 col-span-1 border">
          <CardHeader className="bg-muted/50 py-4 px-6 border-b">
            <CardTitle className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Recent Attendance</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {summary.recent_records.length === 0 ? (
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
                  {summary.recent_records.map((record) => (
                    <TableRow key={record._id} className="border-b/50">
                      <TableCell className="px-6 font-medium">{record.employee_id}</TableCell>
                      <TableCell className="px-6 text-muted-foreground">{record.date}</TableCell>
                      <TableCell className="px-6 text-right">
                        <Badge 
                          variant={record.status === 'Present' ? 'default' : 'destructive'}
                          className={record.status === 'Present' ? 'bg-green-500/15 text-green-700 dark:bg-green-500/20 dark:text-green-400 hover:bg-green-500/25 border-green-200 dark:border-green-900 pointer-events-none shadow-none' : 'pointer-events-none shadow-none'}
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
