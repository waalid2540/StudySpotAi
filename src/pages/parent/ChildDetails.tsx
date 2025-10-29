import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft,
  BookOpen,
  Calendar,
  CheckCircle,
  Clock,
  AlertCircle,
  TrendingUp,
  Trophy,
  Target,
  User,
  Info,
} from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import { storageService } from '../../services/storageService';

interface Homework {
  id: string;
  studentId: string;
  title: string;
  description: string;
  subject: string;
  dueDate: string;
  status: 'pending' | 'in_progress' | 'completed';
  priority: 'low' | 'medium' | 'high';
  createdAt: string;
  updatedAt: string;
}

interface Child {
  id: string;
  name: string;
  email: string;
  linkCode?: string;
  grade: string;
  age: number;
  stats: {
    homeworkCompletion: number;
    averageScore: number;
    totalPoints: number;
    studyTime: number;
  };
}

const ParentChildDetails = () => {
  const { childId } = useParams<{ childId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [child, setChild] = useState<Child | null>(null);
  const [homework, setHomework] = useState<Homework[]>([]);
  const [loading, setLoading] = useState(true);
  const [linkingStatus, setLinkingStatus] = useState<'checking' | 'linked' | 'not_found' | 'error'>('checking');

  useEffect(() => {
    if (!childId) return;

    // Load child info from localStorage
    if (user?.id) {
      const savedChildren = storageService.get<Child[]>(`parent_children_${user.id}`, []);
      const foundChild = savedChildren.find((c) => c.id === childId);
      if (foundChild) {
        setChild(foundChild);
      }
    }

    // Fetch homework from backend
    fetchChildHomework();
  }, [childId, user?.id]);

  const fetchChildHomework = async () => {
    try {
      setLoading(true);
      setLinkingStatus('checking');

      if (!child?.linkCode) {
        toast.error('Link code is required');
        setLoading(false);
        setLinkingStatus('error');
        return;
      }

      console.log('🔍 Starting to link child with code:', child.linkCode);

      // Step 1: Link the child using their link code to get the real student ID
      let realStudentId = childId;
      try {
        const linkResponse = await api.post('/parents/link-child', { linkCode: child.linkCode });
        realStudentId = linkResponse.data.studentId;
        console.log('✅ Child linked successfully!');
        console.log('   - Link Code:', child.linkCode);
        console.log('   - Real Student ID:', realStudentId);
        setLinkingStatus('linked');
        toast.success(`Connected to ${child.name}'s account!`);
      } catch (linkError: any) {
        console.error('❌ Child linking error:', linkError);
        console.error('   - Status:', linkError.response?.status);
        console.error('   - Error:', linkError.response?.data);

        // Handle specific error cases
        if (linkError.response?.status === 404) {
          setLinkingStatus('not_found');
          toast.error(`Invalid link code. Please check the code and try again.`);
          setLoading(false);
          return;
        }
        // If already linked or other error, try to continue with original ID
        console.log('⚠️ Continuing with original ID:', childId);
        setLinkingStatus('error');
      }

      console.log('📚 Fetching homework for student ID:', realStudentId);

      // Step 2: Fetch homework using the real student ID
      const response = await api.get(`/parents/homework/${realStudentId}`);
      console.log('✅ Homework fetched:', response.data);
      setHomework(response.data.homework || []);

      if (response.data.homework && response.data.homework.length > 0) {
        console.log(`   - Found ${response.data.homework.length} homework assignment(s)`);
      } else {
        console.log('   - No homework found for this student');
      }
    } catch (error: any) {
      console.error('❌ Error fetching child homework:', error);
      console.error('   - Status:', error.response?.status);
      console.error('   - Error:', error.response?.data);

      // More user-friendly error messages
      if (error.response?.status === 403) {
        setLinkingStatus('error');
        toast.error('Access denied. Make sure the child is registered as a student.');
      } else if (error.response?.status === 404) {
        setLinkingStatus('not_found');
        toast.error('No student account found. The child needs to register first.');
      } else {
        setLinkingStatus('error');
        toast.error(error.response?.data?.error || 'Failed to load homework data');
      }
      setHomework([]);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: Homework['status']) => {
    switch (status) {
      case 'completed':
        return 'text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20';
      case 'in_progress':
        return 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20';
      case 'pending':
        return 'text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-700';
    }
  };

  const getStatusIcon = (status: Homework['status']) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'in_progress':
        return <Clock className="h-5 w-5 text-blue-600" />;
      case 'pending':
        return <BookOpen className="h-5 w-5 text-gray-600" />;
    }
  };

  const getPriorityColor = (priority: Homework['priority']) => {
    switch (priority) {
      case 'high':
        return 'text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20';
      case 'medium':
        return 'text-yellow-600 dark:text-yellow-400 bg-yellow-50 dark:bg-yellow-900/20';
      case 'low':
        return 'text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20';
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase();
  };

  const completedCount = homework.filter((hw) => hw.status === 'completed').length;
  const pendingCount = homework.filter((hw) => hw.status === 'pending').length;
  const inProgressCount = homework.filter((hw) => hw.status === 'in_progress').length;
  const completionRate = homework.length > 0 ? Math.round((completedCount / homework.length) * 100) : 0;

  if (!child) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Link
            to="/parent/children"
            className="rounded-lg p-2 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Child Not Found</h1>
            <p className="mt-2 text-gray-600 dark:text-gray-400">
              The child you're looking for doesn't exist.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Back Button */}
      <div className="flex items-center gap-4">
        <Link
          to="/parent/children"
          className="rounded-lg p-2 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div className="flex-1">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
            <div className="h-12 w-12 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white text-lg font-bold">
              {getInitials(child.name)}
            </div>
            {child.name}'s Progress
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            {child.grade} • {child.email}
          </p>
        </div>
      </div>

      {/* Debug Info Panel */}
      <div className="rounded-xl bg-blue-50 dark:bg-blue-900/20 border-2 border-blue-200 dark:border-blue-800 p-4">
        <div className="flex items-start gap-3">
          <Info className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5" />
          <div className="flex-1">
            <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">Connection Status</h3>
            <div className="space-y-1 text-sm">
              <p className="text-blue-800 dark:text-blue-200">
                <strong>Link Code:</strong> <span className="font-mono text-lg">{child.linkCode}</span>
              </p>
              <p className="text-blue-800 dark:text-blue-200">
                <strong>Status:</strong>{' '}
                {linkingStatus === 'checking' && '🔍 Checking...'}
                {linkingStatus === 'linked' && '✅ Connected to student account'}
                {linkingStatus === 'not_found' && '❌ Invalid link code'}
                {linkingStatus === 'error' && '⚠️ Connection error'}
              </p>
              <p className="text-blue-800 dark:text-blue-200">
                <strong>Homework Found:</strong> {homework.length} assignment(s)
              </p>
            </div>
            {linkingStatus === 'not_found' && (
              <div className="mt-3 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                <p className="text-sm text-yellow-800 dark:text-yellow-200">
                  <strong>Action Required:</strong> The link code <strong className="font-mono">{child.linkCode}</strong> is invalid. Please ask your child for their correct 6-digit link code.
                </p>
              </div>
            )}
            <p className="mt-2 text-xs text-blue-600 dark:text-blue-400">
              💡 Open browser console (F12) to see detailed logs
            </p>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl bg-white dark:bg-gray-800 p-6 shadow-md">
          <div className="flex items-center justify-between mb-4">
            <div className="rounded-lg p-3 bg-green-50 dark:bg-green-900/20">
              <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-400" />
            </div>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400">Completion Rate</p>
          <p className="mt-1 text-2xl font-bold text-gray-900 dark:text-white">{completionRate}%</p>
        </div>

        <div className="rounded-xl bg-white dark:bg-gray-800 p-6 shadow-md">
          <div className="flex items-center justify-between mb-4">
            <div className="rounded-lg p-3 bg-blue-50 dark:bg-blue-900/20">
              <BookOpen className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400">Total Homework</p>
          <p className="mt-1 text-2xl font-bold text-gray-900 dark:text-white">{homework.length}</p>
        </div>

        <div className="rounded-xl bg-white dark:bg-gray-800 p-6 shadow-md">
          <div className="flex items-center justify-between mb-4">
            <div className="rounded-lg p-3 bg-yellow-50 dark:bg-yellow-900/20">
              <Clock className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
            </div>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400">In Progress</p>
          <p className="mt-1 text-2xl font-bold text-gray-900 dark:text-white">{inProgressCount}</p>
        </div>

        <div className="rounded-xl bg-white dark:bg-gray-800 p-6 shadow-md">
          <div className="flex items-center justify-between mb-4">
            <div className="rounded-lg p-3 bg-purple-50 dark:bg-purple-900/20">
              <Target className="h-6 w-6 text-purple-600 dark:text-purple-400" />
            </div>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400">Pending</p>
          <p className="mt-1 text-2xl font-bold text-gray-900 dark:text-white">{pendingCount}</p>
        </div>
      </div>

      {/* Homework List */}
      <div className="rounded-xl bg-white dark:bg-gray-800 p-6 shadow-md">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
          <BookOpen className="h-6 w-6 text-primary-600" />
          Homework Assignments
        </h2>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
          </div>
        ) : homework.length === 0 ? (
          <div className="text-center py-12">
            <BookOpen className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-4 text-lg font-semibold text-gray-900 dark:text-white">
              No homework found
            </h3>
            <p className="mt-2 text-gray-500 dark:text-gray-400 max-w-md mx-auto">
              <strong>{child.name}</strong> hasn't created any homework assignments yet.
            </p>
            <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg max-w-md mx-auto">
              <p className="text-sm text-blue-800 dark:text-blue-300">
                <strong>Once they create homework:</strong>
              </p>
              <ul className="mt-2 text-sm text-blue-700 dark:text-blue-400 text-left space-y-1">
                <li>• All their assignments will appear here</li>
                <li>• You can track their progress in real-time</li>
                <li>• See completion status and due dates</li>
              </ul>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {homework.map((hw) => (
              <div
                key={hw.id}
                className="flex items-start justify-between rounded-lg border border-gray-200 dark:border-gray-700 p-4 transition-colors hover:bg-gray-50 dark:hover:bg-gray-700/50"
              >
                <div className="flex items-start gap-4 flex-1">
                  <div className="mt-1">{getStatusIcon(hw.status)}</div>
                  <div className="flex-1">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900 dark:text-white">{hw.title}</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                          {hw.description}
                        </p>
                        <div className="mt-3 flex flex-wrap items-center gap-3 text-xs">
                          <span className={`rounded-full px-3 py-1 font-medium ${getStatusColor(hw.status)}`}>
                            {hw.status.replace('_', ' ')}
                          </span>
                          <span className={`rounded-full px-3 py-1 font-medium ${getPriorityColor(hw.priority)}`}>
                            {hw.priority} priority
                          </span>
                          <span className="text-gray-500 dark:text-gray-400 flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            Due: {new Date(hw.dueDate).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 px-3 py-1 rounded-full">
                        {hw.subject}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ParentChildDetails;
