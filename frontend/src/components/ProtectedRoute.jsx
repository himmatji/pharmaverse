import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import AuthModal from "./AuthModal";

const ProtectedRoute = ({ children }) => {
  const [showAuthModal, setShowAuthModal] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  // ✅ Consistent token key
  const isLoggedIn = !!(
    localStorage.getItem("userToken") || 
    sessionStorage.getItem("userToken")
  );

  useEffect(() => {
    if (!isLoggedIn) setShowAuthModal(true);
    else setShowAuthModal(false);
  }, [location.pathname, isLoggedIn]);

  if (isLoggedIn) return <>{children}</>;

  return (
    <AuthModal 
      isOpen={showAuthModal} 
      onClose={() => {
        setShowAuthModal(false);
        navigate("/");
      }}
      onLoginSuccess={() => {
        setShowAuthModal(false);
        window.location.reload();
      }}
    />
  );
};

export default ProtectedRoute;