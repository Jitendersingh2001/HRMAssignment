import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Input } from '../components/ui';
import { Lock, User } from 'lucide-react';
import { ROUTES } from '../constants/routes';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    
    setTimeout(() => {
      if (username === 'admin' && password === 'admin123') {
        localStorage.setItem('hrms_auth', 'true');
        navigate(ROUTES.DASHBOARD);
      } else {
        setError('Invalid username or password');
        setIsLoading(false);
      }
    }, 800);
  };

  return (
    <div className="flex h-screen items-center justify-center bg-gray-50 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8 bg-white p-8 rounded-2xl shadow-xl border border-gray-100">
        <div className="text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-blue-100 mb-4">
            <User className="h-8 w-8 text-blue-600" />
          </div>
          <h2 className="text-3xl font-bold tracking-tight text-gray-900">
            HRMS Lite
          </h2>
          <p className="mt-2 text-sm text-gray-500">
            Sign in to access the employee management portal
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleLogin}>
          {error && (
            <div className="rounded-md bg-red-50 p-4 border border-red-200">
              <p className="text-sm text-red-800 text-center font-medium">{error}</p>
            </div>
          )}

          <div className="space-y-4">
            <Input
              label="Username"
              type="text"
              required
              value={username}
              onChange={(e) => {
                setUsername(e.target.value);
                setError('');
              }}
              placeholder="Enter your username"
            />
            <Input
              label="Password"
              type="password"
              required
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setError('');
              }}
              placeholder="••••••••"
            />
          </div>

          <Button type="submit" className="w-full" size="md" isLoading={isLoading}>
            Sign in
          </Button>
        </form>

        <div className="mt-8 rounded-xl bg-blue-50 p-4 border border-blue-100">
          <div className="flex items-center gap-2 mb-2 text-blue-800 font-semibold text-sm">
            <Lock className="w-4 h-4" />
            <span>Testing Credentials</span>
          </div>
          <div className="text-sm text-blue-900 space-y-1 bg-white p-3 rounded-lg border border-blue-100 shadow-sm font-mono">
            <p><span className="text-blue-500">Username:</span> admin</p>
            <p><span className="text-blue-500">Password:</span> admin123</p>
          </div>
        </div>
      </div>
    </div>
  );
}
