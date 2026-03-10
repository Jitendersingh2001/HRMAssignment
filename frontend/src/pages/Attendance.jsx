import { useState, useEffect, useCallback } from 'react';
import { Search, Calendar as CalendarIcon, CheckCircle2, XCircle, X } from 'lucide-react';
import { format } from 'date-fns';
import api from '../api/client';
import { Button, Input } from '../components/ui';

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
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [isFiltered, setIsFiltered] = useState(false);

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
    if (startDate || endDate) {
      setIsFiltered(true);
      fetchGlobalAttendance(startDate, endDate);
    } else {
      setIsFiltered(false);
      fetchGlobalAttendance();
    }
  }, [startDate, endDate, fetchGlobalAttendance]);

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
    setStartDate('');
    setEndDate('');
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

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Attendance Tracker</h2>
        <p className="mt-1 text-sm text-gray-500">
          Mark daily attendance and view historical records.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Employee Selection */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden lg:col-span-1 flex flex-col h-[600px]">
          <div className="p-4 border-b border-gray-100 bg-gray-50">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input 
                className="pl-9 bg-white" 
                placeholder="Search employees..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
          
          <div className="flex-1 overflow-y-auto">
            {isLoadingEmployees ? (
              <div className="flex justify-center items-center h-full">
                <span className="h-6 w-6 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
              </div>
            ) : filteredEmployees.length === 0 ? (
              <div className="p-6 text-center text-gray-500 text-sm">
                No employees found.
              </div>
            ) : (
              <ul className="divide-y divide-gray-100">
                {filteredEmployees.map((emp) => (
                  <li key={emp._id}>
                    <button
                      onClick={() => setSelectedEmployee(emp.employee_id)}
                      className={`w-full text-left px-4 py-3 hover:bg-gray-50 transition-colors ${
                        selectedEmployee === emp.employee_id ? 'bg-blue-50/50 border-l-4 border-blue-600' : 'border-l-4 border-transparent'
                      }`}
                    >
                      <div className="font-medium text-sm text-gray-900">{emp.full_name}</div>
                      <div className="text-xs text-gray-500 mt-0.5">{emp.employee_id} • {emp.department}</div>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        {/* Right Column: Mark Attendance & Global Records */}
        <div className="lg:col-span-2 space-y-6">
           {selectedEmployee ? (
             <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      {employees.find(e => e.employee_id === selectedEmployee)?.full_name}
                    </h3>
                    <p className="text-sm text-gray-500">Record attendance for today</p>
                  </div>
                  <div className="flex gap-2 w-full sm:w-auto">
                    <Button 
                      onClick={() => handleMarkAttendance('Present')}
                      isLoading={isMarking}
                      className="flex-1 sm:flex-none border-green-200 bg-green-50 text-green-700 hover:bg-green-100 hover:border-green-300"
                    >
                      <CheckCircle2 className="w-4 h-4 mr-2" />
                      Present
                    </Button>
                    <Button 
                      onClick={() => handleMarkAttendance('Absent')}
                      isLoading={isMarking}
                      className="flex-1 sm:flex-none border-red-200 bg-red-50 text-red-700 hover:bg-red-100 hover:border-red-300"
                    >
                      <XCircle className="w-4 h-4 mr-2" />
                      Absent
                    </Button>
                  </div>
                </div>

                {error && (
                  <div className="mt-4 p-3 text-sm text-red-600 bg-red-50 rounded-lg border border-red-100">
                    {error}
                  </div>
                )}
             </div>
           ) : (
             <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 text-center text-gray-500 text-sm">
                Select an employee from the left panel to mark their attendance for today.
             </div>
           )}

           {/* Global Attendance Table */}
           <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-100 bg-gray-50">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider">Attendance Records</h3>
                  
                  {/* Date Filters */}
                  <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-lg p-1 shadow-sm">
                    <Input
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      className="w-[130px] text-xs !py-1.5 border-0 focus:ring-0 bg-transparent"
                    />
                    <span className="text-xs font-semibold text-gray-400 px-1">to</span>
                    <Input
                      type="date"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      className="w-[130px] text-xs !py-1.5 border-0 focus:ring-0 bg-transparent"
                    />
                    {isFiltered && (
                      <button 
                        onClick={handleClearFilter} 
                        className="p-1.5 mr-0.5 text-gray-400 hover:text-gray-600 rounded-md hover:bg-gray-100 transition-colors flex items-center justify-center title='Clear filters'"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="p-0">
                {isLoadingRecords ? (
                   <div className="py-12 flex justify-center">
                     <span className="h-6 w-6 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
                   </div>
                ) : attendanceRecords.length === 0 ? (
                  <div className="py-12 text-center text-sm text-gray-500">
                     <CalendarIcon className="mx-auto h-8 w-8 text-gray-300 mb-2" />
                     No attendance records found{isFiltered ? ' for the selected date range' : ''}.
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Employee</th>
                          <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {attendanceRecords.map((record) => (
                          <tr key={record._id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                              <div className="flex items-center gap-2">
                                <CalendarIcon className="w-4 h-4 text-gray-400" />
                                {format(new Date(record.date), 'MMMM d, yyyy')}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                              {/* If backend doesn't return full name, fallback to employee_id */}
                              {record.employee_id}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
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
                  </div>
                )}
              </div>
           </div>
        </div>
      </div>
    </div>
  );
}
