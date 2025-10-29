import { useState, useEffect } from 'react';
import { Copy, Users, Check, RefreshCw } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../services/api';

export const StudentLinkCode = () => {
  const [linkCode, setLinkCode] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

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
            </>
          )}
        </div>
      </div>
    </div>
  );
};
