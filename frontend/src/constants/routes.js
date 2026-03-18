export const ROUTES = {
  HOME: '/',
  DASHBOARD: '/dashboard',
  EMPLOYEES: '/employees',
  EMPLOYEE_PROFILE: '/employees/:employeeId',
  ATTENDANCE: '/attendance',
  employeeProfile: (employeeId) => `/employees/${employeeId}`,
};
