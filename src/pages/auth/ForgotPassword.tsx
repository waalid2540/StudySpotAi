import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, Key, Lock } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../../contexts/AuthContext';

const ForgotPassword = () => {
  const { forgotPassword, resetPassword } = useAuth();
  const [step, setStep] = useState<'email' | 'code'>('email');
  const [email, setEmail] = useState('');
  const [resetCode, setResetCode] = useState('');
  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRequestCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const generatedCode = await forgotPassword(email);
      setResetCode(generatedCode);
      setStep('code');
      toast.success('Reset code generated! Copy the code below.');
    } catch (error: any) {
      console.error('Forgot password error:', error);
      toast.error(error.message || 'Failed to generate reset code');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (newPassword !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    if (newPassword.length < 8) {
      toast.error('Password must be at least 8 characters');
      return;
    }

    setLoading(true);

    try {
      await resetPassword(email, code, newPassword);
      toast.success('Password reset successfully! Please login with your new password.');
      // Redirect to login after 2 seconds
      setTimeout(() => {
        window.location.href = '/login';
      }, 2000);
    } catch (error: any) {
      console.error('Reset password error:', error);
      toast.error(error.message || 'Failed to reset password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Reset Password</h2>
      <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
        {step === 'email'
          ? 'Enter your email to receive a reset code'
          : 'Enter the code and your new password'}
      </p>

      {step === 'email' ? (
        <form onSubmit={handleRequestCode} className="mt-8 space-y-6">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Email <span className="text-red-500">*</span>
            </label>
            <div className="relative mt-1">
              <Mail className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
              <input
                id="email"
                name="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white py-2 pl-10 pr-4 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-200"
                placeholder="you@example.com"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-gradient-to-r from-primary-500 to-secondary-500 py-3 font-semibold text-white shadow-lg transition hover:shadow-xl disabled:opacity-50"
          >
            {loading ? 'Generating Code...' : 'Get Reset Code'}
          </button>
        </form>
      ) : (
        <form onSubmit={handleResetPassword} className="mt-8 space-y-6">
          {/* Display the reset code */}
          <div className="rounded-lg bg-primary-50 dark:bg-primary-900/20 border-2 border-primary-500 p-4">
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Your Reset Code (valid for 10 minutes):
            </p>
            <p className="text-3xl font-bold text-primary-600 dark:text-primary-400 tracking-wider text-center">
              {resetCode}
            </p>
          </div>

          <div>
            <label htmlFor="code" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Enter Reset Code <span className="text-red-500">*</span>
            </label>
            <div className="relative mt-1">
              <Key className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
              <input
                id="code"
                name="code"
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                required
                maxLength={6}
                className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white py-2 pl-10 pr-4 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-200"
                placeholder="123456"
              />
            </div>
          </div>

          <div>
            <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              New Password <span className="text-red-500">*</span>
            </label>
            <div className="relative mt-1">
              <Lock className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
              <input
                id="newPassword"
                name="newPassword"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                minLength={8}
                className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white py-2 pl-10 pr-4 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-200"
                placeholder="••••••••"
              />
            </div>
          </div>

          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Confirm Password <span className="text-red-500">*</span>
            </label>
            <div className="relative mt-1">
              <Lock className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                minLength={8}
                className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white py-2 pl-10 pr-4 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-200"
                placeholder="••••••••"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-gradient-to-r from-primary-500 to-secondary-500 py-3 font-semibold text-white shadow-lg transition hover:shadow-xl disabled:opacity-50"
          >
            {loading ? 'Resetting Password...' : 'Reset Password'}
          </button>
        </form>
      )}

      <p className="mt-6 text-center text-sm text-gray-600 dark:text-gray-400">
        Remember your password?{' '}
        <Link to="/login" className="font-medium text-primary-600 hover:text-primary-500">
          Back to Login
        </Link>
      </p>
    </div>
  );
};

export default ForgotPassword;
