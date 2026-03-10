export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  DASHBOARD: '/dashboard',
  EMPLOYEES: '/employees',
  EMPLOYEE_PROFILE: '/employees/:employeeId',
  ATTENDANCE: '/attendance',
  
  // Helper for dynamic generation
  employeeProfile: (employeeId) => `/employees/${employeeId}`,
};
