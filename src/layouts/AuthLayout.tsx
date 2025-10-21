import { Outlet } from 'react-router-dom';

const AuthLayout = () => {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-primary-500 via-primary-600 to-secondary-600 dark:from-gray-800 dark:via-gray-900 dark:to-gray-950 px-4 py-12">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold text-white">Learning Platform</h1>
          <p className="mt-2 text-primary-100 dark:text-gray-300">AI-Powered Homework Helper</p>
        </div>
        <div className="rounded-2xl bg-white dark:bg-gray-800 p-8 shadow-2xl">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;
