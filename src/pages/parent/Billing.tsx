import { useState } from 'react';
import {
  CreditCard,
  Calendar,
  DollarSign,
  Download,
  FileText,
  Check,
  X,
  Plus,
  Edit2,
  Trash2,
  AlertCircle,
  Crown,
  Zap,
} from 'lucide-react';
import toast from 'react-hot-toast';

interface PaymentMethod {
  id: string;
  type: 'visa' | 'mastercard' | 'amex';
  last4: string;
  expiryMonth: number;
  expiryYear: number;
  isDefault: boolean;
}

interface Invoice {
  id: string;
  date: string;
  amount: number;
  status: 'paid' | 'pending' | 'failed';
  description: string;
  invoiceUrl: string;
}

const ParentBilling = () => {
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);

  const [invoices] = useState<Invoice[]>([]);

  const [showAddCardModal, setShowAddCardModal] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [subscriptionActive, setSubscriptionActive] = useState(false);

  const currentPlan = {
    name: 'No Active Plan',
    price: 0,
    billingCycle: 'monthly',
    nextBillingDate: '-',
    features: [] as string[],
  };

  const handleAddCard = () => {
    toast.success('Payment method added successfully!');
    setShowAddCardModal(false);
  };

  const handleSetDefault = (id: string) => {
    setPaymentMethods((prev) =>
      prev.map((method) => ({
        ...method,
        isDefault: method.id === id,
      }))
    );
    toast.success('Default payment method updated!');
  };

  const handleDeleteCard = (id: string) => {
    setPaymentMethods((prev) => prev.filter((method) => method.id !== id));
    toast.success('Payment method removed!');
  };

  const handleCancelSubscription = () => {
    setSubscriptionActive(false);
    setShowCancelModal(false);
    toast.success('Subscription cancelled. Access will continue until end of billing period.');
  };

  const handleReactivateSubscription = () => {
    setSubscriptionActive(true);
    toast.success('Subscription reactivated!');
  };

  const getCardIcon = (type: string) => {
    return <CreditCard className="h-6 w-6" />;
  };

  const getStatusColor = (status: Invoice['status']) => {
    switch (status) {
      case 'paid':
        return 'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400';
      case 'pending':
        return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-400';
      case 'failed':
        return 'bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Billing & Subscription
        </h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          Manage your subscription and payment methods
        </p>
      </div>

      {/* Current Plan */}
      <div className="rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 p-8 shadow-lg text-white">
        <div className="flex items-start justify-between mb-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Crown className="h-6 w-6" />
              <h2 className="text-2xl font-bold">{currentPlan.name}</h2>
            </div>
            <p className="text-purple-100">
              Active since September 2024 •{' '}
              {subscriptionActive ? 'Renews automatically' : 'Cancelled'}
            </p>
          </div>
          <div className="text-right">
            <div className="text-4xl font-bold">${currentPlan.price}</div>
            <div className="text-purple-100">per {currentPlan.billingCycle}</div>
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 mb-6">
          {currentPlan.features.map((feature, index) => (
            <div key={index} className="flex items-center gap-2">
              <Check className="h-5 w-5 flex-shrink-0" />
              <span>{feature}</span>
            </div>
          ))}
        </div>

        <div className="flex items-center gap-4 pt-4 border-t border-purple-400">
          <div className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            <span className="text-sm">
              Next billing: {new Date(currentPlan.nextBillingDate).toLocaleDateString()}
            </span>
          </div>
        </div>
      </div>

      {/* Subscription Actions */}
      <div className="rounded-xl bg-white dark:bg-gray-800 p-6 shadow-md">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
          Subscription Management
        </h2>
        <div className="flex flex-wrap gap-3">
          {subscriptionActive ? (
            <>
              <button className="inline-flex items-center gap-2 rounded-lg border border-gray-300 dark:border-gray-600 px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                <Zap className="h-5 w-5" />
                Upgrade Plan
              </button>
              <button
                onClick={() => setShowCancelModal(true)}
                className="inline-flex items-center gap-2 rounded-lg border border-red-300 dark:border-red-600 px-4 py-2 text-red-700 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
              >
                <X className="h-5 w-5" />
                Cancel Subscription
              </button>
            </>
          ) : (
            <button
              onClick={handleReactivateSubscription}
              className="inline-flex items-center gap-2 rounded-lg bg-primary-600 px-4 py-2 text-white hover:bg-primary-700 transition-colors"
            >
              <Check className="h-5 w-5" />
              Reactivate Subscription
            </button>
          )}
        </div>
      </div>

      {/* Payment Methods */}
      <div className="rounded-xl bg-white dark:bg-gray-800 p-6 shadow-md">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">Payment Methods</h2>
          <button
            onClick={() => setShowAddCardModal(true)}
            className="inline-flex items-center gap-2 rounded-lg bg-primary-600 px-4 py-2 text-white hover:bg-primary-700 transition-colors"
          >
            <Plus className="h-5 w-5" />
            Add Card
          </button>
        </div>

        <div className="space-y-4">
          {paymentMethods.map((method) => (
            <div
              key={method.id}
              className={`flex items-center justify-between p-4 rounded-lg border ${
                method.isDefault
                  ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                  : 'border-gray-200 dark:border-gray-700'
              }`}
            >
              <div className="flex items-center gap-4">
                <div className="rounded-lg bg-gray-100 dark:bg-gray-700 p-3">
                  {getCardIcon(method.type)}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-semibold text-gray-900 dark:text-white">
                      {method.type.charAt(0).toUpperCase() + method.type.slice(1)} ••••{' '}
                      {method.last4}
                    </p>
                    {method.isDefault && (
                      <span className="rounded-full bg-primary-600 px-2 py-0.5 text-xs text-white">
                        Default
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Expires {method.expiryMonth.toString().padStart(2, '0')}/{method.expiryYear}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {!method.isDefault && (
                  <button
                    onClick={() => handleSetDefault(method.id)}
                    className="rounded-lg border border-gray-300 dark:border-gray-600 px-3 py-1.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  >
                    Set as Default
                  </button>
                )}
                <button
                  onClick={() => handleDeleteCard(method.id)}
                  className="rounded-lg p-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                >
                  <Trash2 className="h-5 w-5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Billing History */}
      <div className="rounded-xl bg-white dark:bg-gray-800 p-6 shadow-md">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Billing History</h2>
        <div className="space-y-3">
          {invoices.map((invoice) => (
            <div
              key={invoice.id}
              className="flex items-center justify-between p-4 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
            >
              <div className="flex items-center gap-4">
                <div className="rounded-lg bg-primary-50 dark:bg-primary-900/20 p-2">
                  <FileText className="h-5 w-5 text-primary-600" />
                </div>
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">
                    {invoice.description}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {new Date(invoice.date).toLocaleDateString()} • Invoice #{invoice.id}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <span
                  className={`rounded-full px-3 py-1 text-xs font-medium ${getStatusColor(
                    invoice.status
                  )}`}
                >
                  {invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
                </span>
                <span className="font-bold text-gray-900 dark:text-white">
                  ${invoice.amount.toFixed(2)}
                </span>
                <button
                  onClick={() => toast.success('Downloading invoice...')}
                  className="rounded-lg border border-gray-300 dark:border-gray-600 p-2 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  <Download className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Billing Information */}
      <div className="rounded-xl bg-blue-50 dark:bg-blue-900/20 p-6">
        <div className="flex items-start gap-3">
          <AlertCircle className="h-6 w-6 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">
              Billing Information
            </h3>
            <ul className="space-y-1 text-sm text-blue-800 dark:text-blue-200">
              <li>
                • Your subscription renews automatically on the 1st of each month
              </li>
              <li>• You can cancel anytime - no penalties or fees</li>
              <li>• All payments are processed securely through Stripe</li>
              <li>• Need help? Contact our support team at billing@learningplatform.com</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Add Card Modal */}
      {showAddCardModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-xl bg-white dark:bg-gray-800 p-6 shadow-xl">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                Add Payment Method
              </h2>
              <button
                onClick={() => setShowAddCardModal(false)}
                className="rounded-lg p-2 hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Card Number
                </label>
                <input
                  type="text"
                  placeholder="1234 5678 9012 3456"
                  className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-4 py-2 text-gray-900 dark:text-white focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Expiry Date
                  </label>
                  <input
                    type="text"
                    placeholder="MM/YY"
                    className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-4 py-2 text-gray-900 dark:text-white focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    CVC
                  </label>
                  <input
                    type="text"
                    placeholder="123"
                    className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-4 py-2 text-gray-900 dark:text-white focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Cardholder Name
                </label>
                <input
                  type="text"
                  placeholder="John Doe"
                  className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-4 py-2 text-gray-900 dark:text-white focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="setDefault"
                  className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                />
                <label
                  htmlFor="setDefault"
                  className="text-sm text-gray-700 dark:text-gray-300"
                >
                  Set as default payment method
                </label>
              </div>
            </div>

            <div className="mt-6 flex gap-3">
              <button
                onClick={() => setShowAddCardModal(false)}
                className="flex-1 rounded-lg border border-gray-300 dark:border-gray-600 px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleAddCard}
                className="flex-1 rounded-lg bg-primary-600 px-4 py-2 text-white hover:bg-primary-700 transition-colors"
              >
                Add Card
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Cancel Subscription Modal */}
      {showCancelModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-xl bg-white dark:bg-gray-800 p-6 shadow-xl">
            <div className="mb-6">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/20 mb-4">
                <AlertCircle className="h-6 w-6 text-red-600 dark:text-red-400" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white text-center mb-2">
                Cancel Subscription?
              </h2>
              <p className="text-gray-600 dark:text-gray-400 text-center">
                You'll continue to have access until the end of your current billing period on{' '}
                <strong>{new Date(currentPlan.nextBillingDate).toLocaleDateString()}</strong>.
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowCancelModal(false)}
                className="flex-1 rounded-lg border border-gray-300 dark:border-gray-600 px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                Keep Subscription
              </button>
              <button
                onClick={handleCancelSubscription}
                className="flex-1 rounded-lg bg-red-600 px-4 py-2 text-white hover:bg-red-700 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ParentBilling;
