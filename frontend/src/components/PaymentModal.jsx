
Loading older messages…






















































import { useState } from 'react';
import axios from 'axios';
import {
  X,
  CreditCard,
  Shield,
  Lock,
  Sparkles,
  Wallet,
} from 'lucide-react';

const API_BASE = (import.meta.env.VITE_API_URL || 'https://api.pharmaverse.co.in').replace(/\/$/, '');

const getToken = () =>
  localStorage.getItem('userToken') || sessionStorage.getItem('userToken');

const loadRazorpayScript = () => {
  if (window.Razorpay) return Promise.resolve(true);

  return new Promise((resolve) => {
    const existingScript = document.querySelector(
      'script[src="https://checkout.razorpay.com/v1/checkout.js"]'
    );

    if (existingScript) {
      existingScript.addEventListener('load', () => resolve(true), { once: true });
      existingScript.addEventListener('error', () => resolve(false), { once: true });
      // In case an earlier load completed before this call.
      if (window.Razorpay) resolve(true);
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

const getCourseContentPayload = (product) => {
  if (!product || product.type !== 'course-content') return {};

  // These values must match the selected pricing rule in the admin panel.
  return {
    productType: 'course-content',
    course: product.course || '',
    category: product.category || '',
    semester: product.semester == null ? '' : String(product.semester),
    year: product.year == null ? '' : String(product.year),
    language: product.language || '',
    specialization: product.specialization || '',
    contentKey: product.contentKey || '',
  };
};

const PaymentModal = ({ isOpen, onClose, product, onSuccess }) => {
  const [loading, setLoading] = useState(false);

  if (!isOpen || !product) return null;

  const handlePayment = async () => {
    if (loading) return;
    setLoading(true);

    try {
      const token = getToken();
      if (!token) {
        alert('Please login first.');
        window.location.href = '/login';
        return;
      }

      if (!product.type || product.id === undefined || product.id === null || String(product.id).trim() === '') {
        alert('Product details are incomplete. Please close this window and try again.');
        return;
      }

      const coursePayload = getCourseContentPayload(product);
      if (
        product.type === 'course-content' &&
        (!coursePayload.course || !coursePayload.category || !coursePayload.contentKey)
      ) {
        alert('Course, category, or content key is missing. Please refresh the page and try again.');
        return;
      }

      // For course-content, the backend ignores the client price and reads the
      // active price/discount from the admin-managed CoursePrice document.
      // Legacy products continue to send product.price as before.
      const orderPayload = {
        ...(product.type === 'course-content' ? {} : { amount: product.price }),
        productType: product.type,
        productId: String(product.id),
        productTitle: product.title || 'Premium Content',
        ...coursePayload,
      };

      const orderResponse = await axios.post(
        `${API_BASE}/api/payment/create-order`,
        orderPayload,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const orderData = orderResponse.data || {};
      if (!orderData.success || !orderData.orderId || !orderData.key) {
        throw new Error(orderData.message || 'Could not create the payment order.');
      }

      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded || !window.Razorpay) {
        throw new Error('Failed to load Razorpay. Please check your internet connection and try again.');
      }

      // The API returns amount in rupees. Razorpay Checkout expects paise.
      const amountInPaise = Math.round(Number(orderData.amount) * 100);
      if (!Number.isFinite(amountInPaise) || amountInPaise <= 0) {
        throw new Error('The server returned an invalid payment amount.');
      }

      const options = {
        key: orderData.key,
        amount: amountInPaise,
        currency: orderData.currency || 'INR',
        name: 'PharmaVerse',
        description: `Purchase: ${product.title || 'Premium Content'}`,
        image: '/logo.png',
        order_id: orderData.orderId,
        prefill: {
          name: localStorage.getItem('userName') || sessionStorage.getItem('userName') || '',
          email: localStorage.getItem('userEmail') || sessionStorage.getItem('userEmail') || '',
        },
        theme: { color: '#7c3aed' },
        modal: {
          ondismiss: () => setLoading(false),
        },
        handler: async (response) => {
          try {
            const verifyResponse = await axios.post(
              `${API_BASE}/api/payment/verify-payment`,
              {
                orderId: response.razorpay_order_id,
                paymentId: response.razorpay_payment_id,
                signature: response.razorpay_signature,
                productType: product.type,
                productId: String(product.id),
              },
              { headers: { Authorization: `Bearer ${token}` } }
            );

            if (!verifyResponse.data?.success) {
              throw new Error(verifyResponse.data?.message || 'Payment verification failed.');
            }

            // Do not grant access by writing a partial purchase to localStorage.
            // The backend is the source of truth; onSuccess should refresh access/status.
            alert('Payment successful! Your payment has been verified.');
            if (typeof onSuccess === 'function') await onSuccess(verifyResponse.data);
            if (typeof onClose === 'function') onClose();
          } catch (verifyError) {
            console.error('Payment verification error:', verifyError);
            alert(
              verifyError.response?.data?.message ||
              verifyError.message ||
              'Payment was received, but verification could not be completed. Please contact support before paying again.'
            );
          } finally {
            setLoading(false);
          }
        },
      };

      const razorpay = new window.Razorpay(options);
      razorpay.on('payment.failed', (event) => {
        console.error('Razorpay payment failed:', event?.error || event);
        setLoading(false);
        alert(event?.error?.description || 'Payment failed. Please try again.');
      });
      razorpay.open();
    } catch (error) {
      console.error('Payment error:', error);
      alert(error.response?.data?.message || error.message || 'Payment failed. Please try again.');
      setLoading(false);
    }
  };

  const displayedPrice = Number(product.price);
  const priceText = Number.isFinite(displayedPrice) ? displayedPrice.toFixed(2).replace(/\.00$/, '') : '—';

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
          <button type="button" onClick={onClose} disabled={loading} aria-label="Close payment dialog" className="hover:bg-gray-100 p-1.5 sm:p-2 rounded-full transition-all disabled:opacity-50">
            <X size={18} className="sm:w-[20px] sm:h-[20px]" />
          </button>
        </div>

        <div className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-xl p-4 sm:p-5 mb-4 sm:mb-6">
          <p className="text-xs sm:text-sm text-gray-600 mb-1">You are purchasing:</p>
          <h3 className="text-base sm:text-lg md:text-xl font-bold text-gray-800">{product.title || 'Premium Content'}</h3>
          <div className="flex items-center gap-2 mt-2 sm:mt-3">
            <Sparkles size={14} className="sm:w-[16px] sm:h-[16px] text-yellow-500" />
            <span className="text-[10px] sm:text-xs text-gray-500">Instant access after verified payment</span>
          </div>
        </div>

        <div className="space-y-3 sm:space-y-4 mb-4 sm:mb-6">
          <div className="flex justify-between items-center py-2 sm:py-3 border-b">
            <span className="text-sm sm:text-base text-gray-600">Product Price</span>
            <span className="text-xl sm:text-2xl font-bold text-purple-600">₹{priceText}</span>
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
              <span className="text-[10px] sm:text-sm text-gray-500">Secure checkout</span>
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={handlePayment}
          disabled={loading}
          className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white py-3 sm:py-4 rounded-xl font-bold text-base sm:text-lg transition-all duration-300 flex items-center justify-center gap-2 sm:gap-3 shadow-lg hover:shadow-xl disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {loading ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 sm:h-5 sm:w-5 border-b-2 border-white" />
              Processing...
            </>
          ) : (
            <>
              <CreditCard size={18} className="sm:w-[20px] sm:h-[20px]" />
              Pay ₹{priceText} &amp; Access
            </>
          )}
        </button>

        <p className="text-center text-[10px] sm:text-xs text-gray-400 mt-3 sm:mt-4">
          By completing this purchase, you agree to our Terms of Service.
        </p>
      </div>
    </div>
  );
};

export default PaymentModal;


