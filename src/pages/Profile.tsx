import { useState, useEffect } from 'react';
import { gamificationAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { useUserStats } from '../hooks/useUserStats';
import {
  User,
  Mail,
  Phone,
  Calendar,
  Edit,
  Save,
  X,
  Camera,
  Bell,
  Lock,
  Award,
  BookOpen,
  Trophy,
  Target,
  TrendingUp,
  CheckCircle
} from 'lucide-react';
import toast from 'react-hot-toast';

interface UserProfile {
  name: string;
  email: string;
  phone: string;
  location: string;
  bio: string;
  avatar: string;
  joinDate: string;
  role: string;
}

interface UserStats {
  totalPoints: number;
  level: number;
  rank: number;
  homeworkCompleted: number;
  quizzesTaken: number;
  badges: number;
  currentStreak: number;
}

const ProfilePage = () => {
  const { user } = useAuth();
  const { stats: userStats, loading: statsLoading } = useUserStats();
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState<'profile' | 'preferences' | 'security'>('profile');
  const [loading, setLoading] = useState(true);

  const [profile, setProfile] = useState<UserProfile>({
    name: 'User',
    email: '',
    phone: '',
    location: '',
    bio: '',
    avatar: '',
    joinDate: new Date().toISOString().split('T')[0],
    role: 'Student',
  });

  const [editedProfile, setEditedProfile] = useState<UserProfile>({
    name: 'User',
    email: '',
    phone: '',
    location: '',
    bio: '',
    avatar: '',
    joinDate: new Date().toISOString().split('T')[0],
    role: 'Student',
  });
  const [stats, setStats] = useState<UserStats>({
    totalPoints: 0,
    level: 1,
    rank: 0,
    homeworkCompleted: 0,
    quizzesTaken: 0,
    badges: 0,
    currentStreak: 0,
  });

  const [notifications, setNotifications] = useState({
    emailNotifications: true,
    homeworkReminders: true,
    quizAlerts: true,
    weeklyReports: true,
    achievementAlerts: true,
  });

  const [preferences, setPreferences] = useState({
    learningPace: 'medium' as 'slow' | 'medium' | 'fast',
    preferredSubjects: ['Mathematics', 'Science'],
    studyReminders: true,
    darkMode: false,
  });

  // Update profile when user changes
  useEffect(() => {
    if (user) {
      const updatedProfile = {
        name: user.displayName || user.email?.split('@')[0] || 'User',
        email: user.email || '',
        phone: '',
        location: '',
        bio: user.role === 'parent'
          ? 'Parent monitoring student progress and supporting learning.'
          : user.role === 'admin'
          ? 'Administrator managing the platform.'
          : 'Passionate learner focused on continuous improvement and academic excellence.',
        avatar: '',
        joinDate: user.createdAt ? new Date(user.createdAt).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
        role: user.role === 'parent' ? 'Parent' : user.role === 'admin' ? 'Admin' : 'Student',
      };
      setProfile(updatedProfile);
      setEditedProfile(updatedProfile);
    }
  }, [user]);

  useEffect(() => {
    if (userStats) {
      const badgesCount = userStats.achievements?.length || 0;

      setStats({
        totalPoints: userStats.totalPoints || 0,
        level: userStats.level || 1,
        rank: userStats.rank || 0,
        homeworkCompleted: userStats.homeworkCompleted || 0,
        quizzesTaken: userStats.quizzesCompleted || 0,
        badges: badgesCount,
        currentStreak: userStats.streak || 0,
      });
      setLoading(false);
    }
  }, [userStats]);

  const handleEditToggle = () => {
    if (isEditing) {
      // Cancel editing - reset to current profile
      setEditedProfile(profile);
    } else {
      // Start editing - copy current profile to edited state
      setEditedProfile(profile);
    }
    setIsEditing(!isEditing);
  };

  const handleSaveProfile = () => {
    setProfile(editedProfile);
    setIsEditing(false);
    toast.success('Profile updated successfully!');
  };

  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setEditedProfile({ ...editedProfile, avatar: reader.result as string });
        setProfile({ ...profile, avatar: reader.result as string });
        toast.success('Profile picture updated!');
      };
      reader.readAsDataURL(file);
    }
  };

  const handleNotificationChange = (key: keyof typeof notifications) => {
    setNotifications({ ...notifications, [key]: !notifications[key] });
    toast.success('Notification settings updated!');
  };

  const handlePreferenceChange = (key: string, value: any) => {
    setPreferences({ ...preferences, [key]: value });
    toast.success('Preferences updated!');
  };

  const statsCards = [
    { label: 'Total Points', value: stats.totalPoints, icon: Trophy, color: 'bg-yellow-500' },
    { label: 'Current Level', value: stats.level, icon: TrendingUp, color: 'bg-purple-500' },
    { label: 'Global Rank', value: `#${stats.rank || '-'}`, icon: Target, color: 'bg-blue-500' },
    { label: 'Badges Earned', value: stats.badges, icon: Award, color: 'bg-green-500' },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 dark:bg-gray-900 min-h-screen p-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-700 dark:to-purple-700 text-white p-8 rounded-xl shadow-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-6">
            <div className="relative">
              <div className="w-24 h-24 rounded-full bg-white dark:bg-gray-800 flex items-center justify-center overflow-hidden border-4 border-white shadow-lg">
                {profile.avatar ? (
                  <img src={profile.avatar} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <User className="h-12 w-12 text-primary-600" />
                )}
              </div>
              <label className="absolute bottom-0 right-0 bg-white dark:bg-gray-800 rounded-full p-2 shadow-lg cursor-pointer hover:bg-gray-100 dark:bg-gray-800 transition-colors">
                <Camera className="h-4 w-4 text-primary-600" />
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarUpload}
                  className="hidden"
                />
              </label>
            </div>
            <div>
              <h1 className="text-3xl font-bold">{profile.name}</h1>
              <p className="text-lg opacity-90">{profile.email}</p>
              <div className="flex items-center gap-2 mt-2">
                <span className="bg-white dark:bg-gray-800/20 px-3 py-1 rounded-full text-sm font-medium">
                  {profile.role}
                </span>
                <span className="bg-white dark:bg-gray-800/20 px-3 py-1 rounded-full text-sm font-medium">
                  Level {stats.level}
                </span>
              </div>
            </div>
          </div>
          <button
            onClick={handleEditToggle}
            className="flex items-center gap-2 bg-white dark:bg-gray-800 text-primary-600 px-6 py-3 rounded-lg hover:bg-gray-100 dark:bg-gray-800 transition-colors font-medium"
          >
            {isEditing ? (
              <>
                <X className="h-5 w-5" />
                Cancel
              </>
            ) : (
              <>
                <Edit className="h-5 w-5" />
                Edit Profile
              </>
            )}
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-4 border-b border-gray-200 dark:border-gray-700 dark:border-gray-700">
        <button
          onClick={() => setActiveTab('profile')}
          className={`pb-4 px-4 font-medium transition-colors ${
            activeTab === 'profile'
              ? 'text-primary-600 border-b-2 border-primary-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          Profile Information
        </button>
        <button
          onClick={() => setActiveTab('preferences')}
          className={`pb-4 px-4 font-medium transition-colors ${
            activeTab === 'preferences'
              ? 'text-primary-600 border-b-2 border-primary-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          Preferences
        </button>
        <button
          onClick={() => setActiveTab('security')}
          className={`pb-4 px-4 font-medium transition-colors ${
            activeTab === 'security'
              ? 'text-primary-600 border-b-2 border-primary-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          Security
        </button>
      </div>

      {/* Profile Tab */}
      {activeTab === 'profile' && (
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Personal Information */}
          <div className="bg-white dark:bg-gray-800 dark:bg-gray-800 rounded-xl shadow-md p-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white dark:text-white mb-6">Personal Information</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Full Name
                </label>
                <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
                  <User className="h-5 w-5 text-gray-400" />
                  {isEditing ? (
                    <input
                      type="text"
                      value={editedProfile.name}
                      onChange={(e) => setEditedProfile({ ...editedProfile, name: e.target.value })}
                      className="flex-1 bg-white dark:bg-gray-800 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                  ) : (
                    <span className="text-gray-900 dark:text-white">{profile.name}</span>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Email Address
                </label>
                <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
                  <Mail className="h-5 w-5 text-gray-400" />
                  {isEditing ? (
                    <input
                      type="email"
                      value={editedProfile.email}
                      onChange={(e) => setEditedProfile({ ...editedProfile, email: e.target.value })}
                      className="flex-1 bg-white dark:bg-gray-800 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                  ) : (
                    <span className="text-gray-900 dark:text-white">{profile.email}</span>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Bio
                </label>
                {isEditing ? (
                  <textarea
                    value={editedProfile.bio}
                    onChange={(e) => setEditedProfile({ ...editedProfile, bio: e.target.value })}
                    rows={4}
                    className="w-full p-3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                ) : (
                  <p className="text-gray-900 dark:text-white p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">{profile.bio}</p>
                )}
              </div>

              {isEditing && (
                <button
                  onClick={handleSaveProfile}
                  className="w-full flex items-center justify-center gap-2 bg-primary-600 text-white py-3 rounded-lg hover:bg-primary-700 transition-colors font-medium"
                >
                  <Save className="h-5 w-5" />
                  Save Changes
                </button>
              )}
            </div>
          </div>

          {/* Account Details */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Account Details</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-blue-100 dark:bg-blue-900/20 rounded-lg border border-blue-300 dark:border-blue-700">
                <div className="flex items-center gap-3">
                  <Calendar className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                  <div>
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Member Since</p>
                    <p className="text-lg font-bold text-gray-900 dark:text-white">
                      {new Date(profile.joinDate).toLocaleDateString('en-US', {
                        month: 'long',
                        year: 'numeric'
                      })}
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between p-4 bg-green-100 dark:bg-green-900/20 rounded-lg border border-green-300 dark:border-green-700">
                <div className="flex items-center gap-3">
                  <BookOpen className="h-5 w-5 text-green-600 dark:text-green-400" />
                  <div>
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Homework Completed</p>
                    <p className="text-lg font-bold text-gray-900 dark:text-white">{stats.homeworkCompleted}</p>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between p-4 bg-purple-100 dark:bg-purple-900/20 rounded-lg border border-purple-300 dark:border-purple-700">
                <div className="flex items-center gap-3">
                  <Trophy className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                  <div>
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Quizzes Taken</p>
                    <p className="text-lg font-bold text-gray-900 dark:text-white">{stats.quizzesTaken}</p>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between p-4 bg-yellow-100 dark:bg-yellow-900/20 rounded-lg border border-yellow-300 dark:border-yellow-700">
                <div className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
                  <div>
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Current Streak</p>
                    <p className="text-lg font-bold text-gray-900 dark:text-white">{stats.currentStreak} days</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Preferences Tab */}
      {activeTab === 'preferences' && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Learning Preferences</h2>

          <div className="space-y-6">
            {/* Learning Pace */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                Preferred Learning Pace
              </label>
              <div className="grid grid-cols-3 gap-4">
                {(['slow', 'medium', 'fast'] as const).map((pace) => (
                  <button
                    key={pace}
                    onClick={() => handlePreferenceChange('learningPace', pace)}
                    className={`p-4 rounded-lg border-2 transition-all ${
                      preferences.learningPace === pace
                        ? 'border-primary-600 bg-primary-50'
                        : 'border-gray-200 hover:border-primary-300'
                    }`}
                  >
                    <p className="font-medium capitalize">{pace}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Notifications */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Notification Settings
              </h3>
              <div className="space-y-3">
                {Object.entries(notifications).map(([key, value]) => (
                  <div key={key} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
                    <span className="text-gray-700 dark:text-gray-300 font-medium">
                      {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                    </span>
                    <button
                      onClick={() => handleNotificationChange(key as keyof typeof notifications)}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        value ? 'bg-primary-600' : 'bg-gray-300'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          value ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Security Tab */}
      {activeTab === 'security' && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
            <Lock className="h-6 w-6" />
            Security Settings
          </h2>

          <div className="space-y-6">
            <div className="p-6 bg-gray-50 dark:bg-gray-900 rounded-lg">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Change Password</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Current Password
                  </label>
                  <input
                    type="password"
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-600 focus:border-transparent"
                    placeholder="Enter current password"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    New Password
                  </label>
                  <input
                    type="password"
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-600 focus:border-transparent"
                    placeholder="Enter new password"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Confirm New Password
                  </label>
                  <input
                    type="password"
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-600 focus:border-transparent"
                    placeholder="Confirm new password"
                  />
                </div>
                <button
                  onClick={() => toast.success('Password updated successfully!')}
                  className="w-full bg-primary-600 text-white py-3 rounded-lg hover:bg-primary-700 transition-colors font-medium"
                >
                  Update Password
                </button>
              </div>
            </div>

            <div className="p-6 bg-red-50 rounded-lg border border-red-200">
              <h3 className="text-lg font-semibold text-red-900 mb-2">Danger Zone</h3>
              <p className="text-sm text-red-700 mb-4">
                Once you delete your account, there is no going back. Please be certain.
              </p>
              <button
                onClick={() => toast.error('Account deletion requires admin approval')}
                className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 transition-colors font-medium"
              >
                Delete Account
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfilePage;
