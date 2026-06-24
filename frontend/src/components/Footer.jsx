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
    <footer className="bg-white border-t border-gray-200">
      {/* Main Footer */}
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
                <span>+91 98765 43210</span>
              </div>
              <div className="flex items-center justify-center md:justify-start gap-2.5 text-gray-600 text-sm sm:text-base">
                <MapPin size={16} className="sm:w-5 sm:h-5 text-amber-500 flex-shrink-0" />
                <span>Greater Noida, India</span>
              </div>
              <div className="flex items-center justify-center md:justify-start gap-2.5 text-gray-600 text-sm sm:text-base">
                <Clock size={16} className="sm:w-5 sm:h-5 text-amber-500 flex-shrink-0" />
                <span>Mon - Sat, 9 AM - 7 PM</span>
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

        {/* Bottom Bar */}
        <div className="border-t border-gray-200 mt-10 sm:mt-12 pt-6 sm:pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-gray-500 text-xs sm:text-sm text-center">
              © {currentYear} PharmaVerse. All rights reserved. Made with{' '}
              <Heart size={12} className="inline text-red-500" /> for pharmacy students
            </p>
            <div className="flex gap-4 sm:gap-6 flex-wrap justify-center">
              {legal.map((item, idx) => (
                <span key={idx} className="text-gray-500 text-xs sm:text-sm hover:text-amber-500 transition-colors duration-300 cursor-pointer">
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