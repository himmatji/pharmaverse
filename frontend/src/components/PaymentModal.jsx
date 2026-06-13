import { useState } from 'react';
import axios from 'axios';
import { X, CreditCard, Shield, Lock, Sparkles, Wallet, CheckCircle } from 'lucide-react';

// ========== DYNAMIC BASE URL - Works on both Localhost & EC2 ==========
const EC2_BASE_URL = "http://3.109.121.96:5000";
const LOCAL_BASE_URL = "http://localhost:5000";

// Auto-detect environment
const isProduction = window.location.hostname !== "localhost" && window.location.hostname !== "127.0.0.1";
const BASE_URL = isProduction ? EC2_BASE_URL : LOCAL_BASE_URL;

console.log(`🌐 PaymentModal running in ${isProduction ? "PRODUCTION (EC2)" : "DEVELOPMENT (Localhost)"} mode`);

const API_URL = `${BASE_URL}/api/payment`;

const PaymentModal = ({ isOpen, onClose, product, onSuccess }) => {
  const [loading, setLoading] = useState(false);

  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      // Check if script already exists
      if (window.Razorpay) {
        resolve(true);
        return;
      }
      
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handlePayment = async () => {
    setLoading(true);
    
    try {
      const token = localStorage.getItem('userToken') || localStorage.getItem('token') || sessionStorage.getItem('userToken');
      
      if (!token) {
        alert('Please login first');
        window.location.href = '/login';
        return;
      }
      
      // Create order
      const orderResponse = await axios.post(`${API_URL}/create-order`, {
        amount: product.price,
        productType: product.type,
        productId: product.id,
        productTitle: product.title
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      const { orderId, amount, currency, key } = orderResponse.data;
      
      // Load Razorpay script
      const res = await loadRazorpayScript();
      if (!res) {
        alert('Failed to load payment gateway. Please check your internet connection.');
        setLoading(false);
        return;
      }
      
      // Get user details for prefill
      let userName = '';
      let userEmail = '';
      try {
        const userData = localStorage.getItem('user');
        if (userData) {
          const user = JSON.parse(userData);
          userName = user.name || '';
          userEmail = user.email || '';
        }
      } catch (e) {
        console.error('Error parsing user data:', e);
      }
      
      const options = {
        key: key,
        amount: amount * 100,
        currency: currency,
        name: 'PharmaVerse',
        description: `Purchase: ${product.title}`,
        image: '/logo.png',
        order_id: orderId,
        handler: async (response) => {
          try {
            // Verify payment
            const verifyResponse = await axios.post(`${API_URL}/verify-payment`, {
              orderId: response.razorpay_order_id,
              paymentId: response.razorpay_payment_id,
              signature: response.razorpay_signature,
              productType: product.type,
              productId: product.id
            }, {
              headers: { Authorization: `Bearer ${token}` }
            });
            
            if (verifyResponse.data.success) {
              // Update local storage
              try {
                const user = JSON.parse(localStorage.getItem('user') || sessionStorage.getItem('user'));
                if (user) {
                  if (!user.purchasedItems) user.purchasedItems = [];
                  user.purchasedItems.push({
                    productType: product.type,
                    productId: product.id,
                    productTitle: product.title,
                    amount: product.price,
                    purchasedAt: new Date()
                  });
                  localStorage.setItem('user', JSON.stringify(user));
                }
              } catch (e) {
                console.error('Error updating user data:', e);
              }
              
              alert('🎉 Payment successful! You can now access the content.');
              if (onSuccess) onSuccess();
              onClose();
            } else {
              alert('Payment verification failed. Please contact support.');
            }
          } catch (error) {
            console.error('Verification error:', error);
            alert('Payment verification failed. Please contact support.');
          }
        },
        prefill: {
          name: userName,
          email: userEmail
        },
        theme: {
          color: '#7c3aed'
        },
        modal: {
          ondismiss: () => {
            setLoading(false);
          }
        }
      };
      
      const razorpay = new window.Razorpay(options);
      razorpay.on('payment.failed', (response) => {
        console.error('Payment failed:', response.error);
        alert('Payment failed: ' + (response.error.description || 'Please try again'));
        setLoading(false);
      });
      razorpay.open();
      
    } catch (error) {
      console.error('Payment error:', error);
      alert(error.response?.data?.message || 'Payment failed. Please try again.');
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  // Animation styles
  const styleSheet = document.createElement("style");
  styleSheet.textContent = `
    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }
    @keyframes scaleIn {
      from {
        opacity: 0;
        transform: scale(0.95);
      }
      to {
        opacity: 1;
        transform: scale(1);
      }
    }
    .animate-fadeIn {
      animation: fadeIn 0.3s ease-out;
    }
    .animate-scaleIn {
      animation: scaleIn 0.3s ease-out;
    }
  `;
  document.head.appendChild(styleSheet);

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center z-50 animate-fadeIn p-4">
      <div className="bg-white rounded-2xl p-5 sm:p-8 w-full max-w-md shadow-2xl animate-scaleIn">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-xl flex items-center justify-center">
              <Wallet size={20} className="sm:w-6 sm:h-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-gray-800">Premium Access</h2>
              <p className="text-gray-500 text-xs sm:text-sm">Secure payment gateway</p>
            </div>
          </div>
          <button onClick={onClose} className="hover:bg-gray-100 p-2 rounded-full transition-all">
            <X size={18} className="sm:w-5 sm:h-5" />
          </button>
        </div>

        <div className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-xl p-4 sm:p-5 mb-6">
          <p className="text-xs sm:text-sm text-gray-600 mb-1">You are purchasing:</p>
          <h3 className="text-lg sm:text-xl font-bold text-gray-800 break-words">{product.title}</h3>
          <div className="flex items-center gap-2 mt-3">
            <Sparkles size={14} className="sm:w-4 sm:h-4 text-yellow-500" />
            <span className="text-[10px] sm:text-xs text-gray-500">Instant access after payment</span>
          </div>
        </div>

        <div className="space-y-4 mb-6">
          <div className="flex justify-between items-center py-3 border-b">
            <span className="text-gray-600 text-sm sm:text-base">Product Price</span>
            <span className="text-xl sm:text-2xl font-bold text-purple-600">₹{product.price}</span>
          </div>
          <div className="flex justify-between items-center py-3 border-b">
            <span className="text-gray-600 text-sm sm:text-base">Payment Gateway Fee</span>
            <span className="text-gray-500 text-sm sm:text-base">Included</span>
          </div>
          <div className="flex justify-between items-center py-2">
            <div className="flex items-center gap-2">
              <Shield size={14} className="sm:w-4 sm:h-4 text-green-600" />
              <span className="text-[10px] sm:text-xs text-gray-500">Secure SSL Encryption</span>
            </div>
            <div className="flex items-center gap-2">
              <Lock size={14} className="sm:w-4 sm:h-4 text-green-600" />
              <span className="text-[10px] sm:text-xs text-gray-500">100% Safe</span>
            </div>
          </div>
        </div>

        <button
          onClick={handlePayment}
          disabled={loading}
          className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white py-3 sm:py-4 rounded-xl font-bold text-base sm:text-lg transition-all duration-300 flex items-center justify-center gap-2 sm:gap-3 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 sm:h-5 sm:w-5 border-b-2 border-white"></div>
              Processing...
            </>
          ) : (
            <>
              <CreditCard size={16} className="sm:w-5 sm:h-5" />
              Pay ₹{product.price} & Access
            </>
          )}
        </button>

        <p className="text-center text-[10px] sm:text-xs text-gray-400 mt-4">
          By completing this purchase, you agree to our Terms of Service
        </p>
      </div>
    </div>
  );
};

export default PaymentModal;