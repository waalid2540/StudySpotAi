import { useState, useEffect } from 'react';
import { Copy, Users, Check, RefreshCw, Mail, Send } from 'lucide-react';
import toast from 'react-hot-toast';
import api, { parentAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';

export const StudentLinkCode = () => {
  const { user } = useAuth();
  const [linkCode, setLinkCode] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [parentEmail, setParentEmail] = useState('');
  const [studentName, setStudentName] = useState('');
  const [sending, setSending] = useState(false);
  const [showEmailForm, setShowEmailForm] = useState(false);

  useEffect(() => {
    fetchLinkCode();
  }, []);

  const fetchLinkCode = async () => {
    try {
      setLoading(true);
      const response = await api.get('/students/link-code');
      setLinkCode(response.data.linkCode);
    } catch (error) {
      console.error('Failed to fetch link code:', error);
      toast.error('Failed to load link code');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(linkCode);
    setCopied(true);
    toast.success('Link code copied to clipboard!');
    setTimeout(() => setCopied(false), 2000);
  };

  const sendEmailToParent = async () => {
    if (!parentEmail || !studentName) {
      toast.error('Please enter both parent email and your name');
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(parentEmail)) {
      toast.error('Please enter a valid email address');
      return;
    }

    try {
      setSending(true);
      const response = await parentAPI.sendLinkCodeEmail(parentEmail, studentName);

      toast.success(`Link code sent to ${parentEmail}!`);

      // Show preview URL in console for testing
      if (response.data.previewUrl) {
        console.log('📧 Email Preview:', response.data.previewUrl);
        toast.success('Check console for email preview link (test mode)', { duration: 5000 });
      }

      // Reset form
      setParentEmail('');
      setStudentName('');
      setShowEmailForm(false);
    } catch (error: any) {
      console.error('Failed to send email:', error);
      const errorMessage = error.response?.data?.error || 'Failed to send email. Please try again.';
      toast.error(errorMessage);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="bg-gradient-to-br from-primary-50 to-secondary-50 dark:from-primary-900/20 dark:to-secondary-900/20 rounded-xl border-2 border-primary-200 dark:border-primary-800 p-6 shadow-lg">
      <div className="flex items-start gap-4">
        <div className="rounded-full bg-primary-100 dark:bg-primary-900/40 p-3">
          <Users className="h-6 w-6 text-primary-600 dark:text-primary-400" />
        </div>
        <div className="flex-1">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
            Parent Link Code
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
            Share this code with your parents so they can monitor your progress
          </p>

          {loading ? (
            <div className="flex items-center justify-center py-4">
              <RefreshCw className="h-6 w-6 animate-spin text-primary-600" />
            </div>
          ) : (
            <>
              <div className="flex items-center gap-3 bg-white dark:bg-gray-800 rounded-lg p-4 border-2 border-primary-300 dark:border-primary-700">
                <div className="flex-1">
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Your Link Code</p>
                  <p className="text-3xl font-bold font-mono text-primary-600 dark:text-primary-400 tracking-wider">
                    {linkCode}
                  </p>
                </div>
                <button
                  onClick={copyToClipboard}
                  className="rounded-lg bg-primary-600 hover:bg-primary-700 text-white px-4 py-3 transition-colors flex items-center gap-2"
                >
                  {copied ? (
                    <>
                      <Check className="h-5 w-5" />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="h-5 w-5" />
                      Copy
                    </>
                  )}
                </button>
              </div>

              <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                <p className="text-xs text-blue-800 dark:text-blue-300">
                  <strong>💡 How to use:</strong> Your parent needs to enter this code when adding you as a child in their account
                </p>
              </div>

              {/* Email to Parent Section */}
              <div className="mt-6 border-t border-primary-200 dark:border-primary-700 pt-4">
                {!showEmailForm ? (
                  <button
                    onClick={() => setShowEmailForm(true)}
                    className="w-full flex items-center justify-center gap-2 rounded-lg bg-white dark:bg-gray-800 border-2 border-primary-300 dark:border-primary-600 text-primary-700 dark:text-primary-400 px-4 py-3 hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-colors font-medium"
                  >
                    <Mail className="h-5 w-5" />
                    Send Code to Parent via Email
                  </button>
                ) : (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                        <Mail className="h-5 w-5 text-primary-600 dark:text-primary-400" />
                        Send via Email
                      </h4>
                      <button
                        onClick={() => setShowEmailForm(false)}
                        className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                      >
                        ✕
                      </button>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Your Name
                      </label>
                      <input
                        type="text"
                        value={studentName}
                        onChange={(e) => setStudentName(e.target.value)}
                        placeholder="Enter your full name"
                        className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-gray-900 dark:text-white focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Parent's Email
                      </label>
                      <input
                        type="email"
                        value={parentEmail}
                        onChange={(e) => setParentEmail(e.target.value)}
                        placeholder="parent@example.com"
                        className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-gray-900 dark:text-white focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500"
                      />
                    </div>

                    <button
                      onClick={sendEmailToParent}
                      disabled={sending || !parentEmail || !studentName}
                      className="w-full flex items-center justify-center gap-2 rounded-lg bg-primary-600 hover:bg-primary-700 text-white px-4 py-3 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {sending ? (
                        <>
                          <RefreshCw className="h-5 w-5 animate-spin" />
                          Sending...
                        </>
                      ) : (
                        <>
                          <Send className="h-5 w-5" />
                          Send Email
                        </>
                      )}
                    </button>

                    <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
                      Your parent will receive an email with your link code and instructions
                    </p>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
