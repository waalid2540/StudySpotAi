import { useState } from 'react';
import { aiAPI } from '../services/api';
import { Sparkles, Loader2, BookOpen, CheckCircle2 } from 'lucide-react';
import toast from 'react-hot-toast';

interface AIHomeworkHelperProps {
  onClose: () => void;
}

const AIHomeworkHelper = ({ onClose }: AIHomeworkHelperProps) => {
  const [question, setQuestion] = useState('');
  const [subject, setSubject] = useState('Math');
  const [solution, setSolution] = useState('');
  const [keyPoints, setKeyPoints] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const subjects = ['Math', 'Science', 'English', 'History', 'Physics', 'Chemistry', 'Biology', 'Other'];

  const handleSolve = async () => {
    if (!question.trim()) {
      toast.error('Please enter a question');
      return;
    }

    setLoading(true);
    try {
      const response = await aiAPI.solveHomework(question, subject);
      setSolution(response.data.solution);
      setKeyPoints(response.data.keyPoints || []);

      const pointsEarned = response.data.pointsEarned || 5;
      const totalPoints = response.data.totalPoints;
      const aiUsageCount = response.data.aiUsageCount;

      if (totalPoints) {
        toast.success(`🎉 +${pointsEarned} points! Total: ${totalPoints} | AI Used: ${aiUsageCount}x`, {
          duration: 4000,
        });
      } else {
        toast.success(`Solution generated! You earned ${pointsEarned} points!`);
      }
    } catch (error: any) {
      console.error('AI Solve Error:', error);
      toast.error(error.response?.data?.error || 'Failed to generate solution');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white p-6 rounded-t-xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Sparkles className="h-8 w-8" />
              <div>
                <h2 className="text-2xl font-bold">AI Homework Helper</h2>
                <p className="text-sm opacity-90">Get step-by-step solutions with AI</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-white/80 hover:text-white text-2xl font-bold"
            >
              ×
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Input Section */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Subject
              </label>
              <select
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent"
              >
                {subjects.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Your Question
              </label>
              <textarea
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                placeholder="Enter your homework question here... Be as specific as possible!"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent min-h-32"
                disabled={loading}
              />
              <p className="text-xs text-gray-500 mt-2">
                Example: "Solve for x: 2x + 5 = 15" or "Explain how photosynthesis works"
              </p>
            </div>

            <button
              onClick={handleSolve}
              disabled={loading || !question.trim()}
              className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white py-3 rounded-lg hover:shadow-lg transition-shadow disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 font-semibold"
            >
              {loading ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Generating Solution...
                </>
              ) : (
                <>
                  <Sparkles className="h-5 w-5" />
                  Get AI Help
                </>
              )}
            </button>
          </div>

          {/* Solution Section */}
          {solution && (
            <div className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-xl p-6 border-2 border-purple-200">
              <div className="flex items-center gap-2 mb-4">
                <CheckCircle2 className="h-6 w-6 text-green-600" />
                <h3 className="text-lg font-bold text-gray-900">AI Solution</h3>
              </div>
              <div className="prose prose-sm max-w-none">
                <div className="whitespace-pre-wrap text-gray-800 leading-relaxed">
                  {solution}
                </div>
              </div>

              {/* Key Points */}
              {keyPoints.length > 0 && (
                <div className="mt-4 p-4 bg-white rounded-lg border border-purple-200">
                  <p className="font-semibold text-purple-900 mb-2">🔑 Key Points:</p>
                  <ul className="space-y-1">
                    {keyPoints.map((point, index) => (
                      <li key={index} className="text-sm text-gray-700 flex items-start gap-2">
                        <span className="text-purple-600">•</span>
                        {point}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="mt-4 p-4 bg-white rounded-lg border border-purple-200">
                <div className="flex items-start gap-3">
                  <BookOpen className="h-5 w-5 text-purple-600 flex-shrink-0 mt-0.5" />
                  <div className="text-sm text-gray-700">
                    <p className="font-semibold text-purple-900 mb-1">Learning Tip:</p>
                    <p>Make sure you understand each step before moving forward. Try solving a similar problem on your own to reinforce what you've learned!</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Tips */}
          {!solution && !loading && (
            <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
              <h4 className="font-semibold text-blue-900 mb-2">💡 Tips for Better Results:</h4>
              <ul className="text-sm text-blue-800 space-y-1 ml-4 list-disc">
                <li>Be specific with your question</li>
                <li>Include all relevant information</li>
                <li>Select the correct subject</li>
                <li>For math problems, show the equation clearly</li>
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AIHomeworkHelper;
