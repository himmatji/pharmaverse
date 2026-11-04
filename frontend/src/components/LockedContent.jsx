import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import PaymentModal from './PaymentModal';
import { Lock, Crown, Sparkles, Unlock, Eye } from 'lucide-react';

const API_BASE = (import.meta.env.VITE_API_URL || 'https://api.pharmaverse.co.in').replace(/\/$/, '');

const getToken = () =>
  localStorage.getItem('userToken') || sessionStorage.getItem('userToken');

const normalizeQueryValue = (v) =>
  v === undefined || v === null ? '' : String(v).trim();

const normalizeCompare = (v) => normalizeQueryValue(v).toLowerCase();

const LockedContent = ({ product, children, previewContent }) => {
  const [showPayment, setShowPayment] = useState(false);
  const [hasAccess, setHasAccess] = useState(false);
  const [loading, setLoading] = useState(true);
  const [accessError, setAccessError] = useState('');
  const [pricingLoading, setPricingLoading] = useState(false);
  const [pricingError, setPricingError] = useState('');
  const [matchedPricing, setMatchedPricing] = useState(null);

  const productType = normalizeQueryValue(product?.type);
  const productId = normalizeQueryValue(product?.id);
  const contentKey = normalizeQueryValue(product?.contentKey);
  const course = normalizeQueryValue(product?.course);
  const category = normalizeQueryValue(product?.category);
  const semester = normalizeQueryValue(product?.semester);
  const year = normalizeQueryValue(product?.year);
  const language = normalizeQueryValue(product?.language);
  const specialization = normalizeQueryValue(product?.specialization);

  const isCourseContent = productType === 'course-content';

  // ---------- Fetch admin price ----------
  useEffect(() => {
    let cancelled = false;

    const fetchPricing = async () => {
      if (!isCourseContent) {
        setMatchedPricing(null);
        setPricingError('');
        return;
      }

      if (!course || !category || !contentKey) {
        setMatchedPricing(null);
        setPricingError('Pricing details missing. Refresh page.');
        return;
      }

      setPricingLoading(true);
      setPricingError('');
      setMatchedPricing(null);

      try {
        const response = await axios.get(`${API_BASE}/api/admin/public-price`);
        const contentPrices = response.data?.contentPrices;

        if (!response.data?.success || !Array.isArray(contentPrices)) {
          throw new Error('Unable to load admin pricing.');
        }

        const matched = contentPrices.find((entry) =>
          entry.isActive !== false &&
          normalizeCompare(entry.course) === normalizeCompare(course) &&
          normalizeCompare(entry.category) === normalizeCompare(category) &&
          normalizeCompare(entry.semester) === normalizeCompare(semester) &&
          normalizeCompare(entry.year) === normalizeCompare(year) &&
          normalizeCompare(entry.language) === normalizeCompare(language) &&
          normalizeCompare(entry.specialization) === normalizeCompare(specialization) &&
          normalizeCompare(entry.contentKey) === normalizeCompare(contentKey)
        );

        if (!matched) {
          throw new Error('Price not configured for this content. Contact admin.');
        }

        const basePrice = Number(matched.price);
        const discount = Number(matched.discount || 0);

        if (
          !Number.isFinite(basePrice) || basePrice < 0 ||
          !Number.isFinite(discount) || discount < 0 || discount > 100
        ) {
          throw new Error('Invalid price configuration. Contact admin.');
        }

        if (!cancelled) {
          setMatchedPricing({
            ...matched,
            price: basePrice,
            discount,
            finalPrice: Math.round(basePrice * (1 - discount / 100) * 100) / 100,
          });
        }
      } catch (error) {
        console.error('Fetch content pricing error:', error);
        if (!cancelled) {
          setPricingError(
            error.response?.data?.message || error.message || 'Could not load price.'
          );
        }
      } finally {
        if (!cancelled) setPricingLoading(false);
      }
    };

    fetchPricing();
    return () => { cancelled = true; };
  }, [isCourseContent, course, category, semester, year, language, specialization, contentKey]);

  // ---------- Check access ----------
  const checkAccess = useCallback(async () => {
    if (!productType || !productId) {
      setHasAccess(false);
      setAccessError('Content details missing.');
      setLoading(false);
      return;
    }

    setLoading(true);
    setAccessError('');

    try {
      const token = getToken();
      if (!token) {
        setHasAccess(false);
        setLoading(false);
        return;
      }

      const params = {};
      if (isCourseContent || contentKey || (course && category)) {
        params.contentKey = contentKey;
        params.course = course;
        params.category = category;
        params.semester = semester;
        params.year = year;
        params.language = language;
        params.specialization = specialization;
      }

      const response = await axios.get(
        `${API_BASE}/api/payment/check-access/${encodeURIComponent(productType)}/${encodeURIComponent(productId)}`,
        { headers: { Authorization: `Bearer ${token}` }, params }
      );

      setHasAccess(response.data?.hasAccess === true);
    } catch (error) {
      console.error('Check access error:', error);
      setHasAccess(false);
      setAccessError(
        error.response?.data?.message || 'Could not verify access. Try again.'
      );
    } finally {
      setLoading(false);
    }
  }, [productType, productId, isCourseContent, contentKey, course, category, semester, year, language, specialization]);

  useEffect(() => { checkAccess(); }, [checkAccess]);

  const handlePaymentSuccess = async () => { await checkAccess(); };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-48 sm:h-56 md:h-64">
        <div className="animate-spin rounded-full h-6 w-6 sm:h-8 sm:w-8 border-b-2 border-purple-600" />
      </div>
    );
  }

  if (hasAccess) {
    return (
      <div className="animate-fadeIn">
        <div className="bg-green-50 border border-green-200 rounded-xl p-2 sm:p-3 mb-3 sm:mb-4 flex items-center gap-2">
          <Unlock size={16} className="text-green-600" />
          <span className="text-xs sm:text-sm text-green-700">
            You have access to this content. Enjoy!
          </span>
        </div>
        {children}
      </div>
    );
  }

  const finalPrice = isCourseContent ? matchedPricing?.finalPrice : Number(product?.price);
  const validPrice = Number.isFinite(finalPrice) && finalPrice > 0;
  const isFree = isCourseContent && matchedPricing &&
    (matchedPricing.accessType === 'free' || matchedPricing.price === 0);

  const paymentProduct = { ...product, price: finalPrice };
  const formatPrice = (v) => Number(v).toFixed(2).replace(/\.?0+$/, '');

  return (
    <>
      <div className="relative bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl sm:rounded-2xl overflow-hidden border-2 border-dashed border-purple-300">
        {previewContent && (
          <div className="p-4 sm:p-6 border-b border-gray-200">
            <h3 className="font-semibold text-gray-700 mb-1 sm:mb-2 flex items-center gap-1 sm:gap-2 text-sm sm:text-base">
              <Eye size={14} /> Preview
            </h3>
            {previewContent}
          </div>
        )}

        <div className="relative p-8 sm:p-10 md:p-12 text-center">
          <div className="absolute inset-0 bg-white/60 backdrop-blur-sm" />
          <div className="relative z-10">
            <div className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 bg-gradient-to-br from-purple-100 to-indigo-100 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4 md:mb-5">
              <Lock size={32} className="text-purple-500" />
            </div>

            <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-800 mb-1 sm:mb-2">
              Premium Content Locked
            </h3>
            <p className="text-sm sm:text-base text-gray-500 mb-4 sm:mb-5 md:mb-6">
              Purchase this semester content to unlock full access
            </p>

            <div className="flex items-center justify-center gap-1 sm:gap-2 mb-4 sm:mb-5 md:mb-6">
              <Crown size={14} className="text-yellow-500" />
              <span className="text-xs sm:text-sm text-gray-600">
                One-time payment • Lifetime access
              </span>
            </div>

            {pricingLoading && isCourseContent && (
              <p className="text-sm text-purple-600 mb-3">Loading latest price...</p>
            )}
            {pricingError && (
              <p className="text-xs sm:text-sm text-red-600 mb-3" role="alert">{pricingError}</p>
            )}
            {accessError && (
              <p className="text-xs sm:text-sm text-red-600 mb-3" role="alert">{accessError}</p>
            )}

            {matchedPricing && matchedPricing.discount > 0 && !isFree && (
              <div className="mb-2 flex items-center justify-center gap-2">
                <span className="text-sm text-gray-400 line-through">
                  ₹{formatPrice(matchedPricing.price)}
                </span>
                <span className="text-xs font-semibold text-green-700 bg-green-100 px-2 py-1 rounded-full">
                  {matchedPricing.discount}% OFF
                </span>
              </div>
            )}

            {isFree ? (
              <p className="text-sm font-semibold text-green-700">
                This content is free. Refresh the page to access it.
              </p>
            ) : (
              <button
                onClick={() => setShowPayment(true)}
                disabled={
                  !productType || !productId || pricingLoading || !validPrice ||
                  (isCourseContent && (!contentKey || !matchedPricing))
                }
                className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-white px-6 sm:px-8 py-3 sm:py-4 rounded-xl font-bold text-sm sm:text-base md:text-lg transition-all duration-300 flex items-center gap-2 sm:gap-3 mx-auto shadow-xl hover:scale-105"
              >
                <Sparkles size={16} />
                Unlock for {validPrice ? `₹${formatPrice(finalPrice)}` : '—'}
              </button>
            )}
          </div>
        </div>
      </div>

      <PaymentModal
        isOpen={showPayment}
        onClose={() => setShowPayment(false)}
        product={paymentProduct}
        onSuccess={handlePaymentSuccess}
      />
    </>
  );
};

export default LockedContent;