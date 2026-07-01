import { 
  Mail, 
  Phone, 
  MapPin, 
  Clock,
  Copy,
  Shield,
  FileText,
  AlertCircle,
  X,
  File,
  Video,
  FileSpreadsheet,
  BookOpen,
  Zap,
  GraduationCap,
  Users,
  Award,
  CheckCircle
} from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaFacebook, FaInstagram, FaYoutube, FaLinkedin, FaTelegram, FaWhatsapp, FaQuora } from "react-icons/fa";
import logo from "../assets/logo.png";

const Footer = () => {
  const navigate = useNavigate();
  const currentYear = new Date().getFullYear();
  const [showTerms, setShowTerms] = useState(false);
  const [showPrivacy, setShowPrivacy] = useState(false);
  const [showRefund, setShowRefund] = useState(false);
  const [showDisclaimer, setShowDisclaimer] = useState(false);

  const quickLinks = [
    { 
      label: "Free PDF Notes", 
      icon: File, 
      color: "text-emerald-500",
      bg: "bg-emerald-50",
      description: "Download free study materials",
      path: "/bpharm",
      state: { scrollTo: "notes" }
    },
    { 
      label: "Premium Notes", 
      icon: BookOpen, 
      color: "text-amber-500",
      bg: "bg-amber-50",
      description: "Exclusive premium content",
      path: "/bpharm",
      state: { scrollTo: "notes" }
    },
    { 
      label: "Practical / Project Record File", 
      icon: FileSpreadsheet, 
      color: "text-purple-500",
      bg: "bg-purple-50",
      description: "Complete practical guides",
      path: "/bpharm",
      state: { scrollTo: "papers" }
    },
    { 
      label: "Practical Videos", 
      icon: Video, 
      color: "text-rose-500",
      bg: "bg-rose-50",
      description: "Step-by-step video tutorials",
      path: "/bpharm",
      state: { scrollTo: "videos" }
    },
    { 
      label: "Exam Crash Course", 
      icon: Zap, 
      color: "text-orange-500",
      bg: "bg-orange-50",
      description: "Quick revision for exams",
      path: "/bpharm",
      state: { scrollTo: "notes" }
    },
  ];

  const resources = [
    { label: "Blog", path: "/blog" },
    { label: "Success Stories", path: "/success-stories" },
    { label: "FAQs", path: "/faqs" },
    { label: "Support Center", path: "/support" },
    { label: "Community", path: "/community" }
  ];

  const founders = [
    "Prof. Anuj Km. Bharti",
    "Prof. Deepak Saini",
    "Prof. Chaudhary Himmat Singh"
  ];

  const socialLinks = [
    { icon: FaFacebook, href: "https://facebook.com/share/p/18eMt35o43", label: "Facebook" },
    { icon: FaInstagram, href: "https://instagram.com/pharmaverse.co.in", label: "Instagram" },
    { icon: FaYoutube, href: "https://youtube.com/@pharmaverse_youtube", label: "YouTube" },
    { icon: FaLinkedin, href: "https://linkedin.com/in/pharma-verse-34385640b", label: "LinkedIn" },
    { icon: FaTelegram, href: "https://t.me/PharmaVerse_official", label: "Telegram" },
    { icon: FaWhatsapp, href: "https://whatsapp.com/channel/0029Vb7gIycDuMRlrNrord3M", label: "WhatsApp" },
    { icon: FaQuora, href: "https://qr.ae/pFrdVn", label: "Quora" }
  ];

  const handleNavigate = (path, state) => {
    if (state) {
      navigate(path, { state });
    } else {
      navigate(path);
    }
  };

  const LegalModal = ({ isOpen, onClose, title, icon: Icon, children }) => {
    if (!isOpen) return null;

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
        <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
          <div className="sticky top-0 bg-gradient-to-r from-amber-50 to-orange-50 border-b border-amber-200/50 p-5 flex items-center justify-between rounded-t-2xl">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-r from-amber-400 to-orange-500 flex items-center justify-center">
                <Icon className="text-white" size={20} />
              </div>
              <h2 className="text-xl font-bold text-gray-800">{title}</h2>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-white/50 rounded-full transition-colors">
              <X size={24} className="text-gray-500" />
            </button>
          </div>
          <div className="p-6 md:p-8">{children}</div>
          <div className="sticky bottom-0 bg-white border-t border-gray-200 p-4">
            <button onClick={onClose} className="w-full bg-gradient-to-r from-amber-400 to-orange-500 hover:from-amber-500 hover:to-orange-600 text-white font-semibold py-3 rounded-xl transition-all duration-300 shadow-lg shadow-amber-500/25">
              I Understand & Close
            </button>
          </div>
        </div>
      </div>
    );
  };

  // ==================== TERMS & CONDITIONS ====================
  const TermsContent = () => (
    <div className="space-y-6 text-gray-600">
      <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-xl p-4 mb-6">
        <p className="text-sm text-gray-700 flex items-center gap-2">
          <GraduationCap className="text-amber-500" size={20} />
          <span className="font-semibold">Welcome to PharmaVerse - Your E-Learning Partner for Pharmacy Excellence</span>
        </p>
      </div>

      <section>
        <h3 className="text-lg font-semibold text-gray-800 mb-2 flex items-center gap-2">
          <span className="w-1.5 h-6 bg-gradient-to-b from-amber-400 to-orange-500 rounded-full"></span>
          1. Acceptance of Terms
        </h3>
        <p>By accessing or using PharmaVerse's e-learning platform, you agree to be bound by these Terms & Conditions. If you do not agree, please do not use our services.</p>
      </section>

      <section>
        <h3 className="text-lg font-semibold text-gray-800 mb-2 flex items-center gap-2">
          <span className="w-1.5 h-6 bg-gradient-to-b from-amber-400 to-orange-500 rounded-full"></span>
          2. Educational Content & Intellectual Property
        </h3>
        <p>All educational content, including study materials, video lectures, notes, question papers, and resources on PharmaVerse are the exclusive intellectual property of PharmaVerse. These are provided for personal educational use only.</p>
        <ul className="list-disc pl-6 mt-2 space-y-1">
          <li>You may not reproduce, distribute, or share any content without written permission</li>
          <li>Content is for individual learning purposes only</li>
          <li>Commercial use of any content is strictly prohibited</li>
        </ul>
      </section>

      <section>
        <h3 className="text-lg font-semibold text-gray-800 mb-2 flex items-center gap-2">
          <span className="w-1.5 h-6 bg-gradient-to-b from-amber-400 to-orange-500 rounded-full"></span>
          3. User Accounts & Learning Progress
        </h3>
        <p>You are responsible for maintaining the confidentiality of your account credentials. Your learning progress, saved notes, and course completions are associated with your account.</p>
        <ul className="list-disc pl-6 mt-2 space-y-1">
          <li>One account per user</li>
          <li>Account sharing is prohibited</li>
          <li>You are responsible for all activities under your account</li>
        </ul>
      </section>

      <section>
        <h3 className="text-lg font-semibold text-gray-800 mb-2 flex items-center gap-2">
          <span className="w-1.5 h-6 bg-gradient-to-b from-amber-400 to-orange-500 rounded-full"></span>
          4. Academic Integrity
        </h3>
        <p>PharmaVerse promotes academic excellence and integrity. All educational resources are meant to supplement your learning journey.</p>
        <ul className="list-disc pl-6 mt-2 space-y-1">
          <li>Use resources responsibly for learning</li>
          <li>Do not use materials for cheating or academic dishonesty</li>
          <li>Respect copyright and intellectual property rights</li>
        </ul>
      </section>

      <section>
        <h3 className="text-lg font-semibold text-gray-800 mb-2 flex items-center gap-2">
          <span className="w-1.5 h-6 bg-gradient-to-b from-amber-400 to-orange-500 rounded-full"></span>
          5. Prohibited Activities
        </h3>
        <ul className="list-disc pl-6 space-y-1">
          <li>Copying, redistributing, or selling content</li>
          <li>Attempting to hack or disrupt the platform</li>
          <li>Sharing premium content with non-subscribers</li>
          <li>Uploading malicious code or viruses</li>
          <li>Impersonating other users</li>
        </ul>
      </section>

      <section>
        <h3 className="text-lg font-semibold text-gray-800 mb-2 flex items-center gap-2">
          <span className="w-1.5 h-6 bg-gradient-to-b from-amber-400 to-orange-500 rounded-full"></span>
          6. Disclaimer of Warranties
        </h3>
        <p>All content and services are provided "as is" without any warranties. PharmaVerse does not guarantee specific learning outcomes or exam results.</p>
      </section>

      <section>
        <h3 className="text-lg font-semibold text-gray-800 mb-2 flex items-center gap-2">
          <span className="w-1.5 h-6 bg-gradient-to-b from-amber-400 to-orange-500 rounded-full"></span>
          7. Changes to Terms
        </h3>
        <p>PharmaVerse reserves the right to update these Terms & Conditions at any time. Continued use of the platform constitutes acceptance of the updated terms.</p>
      </section>

      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
        <p className="text-sm text-gray-700 flex items-center gap-2">
          <AlertCircle className="text-amber-500" size={18} />
          <span><span className="font-semibold">Last Updated:</span> {new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
        </p>
      </div>
    </div>
  );

  // ==================== PRIVACY POLICY ====================
  const PrivacyContent = () => (
    <div className="space-y-6 text-gray-600">
      <div className="bg-gradient-to-r from-blue-50 to-cyan-50 border border-blue-200 rounded-xl p-4 mb-6">
        <p className="text-sm text-gray-700 flex items-center gap-2">
          <Shield className="text-blue-500" size={20} />
          <span className="font-semibold">Your Privacy Matters at PharmaVerse</span>
        </p>
      </div>

      <section>
        <h3 className="text-lg font-semibold text-gray-800 mb-2 flex items-center gap-2">
          <span className="w-1.5 h-6 bg-gradient-to-b from-blue-400 to-cyan-500 rounded-full"></span>
          1. Information We Collect
        </h3>
        <p>We collect the following information to provide and improve our e-learning services:</p>
        <ul className="list-disc pl-6 mt-2 space-y-1">
          <li><span className="font-semibold">Personal Information:</span> Name, email address, phone number, educational background</li>
          <li><span className="font-semibold">Learning Data:</span> Course progress, quiz scores, time spent, learning preferences</li>
          <li><span className="font-semibold">Technical Data:</span> Device information, IP address, browser type, usage patterns</li>
          <li><span className="font-semibold">Payment Information:</span> Transaction details (processed securely via third-party gateways)</li>
        </ul>
      </section>

      <section>
        <h3 className="text-lg font-semibold text-gray-800 mb-2 flex items-center gap-2">
          <span className="w-1.5 h-6 bg-gradient-to-b from-blue-400 to-cyan-500 rounded-full"></span>
          2. How We Use Your Information
        </h3>
        <ul className="list-disc pl-6 space-y-1">
          <li>To provide and personalize your learning experience</li>
          <li>To track your progress and suggest relevant content</li>
          <li>To process your transactions and manage subscriptions</li>
          <li>To send you updates, notifications, and learning recommendations</li>
          <li>To improve our platform and develop new features</li>
          <li>To provide customer support and respond to inquiries</li>
        </ul>
      </section>

      <section>
        <h3 className="text-lg font-semibold text-gray-800 mb-2 flex items-center gap-2">
          <span className="w-1.5 h-6 bg-gradient-to-b from-blue-400 to-cyan-500 rounded-full"></span>
          3. Data Security & Protection
        </h3>
        <p>We implement industry-standard security measures to protect your data:</p>
        <ul className="list-disc pl-6 mt-2 space-y-1">
          <li>SSL/HTTPS encryption for all data transmission</li>
          <li>Secure servers with firewall protection</li>
          <li>Regular security audits and updates</li>
          <li>Limited employee access to user data</li>
        </ul>
      </section>

      <section>
        <h3 className="text-lg font-semibold text-gray-800 mb-2 flex items-center gap-2">
          <span className="w-1.5 h-6 bg-gradient-to-b from-blue-400 to-cyan-500 rounded-full"></span>
          4. Third-Party Sharing
        </h3>
        <p>We do not sell, trade, or transfer your personal information to third parties except:</p>
        <ul className="list-disc pl-6 mt-2 space-y-1">
          <li>Payment processors for transaction handling</li>
          <li>Analytics providers to improve our services</li>
          <li>When required by law or to protect our rights</li>
        </ul>
      </section>

      <section>
        <h3 className="text-lg font-semibold text-gray-800 mb-2 flex items-center gap-2">
          <span className="w-1.5 h-6 bg-gradient-to-b from-blue-400 to-cyan-500 rounded-full"></span>
          5. Cookies & Tracking
        </h3>
        <p>We use cookies to enhance your learning experience. These help us remember your preferences and track your progress. You can disable cookies in your browser settings.</p>
      </section>

      <section>
        <h3 className="text-lg font-semibold text-gray-800 mb-2 flex items-center gap-2">
          <span className="w-1.5 h-6 bg-gradient-to-b from-blue-400 to-cyan-500 rounded-full"></span>
          6. User Rights
        </h3>
        <p>You have the right to:</p>
        <ul className="list-disc pl-6 mt-2 space-y-1">
          <li>Access your personal data</li>
          <li>Request data correction or deletion</li>
          <li>Opt-out of marketing communications</li>
          <li>Export your learning data</li>
        </ul>
      </section>

      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
        <p className="text-sm text-gray-700 flex items-center gap-2">
          <AlertCircle className="text-blue-500" size={18} />
          <span><span className="font-semibold">Last Updated:</span> {new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
        </p>
      </div>
    </div>
  );

  // ==================== REFUND POLICY ====================
  const RefundContent = () => (
    <div className="space-y-6 text-gray-600">
      <div className="bg-gradient-to-r from-red-50 to-rose-50 border border-red-200 rounded-xl p-4 mb-6">
        <p className="text-sm text-gray-700 flex items-center gap-2">
          <AlertCircle className="text-red-500" size={20} />
          <span className="font-semibold">Please Read Carefully - No Refund Policy</span>
        </p>
      </div>

      <section>
        <h3 className="text-lg font-semibold text-gray-800 mb-2 flex items-center gap-2">
          <span className="w-1.5 h-6 bg-gradient-to-b from-red-400 to-rose-500 rounded-full"></span>
          1. No Refund Policy
        </h3>
        <div className="bg-red-50 border-2 border-red-300 rounded-xl p-4 mb-4">
          <p className="text-red-700 font-bold text-center text-lg">⚠️ ALL SALES ARE FINAL - NO REFUNDS</p>
          <p className="text-red-600 text-sm text-center mt-1">Money is not refundable under any circumstances.</p>
        </div>
        <p className="text-gray-600">All purchases made on PharmaVerse, including but not limited to:</p>
        <ul className="list-disc pl-6 mt-2 space-y-1">
          <li>Premium course subscriptions</li>
          <li>Premium notes and study materials</li>
          <li>Exam crash courses</li>
          <li>Video lecture access</li>
          <li>Any other digital products or services</li>
        </ul>
        <p className="mt-3 font-semibold text-gray-700">are non-refundable.</p>
      </section>

      <section>
        <h3 className="text-lg font-semibold text-gray-800 mb-2 flex items-center gap-2">
          <span className="w-1.5 h-6 bg-gradient-to-b from-red-400 to-rose-500 rounded-full"></span>
          2. Why No Refunds?
        </h3>
        <ul className="list-disc pl-6 space-y-1">
          <li>Digital content is delivered instantly upon purchase</li>
          <li>Content can be downloaded and accessed immediately</li>
          <li>Prevents misuse and unauthorized sharing</li>
          <li>Maintains the integrity of our educational platform</li>
        </ul>
      </section>

      <section>
        <h3 className="text-lg font-semibold text-gray-800 mb-2 flex items-center gap-2">
          <span className="w-1.5 h-6 bg-gradient-to-b from-red-400 to-rose-500 rounded-full"></span>
          3. Exceptions (Technical Issues Only)
        </h3>
        <p>Refunds may be considered ONLY in cases where:</p>
        <ul className="list-disc pl-6 mt-2 space-y-1">
          <li>The platform is inaccessible for more than 48 hours</li>
          <li>There is a confirmed technical error on our side</li>
          <li>Duplicate payment was made (will be refunded)</li>
        </ul>
        <p className="mt-2 text-sm text-gray-500">Any refund requests must be submitted within 7 days of purchase with proper evidence.</p>
      </section>

      <section>
        <h3 className="text-lg font-semibold text-gray-800 mb-2 flex items-center gap-2">
          <span className="w-1.5 h-6 bg-gradient-to-b from-red-400 to-rose-500 rounded-full"></span>
          4. Contact Us
        </h3>
        <p>If you have any questions about this policy, please contact us:</p>
        <div className="bg-gray-50 rounded-xl p-4 mt-2">
          <p className="text-gray-700"><span className="font-semibold">Email:</span> pharmaversehelpline@gmail.com</p>
          <p className="text-gray-700"><span className="font-semibold">Phone:</span> +91 9548787579</p>
          <p className="text-gray-700"><span className="font-semibold">Support Hours:</span> Mon-Sat, 1PM - 4 PM</p>
        </div>
      </section>

      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
        <p className="text-sm text-gray-700 flex items-center gap-2">
          <AlertCircle className="text-amber-500" size={18} />
          <span><span className="font-semibold">Last Updated:</span> {new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
        </p>
      </div>
    </div>
  );

  // ==================== DISCLAIMER ====================
  const DisclaimerContent = () => (
    <div className="space-y-6 text-gray-600">
      <div className="bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 rounded-xl p-4 mb-6">
        <p className="text-sm text-gray-700 flex items-center gap-2">
          <AlertCircle className="text-purple-500" size={20} />
          <span className="font-semibold">Important Legal Notice</span>
        </p>
      </div>

      <section>
        <h3 className="text-lg font-semibold text-gray-800 mb-2 flex items-center gap-2">
          <span className="w-1.5 h-6 bg-gradient-to-b from-purple-400 to-pink-500 rounded-full"></span>
          1. General Disclaimer
        </h3>
        <p>The information provided on PharmaVerse is for educational purposes only and should not be considered as professional medical advice. Always consult with qualified healthcare professionals for medical decisions.</p>
      </section>

      <section>
        <h3 className="text-lg font-semibold text-gray-800 mb-2 flex items-center gap-2">
          <span className="w-1.5 h-6 bg-gradient-to-b from-purple-400 to-pink-500 rounded-full"></span>
          2. Intellectual Property Rights
        </h3>
        <div className="bg-amber-50 border-2 border-amber-300 rounded-xl p-4">
          <p className="text-gray-700 text-center font-semibold">
            All content, including but not limited to study materials, video lectures, notes, question papers, practical records, and resources available on PharmaVerse, is the <span className="text-amber-600 font-bold">intellectual property right of PharmaVerse</span>.
          </p>
          <div className="mt-3 p-3 bg-white/50 rounded-lg border border-amber-200">
            <p className="text-sm text-gray-600 flex items-center gap-2">
              <Shield className="text-amber-500" size={16} />
              <span>Unauthorized reproduction, distribution, or copying of any content is strictly prohibited and may result in legal action.</span>
            </p>
          </div>
        </div>
      </section>

      <section>
        <h3 className="text-lg font-semibold text-gray-800 mb-2 flex items-center gap-2">
          <span className="w-1.5 h-6 bg-gradient-to-b from-purple-400 to-pink-500 rounded-full"></span>
          3. Accuracy of Information
        </h3>
        <p>While we strive to provide accurate and up-to-date information, we make no representations or warranties of any kind, express or implied, about the completeness, accuracy, reliability, suitability, or availability of the information contained on the platform.</p>
      </section>

      <section>
        <h3 className="text-lg font-semibold text-gray-800 mb-2 flex items-center gap-2">
          <span className="w-1.5 h-6 bg-gradient-to-b from-purple-400 to-pink-500 rounded-full"></span>
          4. External Links
        </h3>
        <p>Our platform may contain links to external websites. We have no control over the content or availability of these sites and are not responsible for their content, privacy policies, or practices.</p>
      </section>

      <section>
        <h3 className="text-lg font-semibold text-gray-800 mb-2 flex items-center gap-2">
          <span className="w-1.5 h-6 bg-gradient-to-b from-purple-400 to-pink-500 rounded-full"></span>
          5. Limitation of Liability
        </h3>
        <p>PharmaVerse, its founders, contributors, and affiliates shall not be liable for any direct, indirect, incidental, consequential, or punitive damages arising from the use of this platform.</p>
      </section>

      <section>
        <h3 className="text-lg font-semibold text-gray-800 mb-2 flex items-center gap-2">
          <span className="w-1.5 h-6 bg-gradient-to-b from-purple-400 to-pink-500 rounded-full"></span>
          6. Educational Purpose
        </h3>
        <p>All resources on PharmaVerse are designed to supplement your education. We do not guarantee exam success or specific academic outcomes. Learning outcomes depend on individual effort and dedication.</p>
      </section>

      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
        <p className="text-sm text-gray-700 flex items-center gap-2">
          <AlertCircle className="text-amber-500" size={18} />
          <span><span className="font-semibold">Last Updated:</span> {new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
        </p>
      </div>
    </div>
  );

  return (
    <>
      <footer className="bg-white border-t border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-12 lg:py-16">
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 md:gap-10 lg:gap-12">
            
            {/* Column 1: Brand */}
            <div className="text-center md:text-left">
              <div className="flex items-center justify-center md:justify-start gap-2 mb-4">
                <img src={logo} alt="PharmaVerse" className="w-10 h-10 sm:w-12 sm:h-12 object-contain" />
                <h2 className="text-xl sm:text-2xl font-bold text-gray-800">
                  PHARMA<span className="text-amber-500">VERSE</span>
                </h2>
              </div>
              <p className="text-gray-600 text-sm sm:text-base leading-relaxed max-w-xs mx-auto md:mx-0">
                Empowering pharmacy students with high-quality study materials, 
                video tutorials, and practice tools for academic excellence.
              </p>
              <div className="mt-4 flex items-center justify-center md:justify-start gap-2 text-xs text-gray-400">
                <Copy size={14} className="text-amber-500" />
                <span>All Rights Reserved</span>
              </div>
            </div>

            {/* Column 2: Quick Links */}
            <div className="text-center md:text-left">
              <h3 className="text-lg sm:text-xl font-semibold text-gray-800 mb-4 sm:mb-5">Quick Links</h3>
              <ul className="space-y-3 sm:space-y-3.5">
                {quickLinks.map((link, idx) => {
                  const Icon = link.icon;
                  return (
                    <li key={idx}>
                      <div 
                        className="flex items-center gap-3 group cursor-pointer hover:translate-x-1 transition-all duration-300"
                        onClick={() => handleNavigate(link.path, link.state)}
                      >
                        <div className={`w-8 h-8 rounded-lg ${link.bg} flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-300`}>
                          <Icon size={16} className={link.color} />
                        </div>
                        <div className="flex flex-col">
                          <span className="text-gray-700 text-sm sm:text-base font-medium group-hover:text-amber-500 transition-colors duration-300">
                            {link.label}
                          </span>
                          <span className="text-gray-400 text-[10px] sm:text-xs">
                            {link.description}
                          </span>
                        </div>
                      </div>
                    </li>
                  );
                })}
              </ul>
            </div>

            {/* Column 3: Resources */}
            <div className="text-center md:text-left">
              <h3 className="text-lg sm:text-xl font-semibold text-gray-800 mb-4 sm:mb-5">Resources</h3>
              <ul className="space-y-2 sm:space-y-2.5">
                {resources.map((link, idx) => (
                  <li key={idx}>
                    <span 
                      className="text-gray-600 text-sm sm:text-base hover:text-amber-500 transition-colors duration-300 cursor-pointer"
                      onClick={() => handleNavigate(link.path)}
                    >
                      {link.label}
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Column 4: Founders */}
            <div className="text-center md:text-left">
              <h3 className="text-lg sm:text-xl font-semibold text-gray-800 mb-4 sm:mb-5">Our Founders</h3>
              <ul className="space-y-2 sm:space-y-2.5">
                {founders.map((founder, idx) => (
                  <li key={idx}>
                    <p className="text-gray-700 text-sm sm:text-base font-medium">{founder}</p>
                  </li>
                ))}
              </ul>
            </div>

            {/* Column 5: Contact & Social */}
            <div className="text-center md:text-left">
              <h3 className="text-lg sm:text-xl font-semibold text-gray-800 mb-4 sm:mb-5">Connect With Us</h3>
              
              <div className="space-y-2.5 sm:space-y-3 mb-5 sm:mb-6">
                <div className="flex items-center justify-center md:justify-start gap-2.5 text-gray-600 text-sm sm:text-base">
                  <Mail size={16} className="sm:w-5 sm:h-5 text-amber-500 flex-shrink-0" />
                  <span className="break-all">pharmaversehelpline@gmail.com</span>
                </div>
                <div className="flex items-center justify-center md:justify-start gap-2.5 text-gray-600 text-sm sm:text-base">
                  <Phone size={16} className="sm:w-5 sm:h-5 text-amber-500 flex-shrink-0" />
                  <span>+91 9548787579</span>
                </div>
                <div className="flex items-center justify-center md:justify-start gap-2.5 text-gray-600 text-sm sm:text-base">
                  <MapPin size={16} className="sm:w-5 sm:h-5 text-amber-500 flex-shrink-0" />
                  <span>Greater Noida, India</span>
                </div>
                <div className="flex items-center justify-center md:justify-start gap-2.5 text-gray-600 text-sm sm:text-base">
                  <Clock size={16} className="sm:w-5 sm:h-5 text-amber-500 flex-shrink-0" />
                  <span>Mon - Sat, 1PM - 4 PM</span>
                </div>
              </div>

              <div>
                <p className="text-sm sm:text-base font-medium text-gray-700 mb-3 sm:mb-4">Follow us on</p>
                <div className="flex gap-3 flex-wrap justify-center md:justify-start">
                  {socialLinks.map((social, idx) => {
                    const Icon = social.icon;
                    return (
                      <a
                        key={idx}
                        href={social.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 hover:bg-amber-500 hover:text-white transition-all duration-300 hover:scale-110 hover:shadow-lg hover:shadow-amber-500/20 cursor-pointer"
                        aria-label={social.label}
                      >
                        <Icon size={18} className="sm:w-5 sm:h-5" />
                      </a>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Bar - UPDATED with full copyright notice */}
          <div className="border-t border-gray-200 mt-10 sm:mt-12 pt-6 sm:pt-8">
            <div className="flex flex-col items-center gap-4">
              <div className="text-center">
                <p className="text-gray-500 text-xs sm:text-sm font-medium">
                  © {currentYear} PharmaVerse. All Rights Reserved.
                </p>
                <p className="text-gray-400 text-[10px] sm:text-xs mt-2 max-w-4xl leading-relaxed">
                  Unauthorized copying, recording, downloading, sharing, redistribution, or commercial use of any PharmaVerse content is strictly prohibited and may result in civil and criminal legal action under applicable intellectual property laws.
                </p>
                <p className="text-gray-400 text-[10px] sm:text-xs mt-1">
                  🔒 All content is protected by copyright law
                </p>
              </div>
              
              <div className="flex gap-4 sm:gap-6 flex-wrap justify-center">
                <button onClick={() => setShowTerms(true)} className="text-gray-500 text-xs sm:text-sm hover:text-amber-500 transition-colors duration-300 flex items-center gap-1">
                  <FileText size={14} /> Terms & Conditions
                </button>
                <button onClick={() => setShowPrivacy(true)} className="text-gray-500 text-xs sm:text-sm hover:text-amber-500 transition-colors duration-300">
                  Privacy Policy
                </button>
                <button onClick={() => setShowRefund(true)} className="text-gray-500 text-xs sm:text-sm hover:text-amber-500 transition-colors duration-300">
                  Refund Policy
                </button>
                <button onClick={() => setShowDisclaimer(true)} className="text-gray-500 text-xs sm:text-sm hover:text-amber-500 transition-colors duration-300">
                  Disclaimer
                </button>
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-gray-100">
              <p className="text-gray-400 text-[10px] sm:text-xs text-center">
                <span className="font-semibold">⚠️ Intellectual Property Notice:</span> All content is the exclusive 
                <span className="font-bold text-amber-600"> intellectual property right of PharmaVerse</span>. 
                Unauthorized reproduction, distribution, or copying is strictly prohibited.
              </p>
            </div>
          </div>

        </div>
      </footer>

      {/* Modals */}
      <LegalModal isOpen={showTerms} onClose={() => setShowTerms(false)} title="Terms & Conditions" icon={FileText}>
        <TermsContent />
      </LegalModal>

      <LegalModal isOpen={showPrivacy} onClose={() => setShowPrivacy(false)} title="Privacy Policy" icon={Shield}>
        <PrivacyContent />
      </LegalModal>

      <LegalModal isOpen={showRefund} onClose={() => setShowRefund(false)} title="Refund Policy" icon={AlertCircle}>
        <RefundContent />
      </LegalModal>

      <LegalModal isOpen={showDisclaimer} onClose={() => setShowDisclaimer(false)} title="Disclaimer" icon={AlertCircle}>
        <DisclaimerContent />
      </LegalModal>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }
        .animate-fadeIn { animation: fadeIn 0.3s ease; }
      `}</style>
    </>
  );
};

export default Footer;