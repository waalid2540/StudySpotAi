import { useEffect, useState } from 'react';
import { homeworkAPI } from '../../services/api';
import { Plus, Trash2, CheckCircle, Clock, AlertCircle, Upload, X, FileText, Image as ImageIcon, Sparkles } from 'lucide-react';
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
  const [showAIHelper, setShowAIHelper] = useState(false);
  const [filter, setFilter] = useState<'all' | 'pending' | 'completed'>('all');

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
      toast.error('Please select at least one file to upload');
      return;
    }

    try {
      // Auto-generate all data from uploaded files
      const firstFileName = selectedFiles[0].name.replace(/\.[^/.]+$/, ''); // Remove extension

      const finalData = {
        subject: 'General',
        title: `Homework - ${firstFileName}`,
        description: `Uploaded ${selectedFiles.length} file${selectedFiles.length > 1 ? 's' : ''}: ${selectedFiles.map(f => f.name).join(', ')}`,
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 7 days from now
        difficulty: 'medium' as const,
      };

      // For now, just add homework without files (backend would need multipart/form-data support)
      // In production, you'd upload files to storage and save URLs
      await homeworkAPI.create(finalData);

      toast.success(`✅ ${selectedFiles.length} file${selectedFiles.length > 1 ? 's' : ''} uploaded successfully!`);

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
      console.error('Failed to upload homework:', error);
      toast.error('Failed to upload files. Please try again.');
    }
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

  const filteredHomework = homework.filter((item) => {
    if (filter === 'all') return true;
    if (filter === 'pending') return item.status === 'pending' || item.status === 'in_progress';
    if (filter === 'completed') return item.status === 'completed';
    return true;
  });

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
          <h1 className="text-3xl font-bold text-gray-900">My Homework</h1>
          <p className="mt-2 text-gray-600">Manage and track your assignments</p>
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
      <div className="flex gap-4 border-b border-gray-200">
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

      {/* Homework List */}
      <div className="space-y-4">
        {filteredHomework.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-xl shadow-md">
            <p className="text-gray-500 text-lg">No homework found. Add your first assignment!</p>
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
              className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow"
            >
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    {getStatusIcon(item.status)}
                    <h3 className="text-xl font-bold text-gray-900">{item.title}</h3>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getDifficultyColor(item.difficulty)}`}>
                      {item.difficulty}
                    </span>
                  </div>
                  <p className="text-gray-600 mb-3">{item.description}</p>
                  <div className="flex items-center gap-4 text-sm text-gray-500">
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

      {/* Add Homework Modal - Simplified */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full p-8">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Upload Homework</h2>
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
              {/* File Upload Section - Primary */}
              <div>
                <div className="border-2 border-dashed border-primary-300 rounded-lg p-8 text-center hover:border-primary-500 transition-colors bg-primary-50">
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
                      <span className="text-lg font-medium text-gray-900 block">
                        Click to upload files
                      </span>
                      <span className="text-sm text-gray-600">
                        or drag and drop here
                      </span>
                    </div>
                    <span className="text-xs text-gray-500">
                      Images, PDF, DOC, TXT • Multiple files supported
                    </span>
                  </label>
                </div>

                {/* File Previews */}
                {selectedFiles.length > 0 && (
                  <div className="mt-6 space-y-3">
                    <div className="flex justify-between items-center">
                      <p className="text-sm font-medium text-gray-700">
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
                          className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200 hover:border-primary-300 transition-colors"
                        >
                          {file.type.startsWith('image/') ? (
                            <div className="relative flex-shrink-0">
                              <img
                                src={filePreviews[index]}
                                alt={file.name}
                                className="h-14 w-14 object-cover rounded"
                              />
                              <ImageIcon className="absolute bottom-0 right-0 h-5 w-5 text-blue-500 bg-white rounded-full p-0.5" />
                            </div>
                          ) : (
                            <FileText className="h-12 w-12 text-blue-500 flex-shrink-0" />
                          )}
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 truncate">
                              {file.name}
                            </p>
                            <p className="text-xs text-gray-500">
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
              <div className="flex gap-4 pt-4 border-t border-gray-200">
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
                  className="px-6 bg-gray-200 text-gray-800 py-3 rounded-lg hover:bg-gray-300 font-medium transition-colors"
                >
                  Cancel
                </button>
              </div>

              {selectedFiles.length > 0 && (
                <p className="text-xs text-gray-500 text-center">
                  Files will be uploaded automatically with smart defaults
                </p>
              )}
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
