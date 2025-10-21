import { useState, useEffect, useRef } from 'react';
import { Play, Pause, RotateCcw, X, Clock, Coffee, Target } from 'lucide-react';
import toast from 'react-hot-toast';
import { useFocusTrap } from '../hooks/useFocusTrap';

interface StudyTimerProps {
  isOpen: boolean;
  onClose: () => void;
}

type TimerMode = 'focus' | 'shortBreak' | 'longBreak';

const StudyTimer = ({ isOpen, onClose }: StudyTimerProps) => {
  const [mode, setMode] = useState<TimerMode>('focus');
  const [timeLeft, setTimeLeft] = useState(25 * 60); // 25 minutes in seconds
  const [isRunning, setIsRunning] = useState(false);
  const [completedSessions, setCompletedSessions] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const focusTrapRef = useFocusTrap(isOpen);

  const TIMER_SETTINGS = {
    focus: 25 * 60,        // 25 minutes
    shortBreak: 5 * 60,    // 5 minutes
    longBreak: 15 * 60,    // 15 minutes
  };

  useEffect(() => {
    if (!isRunning) return;

    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          handleTimerComplete();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isRunning]);

  // Handle Escape key to close modal
  useEffect(() => {
    if (!isOpen) return;

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  const handleTimerComplete = () => {
    setIsRunning(false);

    // Play notification sound
    if (audioRef.current) {
      audioRef.current.play().catch(() => {});
    }

    if (mode === 'focus') {
      const newCount = completedSessions + 1;
      setCompletedSessions(newCount);
      toast.success(`🎉 Focus session complete! You completed ${newCount} session${newCount > 1 ? 's' : ''} today!`, {
        duration: 5000,
      });

      // Auto-switch to break
      if (newCount % 4 === 0) {
        switchMode('longBreak');
        toast('Time for a long break! You deserve it!', { icon: '☕', duration: 4000 });
      } else {
        switchMode('shortBreak');
        toast('Time for a short break!', { icon: '☕', duration: 4000 });
      }
    } else {
      toast.success('Break complete! Ready for another focus session?', { duration: 4000 });
      switchMode('focus');
    }
  };

  const switchMode = (newMode: TimerMode) => {
    setMode(newMode);
    setTimeLeft(TIMER_SETTINGS[newMode]);
    setIsRunning(false);
  };

  const toggleTimer = () => {
    setIsRunning(!isRunning);
    if (!isRunning) {
      toast.success(mode === 'focus' ? 'Focus time! Stay concentrated!' : 'Break started. Relax!');
    }
  };

  const resetTimer = () => {
    setIsRunning(false);
    setTimeLeft(TIMER_SETTINGS[mode]);
    toast('Timer reset');
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const progress = ((TIMER_SETTINGS[mode] - timeLeft) / TIMER_SETTINGS[mode]) * 100;

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 z-40 flex items-center justify-center p-4"
        onClick={onClose}
        role="dialog"
        aria-modal="true"
        aria-labelledby="study-timer-title"
      >
        {/* Timer Card */}
        <div
          ref={focusTrapRef}
          className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-fade-in"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className={`p-6 text-white ${
            mode === 'focus'
              ? 'bg-gradient-to-r from-blue-600 to-purple-600'
              : mode === 'shortBreak'
              ? 'bg-gradient-to-r from-green-600 to-teal-600'
              : 'bg-gradient-to-r from-orange-600 to-red-600'
          }`}>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <Clock className="h-6 w-6" aria-hidden="true" />
                <h2 id="study-timer-title" className="text-2xl font-bold">Study Timer</h2>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-white/20 dark:hover:bg-white/30 rounded-lg transition-colors"
                aria-label="Close study timer"
              >
                <X className="h-6 w-6" aria-hidden="true" />
              </button>
            </div>

            {/* Mode Selector */}
            <div className="flex gap-2">
              <button
                onClick={() => switchMode('focus')}
                className={`flex-1 px-4 py-2 rounded-lg font-medium transition-colors ${
                  mode === 'focus'
                    ? 'bg-white text-blue-600'
                    : 'bg-white/20 hover:bg-white/30'
                }`}
              >
                <Target className="inline h-4 w-4 mr-1" />
                Focus
              </button>
              <button
                onClick={() => switchMode('shortBreak')}
                className={`flex-1 px-4 py-2 rounded-lg font-medium transition-colors ${
                  mode === 'shortBreak'
                    ? 'bg-white text-green-600'
                    : 'bg-white/20 hover:bg-white/30'
                }`}
              >
                <Coffee className="inline h-4 w-4 mr-1" />
                Short
              </button>
              <button
                onClick={() => switchMode('longBreak')}
                className={`flex-1 px-4 py-2 rounded-lg font-medium transition-colors ${
                  mode === 'longBreak'
                    ? 'bg-white text-orange-600'
                    : 'bg-white/20 hover:bg-white/30'
                }`}
              >
                <Coffee className="inline h-4 w-4 mr-1" />
                Long
              </button>
            </div>
          </div>

          {/* Timer Display */}
          <div className="p-8">
            {/* Circular Progress */}
            <div className="relative w-64 h-64 mx-auto mb-8">
              {/* Background Circle */}
              <svg className="w-full h-full transform -rotate-90">
                <circle
                  cx="128"
                  cy="128"
                  r="120"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="8"
                  className="text-gray-200 dark:text-gray-700"
                />
                {/* Progress Circle */}
                <circle
                  cx="128"
                  cy="128"
                  r="120"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="8"
                  strokeDasharray={`${2 * Math.PI * 120}`}
                  strokeDashoffset={`${2 * Math.PI * 120 * (1 - progress / 100)}`}
                  strokeLinecap="round"
                  className={`transition-all duration-1000 ${
                    mode === 'focus'
                      ? 'text-blue-600'
                      : mode === 'shortBreak'
                      ? 'text-green-600'
                      : 'text-orange-600'
                  }`}
                />
              </svg>

              {/* Time Text */}
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <div className="text-6xl font-bold text-gray-900 dark:text-white mb-2">
                  {formatTime(timeLeft)}
                </div>
                <div className="text-lg text-gray-600 dark:text-gray-400 capitalize">
                  {mode === 'shortBreak' ? 'Short Break' : mode === 'longBreak' ? 'Long Break' : 'Focus Time'}
                </div>
              </div>
            </div>

            {/* Controls */}
            <div className="flex gap-4 justify-center mb-6">
              <button
                onClick={toggleTimer}
                className={`flex items-center gap-2 px-8 py-4 rounded-xl font-semibold text-white shadow-lg hover:shadow-xl transition-all ${
                  mode === 'focus'
                    ? 'bg-blue-600 hover:bg-blue-700'
                    : mode === 'shortBreak'
                    ? 'bg-green-600 hover:bg-green-700'
                    : 'bg-orange-600 hover:bg-orange-700'
                }`}
              >
                {isRunning ? (
                  <>
                    <Pause className="h-5 w-5" />
                    Pause
                  </>
                ) : (
                  <>
                    <Play className="h-5 w-5" />
                    Start
                  </>
                )}
              </button>
              <button
                onClick={resetTimer}
                className="flex items-center gap-2 px-6 py-4 rounded-xl font-semibold text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
              >
                <RotateCcw className="h-5 w-5" />
                Reset
              </button>
            </div>

            {/* Stats */}
            <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  Sessions Completed Today
                </span>
                <span className="text-2xl font-bold text-gray-900 dark:text-white">
                  {completedSessions}
                </span>
              </div>
              <div className="mt-2 bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                <div
                  className="bg-gradient-to-r from-blue-600 to-purple-600 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${Math.min((completedSessions / 8) * 100, 100)}%` }}
                />
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 text-center">
                Goal: 8 sessions per day
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Audio element for notification sound */}
      <audio ref={audioRef} src="data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSuBzvLZjDwKE2S56+iTUhMKTajk8bllHAU8ltj1unQlBSl+zPLaizsKEGG37OypWRQMSKXh8L1qIgUtgc3y2IY6CRZmu+rllVEQCU+o4/G4aCAGPJPY88p5KwUme8rx3I8+ChVfsOfxrF0UDEin4PK4ZRkGN5bY88t4KQUkd8rx4JI/ChN," />
    </>
  );
};

export default StudyTimer;
