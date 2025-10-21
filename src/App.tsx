import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';

// Layouts
import MainLayout from './layouts/MainLayout';
import AuthLayout from './layouts/AuthLayout';

// Route Guards
import ProtectedRoute from './components/ProtectedRoute';
import PublicRoute from './components/PublicRoute';

// Pages
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import StudentDashboard from './pages/student/Dashboard';
import ParentDashboard from './pages/parent/Dashboard';
import ParentChildren from './pages/parent/Children';
import ParentMessages from './pages/parent/Messages';
import ParentReports from './pages/parent/Reports';
import ParentBilling from './pages/parent/Billing';
import ParentSettings from './pages/parent/Settings';
import AdminDashboard from './pages/admin/Dashboard';
import AdminUsers from './pages/admin/Users';
import AdminHomework from './pages/admin/Homework';
import HomeworkPage from './pages/student/Homework';
import AIChat from './pages/student/AIChat';
import QuizPage from './pages/student/Quiz';
import GamificationPage from './pages/student/Gamification';
import Analytics from './pages/student/Analytics';
import ProfilePage from './pages/Profile';
import NotFound from './pages/NotFound';

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <Routes>
          {/* Public Routes (only accessible when NOT authenticated) */}
          <Route element={<PublicRoute />}>
            <Route element={<AuthLayout />}>
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
            </Route>
          </Route>

          {/* Protected Routes (only accessible when authenticated) */}
          <Route element={<ProtectedRoute />}>
            <Route element={<MainLayout />}>
              <Route path="/" element={<Navigate to="/dashboard" replace />} />

              {/* Student Routes */}
              <Route path="/dashboard" element={<StudentDashboard />} />
              <Route path="/homework" element={<HomeworkPage />} />
              <Route path="/ai-chat" element={<AIChat />} />
              <Route path="/quiz" element={<QuizPage />} />
              <Route path="/gamification" element={<GamificationPage />} />

              {/* Parent Routes */}
              <Route path="/parent-dashboard" element={<ParentDashboard />} />
              <Route path="/parent/children" element={<ParentChildren />} />
              <Route path="/parent/messages" element={<ParentMessages />} />
              <Route path="/parent/reports" element={<ParentReports />} />
              <Route path="/parent/billing" element={<ParentBilling />} />
              <Route path="/parent/settings" element={<ParentSettings />} />

              {/* Admin Routes */}
              <Route path="/admin-dashboard" element={<AdminDashboard />} />
              <Route path="/admin/users" element={<AdminUsers />} />
              <Route path="/admin/homework" element={<AdminHomework />} />
              <Route path="/admin/analytics" element={<Analytics />} />
              <Route path="/admin/settings" element={<ParentSettings />} />

              {/* Shared Routes */}
              <Route path="/profile" element={<ProfilePage />} />
            </Route>
          </Route>

          {/* 404 */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Router>

      {/* Toast Notifications */}
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#363636',
            color: '#fff',
          },
          success: {
            duration: 3000,
            iconTheme: {
              primary: '#22c55e',
              secondary: '#fff',
            },
          },
          error: {
            duration: 4000,
            iconTheme: {
              primary: '#ef4444',
              secondary: '#fff',
            },
          },
        }}
      />
    </QueryClientProvider>
  );
}

export default App;
