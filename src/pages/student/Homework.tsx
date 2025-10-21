import { useEffect, useState } from 'react';
import { homeworkAPI } from '../../services/api';
import { Plus, Trash2, CheckCircle, Clock, AlertCircle, Upload, X, FileText, Image as ImageIcon, Sparkles, Search, Filter, SlidersHorizontal, Edit } from 'lucide-react';
import toast from 'react-hot-toast';
import AIHomeworkHelper from '../../components/AIHomeworkHelper';

interface Homework {
  id: string;
  subject: string;
  title: string;
  description: string;
  dueDate: string;
  difficulty: 'easy' | 'medium' | 'hard';
  status: 'pending' | 'in_progress' | 'completed' | 'overdue';
}

const HomeworkPage = () => {
  const [homework, setHomework] = useState<Homework[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingHomework, setEditingHomework] = useState<Homework | null>(null);
  const [showAIHelper, setShowAIHelper] = useState(false);
  const [filter, setFilter] = useState<'all' | 'pending' | 'completed'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [subjectFilter, setSubjectFilter] = useState('all');
  const [difficultyFilter, setDifficultyFilter] = useState('all');
  const [sortBy, setSortBy] = useState<'dueDate' | 'subject' | 'difficulty'>('dueDate');

  const [formData, setFormData] = useState({
    subject: '',
    title: '',
    description: '',
    dueDate: '',
    difficulty: 'medium' as 'easy' | 'medium' | 'hard',
  });
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [filePreviews, setFilePreviews] = useState<string[]>([]);

  useEffect(() => {
    loadHomework();
  }, []);

  const loadHomework = async () => {
    try {
      const response = await homeworkAPI.getAll();
      setHomework(response.data.homework || []);
    } catch (error) {
      console.error('Failed to load homework:', error);
      toast.error('Failed to load homework');
    } finally {
      setLoading(false);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setSelectedFiles((prev) => [...prev, ...files]);

    // Create previews for images
    files.forEach((file) => {
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onloadend = () => {
          setFilePreviews((prev) => [...prev, reader.result as string]);
        };
        reader.readAsDataURL(file);
      }
    });
  };

  const removeFile = (index: number) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
    setFilePreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const handleAddHomework = async (e: React.FormEvent) => {
    e.preventDefault();

    if (selectedFiles.length === 0) {
      toast.error('Please upload at least one file');
      return;
    }

    try {
      // Create homework from uploaded files
      const firstFileName = selectedFiles[0].name.replace(/\.[^/.]+$/, '');

      const finalData = {
        subject: 'English',
        title: firstFileName,
        description: `Files: ${selectedFiles.map(f => f.name).join(', ')}`,
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        difficulty: 'medium' as const,
      };

      await homeworkAPI.create(finalData);
      toast.success(`✅ ${selectedFiles.length} file(s) uploaded successfully!`);

      // Reset and close
      setShowAddModal(false);
      setSelectedFiles([]);
      setFilePreviews([]);
      setFormData({
        subject: '',
        title: '',
        description: '',
        dueDate: '',
        difficulty: 'medium',
      });

      loadHomework();
    } catch (error) {
      console.error('Failed to add homework:', error);
      toast.error('Failed to add homework. Please try again.');
    }
  };

  const handleEditHomework = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.subject || !formData.title || !formData.dueDate) {
      toast.error('Please fill in all required fields');
      return;
    }

    if (!editingHomework) return;

    try {
      await homeworkAPI.update(editingHomework.id, formData);
      toast.success('Homework updated successfully!');

      // Reset and close
      setShowEditModal(false);
      setEditingHomework(null);
      setFormData({
        subject: '',
        title: '',
        description: '',
        dueDate: '',
        difficulty: 'medium',
      });

      loadHomework();
    } catch (error) {
      console.error('Failed to update homework:', error);
      toast.error('Failed to update homework. Please try again.');
    }
  };

  const openEditModal = (item: Homework) => {
    setEditingHomework(item);
    setFormData({
      subject: item.subject,
      title: item.title,
      description: item.description || '',
      dueDate: item.dueDate.split('T')[0], // Format date for input
      difficulty: item.difficulty,
    });
    setShowEditModal(true);
  };

  const handleComplete = async (id: string) => {
    try {
      const response = await homeworkAPI.complete(id);
      const data = response.data;

      if (data.badgeUnlocked) {
        toast.success('🏅 Badge Unlocked! +20 points', { duration: 5000 });
      } else if (data.totalPoints) {
        toast.success(`✅ +20 points! Total: ${data.totalPoints}`, { duration: 3000 });
      } else {
        toast.success('Homework marked as complete! +20 points');
      }

      loadHomework();
    } catch (error) {
      console.error('Failed to complete homework:', error);
      toast.error('Failed to complete homework');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this homework?')) return;
    try {
      await homeworkAPI.delete(id);
      toast.success('Homework deleted');
      loadHomework();
    } catch (error) {
      console.error('Failed to delete homework:', error);
      toast.error('Failed to delete homework');
    }
  };

  const filteredHomework = homework
    .filter((item) => {
      // Status filter
      if (filter === 'pending' && item.status !== 'pending' && item.status !== 'in_progress') return false;
      if (filter === 'completed' && item.status !== 'completed') return false;

      // Search query
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const matchesSearch =
          item.title.toLowerCase().includes(query) ||
          item.subject.toLowerCase().includes(query) ||
          item.description?.toLowerCase().includes(query);
        if (!matchesSearch) return false;
      }

      // Subject filter
      if (subjectFilter !== 'all' && item.subject !== subjectFilter) return false;

      // Difficulty filter
      if (difficultyFilter !== 'all' && item.difficulty !== difficultyFilter) return false;

      return true;
    })
    .sort((a, b) => {
      if (sortBy === 'dueDate') {
        return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
      } else if (sortBy === 'subject') {
        return a.subject.localeCompare(b.subject);
      } else if (sortBy === 'difficulty') {
        const difficultyOrder = { easy: 1, medium: 2, hard: 3 };
        return difficultyOrder[a.difficulty] - difficultyOrder[b.difficulty];
      }
      return 0;
    });

  // Get unique subjects from homework
  const subjects = Array.from(new Set(homework.map(h => h.subject)));

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'bg-green-100 text-green-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'hard': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'overdue': return <AlertCircle className="h-5 w-5 text-red-500" />;
      default: return <Clock className="h-5 w-5 text-yellow-500" />;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">My Homework</h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">Manage and track your assignments</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => setShowAIHelper(true)}
            className="flex items-center gap-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white px-6 py-3 rounded-lg hover:shadow-lg transition-shadow"
          >
            <Sparkles className="h-5 w-5" />
            AI Helper
          </button>
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 bg-primary-600 text-white px-6 py-3 rounded-lg hover:bg-primary-700 transition-colors"
          >
            <Plus className="h-5 w-5" />
            Add Homework
          </button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-4 border-b border-gray-200 dark:border-gray-700">
        <button
          onClick={() => setFilter('all')}
          className={`pb-4 px-2 font-medium transition-colors ${
            filter === 'all'
              ? 'text-primary-600 border-b-2 border-primary-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          All ({homework.length})
        </button>
        <button
          onClick={() => setFilter('pending')}
          className={`pb-4 px-2 font-medium transition-colors ${
            filter === 'pending'
              ? 'text-primary-600 border-b-2 border-primary-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          Pending ({homework.filter(h => h.status === 'pending' || h.status === 'in_progress').length})
        </button>
        <button
          onClick={() => setFilter('completed')}
          className={`pb-4 px-2 font-medium transition-colors ${
            filter === 'completed'
              ? 'text-primary-600 border-b-2 border-primary-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          Completed ({homework.filter(h => h.status === 'completed').length})
        </button>
      </div>

      {/* Search and Filters */}
      <div className="bg-gray-50 dark:bg-gray-900 dark:bg-gray-800 rounded-lg p-4 space-y-4">
        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search homework by title, subject, or description..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 dark:bg-gray-700 text-gray-900 dark:text-white dark:text-white focus:ring-2 focus:ring-primary-600 focus:border-transparent"
          />
        </div>

        {/* Advanced Filters */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Subject Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 dark:text-gray-300 mb-2">
              Subject
            </label>
            <select
              value={subjectFilter}
              onChange={(e) => setSubjectFilter(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 dark:bg-gray-700 text-gray-900 dark:text-white dark:text-white focus:ring-2 focus:ring-primary-600 focus:border-transparent"
            >
              <option value="all">All Subjects</option>
              {subjects.map((subject) => (
                <option key={subject} value={subject}>
                  {subject}
                </option>
              ))}
            </select>
          </div>

          {/* Difficulty Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 dark:text-gray-300 mb-2">
              Difficulty
            </label>
            <select
              value={difficultyFilter}
              onChange={(e) => setDifficultyFilter(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 dark:bg-gray-700 text-gray-900 dark:text-white dark:text-white focus:ring-2 focus:ring-primary-600 focus:border-transparent"
            >
              <option value="all">All Difficulties</option>
              <option value="easy">Easy</option>
              <option value="medium">Medium</option>
              <option value="hard">Hard</option>
            </select>
          </div>

          {/* Sort By */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 dark:text-gray-300 mb-2">
              Sort By
            </label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 dark:bg-gray-700 text-gray-900 dark:text-white dark:text-white focus:ring-2 focus:ring-primary-600 focus:border-transparent"
            >
              <option value="dueDate">Due Date</option>
              <option value="subject">Subject</option>
              <option value="difficulty">Difficulty</option>
            </select>
          </div>
        </div>

        {/* Active Filters Summary */}
        {(searchQuery || subjectFilter !== 'all' || difficultyFilter !== 'all') && (
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm text-gray-600 dark:text-gray-400 dark:text-gray-400">Active filters:</span>
            {searchQuery && (
              <span className="inline-flex items-center gap-1 px-3 py-1 bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 rounded-full text-sm">
                Search: "{searchQuery}"
                <button
                  onClick={() => setSearchQuery('')}
                  className="hover:text-primary-900 dark:hover:text-primary-100"
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            )}
            {subjectFilter !== 'all' && (
              <span className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full text-sm">
                {subjectFilter}
                <button
                  onClick={() => setSubjectFilter('all')}
                  className="hover:text-blue-900 dark:hover:text-blue-100"
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            )}
            {difficultyFilter !== 'all' && (
              <span className="inline-flex items-center gap-1 px-3 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-full text-sm">
                {difficultyFilter}
                <button
                  onClick={() => setDifficultyFilter('all')}
                  className="hover:text-purple-900 dark:hover:text-purple-100"
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            )}
            <button
              onClick={() => {
                setSearchQuery('');
                setSubjectFilter('all');
                setDifficultyFilter('all');
              }}
              className="text-sm text-gray-600 dark:text-gray-400 dark:text-gray-400 hover:text-gray-900 dark:text-white dark:hover:text-white underline"
            >
              Clear all
            </button>
          </div>
        )}

        {/* Results Count */}
        <div className="text-sm text-gray-600 dark:text-gray-400 dark:text-gray-400">
          Showing {filteredHomework.length} of {homework.length} assignments
        </div>
      </div>

      {/* Homework List */}
      <div className="space-y-4">
        {filteredHomework.length === 0 ? (
          <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-xl shadow-md">
            <p className="text-gray-500 dark:text-gray-400 text-lg">No homework found. Add your first assignment!</p>
            <button
              onClick={() => setShowAddModal(true)}
              className="mt-4 bg-primary-600 text-white px-6 py-2 rounded-lg hover:bg-primary-700"
            >
              Add Homework
            </button>
          </div>
        ) : (
          filteredHomework.map((item) => (
            <div
              key={item.id}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow"
            >
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    {getStatusIcon(item.status)}
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white">{item.title}</h3>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getDifficultyColor(item.difficulty)}`}>
                      {item.difficulty}
                    </span>
                  </div>
                  <p className="text-gray-600 dark:text-gray-400 mb-3">{item.description}</p>
                  <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                    <span className="font-medium text-primary-600">{item.subject}</span>
                    <span>Due: {new Date(item.dueDate).toLocaleDateString()}</span>
                    <span className={`px-2 py-1 rounded text-xs ${
                      item.status === 'completed' ? 'bg-green-100 text-green-800' :
                      item.status === 'overdue' ? 'bg-red-100 text-red-800' :
                      'bg-yellow-100 text-yellow-800'
                    }`}>
                      {item.status}
                    </span>
                  </div>
                </div>
                <div className="flex gap-2">
                  {item.status !== 'completed' && (
                    <button
                      onClick={() => handleComplete(item.id)}
                      className="flex items-center gap-2 bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors"
                    >
                      <CheckCircle className="h-4 w-4" />
                      Complete
                    </button>
                  )}
                  <button
                    onClick={() => openEditModal(item)}
                    className="flex items-center gap-2 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors"
                  >
                    <Edit className="h-4 w-4" />
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(item.id)}
                    className="flex items-center gap-2 bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors"
                  >
                    <Trash2 className="h-4 w-4" />
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Add Homework Modal - File Upload Only */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-2xl w-full p-8">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Upload Homework Files</h2>
              <button
                onClick={() => {
                  setShowAddModal(false);
                  setSelectedFiles([]);
                  setFilePreviews([]);
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <form onSubmit={handleAddHomework} className="space-y-6">
              {/* File Upload */}
              <div>
                <div className="border-2 border-dashed border-primary-300 dark:border-primary-700 rounded-lg p-8 text-center hover:border-primary-500 transition-colors bg-primary-50 dark:bg-primary-900/10">
                  <input
                    type="file"
                    multiple
                    accept="image/*,.pdf,.doc,.docx,.txt"
                    onChange={handleFileSelect}
                    className="hidden"
                    id="file-upload"
                  />
                  <label
                    htmlFor="file-upload"
                    className="cursor-pointer flex flex-col items-center gap-3"
                  >
                    <Upload className="h-16 w-16 text-primary-500" />
                    <div>
                      <span className="text-lg font-medium text-gray-900 dark:text-white block">
                        Click to upload files
                      </span>
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        or drag and drop here
                      </span>
                    </div>
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      Images, PDF, DOC, TXT • Multiple files supported
                    </span>
                  </label>
                </div>

                {/* File Previews */}
                {selectedFiles.length > 0 && (
                  <div className="mt-6 space-y-3">
                    <div className="flex justify-between items-center">
                      <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        {selectedFiles.length} file{selectedFiles.length > 1 ? 's' : ''} selected
                      </p>
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedFiles([]);
                          setFilePreviews([]);
                        }}
                        className="text-sm text-red-600 hover:text-red-700"
                      >
                        Clear all
                      </button>
                    </div>
                    <div className="grid grid-cols-2 gap-3 max-h-64 overflow-y-auto">
                      {selectedFiles.map((file, index) => (
                        <div
                          key={index}
                          className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-primary-300 transition-colors"
                        >
                          {file.type.startsWith('image/') ? (
                            <div className="relative flex-shrink-0">
                              <img
                                src={filePreviews[index]}
                                alt={file.name}
                                className="h-14 w-14 object-cover rounded"
                              />
                              <ImageIcon className="absolute bottom-0 right-0 h-5 w-5 text-blue-500 bg-white dark:bg-gray-800 rounded-full p-0.5" />
                            </div>
                          ) : (
                            <FileText className="h-12 w-12 text-blue-500 flex-shrink-0" />
                          )}
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                              {file.name}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              {(file.size / 1024).toFixed(1)} KB
                            </p>
                          </div>
                          <button
                            type="button"
                            onClick={() => removeFile(index)}
                            className="text-red-500 hover:text-red-700 flex-shrink-0"
                          >
                            <X className="h-5 w-5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex gap-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                <button
                  type="submit"
                  disabled={selectedFiles.length === 0}
                  className="flex-1 bg-primary-600 text-white py-3 rounded-lg hover:bg-primary-700 font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {selectedFiles.length > 0
                    ? `Upload ${selectedFiles.length} file${selectedFiles.length > 1 ? 's' : ''}`
                    : 'Select files to upload'
                  }
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowAddModal(false);
                    setSelectedFiles([]);
                    setFilePreviews([]);
                  }}
                  className="px-6 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 py-3 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 font-medium transition-colors"
                >
                  Cancel
                </button>
              </div>

              {selectedFiles.length > 0 && (
                <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
                  Subject will be automatically set to "English"
                </p>
              )}
            </form>
          </div>
        </div>
      )}

      {/* Edit Homework Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-2xl w-full p-8 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Edit Homework</h2>
              <button
                onClick={() => {
                  setShowEditModal(false);
                  setEditingHomework(null);
                  setFormData({
                    subject: '',
                    title: '',
                    description: '',
                    dueDate: '',
                    difficulty: 'medium',
                  });
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <form onSubmit={handleEditHomework} className="space-y-6">
              {/* Subject */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Subject <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  placeholder="e.g., Mathematics, Science, English"
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-600 focus:border-transparent"
                />
              </div>

              {/* Title */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g., Chapter 5 Exercises"
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-600 focus:border-transparent"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Add any additional details..."
                  rows={4}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-600 focus:border-transparent"
                />
              </div>

              {/* Due Date and Difficulty */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Due Date <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.dueDate}
                    onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-600 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Difficulty
                  </label>
                  <select
                    value={formData.difficulty}
                    onChange={(e) => setFormData({ ...formData, difficulty: e.target.value as any })}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-600 focus:border-transparent"
                  >
                    <option value="easy">Easy</option>
                    <option value="medium">Medium</option>
                    <option value="hard">Hard</option>
                  </select>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                <button
                  type="submit"
                  className="flex-1 bg-primary-600 text-white py-3 rounded-lg hover:bg-primary-700 font-medium transition-colors"
                >
                  Save Changes
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowEditModal(false);
                    setEditingHomework(null);
                    setFormData({
                      subject: '',
                      title: '',
                      description: '',
                      dueDate: '',
                      difficulty: 'medium',
                    });
                  }}
                  className="px-6 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 py-3 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 font-medium transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* AI Homework Helper Modal */}
      {showAIHelper && (
        <AIHomeworkHelper onClose={() => setShowAIHelper(false)} />
      )}
    </div>
  );
};

export default HomeworkPage;
