import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Trash2, Eye, Mail, Briefcase, Loader2 } from 'lucide-react';
import api from '../api/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { ROUTES } from '../constants/routes';

export default function Employees() {
  const navigate = useNavigate();
  const [employees, setEmployees] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [departments, setDepartments] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [employeeToDelete, setEmployeeToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const [formData, setFormData] = useState({
    employee_id: '',
    full_name: '',
    email: '',
    phone: '',
    department: '',
  });
  const [formError, setFormError] = useState('');

  useEffect(() => {
    fetchEmployees();
    fetchDepartments();
  }, []);

  const fetchDepartments = async () => {
    try {
      const { data } = await api.get('/departments/');
      setDepartments(data);
    } catch (err) {
      console.error("Failed to fetch departments", err);
    }
  };

  const fetchEmployees = async () => {
    try {
      setIsLoading(true);
      const { data } = await api.get('/employees/');
      setEmployees(data);
      setError(null);
    } catch (err) {
      setError('Failed to fetch employees. Please check your connection.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setFormError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Javascript validation only for custom logic that HTML regex cannot handle (Duplication Check)
    if (employees.some((emp) => emp.employee_id === formData.employee_id)) {
      setFormError('This Employee ID is already taken. Please choose another one.');
      return;
    }

    if (formData.phone && employees.some((emp) => emp.phone === formData.phone)) {
      setFormError('This Phone Number is already registered to another employee.');
      return;
    }

    setFormError('');
    setIsSubmitting(true);

    try {
      await api.post('/employees/', formData);
      setIsModalOpen(false);
      setFormData({ employee_id: '', full_name: '', email: '', phone: '', department: '' });
      fetchEmployees();
    } catch (err) {
      if (err.response?.data?.detail) {
        setFormError(err.response.data.detail);
      } else {
        setFormError('An error occurred while adding the employee.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const confirmDelete = (employee) => {
    setEmployeeToDelete(employee);
    setIsDeleteModalOpen(true);
  };

  const handleDelete = async () => {
    if (!employeeToDelete) return;
    
    setIsDeleting(true);
    try {
      await api.delete(`/employees/${employeeToDelete.employee_id}`);
      setEmployees((prev) => prev.filter((emp) => emp.employee_id !== employeeToDelete.employee_id));
      setIsDeleteModalOpen(false);
      setEmployeeToDelete(null);
    } catch (err) {
      setError('Failed to delete employee. Please try again.');
      console.error(err);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-foreground">Employees</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Manage your company's workforce and departments.
          </p>
        </div>
        <Button onClick={() => setIsModalOpen(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Add Employee
        </Button>
      </div>

      {error ? (
        <Card className="border-destructive/50 bg-destructive/10">
          <CardContent className="pt-6">
            <p className="text-sm text-destructive font-medium">{error}</p>
          </CardContent>
        </Card>
      ) : isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3, 4, 5].map(i => <Skeleton key={i} className="h-16 w-full rounded-xl" />)}
        </div>
      ) : employees.length === 0 ? (
        <div className="text-center py-16 px-4 rounded-xl border-2 border-dashed border-border bg-card">
          <Briefcase className="mx-auto h-12 w-12 text-muted-foreground/50" />
          <h3 className="mt-2 text-sm font-semibold text-foreground">No employees</h3>
          <p className="mt-1 text-sm text-muted-foreground">Get started by adding a new employee.</p>
          <div className="mt-6">
            <Button onClick={() => setIsModalOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Add Employee
            </Button>
          </div>
        </div>
      ) : (
        <Card className="border-border/50">
          <CardContent className="p-0">
            <Table>
              <TableHeader className="bg-muted/50">
                <TableRow className="hover:bg-transparent">
                  <TableHead className="px-6 h-12">Employee ID</TableHead>
                  <TableHead className="px-6 h-12">Name</TableHead>
                  <TableHead className="px-6 h-12">Department</TableHead>
                  <TableHead className="px-6 h-12 text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {employees.map((employee) => (
                  <TableRow key={employee._id} className="border-b/50">
                    <TableCell className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      {employee.employee_id}
                    </TableCell>
                    <TableCell className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium">{employee.full_name}</div>
                      <div className="flex flex-col gap-1 mt-1 text-sm text-muted-foreground">
                        <div className="flex items-center">
                          <Mail className="w-3 h-3 mr-1.5" />
                          {employee.email}
                        </div>
                        {employee.phone && (
                          <div className="flex items-center">
                            <span className="w-3 h-3 mr-1.5 flex items-center justify-center text-[10px]">📞</span>
                            {employee.phone}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="px-6 py-4 whitespace-nowrap">
                      <Badge variant="secondary" className="px-2 py-0.5 pointer-events-none">
                        {employee.department}
                      </Badge>
                    </TableCell>
                    <TableCell className="px-6 py-4 whitespace-nowrap text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          onClick={() => navigate(ROUTES.employeeProfile(employee.employee_id))}
                          className="text-primary hover:text-primary hover:bg-primary/10"
                          title="View Profile"
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          onClick={() => confirmDelete(employee)}
                          className="text-destructive hover:text-destructive hover:bg-destructive/10"
                          title="Delete Employee"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add New Employee</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4 pt-2">
            {formError && (
              <div className="p-3 text-sm text-destructive bg-destructive/10 rounded-lg border border-destructive/20">
                {formError}
              </div>
            )}
            
            <div className="space-y-2">
              <Label htmlFor="employee_id">Employee ID</Label>
              <Input
                id="employee_id"
                name="employee_id"
                value={formData.employee_id}
                onChange={handleInputChange}
                placeholder="e.g. EMP001"
                required
                pattern="^EMP\d+$"
                title="ID must start with EMP followed by numbers (e.g., EMP001)"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="full_name">Full Name</Label>
              <Input
                id="full_name"
                name="full_name"
                value={formData.full_name}
                onChange={handleInputChange}
                placeholder="John Doe"
                required
                minLength={2}
                maxLength={100}
                pattern="^[A-Za-z\s]+$"
                title="Full name must contain only letters and spaces (2-100 characters)"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="john@company.com"
                maxLength={100}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="department">Department</Label>
              <Select 
                name="department" 
                value={formData.department} 
                onValueChange={(val) => handleInputChange({ target: { name: 'department', value: val }})}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select Department" />
                </SelectTrigger>
                <SelectContent>
                  {departments.map((opt) => (
                    <SelectItem key={opt} value={opt}>{opt}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                placeholder="e.g. +1234567890"
                required
                pattern="^\+?[0-9]{10,15}$"
                title="Phone number must be exactly 10-15 digits, optionally starting with +"
              />
            </div>
            
            <DialogFooter className="mt-6 pt-4 border-t">
              <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Add Employee
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Delete Employee</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete <strong>{employeeToDelete?.full_name}</strong>? This action will also delete all of their attendance records and cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-4 pt-4 border-t">
            <Button type="button" variant="outline" onClick={() => setIsDeleteModalOpen(false)}>
              Cancel
            </Button>
            <Button type="button" variant="destructive" onClick={handleDelete} disabled={isDeleting}>
              {isDeleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Delete Employee
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
