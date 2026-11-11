
import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import AuthModal from "./AuthModal";

const ProtectedRoute = ({ children }) => {
  const [showAuthModal, setShowAuthModal] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  // Use the same token key as AuthModal and Navbar
  const isLoggedIn = !!(
    localStorage.getItem("token") ||
    localStorage.getItem("userToken") ||
    sessionStorage.getItem("token") ||
    sessionStorage.getItem("userToken")
  );

  useEffect(() => {
    if (!isLoggedIn) {
      setShowAuthModal(true);
    } else {
      setShowAuthModal(false);
    }
  }, [location.pathname, isLoggedIn]);

  // Show protected content only after login
  if (isLoggedIn) {
    return <>{children}</>;
  }

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
