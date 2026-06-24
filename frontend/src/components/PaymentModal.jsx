import { useState } from 'react';
import axios from 'axios';
import { X, CreditCard, Shield, Lock, Sparkles, Wallet, CheckCircle } from 'lucide-react';

const PaymentModal = ({ isOpen, onClose, product, onSuccess }) => {
  const [loading, setLoading] = useState(false);

  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
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
      const token = localStorage.getItem('userToken') || sessionStorage.getItem('userToken');
      
      if (!token) {
        alert('Please login first');
        window.location.href = '/login';
        return;
      }
      
      // Create order
      const orderResponse = await axios.post('https://api.pharmaverse.co.in/api/payment/create-order', {
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
      
      const options = {
        key: key,
        amount: amount * 100,
        currency: currency,
        name: 'PharmaVerse',
        description: `Purchase: ${product.title}`,
        image: '/logo.png',
        order_id: orderId,
        handler: async (response) => {
          // Verify payment
          const verifyResponse = await axios.post('https://api.pharmaverse.co.in/api/payment/verify-payment', {
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
            const user = JSON.parse(localStorage.getItem('user') || sessionStorage.getItem('user'));
            if (user) {
              if (!user.purchasedItems) user.purchasedItems = [];
              user.purchasedItems.push({
                productType: product.type,
                productId: product.id,
                productTitle: product.title,
                purchasedAt: new Date()
              });
              localStorage.setItem('user', JSON.stringify(user));
            }
            
            alert('🎉 Payment successful! You can now access the content.');
            onSuccess();
            onClose();
          }
        },
        prefill: {
          name: localStorage.getItem('userName') || '',
          email: localStorage.getItem('userEmail') || ''
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
      razorpay.open();
      
    } catch (error) {
      console.error('Payment error:', error);
      alert(error.response?.data?.message || 'Payment failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center z-50 animate-fadeIn p-4">
      <div className="bg-white rounded-2xl p-6 sm:p-8 w-full max-w-[92%] sm:max-w-md shadow-2xl animate-scaleIn mx-2 sm:mx-4">
        <div className="flex justify-between items-center mb-4 sm:mb-6">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-xl flex items-center justify-center">
              <Wallet size={20} className="sm:w-[24px] sm:h-[24px] text-white" />
            </div>
            <div>
              <h2 className="text-lg sm:text-2xl font-bold text-gray-800">Premium Access</h2>
              <p className="text-xs sm:text-sm text-gray-500">Secure payment gateway</p>
            </div>
          </div>
          <button onClick={onClose} className="hover:bg-gray-100 p-1.5 sm:p-2 rounded-full transition-all">
            <X size={18} className="sm:w-[20px] sm:h-[20px]" />
          </button>
        </div>

        <div className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-xl p-4 sm:p-5 mb-4 sm:mb-6">
          <p className="text-xs sm:text-sm text-gray-600 mb-1">You are purchasing:</p>
          <h3 className="text-base sm:text-lg md:text-xl font-bold text-gray-800">{product.title}</h3>
          <div className="flex items-center gap-2 mt-2 sm:mt-3">
            <Sparkles size={14} className="sm:w-[16px] sm:h-[16px] text-yellow-500" />
            <span className="text-[10px] sm:text-xs text-gray-500">Instant access after payment</span>
          </div>
        </div>

        <div className="space-y-3 sm:space-y-4 mb-4 sm:mb-6">
          <div className="flex justify-between items-center py-2 sm:py-3 border-b">
            <span className="text-sm sm:text-base text-gray-600">Product Price</span>
            <span className="text-xl sm:text-2xl font-bold text-purple-600">₹{product.price}</span>
          </div>
          <div className="flex justify-between items-center py-2 sm:py-3 border-b">
            <span className="text-sm sm:text-base text-gray-600">Payment Gateway Fee</span>
            <span className="text-sm sm:text-base text-gray-500">Included</span>
          </div>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-1 sm:gap-2 py-2">
            <div className="flex items-center gap-2">
              <Shield size={14} className="sm:w-[16px] sm:h-[16px] text-green-600" />
              <span className="text-[10px] sm:text-sm text-gray-500">Secure SSL Encryption</span>
            </div>
            <div className="flex items-center gap-2">
              <Lock size={14} className="sm:w-[16px] sm:h-[16px] text-green-600" />
              <span className="text-[10px] sm:text-sm text-gray-500">100% Safe</span>
            </div>
          </div>
        </div>

        <button
          onClick={handlePayment}
          disabled={loading}
          className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white py-3 sm:py-4 rounded-xl font-bold text-base sm:text-lg transition-all duration-300 flex items-center justify-center gap-2 sm:gap-3 shadow-lg hover:shadow-xl"
        >
          {loading ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 sm:h-5 sm:w-5 border-b-2 border-white"></div>
              Processing...
            </>
          ) : (
            <>
              <CreditCard size={18} className="sm:w-[20px] sm:h-[20px]" />
              Pay ₹{product.price} & Access
            </>
          )}
        </button>

        <p className="text-center text-[10px] sm:text-xs text-gray-400 mt-3 sm:mt-4">
          By completing this purchase, you agree to our Terms of Service
        </p>
      </div>
    </div>
  );
};

export default PaymentModal;