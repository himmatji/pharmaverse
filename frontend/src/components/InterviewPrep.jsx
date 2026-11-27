import { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import { ArrowRight, BookOpen, Sparkles, Tag } from "lucide-react";

const API_BASE = (
  import.meta.env.VITE_API_URL || "https://api.pharmaverse.co.in"
).replace(/\/$/, "");

const InterviewPrepBanner = () => {
  const [pricing, setPricing] = useState(null);
  const [priceLoading, setPriceLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    const fetchInterviewPrice = async () => {
      try {
        const response = await axios.get(
          `${API_BASE}/api/admin/public-price`,
          { timeout: 12000 }
        );

        // Interview Material is stored separately in CoursePrice,
        // not inside the course contentPrices array.
        const item = response?.data?.interviewMaterial;

        if (!mounted) return;

        if (
          item &&
          item.isActive !== false &&
          Number.isFinite(Number(item.price)) &&
          Number.isFinite(Number(item.discount))
        ) {
          const price = Math.max(0, Number(item.price));
          const discount = Math.min(100, Math.max(0, Number(item.discount)));
          const calculatedFinal =
            Math.round(price * (1 - discount / 100) * 100) / 100;

          const suppliedFinal = Number(item.finalPrice);
          const finalPrice =
            Number.isFinite(suppliedFinal) && suppliedFinal >= 0
              ? suppliedFinal
              : calculatedFinal;

          setPricing({
            price,
            discount,
            finalPrice,
            accessType: String(item.accessType || "paid").toLowerCase(),
          });
        } else {
          setPricing(null);
        }
      } catch (error) {
        console.error("Interview Material banner price error:", error);
        if (mounted) setPricing(null);
      } finally {
        if (mounted) setPriceLoading(false);
      }
    };

    fetchInterviewPrice();

    return () => {
      mounted = false;
    };
  }, []);

  const isFree =
    pricing &&
    (pricing.accessType === "free" || pricing.finalPrice <= 0);

  const showDiscount =
    pricing &&
    !isFree &&
    pricing.discount > 0 &&
    pricing.price > pricing.finalPrice;

  const formatPrice = (amount) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 2,
    }).format(amount);

  return (
    <section className="w-full px-4 py-12 sm:px-6 lg:px-10">
      <div className="relative mx-auto max-w-7xl overflow-hidden rounded-3xl bg-gradient-to-br from-[#071426] via-[#0f2847] to-[#163b57] shadow-xl">
        <div className="pointer-events-none absolute -right-16 -top-20 h-72 w-72 rounded-full bg-sky-500/20 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-24 right-1/3 h-64 w-64 rounded-full bg-purple-500/20 blur-3xl" />

        <div className="relative z-10 flex flex-col items-start justify-between gap-8 px-6 py-10 sm:px-10 md:flex-row md:items-center md:px-14 md:py-14">
          <div className="max-w-2xl">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-xs font-semibold uppercase tracking-widest text-sky-200">
              <Sparkles size={15} />
              Career preparation
            </div>

            <h2 className="text-3xl font-extrabold leading-tight text-white sm:text-4xl lg:text-5xl">
              Prepare Smarter.
              <span className="block bg-gradient-to-r from-sky-300 via-cyan-300 to-purple-300 bg-clip-text text-transparent">
                Crack Your Interview.
              </span>
            </h2>

            <p className="mt-4 max-w-xl text-sm leading-7 text-slate-300 sm:text-base">
              Explore interview preparation PDFs, important questions,
              model answers, tips and guidance — all in one place.
            </p>

            {/* Live admin-managed price and discount */}
            <div className="mt-6 inline-flex min-w-[250px] flex-col gap-2 rounded-2xl border border-white/15 bg-white/10 px-5 py-4 text-white backdrop-blur-sm">
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-sky-200">
                <Tag size={14} />
                One-time access price
              </div>

              {priceLoading ? (
                <p className="text-sm text-slate-300">Loading price...</p>
              ) : !pricing ? (
                <p className="text-sm text-amber-200">
                  Price temporarily unavailable
                </p>
              ) : isFree ? (
                <div className="text-2xl font-extrabold text-emerald-300">
                  FREE
                </div>
              ) : (
                <div className="flex flex-wrap items-center gap-3">
                  {showDiscount && (
                    <span className="text-sm text-slate-300 line-through">
                      {formatPrice(pricing.price)}
                    </span>
                  )}
                  <span className="text-2xl font-extrabold">
                    {formatPrice(pricing.finalPrice)}
                  </span>
                  {showDiscount && (
                    <span className="rounded-full bg-emerald-400/20 px-2.5 py-1 text-xs font-bold text-emerald-200">
                      {pricing.discount}% OFF
                    </span>
                  )}
                </div>
              )}

              <p className="text-xs text-slate-300">
                Pay once · Lifetime access to all interview PDFs
              </p>
            </div>

            <Link
              to="/interview-prep"
              className="mt-7 inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-sky-500 to-purple-600 px-6 py-3.5 text-sm font-bold text-white shadow-lg shadow-sky-950/30 transition hover:-translate-y-0.5 hover:shadow-xl"
            >
              <BookOpen size={18} />
              Explore Interview Material
              <ArrowRight size={18} />
            </Link>
          </div>

          <div className="hidden h-44 w-44 shrink-0 items-center justify-center rounded-full border border-white/15 bg-white/10 text-sky-200 md:flex lg:h-52 lg:w-52">
            <div className="flex h-32 w-32 items-center justify-center rounded-full border border-sky-300/30 bg-gradient-to-br from-sky-500/20 to-purple-500/20 lg:h-40 lg:w-40">
              <BookOpen size={68} strokeWidth={1.4} />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default InterviewPrepBanner;