import { useState } from 'react';
import { useAuth } from '../../hooks/useSupabase';

interface MpesaPaymentProps {
  amount: number;
  planType: string;
  onSuccess?: () => void;
}

export default function MpesaPayment({ amount, planType, onSuccess }: MpesaPaymentProps) {
  const { user } = useAuth();
  const [phoneNumber, setPhoneNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handlePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);
    setMessage('');

    try {
      const response = await fetch('/api/mpesa/pay', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phoneNumber: phoneNumber.replace(/^0/, '254'),
          amount,
          userId: user.id,
          planType
        })
      });

      const data = await response.json();

      if (data.success) {
        setMessage('Payment request sent to your phone. Please enter your M-Pesa PIN to complete the payment.');
        onSuccess?.();
      } else {
        setMessage(data.error || 'Payment failed');
      }
    } catch (error: any) {
      setMessage('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <div className="flex items-center mb-4">
        <div className="w-8 h-8 bg-green-600 rounded mr-3 flex items-center justify-center text-white font-bold">M</div>
        <h3 className="text-lg font-semibold">Pay with M-Pesa</h3>
      </div>

      <form onSubmit={handlePayment} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Phone Number</label>
          <input
            type="tel"
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
            placeholder="0712345678"
            className="w-full p-3 border rounded-lg"
            required
          />
          <p className="text-xs text-gray-500 mt-1">Enter your Safaricom number</p>
        </div>

        <div className="bg-green-50 p-3 rounded-lg">
          <div className="flex justify-between items-center">
            <span className="font-medium">Amount:</span>
            <span className="text-lg font-bold text-green-600">KSh {amount}</span>
          </div>
          <div className="flex justify-between items-center mt-1">
            <span className="text-sm text-gray-600">Plan:</span>
            <span className="text-sm">{planType}</span>
          </div>
        </div>

        {message && (
          <div className={`p-3 rounded-lg ${message.includes('successful') ? 'bg-green-100 text-green-700' : 
            message.includes('failed') ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'}`}>
            {message}
          </div>
        )}

        <button
          type="submit"
          disabled={loading || !phoneNumber}
          className="w-full bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 disabled:opacity-50 font-medium"
        >
          {loading ? 'Processing...' : `Pay KSh ${amount}`}
        </button>
      </form>
    </div>
  );
}