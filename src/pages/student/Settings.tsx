import { useState } from 'react';
import { Sparkles, User, Bell, Shield, Palette } from 'lucide-react';
import { TutorCharacterBuilder } from '../../components/TutorCharacterBuilder';
import { TutorCharacter, PERSONALITY_TRAITS } from '../../types/tutorCharacter';
import { TutorCharacterPreview } from '../../components/TutorCharacterPreview';
import toast from 'react-hot-toast';

const StudentSettings = () => {
  const [activeTab, setActiveTab] = useState<'tutor' | 'profile' | 'notifications' | 'privacy'>('tutor');
  const [tutorCharacter, setTutorCharacter] = useState<TutorCharacter>(() => {
    const saved = localStorage.getItem('tutorCharacter');
    if (saved) {
      const parsed = JSON.parse(saved);
      return { ...parsed, createdAt: new Date(parsed.createdAt) };
    }
    return {
      id: 'default',
      name: 'Buddy',
      personality: 'friend',
      appearance: {
        bodyType: 'round',
        skinColor: '#FBBF24',
        eyeStyle: 'sparkle',
        mouthStyle: 'smile',
        accessory: 'none',
        primaryColor: '#60A5FA',
        secondaryColor: '#A78BFA',
      },
      createdAt: new Date(),
    };
  });

  const tabs = [
    { id: 'tutor', name: 'AI Tutor', icon: Sparkles },
    { id: 'profile', name: 'Profile', icon: User },
    { id: 'notifications', name: 'Notifications', icon: Bell },
    { id: 'privacy', name: 'Privacy', icon: Shield },
  ];

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Settings</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          Customize your learning experience
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar */}
        <div className="lg:col-span-1">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4 space-y-2">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as typeof activeTab)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                    activeTab === tab.id
                      ? 'bg-purple-500 text-white'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span className="font-medium">{tab.name}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Content */}
        <div className="lg:col-span-3">
          {activeTab === 'tutor' && (
            <div className="space-y-6">
              {/* Current Tutor */}
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-purple-500" />
                  Your Current AI Tutor
                </h2>
                <div className="flex items-center gap-6 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-xl p-6">
                  <TutorCharacterPreview
                    appearance={tutorCharacter.appearance}
                    emotion="happy"
                    animate={true}
                    size="large"
                  />
                  <div className="flex-1">
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                      {tutorCharacter.name}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 mb-3">
                      {PERSONALITY_TRAITS[tutorCharacter.personality].icon}{' '}
                      {PERSONALITY_TRAITS[tutorCharacter.personality].name}
                    </p>
                    <p className="text-sm text-gray-700 dark:text-gray-300 italic bg-white dark:bg-gray-800 p-3 rounded-lg">
                      "{PERSONALITY_TRAITS[tutorCharacter.personality].greetings[0]}"
                    </p>
                  </div>
                </div>
              </div>

              {/* Customization */}
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
                <TutorCharacterBuilder
                  initialCharacter={tutorCharacter}
                  onSave={(character) => {
                    setTutorCharacter(character);
                    localStorage.setItem('tutorCharacter', JSON.stringify(character));
                    toast.success(`${character.name} is now your tutor!`);
                  }}
                />
              </div>
            </div>
          )}

          {activeTab === 'profile' && (
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                Profile Settings
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                Profile settings coming soon...
              </p>
            </div>
          )}

          {activeTab === 'notifications' && (
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                Notification Preferences
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                Notification settings coming soon...
              </p>
            </div>
          )}

          {activeTab === 'privacy' && (
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                Privacy & Security
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                Privacy settings coming soon...
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StudentSettings;
