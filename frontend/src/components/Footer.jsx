import { 
  Heart, 
  Mail, 
  Phone, 
  MapPin, 
  Clock,
  Copy,
  Shield,
  FileText,
  AlertCircle,
  X
} from "lucide-react";
import { useState } from "react";
import { FaFacebook, FaInstagram, FaYoutube, FaLinkedin, FaTelegram, FaWhatsapp, FaQuora } from "react-icons/fa";
import logo from "../assets/logo.png";

const Footer = () => {
  const currentYear = new Date().getFullYear();
  const [showTerms, setShowTerms] = useState(false);
  const [showPrivacy, setShowPrivacy] = useState(false);
  const [showRefund, setShowRefund] = useState(false);
  const [showDisclaimer, setShowDisclaimer] = useState(false);

  const quickLinks = [
    "Free PDF Notes",
    "Premium Notes", 
    "Video Tutorials",
    "Question Papers",
    "Study Material"
  ];

  const resources = [
    "Blog",
    "Success Stories",
    "FAQs",
    "Support Center",
    "Community"
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

  // Modal Component for Terms & Conditions
  const LegalModal = ({ isOpen, onClose, title, children }) => {
    if (!isOpen) return null;

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fadeIn">
        <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
          <div className="sticky top-0 bg-white border-b border-gray-200 p-4 flex items-center justify-between rounded-t-2xl">
            <div className="flex items-center gap-2">
              <Shield className="text-amber-500" size={24} />
              <h2 className="text-xl font-bold text-gray-800">{title}</h2>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X size={24} className="text-gray-500" />
            </button>
          </div>
          <div className="p-6">
            {children}
          </div>
          <div className="sticky bottom-0 bg-white border-t border-gray-200 p-4">
            <button
              onClick={onClose}
              className="w-full bg-amber-500 hover:bg-amber-600 text-white font-semibold py-2 rounded-xl transition-colors"
            >
              I Understand & Close
            </button>
          </div>
        </div>
      </div>
    );
  };

  // Terms Content
  const TermsContent = () => (
    <div className="space-y-6 text-gray-600">
      <section>
        <h3 className="text-lg font-semibold text-gray-800 mb-2">1. Acceptance of Terms</h3>
        <p>By using PharmaVerse, you agree to be bound by these Terms & Conditions. If you do not agree, please do not use our services.</p>
      </section>
      <section>
        <h3 className="text-lg font-semibold text-gray-800 mb-2">2. Intellectual Property</h3>
        <p>All content on PharmaVerse, including study materials, videos, and resources, is the intellectual property of PharmaVerse. You may not copy, distribute, or reproduce any content without prior written permission.</p>
      </section>
      <section>
        <h3 className="text-lg font-semibold text-gray-800 mb-2">3. User Accounts</h3>
        <p>You are responsible for maintaining the confidentiality of your account credentials. Any activity under your account is your responsibility.</p>
      </section>
      <section>
        <h3 className="text-lg font-semibold text-gray-800 mb-2">4. Prohibited Activities</h3>
        <ul className="list-disc pl-6 space-y-1">
          <li>Copying or redistributing content without permission</li>
          <li>Attempting to hack or disrupt the platform</li>
          <li>Sharing premium content with non-subscribers</li>
          <li>Using the platform for any illegal activities</li>
        </ul>
      </section>
      <section>
        <h3 className="text-lg font-semibold text-gray-800 mb-2">5. Disclaimer</h3>
        <p>All content is provided "as is" without any warranties. PharmaVerse is not responsible for any errors or omissions in the content.</p>
      </section>
      <section>
        <h3 className="text-lg font-semibold text-gray-800 mb-2">6. Changes to Terms</h3>
        <p>PharmaVerse reserves the right to update these Terms & Conditions at any time. Continued use of the platform constitutes acceptance of the updated terms.</p>
      </section>
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
        <div className="flex items-start gap-3">
          <AlertCircle className="text-amber-500 flex-shrink-0 mt-1" size={20} />
          <p className="text-sm text-gray-700">
            <span className="font-semibold">Last Updated:</span> {new Date().toLocaleDateString('en-IN', { 
              day: 'numeric', 
              month: 'long', 
              year: 'numeric' 
            })}
          </p>
        </div>
      </div>
    </div>
  );

  // Privacy Policy Content
  const PrivacyContent = () => (
    <div className="space-y-6 text-gray-600">
      <section>
        <h3 className="text-lg font-semibold text-gray-800 mb-2">1. Information We Collect</h3>
        <p>We collect information you provide directly, such as your name, email address, phone number, and payment information when you register or make a purchase.</p>
      </section>
      <section>
        <h3 className="text-lg font-semibold text-gray-800 mb-2">2. How We Use Your Information</h3>
        <ul className="list-disc pl-6 space-y-1">
          <li>To provide and maintain our services</li>
          <li>To process your transactions</li>
          <li>To send you updates and notifications</li>
          <li>To improve our platform and user experience</li>
        </ul>
      </section>
      <section>
        <h3 className="text-lg font-semibold text-gray-800 mb-2">3. Data Security</h3>
        <p>We implement industry-standard security measures to protect your data. However, no method of transmission over the internet is 100% secure.</p>
      </section>
      <section>
        <h3 className="text-lg font-semibold text-gray-800 mb-2">4. Third-Party Sharing</h3>
        <p>We do not sell, trade, or transfer your personal information to third parties without your consent, except as required by law.</p>
      </section>
      <section>
        <h3 className="text-lg font-semibold text-gray-800 mb-2">5. Cookies</h3>
        <p>We use cookies to enhance your experience. You can choose to disable cookies in your browser settings.</p>
      </section>
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
        <div className="flex items-start gap-3">
          <AlertCircle className="text-amber-500 flex-shrink-0 mt-1" size={20} />
          <p className="text-sm text-gray-700">
            <span className="font-semibold">Last Updated:</span> {new Date().toLocaleDateString('en-IN', { 
              day: 'numeric', 
              month: 'long', 
              year: 'numeric' 
            })}
          </p>
        </div>
      </div>
    </div>
  );

  // Refund Policy Content
  const RefundContent = () => (
    <div className="space-y-6 text-gray-600">
      <section>
        <h3 className="text-lg font-semibold text-gray-800 mb-2">1. Refund Eligibility</h3>
        <p>Refunds are available within 7 days of purchase if you are not satisfied with the content. Proof of purchase required.</p>
      </section>
      <section>
        <h3 className="text-lg font-semibold text-gray-800 mb-2">2. How to Request a Refund</h3>
        <p>Contact our support team at pharmaversehelpline@gmail.com with your order details and reason for refund.</p>
      </section>
      <section>
        <h3 className="text-lg font-semibold text-gray-800 mb-2">3. Processing Time</h3>
        <p>Refunds are processed within 5-7 business days after approval. The amount will be credited to your original payment method.</p>
      </section>
      <section>
        <h3 className="text-lg font-semibold text-gray-800 mb-2">4. Non-Refundable Items</h3>
        <ul className="list-disc pl-6 space-y-1">
          <li>Content that has been downloaded or accessed</li>
          <li>Subscription fees after 7 days of purchase</li>
          <li>Custom content or personalized services</li>
        </ul>
      </section>
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
        <div className="flex items-start gap-3">
          <AlertCircle className="text-amber-500 flex-shrink-0 mt-1" size={20} />
          <p className="text-sm text-gray-700">
            <span className="font-semibold">Last Updated:</span> {new Date().toLocaleDateString('en-IN', { 
              day: 'numeric', 
              month: 'long', 
              year: 'numeric' 
            })}
          </p>
        </div>
      </div>
    </div>
  );

  // Disclaimer Content
  const DisclaimerContent = () => (
    <div className="space-y-6 text-gray-600">
      <section>
        <h3 className="text-lg font-semibold text-gray-800 mb-2">1. General Disclaimer</h3>
        <p>The information provided on PharmaVerse is for educational purposes only and should not be considered as professional medical advice.</p>
      </section>
      <section>
        <h3 className="text-lg font-semibold text-gray-800 mb-2">2. Accuracy of Information</h3>
        <p>While we strive to provide accurate and up-to-date information, we make no representations or warranties of any kind, express or implied, about the completeness, accuracy, reliability, suitability, or availability of the information contained on the platform.</p>
      </section>
      <section>
        <h3 className="text-lg font-semibold text-gray-800 mb-2">3. External Links</h3>
        <p>Our platform may contain links to external websites. We have no control over the content or availability of these sites and are not responsible for their content.</p>
      </section>
      <section>
        <h3 className="text-lg font-semibold text-gray-800 mb-2">4. Limitation of Liability</h3>
        <p>PharmaVerse, its founders, and contributors shall not be liable for any loss or damage arising from the use of this platform.</p>
      </section>
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
        <div className="flex items-start gap-3">
          <AlertCircle className="text-amber-500 flex-shrink-0 mt-1" size={20} />
          <p className="text-sm text-gray-700">
            <span className="font-semibold">Last Updated:</span> {new Date().toLocaleDateString('en-IN', { 
              day: 'numeric', 
              month: 'long', 
              year: 'numeric' 
            })}
          </p>
        </div>
      </div>
    </div>
  );

  return (
    <>
      <footer className="bg-white border-t border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-12 lg:py-16">
          
          {/* 1 Column on Mobile, 5 Columns on Desktop */}
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
              {/* Copyright Protection Badge */}
              <div className="mt-4 flex items-center justify-center md:justify-start gap-2 text-xs text-gray-400">
                <Copy size={14} className="text-amber-500" />
                <span>All Rights Reserved</span>
              </div>
            </div>

            {/* Column 2: Quick Links */}
            <div className="text-center md:text-left">
              <h3 className="text-lg sm:text-xl font-semibold text-gray-800 mb-4 sm:mb-5">Quick Links</h3>
              <ul className="space-y-2 sm:space-y-2.5">
                {quickLinks.map((link, idx) => (
                  <li key={idx}>
                    <span className="text-gray-600 text-sm sm:text-base hover:text-amber-500 transition-colors duration-300 cursor-pointer">
                      {link}
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Column 3: Resources */}
            <div className="text-center md:text-left">
              <h3 className="text-lg sm:text-xl font-semibold text-gray-800 mb-4 sm:mb-5">Resources</h3>
              <ul className="space-y-2 sm:space-y-2.5">
                {resources.map((link, idx) => (
                  <li key={idx}>
                    <span className="text-gray-600 text-sm sm:text-base hover:text-amber-500 transition-colors duration-300 cursor-pointer">
                      {link}
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
                    <p className="text-gray-700 text-sm sm:text-base font-medium">
                      {founder}
                    </p>
                  </li>
                ))}
              </ul>
            </div>

            {/* Column 5: Contact & Social */}
            <div className="text-center md:text-left">
              <h3 className="text-lg sm:text-xl font-semibold text-gray-800 mb-4 sm:mb-5">Connect With Us</h3>
              
              {/* Contact Details */}
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

              {/* Social Icons */}
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

          {/* Bottom Bar - WITH COPYRIGHT PROTECTION & LEGAL LINKS */}
          <div className="border-t border-gray-200 mt-10 sm:mt-12 pt-6 sm:pt-8">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
              {/* Copyright with protection */}
              <div className="text-center md:text-left">
                <p className="text-gray-500 text-xs sm:text-sm">
                  © {currentYear} PharmaVerse. All Rights Reserved.
                </p>
                <p className="text-gray-400 text-[10px] sm:text-xs mt-1">
                  <span className="inline-block">🔒</span> All content is protected by copyright law
                </p>
              </div>
              
              {/* Legal Links - Now opens modals */}
              <div className="flex gap-4 sm:gap-6 flex-wrap justify-center">
                <button
                  onClick={() => setShowTerms(true)}
                  className="text-gray-500 text-xs sm:text-sm hover:text-amber-500 transition-colors duration-300 flex items-center gap-1"
                >
                  <FileText size={14} />
                  Terms & Conditions
                </button>
                <button
                  onClick={() => setShowPrivacy(true)}
                  className="text-gray-500 text-xs sm:text-sm hover:text-amber-500 transition-colors duration-300"
                >
                  Privacy Policy
                </button>
                <button
                  onClick={() => setShowRefund(true)}
                  className="text-gray-500 text-xs sm:text-sm hover:text-amber-500 transition-colors duration-300"
                >
                  Refund Policy
                </button>
                <button
                  onClick={() => setShowDisclaimer(true)}
                  className="text-gray-500 text-xs sm:text-sm hover:text-amber-500 transition-colors duration-300"
                >
                  Disclaimer
                </button>
              </div>
            </div>

            {/* Additional Copyright Protection Notice */}
            <div className="mt-4 pt-4 border-t border-gray-100">
              <p className="text-gray-400 text-[10px] sm:text-xs text-center">
                <span className="font-semibold">⚠️ Disclaimer:</span> Unauthorized reproduction, distribution, or 
                copying of any content from PharmaVerse is strictly prohibited. 
                All study materials, videos, and resources are the intellectual property of PharmaVerse.
              </p>
            </div>
          </div>

        </div>
      </footer>

      {/* Modals */}
      <LegalModal 
        isOpen={showTerms} 
        onClose={() => setShowTerms(false)} 
        title="Terms & Conditions"
      >
        <TermsContent />
      </LegalModal>

      <LegalModal 
        isOpen={showPrivacy} 
        onClose={() => setShowPrivacy(false)} 
        title="Privacy Policy"
      >
        <PrivacyContent />
      </LegalModal>

      <LegalModal 
        isOpen={showRefund} 
        onClose={() => setShowRefund(false)} 
        title="Refund Policy"
      >
        <RefundContent />
      </LegalModal>

      <LegalModal 
        isOpen={showDisclaimer} 
        onClose={() => setShowDisclaimer(false)} 
        title="Disclaimer"
      >
        <DisclaimerContent />
      </LegalModal>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease;
        }
      `}</style>
    </>
  );
};

export default Footer;