import { 
  Heart, 
  Mail, 
  Phone, 
  MapPin, 
  Clock
} from "lucide-react";
// React-icons se import karein social icons
import { FaFacebook, FaInstagram, FaYoutube, FaLinkedin, FaTelegram, FaWhatsapp, FaQuora } from "react-icons/fa";
import logo from "../assets/logo.png";

const Footer = () => {
  const currentYear = new Date().getFullYear();

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

  const legal = [
    "Privacy Policy",
    "Terms of Service",
    "Refund Policy",
    "Disclaimer"
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

  return (
    <footer className="bg-gray-50 border-t border-gray-200">
      {/* Main Footer */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 lg:py-16">
        
        {/* 5 Column Grid - Responsive */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6 sm:gap-8 lg:gap-12">
          
          {/* Column 1: Brand */}
          <div className="lg:col-span-1 text-center sm:text-left">
            <div className="flex items-center justify-center sm:justify-start gap-2 mb-4">
              <img src={logo} alt="PharmaVerse" className="w-8 h-8 sm:w-10 sm:h-10 object-contain" />
              <h2 className="text-lg sm:text-xl font-bold text-gray-800">
                PHARMA<span className="text-amber-500">VERSE</span>
              </h2>
            </div>
            <p className="text-gray-600 text-xs sm:text-sm leading-relaxed">
              Empowering pharmacy students with high-quality study materials, 
              video tutorials, and practice tools for academic excellence.
            </p>
          </div>

          {/* Column 2: Quick Links - NO CLICK, NO POINTER */}
          <div className="text-center sm:text-left">
            <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-3 sm:mb-4">Quick Links</h3>
            <ul className="space-y-1.5 sm:space-y-2">
              {quickLinks.map((link, idx) => (
                <li key={idx}>
                  <span className="text-gray-600 text-xs sm:text-sm cursor-default">
                    {link}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3: Resources - NO CLICK, NO POINTER */}
          <div className="text-center sm:text-left">
            <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-3 sm:mb-4">Resources</h3>
            <ul className="space-y-1.5 sm:space-y-2">
              {resources.map((link, idx) => (
                <li key={idx}>
                  <span className="text-gray-600 text-xs sm:text-sm cursor-default">
                    {link}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 4: Founders - NO CLICK, NO POINTER */}
          <div className="text-center sm:text-left">
            <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-3 sm:mb-4">Our Founders</h3>
            <ul className="space-y-1.5 sm:space-y-2">
              {founders.map((founder, idx) => (
                <li key={idx}>
                  <p className="text-gray-700 text-xs sm:text-sm font-medium cursor-default">
                    {founder}
                  </p>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 5: Contact & Social */}
          <div className="text-center sm:text-left">
            <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-3 sm:mb-4">Connect With Us</h3>
            
            {/* Contact Details - NO CLICK, NO POINTER */}
            <div className="space-y-2 sm:space-y-3 mb-4 sm:mb-6">
              <div className="flex items-center justify-center sm:justify-start gap-2 text-gray-600 text-xs sm:text-sm cursor-default">
                <Mail size={14} className="sm:w-4 sm:h-4 text-amber-500 flex-shrink-0" />
                <span className="break-all">pharmaversehelpline@gmail.com</span>
              </div>
              <div className="flex items-center justify-center sm:justify-start gap-2 text-gray-600 text-xs sm:text-sm cursor-default">
                <Phone size={14} className="sm:w-4 sm:h-4 text-amber-500 flex-shrink-0" />
                <span>+91 98765 43210</span>
              </div>
              <div className="flex items-center justify-center sm:justify-start gap-2 text-gray-600 text-xs sm:text-sm cursor-default">
                <MapPin size={14} className="sm:w-4 sm:h-4 text-amber-500 flex-shrink-0" />
                <span>Greater Noida, India</span>
              </div>
              <div className="flex items-center justify-center sm:justify-start gap-2 text-gray-600 text-xs sm:text-sm cursor-default">
                <Clock size={14} className="sm:w-4 sm:h-4 text-amber-500 flex-shrink-0" />
                <span>Mon - Sat, 9 AM - 7 PM</span>
              </div>
            </div>

            {/* Social Icons - ONLY CLICKABLE, ONLY POINTER */}
            <div>
              <p className="text-xs sm:text-sm font-medium text-gray-700 mb-2 sm:mb-3">Follow us on</p>
              <div className="flex gap-2 flex-wrap justify-center sm:justify-start">
                {socialLinks.map((social, idx) => {
                  const Icon = social.icon;
                  return (
                    <a
                      key={idx}
                      href={social.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 hover:bg-amber-500 hover:text-white transition-all duration-300 hover:scale-110 cursor-pointer"
                      aria-label={social.label}
                    >
                      <Icon size={14} className="sm:w-4 sm:h-4" />
                    </a>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar - NO CLICK, NO POINTER except social links */}
        <div className="border-t border-gray-200 mt-8 sm:mt-10 pt-5 sm:pt-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-3 sm:gap-4">
            <p className="text-gray-500 text-[10px] sm:text-xs text-center cursor-default">
              © {currentYear} PharmaVerse. All rights reserved. Made with{' '}
              <Heart size={10} className="inline text-red-500" /> for pharmacy students
            </p>
            <div className="flex gap-3 sm:gap-6 flex-wrap justify-center">
              {legal.map((item, idx) => (
                <span key={idx} className="text-gray-500 text-[10px] sm:text-xs cursor-default">
                  {item}
                </span>
              ))}
            </div>
          </div>
        </div>

      </div>
    </footer>
  );
};

export default Footer;