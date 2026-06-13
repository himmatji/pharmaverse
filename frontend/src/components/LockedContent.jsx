import { useState, useEffect } from 'react';
import axios from 'axios';
import PaymentModal from './PaymentModal';
import { Lock, Crown, Sparkles, Unlock, Eye } from 'lucide-react';

// ========== DYNAMIC BASE URL - Works on both Localhost & EC2 ==========
const EC2_BASE_URL = "http://3.109.121.96:5000";
const LOCAL_BASE_URL = "http://localhost:5000";

// Auto-detect environment
const isProduction = window.location.hostname !== "localhost" && window.location.hostname !== "127.0.0.1";
const BASE_URL = isProduction ? EC2_BASE_URL : LOCAL_BASE_URL;

console.log(`🌐 LockedContent running in ${isProduction ? "PRODUCTION (EC2)" : "DEVELOPMENT (Localhost)"} mode`);

const LockedContent = ({ product, children, previewContent }) => {
  const [showPayment, setShowPayment] = useState(false);
  const [hasAccess, setHasAccess] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAccess();
  }, [product.id]);

  const checkAccess = async () => {
    try {
      const token = localStorage.getItem('userToken') || localStorage.getItem('token') || sessionStorage.getItem('userToken');
      
      if (!token) {
        setHasAccess(false);
        setLoading(false);
        return;
      }
      
      const response = await axios.get(`${BASE_URL}/api/payment/check-access/${product.type}/${product.id}`, {
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
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  if (hasAccess) {
    return (
      <div className="animate-fadeIn">
        <div className="bg-green-50 border border-green-200 rounded-xl p-3 mb-4 flex items-center gap-2">
          <Unlock size={18} className="text-green-600" />
          <span className="text-sm text-green-700">You have purchased this content. Enjoy!</span>
        </div>
        {children}
      </div>
    );
  }

  return (
    <>
      <div className="relative bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl overflow-hidden border-2 border-dashed border-purple-300">
        {/* Preview Content (if any) */}
        {previewContent && (
          <div className="p-6 border-b border-gray-200">
            <h3 className="font-semibold text-gray-700 mb-2 flex items-center gap-2">
              <Eye size={16} />
              Preview
            </h3>
            {previewContent}
          </div>
        )}
        
        {/* Locked Overlay */}
        <div className="relative p-12 text-center">
          <div className="absolute inset-0 bg-white/60 backdrop-blur-sm"></div>
          <div className="relative z-10">
            <div className="w-24 h-24 bg-gradient-to-br from-purple-100 to-indigo-100 rounded-full flex items-center justify-center mx-auto mb-5">
              <Lock size={48} className="text-purple-500" />
            </div>
            <h3 className="text-2xl font-bold text-gray-800 mb-2">Premium Content Locked</h3>
            <p className="text-gray-500 mb-6">Purchase this content to unlock full access</p>
            
            <div className="flex items-center justify-center gap-2 mb-6">
              <Crown size={18} className="text-yellow-500" />
              <span className="text-sm text-gray-600">One-time payment • Lifetime access</span>
            </div>
            
            <button
              onClick={() => setShowPayment(true)}
              className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white px-8 py-4 rounded-xl font-bold text-lg transition-all duration-300 flex items-center gap-3 mx-auto shadow-xl hover:scale-105"
            >
              <Sparkles size={20} />
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