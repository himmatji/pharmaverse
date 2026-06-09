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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        
        {/* 5 Column Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-8 lg:gap-12">
          
          {/* Column 1: Brand */}
          <div className="lg:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <img src={logo} alt="PharmaVerse" className="w-10 h-10 object-contain" />
              <h2 className="text-xl font-bold text-gray-800">
                PHARMA<span className="text-amber-500">VERSE</span>
              </h2>
            </div>
            <p className="text-gray-600 text-sm leading-relaxed">
              Empowering pharmacy students with high-quality study materials, 
              video tutorials, and practice tools for academic excellence.
            </p>
          </div>

          {/* Column 2: Quick Links */}
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Quick Links</h3>
            <ul className="space-y-2">
              {quickLinks.map((link, idx) => (
                <li key={idx}>
                  <span className="text-gray-600 text-sm hover:text-amber-500 cursor-pointer transition-colors">
                    {link}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3: Resources */}
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Resources</h3>
            <ul className="space-y-2">
              {resources.map((link, idx) => (
                <li key={idx}>
                  <span className="text-gray-600 text-sm hover:text-amber-500 cursor-pointer transition-colors">
                    {link}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 4: Founders */}
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Our Founders</h3>
            <ul className="space-y-2">
              {founders.map((founder, idx) => (
                <li key={idx}>
                  <p className="text-gray-800 text-sm font-medium">{founder}</p>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 5: Contact & Social */}
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Connect With Us</h3>
            
            {/* Contact Details */}
            <div className="space-y-3 mb-6">
              <div className="flex items-center gap-2 text-gray-600 text-sm">
                <Mail size={16} className="text-amber-500 flex-shrink-0" />
                <span>pharmaversehelpline@gmail.com</span>
              </div>
              <div className="flex items-center gap-2 text-gray-600 text-sm">
                <Phone size={16} className="text-amber-500 flex-shrink-0" />
                <span>+91 98765 43210</span>
              </div>
              <div className="flex items-center gap-2 text-gray-600 text-sm">
                <MapPin size={16} className="text-amber-500 flex-shrink-0" />
                <span>Greater Noida, India</span>
              </div>
              <div className="flex items-center gap-2 text-gray-600 text-sm">
                <Clock size={16} className="text-amber-500 flex-shrink-0" />
                <span>Mon - Sat, 9 AM - 7 PM</span>
              </div>
            </div>

            {/* Social Icons */}
            <div>
              <p className="text-sm font-medium text-gray-700 mb-3">Follow us on</p>
              <div className="flex gap-2 flex-wrap">
                {socialLinks.map((social, idx) => {
                  const Icon = social.icon;
                  return (
                    <a
                      key={idx}
                      href={social.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-9 h-9 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 hover:bg-amber-500 hover:text-white transition-all duration-300 hover:scale-110"
                      aria-label={social.label}
                    >
                      <Icon size={16} />
                    </a>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-200 mt-10 pt-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-gray-500 text-xs">
              © {currentYear} PharmaVerse. All rights reserved. Made with{' '}
              <Heart size={12} className="inline text-red-500" /> for pharmacy students
            </p>
            <div className="flex gap-6 flex-wrap justify-center">
              {legal.map((item, idx) => (
                <span key={idx} className="text-gray-500 text-xs hover:text-amber-500 cursor-pointer transition-colors">
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