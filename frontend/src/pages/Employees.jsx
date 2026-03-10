import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Trash2, Eye, Mail, Briefcase } from 'lucide-react';
import api from '../api/client';
import { Button, Input, Modal, Select } from '../components/ui';
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
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Employees</h2>
          <p className="mt-1 text-sm text-gray-500">
            Manage your company's workforce and departments.
          </p>
        </div>
        <Button onClick={() => setIsModalOpen(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Add Employee
        </Button>
      </div>

      {error ? (
        <div className="rounded-lg bg-red-50 p-4 border border-red-200">
          <p className="text-sm text-red-800">{error}</p>
        </div>
      ) : isLoading ? (
        <div className="flex justify-center items-center h-64">
           <span className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
        </div>
      ) : employees.length === 0 ? (
        <div className="text-center py-16 px-4 rounded-xl border-2 border-dashed border-gray-200 bg-white">
          <Briefcase className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-semibold text-gray-900">No employees</h3>
          <p className="mt-1 text-sm text-gray-500">Get started by adding a new employee.</p>
          <div className="mt-6">
            <Button onClick={() => setIsModalOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Add Employee
            </Button>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Employee ID</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Department</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {employees.map((employee) => (
                  <tr key={employee._id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {employee.employee_id}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{employee.full_name}</div>
                      <div className="flex flex-col gap-1 mt-1 text-sm text-gray-500">
                        <div className="flex items-center">
                          <Mail className="w-3 h-3 mr-1" />
                          {employee.email}
                        </div>
                        {employee.phone && (
                          <div className="flex items-center">
                            <span className="w-3 h-3 mr-1 flex items-center justify-center text-[10px]">📞</span>
                            {employee.phone}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex items-center rounded-md bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700 ring-1 ring-inset ring-blue-700/10">
                        {employee.department}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end gap-1">
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          onClick={() => navigate(ROUTES.employeeProfile(employee.employee_id))}
                          className="text-blue-600 hover:text-blue-900 hover:bg-blue-50"
                          title="View Profile"
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          onClick={() => confirmDelete(employee)}
                          className="text-red-600 hover:text-red-900 hover:bg-red-50"
                          title="Delete Employee"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Add New Employee"
      >
        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          {formError && (
            <div className="p-3 text-sm text-red-600 bg-red-50 rounded-lg border border-red-100">
              {formError}
            </div>
          )}
          
          <Input
            label="Employee ID"
            name="employee_id"
            value={formData.employee_id}
            onChange={handleInputChange}
            placeholder="e.g. EMP001"
            required
            pattern="^EMP\d+$"
            title="ID must start with EMP followed by numbers (e.g., EMP001)"
          />
          <Input
            label="Full Name"
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
          <Input
            label="Email Address"
            type="email"
            name="email"
            value={formData.email}
            onChange={handleInputChange}
            placeholder="john@company.com"
            maxLength={100}
            required
          />
          <Select
            label="Department"
            name="department"
            value={formData.department}
            onChange={handleInputChange}
            options={departments}
            required
            title="Please select a valid department"
          />
          <Input
            label="Phone Number"
            type="tel"
            name="phone"
            value={formData.phone}
            onChange={handleInputChange}
            placeholder="e.g. +1234567890"
            required
            pattern="^\+?[0-9]{10,15}$"
            title="Phone number must be exactly 10-15 digits, optionally starting with +"
          />
          
          <div className="mt-6 flex justify-end gap-3 border-t pt-4">
            <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" isLoading={isSubmitting}>
              Add Employee
            </Button>
          </div>
        </form>
      </Modal>

      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="Delete Employee"
      >
        <div className="pt-2">
          <p className="text-sm text-gray-500">
            Are you sure you want to delete <strong>{employeeToDelete?.full_name}</strong>? This action will also delete all of their attendance records and cannot be undone.
          </p>
          <div className="mt-6 flex justify-end gap-3 border-t pt-4">
            <Button type="button" variant="outline" onClick={() => setIsDeleteModalOpen(false)}>
              Cancel
            </Button>
            <Button type="button" variant="danger" onClick={handleDelete} isLoading={isDeleting}>
              Delete Employee
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
