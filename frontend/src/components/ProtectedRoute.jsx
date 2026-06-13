import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import AuthModal from "./AuthModal";

const ProtectedRoute = ({ children }) => {
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [checking, setChecking] = useState(true);
  const location = useLocation();
  const navigate = useNavigate();

  // Check login status from multiple storage keys
  const isLoggedIn = () => {
    const token = localStorage.getItem("token") || 
                  localStorage.getItem("userToken") || 
                  sessionStorage.getItem("token");
    return !!token;
  };

  useEffect(() => {
    // Small delay to ensure storage is read properly
    const checkAuth = () => {
      const loggedIn = isLoggedIn();
      
      if (!loggedIn) {
        setShowAuthModal(true);
      } else {
        setShowAuthModal(false);
      }
      setChecking(false);
    };
    
    checkAuth();
  }, [location.pathname]);

  const handleCloseModal = () => {
    setShowAuthModal(false);
    navigate("/");
  };

  const handleLoginSuccess = () => {
    setShowAuthModal(false);
    // Reload to refresh user data in all components
    window.location.reload();
  };

  // Show loading while checking auth status
  if (checking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="text-center">
          <div className="relative w-16 h-16 mx-auto mb-4">
            <div className="absolute inset-0 border-4 border-gray-200 rounded-full"></div>
            <div className="absolute inset-0 border-4 border-purple-600 rounded-full border-t-transparent animate-spin"></div>
          </div>
          <p className="text-gray-600">Verifying access...</p>
        </div>
      </div>
    );
  }

  if (isLoggedIn()) {
    return <>{children}</>;
  }

  return (
    <AuthModal 
      isOpen={showAuthModal} 
      onClose={handleCloseModal}
      onLoginSuccess={handleLoginSuccess}
    />
  );
};

export default ProtectedRoute;