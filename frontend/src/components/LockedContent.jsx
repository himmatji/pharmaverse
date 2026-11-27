
import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import PaymentModal from './PaymentModal';
import { Lock, Crown, Sparkles, Unlock, Eye } from 'lucide-react';
const API_BASE = (
  import.meta.env.VITE_API_URL || 'https://api.pharmaverse.co.in'
).replace(/\/+$/, '');
const getToken = () =>
  localStorage.getItem('userToken') ||
  sessionStorage.getItem('userToken');
const normalizeValue = (value) =>
  value === undefined || value === null ? '' : String(value).trim();
const normalizeCompare = (value) =>
  normalizeValue(value).toLowerCase();
const formatPrice = (value) => {
  const number = Number(value);
  if (!Number.isFinite(number)) return '0';
  return number.toFixed(2).replace(/\.?0+$/, '');
};
const LockedContent = ({ product, children, previewContent }) => {
  const [showPayment, setShowPayment] = useState(false);
  const [hasAccess, setHasAccess] = useState(false);
  const [loading, setLoading] = useState(true);
  const [accessError, setAccessError] = useState('');
  const [pricingLoading, setPricingLoading] = useState(false);
  const [pricingError, setPricingError] = useState('');
  const [matchedPricing, setMatchedPricing] = useState(null);
  const productType = normalizeValue(product?.type);
  const productId = normalizeValue(product?.id);
  const contentKey = normalizeValue(product?.contentKey);
  const course = normalizeValue(product?.course);
  const category = normalizeValue(product?.category);
  const semester = normalizeValue(product?.semester);
  const year = normalizeValue(product?.year);
  const language = normalizeValue(product?.language);
  const specialization = normalizeValue(product?.specialization);
  const isCourseContent = productType === 'course-content';
  // Fetch the price configured by admin.
  useEffect(() => {
    let cancelled = false;
    const fetchPricing = async () => {
      if (!isCourseContent) {
        setMatchedPricing(null);
        setPricingError('');
        setPricingLoading(false);
        return;
      }
      if (!course || !category || !contentKey) {
        setMatchedPricing(null);
        setPricingError('Pricing details are missing. Please refresh the page.');
        setPricingLoading(false);
        return;
      }
      setPricingLoading(true);
      setPricingError('');
      setMatchedPricing(null);
      try {
        const response = await axios.get(
          `${API_BASE}/api/admin/public-price`
        );
        const contentPrices = response.data?.contentPrices;
        if (
          response.data?.success !== true ||
          !Array.isArray(contentPrices)
        ) {
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
          throw new Error(
            'Price is not configured for this content. Please contact admin.'
          );
        }
        const originalPrice = Number(matched.price);
        const discount = Number(matched.discount ?? 0);
        if (
          !Number.isFinite(originalPrice) ||
          originalPrice < 0 ||
          !Number.isFinite(discount) ||
          discount < 0 ||
          discount > 100
        ) {
          throw new Error('Invalid price configuration. Please contact admin.');
        }
        const finalPrice =
          Math.round(originalPrice * (1 - discount / 100) * 100) / 100;
        if (!cancelled) {
          setMatchedPricing({
            ...matched,
            price: originalPrice,
            discount,
            finalPrice,
          });
        }
      } catch (error) {
        console.error('Fetch content pricing error:', error);
        if (!cancelled) {
          setPricingError(
            error.response?.data?.message ||
              error.message ||
              'Could not load price.'
          );
        }
      } finally {
        if (!cancelled) {
          setPricingLoading(false);
        }
      }
    };
    fetchPricing();
    return () => {
      cancelled = true;
    };
  }, [
    isCourseContent,
    course,
    category,
    semester,
    year,
    language,
    specialization,
    contentKey,
  ]);
  // Check whether the logged-in user has already purchased this content.
  const checkAccess = useCallback(async () => {
    if (!productType || !productId) {
      setHasAccess(false);
      setAccessError('Content details are missing.');
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
      if (isCourseContent) {
        params.contentKey = contentKey;
        params.course = course;
        params.category = category;
        params.semester = semester;
        params.year = year;
        params.language = language;
        params.specialization = specialization;
      }
      const response = await axios.get(
        `${API_BASE}/api/payment/check-access/${encodeURIComponent(
          productType
        )}/${encodeURIComponent(productId)}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          params,
        }
      );
      setHasAccess(response.data?.hasAccess === true);
    } catch (error) {
      console.error('Check access error:', error);
      setHasAccess(false);
      setAccessError(
        error.response?.data?.message ||
          'Could not verify access. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  }, [
    productType,
    productId,
    isCourseContent,
    contentKey,
    course,
    category,
    semester,
    year,
    language,
    specialization,
  ]);
  useEffect(() => {
    checkAccess();
  }, [checkAccess]);
  const handlePaymentSuccess = async () => {
    setShowPayment(false);
    await checkAccess();
  };
  const configuredFinalPrice = Number(matchedPricing?.finalPrice);

  const isFree =
    isCourseContent &&
    Boolean(matchedPricing) &&
    (
      normalizeCompare(matchedPricing.accessType) === 'free' ||
      (
        Number.isFinite(configuredFinalPrice) &&
        configuredFinalPrice <= 0
      )
    );
  // Free content unlocks without opening the payment modal.
  const effectiveHasAccess = hasAccess || Boolean(isFree);
  if (loading || (isCourseContent && pricingLoading)) {
    return (
      <div className="flex items-center justify-center h-48 sm:h-56 md:h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600" />
      </div>
    );
  }
  if (effectiveHasAccess) {
    return (
      <div className="animate-fadeIn">
        <div className="bg-green-50 border border-green-200 rounded-xl p-3 mb-4 flex items-center gap-2">
          <Unlock size={16} className="text-green-600" />
          <span className="text-sm text-green-700">
            {isFree
              ? 'This content is free. You have access.'
              : 'You have access to this content. Enjoy!'}
          </span>
        </div>
        {children}
      </div>
    );
  }
  const finalPrice = isCourseContent
    ? matchedPricing?.finalPrice
    : Number(product?.price);
  const validPrice =
    Number.isFinite(Number(finalPrice)) && Number(finalPrice) > 0;
  const paymentProduct = {
    ...product,
    // These fields are used for the price breakdown in PaymentModal.
    // The backend remains authoritative for the actual Razorpay order amount.
    price: finalPrice,
    finalPrice,
    originalPrice: isCourseContent
      ? Number(matchedPricing?.price)
      : Number(product?.originalPrice ?? product?.price),
    discount: isCourseContent
      ? Number(matchedPricing?.discount ?? 0)
      : Number(product?.discount ?? 0),
  };
  const canPurchase =
    Boolean(productType) &&
    Boolean(productId) &&
    validPrice &&
    (!isCourseContent || Boolean(matchedPricing && contentKey));
  return (
    <>
      <div className="relative bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl sm:rounded-2xl overflow-hidden border-2 border-dashed border-purple-300">
        {previewContent && (
          <div className="p-4 sm:p-6 border-b border-gray-200">
            <h3 className="font-semibold text-gray-700 mb-2 flex items-center gap-2 text-sm sm:text-base">
              <Eye size={14} />
              Preview
            </h3>
            {previewContent}
          </div>
        )}
        <div className="relative p-6 sm:p-10 md:p-12 text-center">
          <div className="absolute inset-0 bg-white/60 backdrop-blur-sm" />
          <div className="relative z-10">
            <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-purple-100 to-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Lock size={32} className="text-purple-500" />
            </div>
            <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-800 mb-2">
              Premium Content Locked
            </h3>
            <p className="text-sm sm:text-base text-gray-500 mb-5">
              Purchase this content to unlock access.
            </p>
            <div className="flex items-center justify-center gap-2 mb-5">
              <Crown size={15} className="text-yellow-500" />
              <span className="text-xs sm:text-sm text-gray-600">
                One-time payment • 6 months access
              </span>
            </div>
            {pricingError && (
              <p className="text-sm text-red-600 mb-4" role="alert">
                {pricingError}
              </p>
            )}
            {accessError && (
              <p className="text-sm text-red-600 mb-4" role="alert">
                {accessError}
              </p>
            )}
            {isCourseContent && matchedPricing && !pricingError && (
              <div className="mb-5">
                <p className="text-sm text-gray-500 mb-1">
                  Original Price
                </p>
                <p className="text-lg text-gray-400 line-through">
                  ₹{formatPrice(matchedPricing.price)}
                </p>
                {matchedPricing.discount > 0 && (
                  <span className="inline-block mt-2 text-xs font-bold text-green-700 bg-green-100 px-3 py-1 rounded-full">
                    {formatPrice(matchedPricing.discount)}% OFF
                  </span>
                )}
                <p className="text-sm text-gray-500 mt-3">
                  Final Payable Price
                </p>
                <p className="text-3xl font-extrabold text-purple-700">
                  ₹{formatPrice(matchedPricing.finalPrice)}
                </p>
                {matchedPricing.discount > 0 && (
                  <p className="text-xs text-green-700 mt-1">
                    You save ₹
                    {formatPrice(
                      matchedPricing.price - matchedPricing.finalPrice
                    )}
                  </p>
                )}
              </div>
            )}
            {!isCourseContent && validPrice && (
              <p className="text-3xl font-extrabold text-purple-700 mb-5">
                ₹{formatPrice(finalPrice)}
              </p>
            )}
            <button
              type="button"
              onClick={() => setShowPayment(true)}
              disabled={!canPurchase || Boolean(pricingError)}
              className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-white px-6 sm:px-8 py-3 sm:py-4 rounded-xl font-bold text-sm sm:text-base transition-all duration-300 flex items-center gap-2 mx-auto shadow-xl"
            >
              <Sparkles size={17} />
              Pay ₹{validPrice ? formatPrice(finalPrice) : '—'} & Unlock
            </button>
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
