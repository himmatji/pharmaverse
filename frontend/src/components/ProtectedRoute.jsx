import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import AuthModal from "./AuthModal";

const ProtectedRoute = ({ children }) => {
  const [showAuthModal, setShowAuthModal] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  // Consistent token key — LockedContent & PaymentModal use 'userToken'
  const isLoggedIn = !!(
    localStorage.getItem("userToken") || sessionStorage.getItem("userToken")
  );

  useEffect(() => {
    if (!isLoggedIn) setShowAuthModal(true);
    else setShowAuthModal(false);
  }, [location.pathname, isLoggedIn]);

  const handleCloseModal = () => {
    setShowAuthModal(false);
    navigate("/");
  };

  const handleLoginSuccess = () => {
    setShowAuthModal(false);
    window.location.reload();
  };

  if (isLoggedIn) return <>{children}</>;

  return (
    <AuthModal
      isOpen={showAuthModal}
      onClose={handleCloseModal}
      onLoginSuccess={handleLoginSuccess}
    />
  );
};

export default ProtectedRoute;