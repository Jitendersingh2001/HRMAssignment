import { useState, useEffect, useCallback, useMemo } from 'react';
import { Search, Calendar as CalendarIcon, CheckCircle2, XCircle, X, Loader2, ChevronDown } from 'lucide-react';
import { format } from 'date-fns';
import api from '../api/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';

export default function Attendance() {
  const [employees, setEmployees] = useState([]);
  const [selectedEmployee, setSelectedEmployee] = useState('');
  const [attendanceRecords, setAttendanceRecords] = useState([]);
  
  const [isLoadingEmployees, setIsLoadingEmployees] = useState(true);
  const [isLoadingRecords, setIsLoadingRecords] = useState(false);
  const [isMarking, setIsMarking] = useState(false);
  
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Date Filter State
  const [dateRange, setDateRange] = useState({ from: undefined, to: undefined });
  const [isFiltered, setIsFiltered] = useState(false);

  const startDateParam = useMemo(() => {
    if (!dateRange?.from) return '';
    return format(dateRange.from, 'yyyy-MM-dd');
  }, [dateRange?.from]);

  const endDateParam = useMemo(() => {
    if (!dateRange?.to) return '';
    return format(dateRange.to, 'yyyy-MM-dd');
  }, [dateRange?.to]);

  // Fetch all attendance globally (filtered by date)
  const fetchGlobalAttendance = useCallback(async (start, end) => {
    setIsLoadingRecords(true);
    try {
      const params = {};
      if (start) params.start_date = start;
      if (end) params.end_date = end;
      // Using the new global endpoint /api/attendance/
      const { data } = await api.get('/attendance/', { params });
      setAttendanceRecords(data);
    } catch (err) {
      console.error(err);
      setAttendanceRecords([]);
    } finally {
      setIsLoadingRecords(false);
    }
  }, []);

  // Fetch global attendance automatically when dates change (or on initial load)
  useEffect(() => {
    if (startDateParam || endDateParam) {
      setIsFiltered(true);
      fetchGlobalAttendance(startDateParam, endDateParam);
    } else {
      setIsFiltered(false);
      fetchGlobalAttendance();
    }
  }, [startDateParam, endDateParam, fetchGlobalAttendance]);

  // Fetch employees list for dropdown/selection
  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const { data } = await api.get('/employees/');
        setEmployees(data);
        if (data.length > 0) {
          setSelectedEmployee(data[0].employee_id);
        }
      } catch (err) {
        console.error(err);
        setError('Failed to load employees.');
      } finally {
        setIsLoadingEmployees(false);
      }
    };
    fetchEmployees();
  }, []);

  const handleClearFilter = () => {
    setDateRange({ from: undefined, to: undefined });
  };

  const handleMarkAttendance = async (status) => {
    if (!selectedEmployee) return;
    setIsMarking(true);
    setError(null);

    const today = format(new Date(), 'yyyy-MM-dd');
    
    try {
      const { data } = await api.post('/attendance/', {
        employee_id: selectedEmployee,
        date: today,
        status: status
      });
      // Add the new record to the top of the list
      setAttendanceRecords((prev) => [data, ...prev]);
    } catch (err) {
      if (err.response?.data?.detail) {
        setError(err.response.data.detail);
      } else {
        setError('Failed to mark attendance.');
      }
    } finally {
      setIsMarking(false);
    }
  };

  const filteredEmployees = employees.filter(emp => 
    emp.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    emp.employee_id.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const visibleAttendanceRecords = useMemo(() => {
    if (!selectedEmployee) return attendanceRecords;
    return attendanceRecords.filter((record) => record.employee_id === selectedEmployee);
  }, [attendanceRecords, selectedEmployee]);

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div>
        <h2 className="text-3xl font-bold tracking-tight text-foreground">Attendance Tracker</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Mark daily attendance and view historical records.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Employee Selection */}
        <Card className="border-border/50 lg:col-span-1 flex flex-col h-[600px] overflow-hidden">
          <CardHeader className="p-4 border-b bg-muted/30">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input 
                className="pl-9 bg-background" 
                placeholder="Search employees..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </CardHeader>
          
          <CardContent className="flex-1 overflow-y-auto p-0">
            {isLoadingEmployees ? (
              <div className="flex justify-center items-center h-full">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
              </div>
            ) : filteredEmployees.length === 0 ? (
              <div className="p-6 text-center text-muted-foreground text-sm">
                No employees found.
              </div>
            ) : (
              <ul className="divide-y divide-border/50">
                {filteredEmployees.map((emp) => (
                  <li key={emp._id}>
                    <button
                      onClick={() => setSelectedEmployee(emp.employee_id)}
                      className={`w-full text-left px-4 py-3 hover:bg-muted/50 transition-colors ${
                        selectedEmployee === emp.employee_id ? 'bg-primary/5 border-l-4 border-l-primary' : 'border-l-4 border-l-transparent'
                      }`}
                    >
                      <div className="font-medium text-sm text-foreground">{emp.full_name}</div>
                      <div className="text-xs text-muted-foreground mt-0.5">{emp.employee_id} • {emp.department}</div>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        {/* Right Column: Mark Attendance & Global Records */}
        <div className="lg:col-span-2 space-y-6">
           {selectedEmployee ? (
             <Card className="border-border/50">
                <CardContent className="p-6">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                      <h3 className="text-lg font-semibold text-foreground">
                        {employees.find(e => e.employee_id === selectedEmployee)?.full_name}
                      </h3>
                      <p className="text-sm text-muted-foreground">Record attendance for today</p>
                    </div>
                    <div className="flex gap-2 w-full sm:w-auto">
                      <Button 
                        onClick={() => handleMarkAttendance('Present')}
                        disabled={isMarking}
                        className="flex-1 sm:flex-none border-green-200 bg-green-50 text-green-700 hover:bg-green-100 hover:border-green-300 dark:bg-green-500/10 dark:text-green-400 dark:border-green-500/20 dark:hover:bg-green-500/20"
                        variant="outline"
                      >
                        {isMarking ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <CheckCircle2 className="w-4 h-4 mr-2" />}
                        Present
                      </Button>
                      <Button 
                        onClick={() => handleMarkAttendance('Absent')}
                        disabled={isMarking}
                        className="flex-1 sm:flex-none border-red-200 bg-red-50 text-red-700 hover:bg-red-100 hover:border-red-300 dark:bg-red-500/10 dark:text-red-400 dark:border-red-500/20 dark:hover:bg-red-500/20"
                        variant="outline"
                      >
                        {isMarking ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <XCircle className="w-4 h-4 mr-2" />}
                        Absent
                      </Button>
                    </div>
                  </div>

                  {error && (
                    <div className="mt-4 p-3 text-sm text-destructive bg-destructive/10 rounded-lg border border-destructive/20">
                      {error}
                    </div>
                  )}
                </CardContent>
             </Card>
           ) : (
             <Card className="border-border/50">
                <CardContent className="p-6 text-center text-muted-foreground text-sm">
                  Select an employee from the left panel to mark their attendance for today.
                </CardContent>
             </Card>
           )}

           {/* Global Attendance Table */}
           <Card className="border-border/50 overflow-hidden">
              <CardHeader className="px-6 py-4 border-b bg-muted/30">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <CardTitle className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Attendance Records</CardTitle>
                  
                  {/* Date Filters */}
                  <div className="flex items-center gap-2 bg-background border border-border rounded-lg p-1 shadow-sm">
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          data-empty={!dateRange?.from || !dateRange?.to}
                          className="w-[280px] sm:w-[320px] justify-between text-left font-normal data-[empty=true]:text-muted-foreground border-0 bg-transparent shadow-none hover:bg-muted/60"
                        >
                          {dateRange?.from ? (
                            dateRange?.to ? (
                              `${format(dateRange.from, 'PPP')} to ${format(dateRange.to, 'PPP')}`
                            ) : (
                              `${format(dateRange.from, 'PPP')} to End date`
                            )
                          ) : (
                            <span>Start date to End date</span>
                          )}
                          <ChevronDown className="h-4 w-4 opacity-70" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent
                        className="w-auto p-0 max-w-[calc(100vw-1rem)]"
                        side="bottom"
                        sideOffset={8}
                        align="end"
                      >
                        <Calendar
                          mode="range"
                          numberOfMonths={2}
                          defaultMonth={dateRange?.from}
                          selected={dateRange}
                          onSelect={(range) => setDateRange(range ?? { from: undefined, to: undefined })}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    {isFiltered && (
                      <button 
                        onClick={handleClearFilter} 
                        title="Clear filters"
                        className="p-1.5 mr-0.5 text-muted-foreground hover:text-foreground rounded-md hover:bg-muted transition-colors flex items-center justify-center"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="p-0">
                {isLoadingRecords ? (
                   <div className="py-12 flex justify-center">
                     <Loader2 className="h-6 w-6 animate-spin text-primary" />
                   </div>
                ) : visibleAttendanceRecords.length === 0 ? (
                  <div className="py-12 text-center text-sm text-muted-foreground">
                     <CalendarIcon className="mx-auto h-8 w-8 text-muted/50 mb-2" />
                     No attendance records found
                     {selectedEmployee ? ` for ${selectedEmployee}` : ''}
                     {isFiltered ? ' in the selected date range' : ''}.
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow className="hover:bg-transparent">
                        <TableHead className="px-6 h-10">Date</TableHead>
                        <TableHead className="px-6 h-10">Employee</TableHead>
                        <TableHead className="px-6 h-10 text-right">Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {visibleAttendanceRecords.map((record) => (
                        <TableRow key={record._id} className="border-b/50">
                          <TableCell className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                            <div className="flex items-center gap-2">
                              <CalendarIcon className="w-4 h-4" />
                              {format(new Date(record.date), 'MMMM d, yyyy')}
                            </div>
                          </TableCell>
                          <TableCell className="px-6 py-4 whitespace-nowrap text-sm font-medium text-foreground">
                            {/* If backend doesn't return full name, fallback to employee_id */}
                            {record.employee_id}
                          </TableCell>
                          <TableCell className="px-6 py-4 whitespace-nowrap text-right text-sm">
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
      </div>
    </div>
  );
}
