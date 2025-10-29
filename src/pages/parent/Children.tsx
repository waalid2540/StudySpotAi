import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  User,
  Plus,
  Edit2,
  Trash2,
  BookOpen,
  TrendingUp,
  Trophy,
  Clock,
  Settings,
  Eye,
  X,
  Check,
  UserPlus,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../../contexts/AuthContext';
import { storageService } from '../../services/storageService';

interface Child {
  id: string;
  name: string;
  email: string;
  linkCode?: string; // Student's link code to connect accounts
  grade: string;
  age: number;
  avatar?: string;
  dateAdded: string;
  status: 'active' | 'inactive';
  stats: {
    homeworkCompletion: number;
    averageScore: number;
    totalPoints: number;
    studyTime: number;
  };
}

const ParentChildren = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [children, setChildren] = useState<Child[]>([]);

  // Load children from localStorage on mount
  useEffect(() => {
    if (user?.id) {
      const savedChildren = storageService.get<Child[]>(`parent_children_${user.id}`, []);
      console.log('Loading children for user:', user.id, savedChildren);
      if (savedChildren && savedChildren.length > 0) {
        setChildren(savedChildren);
      }
    }
  }, [user?.id]);

  // Save children to localStorage whenever it changes
  useEffect(() => {
    if (user?.id) {
      console.log('Saving children for user:', user.id, children);
      storageService.set(`parent_children_${user.id}`, children);
    }
  }, [children, user?.id]);

  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedChild, setSelectedChild] = useState<Child | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    linkCode: '',
    grade: '',
    age: '',
  });

  const handleAddChild = () => {
    if (!formData.name || !formData.grade || !formData.age) {
      toast.error('Please fill in all required fields');
      return;
    }

    if (!formData.linkCode && !formData.email) {
      toast.error('Please enter either a link code or email');
      return;
    }

    const newChild: Child = {
      id: Date.now().toString(),
      name: formData.name,
      email: formData.email || 'Not provided',
      linkCode: formData.linkCode,
      grade: formData.grade,
      age: parseInt(formData.age),
      dateAdded: new Date().toISOString().split('T')[0],
      status: 'active',
      stats: {
        homeworkCompletion: 0,
        averageScore: 0,
        totalPoints: 0,
        studyTime: 0,
      },
    };

    const updatedChildren = [...children, newChild];
    console.log('Adding new child:', newChild);
    console.log('Updated children array:', updatedChildren);
    setChildren(updatedChildren);

    // Explicitly save to localStorage
    if (user?.id) {
      storageService.set(`parent_children_${user.id}`, updatedChildren);
      console.log('Explicitly saved children to localStorage');
    }

    setShowAddModal(false);
    setFormData({ name: '', email: '', linkCode: '', grade: '', age: '' });
    toast.success('Child added successfully!');
  };

  const handleEditChild = () => {
    if (!selectedChild || !formData.name || !formData.grade || !formData.age) {
      toast.error('Please fill in all required fields');
      return;
    }

    const updatedChildren = children.map((child) =>
      child.id === selectedChild.id
        ? {
            ...child,
            name: formData.name,
            email: formData.email || 'Not provided',
            linkCode: formData.linkCode,
            grade: formData.grade,
            age: parseInt(formData.age),
          }
        : child
    );

    setChildren(updatedChildren);

    // Explicitly save to localStorage
    if (user?.id) {
      storageService.set(`parent_children_${user.id}`, updatedChildren);
    }

    setShowEditModal(false);
    setSelectedChild(null);
    setFormData({ name: '', email: '', linkCode: '', grade: '', age: '' });
    toast.success('Child updated successfully!');
  };

  const handleDeleteChild = () => {
    if (selectedChild) {
      const updatedChildren = children.filter((child) => child.id !== selectedChild.id);
      setChildren(updatedChildren);

      // Explicitly save to localStorage
      if (user?.id) {
        storageService.set(`parent_children_${user.id}`, updatedChildren);
      }

      setShowDeleteModal(false);
      setSelectedChild(null);
      toast.success('Child removed successfully!');
    }
  };

  const openEditModal = (child: Child) => {
    setSelectedChild(child);
    setFormData({
      name: child.name,
      email: child.email,
      linkCode: child.linkCode || '',
      grade: child.grade,
      age: child.age.toString(),
    });
    setShowEditModal(true);
  };

  const openDeleteModal = (child: Child) => {
    setSelectedChild(child);
    setShowDeleteModal(true);
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">My Children</h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Manage your children's accounts and learning profiles
          </p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="inline-flex items-center gap-2 rounded-lg bg-primary-600 px-4 py-2 text-white hover:bg-primary-700 transition-colors"
        >
          <Plus className="h-5 w-5" />
          Add Child
        </button>
      </div>

      {/* Children Grid */}
      {children.length === 0 ? (
        <div className="rounded-xl bg-white dark:bg-gray-800 p-12 shadow-md text-center">
          <UserPlus className="h-16 w-16 mx-auto text-gray-400 dark:text-gray-600 mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            No children added yet
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Get started by adding your first child's account
          </p>
          <button
            onClick={() => setShowAddModal(true)}
            className="inline-flex items-center gap-2 rounded-lg bg-primary-600 px-6 py-3 text-white hover:bg-primary-700 transition-colors"
          >
            <Plus className="h-5 w-5" />
            Add Your First Child
          </button>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2">
          {children.map((child) => (
            <div
              key={child.id}
              className="rounded-xl bg-white dark:bg-gray-800 p-6 shadow-md transition-shadow hover:shadow-lg"
            >
              {/* Child Header */}
              <div className="flex items-start justify-between mb-6">
                <div className="flex items-center gap-4">
                  <div className="h-16 w-16 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white text-xl font-bold">
                    {getInitials(child.name)}
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                      {child.name}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{child.grade}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-500">
                      Age: {child.age} • Added {new Date(child.dateAdded).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <span
                  className={`rounded-full px-3 py-1 text-xs font-medium ${
                    child.status === 'active'
                      ? 'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400'
                      : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-400'
                  }`}
                >
                  {child.status}
                </span>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="rounded-lg bg-green-50 dark:bg-green-900/20 p-3">
                  <div className="flex items-center gap-2 mb-1">
                    <BookOpen className="h-4 w-4 text-green-600 dark:text-green-400" />
                    <span className="text-xs text-gray-600 dark:text-gray-400">Homework</span>
                  </div>
                  <p className="text-lg font-bold text-gray-900 dark:text-white">
                    {child.stats.homeworkCompletion}%
                  </p>
                </div>

                <div className="rounded-lg bg-blue-50 dark:bg-blue-900/20 p-3">
                  <div className="flex items-center gap-2 mb-1">
                    <TrendingUp className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                    <span className="text-xs text-gray-600 dark:text-gray-400">Avg Score</span>
                  </div>
                  <p className="text-lg font-bold text-gray-900 dark:text-white">
                    {child.stats.averageScore}%
                  </p>
                </div>

                <div className="rounded-lg bg-yellow-50 dark:bg-yellow-900/20 p-3">
                  <div className="flex items-center gap-2 mb-1">
                    <Trophy className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
                    <span className="text-xs text-gray-600 dark:text-gray-400">Points</span>
                  </div>
                  <p className="text-lg font-bold text-gray-900 dark:text-white">
                    {child.stats.totalPoints}
                  </p>
                </div>

                <div className="rounded-lg bg-purple-50 dark:bg-purple-900/20 p-3">
                  <div className="flex items-center gap-2 mb-1">
                    <Clock className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                    <span className="text-xs text-gray-600 dark:text-gray-400">Study Time</span>
                  </div>
                  <p className="text-lg font-bold text-gray-900 dark:text-white">
                    {child.stats.studyTime}h
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => navigate(`/parent/children/${child.id}`)}
                  className="flex-1 flex items-center justify-center gap-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
                >
                  <Eye className="h-4 w-4" />
                  View Details
                </button>
                <button
                  onClick={() => openEditModal(child)}
                  className="flex items-center justify-center gap-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
                >
                  <Edit2 className="h-4 w-4" />
                </button>
                <button
                  onClick={() => openDeleteModal(child)}
                  className="flex items-center justify-center gap-2 rounded-lg border border-red-300 dark:border-red-600 bg-white dark:bg-gray-700 px-4 py-2 text-sm font-medium text-red-700 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Child Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-xl bg-white dark:bg-gray-800 p-6 shadow-xl">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Add Child</h2>
              <button
                onClick={() => {
                  setShowAddModal(false);
                  setFormData({ name: '', email: '', linkCode: '', grade: '', age: '' });
                }}
                className="rounded-lg p-2 hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Child's Name
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-4 py-2 text-gray-900 dark:text-white focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="Enter child's full name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Email (Optional)
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-4 py-2 text-gray-900 dark:text-white focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="child@example.com (for your reference)"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Student Link Code <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.linkCode}
                  onChange={(e) => setFormData({ ...formData, linkCode: e.target.value.toUpperCase() })}
                  className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-4 py-2 text-gray-900 dark:text-white font-mono text-lg focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="Enter 6-digit code (e.g., ABC123)"
                  maxLength={6}
                  required
                />
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  Ask your child for their 6-digit link code from their profile
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Grade
                </label>
                <select
                  value={formData.grade}
                  onChange={(e) => setFormData({ ...formData, grade: e.target.value })}
                  className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-4 py-2 text-gray-900 dark:text-white focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="">Select grade</option>
                  <option value="1st Grade">1st Grade</option>
                  <option value="2nd Grade">2nd Grade</option>
                  <option value="3rd Grade">3rd Grade</option>
                  <option value="4th Grade">4th Grade</option>
                  <option value="5th Grade">5th Grade</option>
                  <option value="6th Grade">6th Grade</option>
                  <option value="7th Grade">7th Grade</option>
                  <option value="8th Grade">8th Grade</option>
                  <option value="9th Grade">9th Grade</option>
                  <option value="10th Grade">10th Grade</option>
                  <option value="11th Grade">11th Grade</option>
                  <option value="12th Grade">12th Grade</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Age
                </label>
                <input
                  type="number"
                  value={formData.age}
                  onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                  className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-4 py-2 text-gray-900 dark:text-white focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="Enter age"
                  min="5"
                  max="18"
                />
              </div>
            </div>

            <div className="mt-6 flex gap-3">
              <button
                onClick={() => {
                  setShowAddModal(false);
                  setFormData({ name: '', email: '', linkCode: '', grade: '', age: '' });
                }}
                className="flex-1 rounded-lg border border-gray-300 dark:border-gray-600 px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleAddChild}
                className="flex-1 rounded-lg bg-primary-600 px-4 py-2 text-white hover:bg-primary-700 transition-colors flex items-center justify-center gap-2"
              >
                <Check className="h-5 w-5" />
                Add Child
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Child Modal */}
      {showEditModal && selectedChild && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-xl bg-white dark:bg-gray-800 p-6 shadow-xl">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Edit Child</h2>
              <button
                onClick={() => {
                  setShowEditModal(false);
                  setSelectedChild(null);
                  setFormData({ name: '', email: '', linkCode: '', grade: '', age: '' });
                }}
                className="rounded-lg p-2 hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Child's Name
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-4 py-2 text-gray-900 dark:text-white focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Email (Optional)
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-4 py-2 text-gray-900 dark:text-white focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="child@example.com (for your reference)"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Student Link Code <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.linkCode}
                  onChange={(e) => setFormData({ ...formData, linkCode: e.target.value.toUpperCase() })}
                  className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-4 py-2 text-gray-900 dark:text-white font-mono text-lg focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="Enter 6-digit code (e.g., ABC123)"
                  maxLength={6}
                  required
                />
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  Ask your child for their 6-digit link code from their profile
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Grade
                </label>
                <select
                  value={formData.grade}
                  onChange={(e) => setFormData({ ...formData, grade: e.target.value })}
                  className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-4 py-2 text-gray-900 dark:text-white focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="">Select grade</option>
                  <option value="1st Grade">1st Grade</option>
                  <option value="2nd Grade">2nd Grade</option>
                  <option value="3rd Grade">3rd Grade</option>
                  <option value="4th Grade">4th Grade</option>
                  <option value="5th Grade">5th Grade</option>
                  <option value="6th Grade">6th Grade</option>
                  <option value="7th Grade">7th Grade</option>
                  <option value="8th Grade">8th Grade</option>
                  <option value="9th Grade">9th Grade</option>
                  <option value="10th Grade">10th Grade</option>
                  <option value="11th Grade">11th Grade</option>
                  <option value="12th Grade">12th Grade</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Age
                </label>
                <input
                  type="number"
                  value={formData.age}
                  onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                  className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-4 py-2 text-gray-900 dark:text-white focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500"
                  min="5"
                  max="18"
                />
              </div>
            </div>

            <div className="mt-6 flex gap-3">
              <button
                onClick={() => {
                  setShowEditModal(false);
                  setSelectedChild(null);
                  setFormData({ name: '', email: '', linkCode: '', grade: '', age: '' });
                }}
                className="flex-1 rounded-lg border border-gray-300 dark:border-gray-600 px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleEditChild}
                className="flex-1 rounded-lg bg-primary-600 px-4 py-2 text-white hover:bg-primary-700 transition-colors flex items-center justify-center gap-2"
              >
                <Check className="h-5 w-5" />
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && selectedChild && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-xl bg-white dark:bg-gray-800 p-6 shadow-xl">
            <div className="mb-6">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/20 mb-4">
                <Trash2 className="h-6 w-6 text-red-600 dark:text-red-400" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white text-center mb-2">
                Remove Child?
              </h2>
              <p className="text-gray-600 dark:text-gray-400 text-center">
                Are you sure you want to remove <strong>{selectedChild.name}</strong>? This action
                cannot be undone.
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setSelectedChild(null);
                }}
                className="flex-1 rounded-lg border border-gray-300 dark:border-gray-600 px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteChild}
                className="flex-1 rounded-lg bg-red-600 px-4 py-2 text-white hover:bg-red-700 transition-colors"
              >
                Remove
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ParentChildren;
