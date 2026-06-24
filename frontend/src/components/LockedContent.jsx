import { useState, useEffect } from 'react';
import axios from 'axios';
import PaymentModal from './PaymentModal';
import { Lock, Crown, Sparkles, Unlock, Eye } from 'lucide-react';

const LockedContent = ({ product, children, previewContent }) => {
  const [showPayment, setShowPayment] = useState(false);
  const [hasAccess, setHasAccess] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAccess();
  }, [product.id]);

  const checkAccess = async () => {
    try {
      const token = localStorage.getItem('userToken') || sessionStorage.getItem('userToken');
      
      if (!token) {
        setHasAccess(false);
        setLoading(false);
        return;
      }
      
      const response = await axios.get(`https://api.pharmaverse.co.in/api/payment/check-access/${product.type}/${product.id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setHasAccess(response.data.hasAccess);
    } catch (error) {
      console.error('Check access error:', error);
      setHasAccess(false);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-48 sm:h-56 md:h-64">
        <div className="animate-spin rounded-full h-6 w-6 sm:h-8 sm:w-8 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  if (hasAccess) {
    return (
      <div className="animate-fadeIn">
        <div className="bg-green-50 border border-green-200 rounded-xl p-2 sm:p-3 mb-3 sm:mb-4 flex items-center gap-2">
          <Unlock size={16} className="sm:w-[18px] sm:h-[18px] text-green-600" />
          <span className="text-xs sm:text-sm text-green-700">You have purchased this content. Enjoy!</span>
        </div>
        {children}
      </div>
    );
  }

  return (
    <>
      <div className="relative bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl sm:rounded-2xl overflow-hidden border-2 border-dashed border-purple-300">
        {/* Preview Content (if any) */}
        {previewContent && (
          <div className="p-4 sm:p-6 border-b border-gray-200">
            <h3 className="font-semibold text-gray-700 mb-1 sm:mb-2 flex items-center gap-1 sm:gap-2 text-sm sm:text-base">
              <Eye size={14} className="sm:w-[16px] sm:h-[16px]" />
              Preview
            </h3>
            {previewContent}
          </div>
        )}
        
        {/* Locked Overlay */}
        <div className="relative p-8 sm:p-10 md:p-12 text-center">
          <div className="absolute inset-0 bg-white/60 backdrop-blur-sm"></div>
          <div className="relative z-10">
            <div className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 bg-gradient-to-br from-purple-100 to-indigo-100 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4 md:mb-5">
              <Lock size={32} className="sm:w-[38px] sm:h-[38px] md:w-[48px] md:h-[48px] text-purple-500" />
            </div>
            <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-800 mb-1 sm:mb-2">Premium Content Locked</h3>
            <p className="text-sm sm:text-base text-gray-500 mb-4 sm:mb-5 md:mb-6">Purchase this content to unlock full access</p>
            
            <div className="flex items-center justify-center gap-1 sm:gap-2 mb-4 sm:mb-5 md:mb-6">
              <Crown size={14} className="sm:w-[16px] sm:h-[16px] md:w-[18px] md:h-[18px] text-yellow-500" />
              <span className="text-xs sm:text-sm text-gray-600">One-time payment • Lifetime access</span>
            </div>
            
            <button
              onClick={() => setShowPayment(true)}
              className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white px-6 sm:px-8 py-3 sm:py-4 rounded-xl font-bold text-sm sm:text-base md:text-lg transition-all duration-300 flex items-center gap-2 sm:gap-3 mx-auto shadow-xl hover:scale-105"
            >
              <Sparkles size={16} className="sm:w-[18px] sm:h-[18px] md:w-[20px] md:h-[20px]" />
              Unlock for ₹{product.price}
            </button>
          </div>
        </div>
      </div>

      <PaymentModal
        isOpen={showPayment}
        onClose={() => setShowPayment(false)}
        product={product}
        onSuccess={() => {
          setHasAccess(true);
          alert('✅ Access granted! Enjoy your content.');
        }}
      />
    </>
  );
};

export default LockedContent;