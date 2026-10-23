import { useEffect, useState } from "react";
import {
  X,
  Mail,
  Lock,
  User,
  LogIn,
  Eye,
  EyeOff,
  Phone,
  ArrowLeft,
  ShieldCheck,
  KeyRound,
  CheckCircle2,
} from "lucide-react";
import axios from "axios";

const API_URL = (
  import.meta.env.VITE_API_URL || "https://api.pharmaverse.co.in"
).replace(/\/+$/, "").replace(/\/api\/auth$/i, "") + "/api/auth";

const AuthModal = ({ isOpen, onClose, onLoginSuccess }) => {
  const [mode, setMode] = useState("login"); // login | signup | forgot | otp | reset | success
  const [identifier, setIdentifier] = useState("");
  const [email, setEmail] = useState("");
  const [mobile, setMobile] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [name, setName] = useState("");
  const [otp, setOtp] = useState("");
  const [resetToken, setResetToken] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const clearForm = () => {
    setIdentifier("");
    setEmail("");
    setMobile("");
    setPassword("");
    setConfirmPassword("");
    setName("");
    setOtp("");
    setResetToken("");
    setError("");
    setNotice("");
    setShowPassword(false);
    setShowConfirmPassword(false);
  };

  useEffect(() => {
    if (!isOpen) {
      clearForm();
      setMode("login");
    }
    // clearForm is intentionally only run when the modal closes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  if (!isOpen) return null;

  const changeMode = (nextMode) => {
    setMode(nextMode);
    setError("");
    setNotice("");
    setPassword("");
    setConfirmPassword("");
    setOtp("");
    setShowPassword(false);
    setShowConfirmPassword(false);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError("");
    setNotice("");

    try {
      if (mode === "login") {
        if (!identifier.trim() || !password) {
          setError("Please enter your email/mobile number and password.");
          return;
        }

        const response = await axios.post(`${API_URL}/signin`, {
          identifier: identifier.trim(),
          password,
        });

        if (response.data?.success) {
          localStorage.setItem("token", response.data.token);
          localStorage.setItem("user", JSON.stringify(response.data.user));
          localStorage.setItem("isLoggedIn", "true");
          if (onLoginSuccess) onLoginSuccess();
          return;
        }
        setError(response.data?.message || "Unable to sign in.");
        return;
      }

      if (mode === "signup") {
        const cleanEmail = email.trim().toLowerCase();
        const cleanMobile = mobile.trim();

        if (!name.trim()) {
          setError("Please enter your full name.");
          return;
        }
        if (!cleanEmail && !cleanMobile) {
          setError("Please enter an email address or mobile number.");
          return;
        }
        if (cleanEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
          setError("Please enter a valid email address.");
          return;
        }
        if (cleanMobile && !/^\d{10}$/.test(cleanMobile)) {
          setError("Please enter a valid 10-digit mobile number.");
          return;
        }
        if (password.length < 8) {
          setError("Password must be at least 8 characters long.");
          return;
        }

        const response = await axios.post(`${API_URL}/signup`, {
          name: name.trim(),
          email: cleanEmail || undefined,
          mobile: cleanMobile || undefined,
          password,
        });

        if (response.data?.success) {
          localStorage.setItem("token", response.data.token);
          localStorage.setItem("user", JSON.stringify(response.data.user));
          localStorage.setItem("isLoggedIn", "true");
          if (onLoginSuccess) onLoginSuccess();
          return;
        }
        setError(response.data?.message || "Unable to create account.");
        return;
      }

      if (mode === "forgot") {
        const cleanEmail = email.trim().toLowerCase();
        if (!cleanEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
          setError("Enter the Gmail address registered with your PharmaVerse account.");
          return;
        }

        const response = await axios.post(`${API_URL}/forgot-password`, {
          email: cleanEmail,
        });

        if (response.data?.success) {
          setEmail(cleanEmail);
          setNotice(
            response.data.message ||
              "If an account exists for this email, an OTP will be sent shortly."
          );
          setMode("otp");
          return;
        }
        setError(response.data?.message || "Unable to send OTP. Please try again.");
        return;
      }

      if (mode === "otp") {
        const cleanEmail = email.trim().toLowerCase();
        if (!/^\d{6}$/.test(otp.trim())) {
          setError("Enter the 6-digit OTP sent to your email.");
          return;
        }

        const response = await axios.post(`${API_URL}/verify-reset-otp`, {
          email: cleanEmail,
          otp: otp.trim(),
        });

        if (response.data?.success && response.data?.resetToken) {
          setResetToken(response.data.resetToken);
          setOtp("");
          setMode("reset");
          setNotice("OTP verified. Create your new password.");
          return;
        }
        setError(response.data?.message || "OTP verification failed.");
        return;
      }

      if (mode === "reset") {
        if (password.length < 8) {
          setError("Password must be at least 8 characters long.");
          return;
        }
        if (password !== confirmPassword) {
          setError("Passwords do not match.");
          return;
        }
        if (!resetToken) {
          setError("Reset session is missing. Please request a new OTP.");
          return;
        }

        const response = await axios.post(`${API_URL}/reset-password`, {
          email: email.trim().toLowerCase(),
          resetToken,
          newPassword: password,
        });

        if (response.data?.success) {
          setPassword("");
          setConfirmPassword("");
          setResetToken("");
          setMode("success");
          setNotice(
            response.data.message ||
              "Password reset successfully. You can now sign in."
          );
          return;
        }
        setError(response.data?.message || "Unable to reset password.");
      }
    } catch (err) {
      console.error("Auth/Forgot Password error:", err);
      setError(
        err.response?.data?.message ||
          "Something went wrong. Please check your connection and try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const titleByMode = {
    login: "Welcome Back!",
    signup: "Create Account",
    forgot: "Forgot Password?",
    otp: "Verify OTP",
    reset: "Create New Password",
    success: "Password Updated",
  };

  const subtitleByMode = {
    login: "Login to access study materials",
    signup: "Sign up to start learning for free",
    forgot: "Enter your registered email to receive a 6-digit OTP",
    otp: `Enter the 6-digit OTP sent to ${email}`,
    reset: "Choose a strong password for your account",
    success: "Your PharmaVerse account is ready to use",
  };

  const inputClass =
    "w-full min-w-0 flex-1 outline-none bg-transparent text-sm sm:text-base";
  const fieldClass =
    "flex items-center gap-3 border border-gray-200 rounded-xl px-3 sm:px-4 py-2.5 sm:py-3 focus-within:border-purple-500 focus-within:ring-2 focus-within:ring-purple-100 transition";

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <button
        type="button"
        aria-label="Close authentication modal"
        onClick={onClose}
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
      />

      <div className="relative max-h-[90vh] w-full max-w-[90%] overflow-y-auto rounded-3xl bg-white p-6 shadow-2xl animate-in fade-in zoom-in duration-300 mx-2 sm:mx-4 sm:max-w-md sm:p-8">
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="absolute right-4 top-4 text-gray-400 transition hover:text-gray-600 sm:right-5 sm:top-5"
        >
          <X size={22} />
        </button>

        <div className="mb-6 text-center sm:mb-8">
          <div className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-3xl bg-gradient-to-r from-purple-500 to-indigo-600 shadow-lg sm:mb-4 sm:h-20 sm:w-20">
            {mode === "forgot" ? (
              <Mail size={32} className="text-white" />
            ) : mode === "otp" ? (
              <ShieldCheck size={32} className="text-white" />
            ) : mode === "reset" ? (
              <KeyRound size={32} className="text-white" />
            ) : mode === "success" ? (
              <CheckCircle2 size={32} className="text-white" />
            ) : (
              <LogIn size={32} className="text-white" />
            )}
          </div>
          <h2 className="text-2xl font-bold text-gray-900 sm:text-3xl">
            {titleByMode[mode]}
          </h2>
          <p className="mt-1 text-sm text-gray-500 sm:mt-2">
            {subtitleByMode[mode]}
          </p>
        </div>

        {error && (
          <div
            role="alert"
            className="mb-4 rounded-xl border border-red-200 bg-red-50 p-3 text-center text-xs text-red-600 sm:text-sm"
          >
            {error}
          </div>
        )}

        {notice && (
          <div
            role="status"
            className="mb-4 rounded-xl border border-green-200 bg-green-50 p-3 text-center text-xs text-green-700 sm:text-sm"
          >
            {notice}
          </div>
        )}

        {mode === "success" ? (
          <div className="space-y-4">
            <button
              type="button"
              onClick={() => {
                clearForm();
                setMode("login");
              }}
              className="w-full rounded-xl bg-gradient-to-r from-purple-500 to-indigo-600 py-3 text-sm font-semibold text-white shadow-lg transition hover:scale-[1.02] sm:text-base"
            >
              Back to Sign In
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
            {mode === "signup" && (
              <>
                <div className={fieldClass}>
                  <User size={20} className="shrink-0 text-gray-400" />
                  <input
                    type="text"
                    autoComplete="name"
                    placeholder="Full Name"
                    value={name}
                    onChange={(event) => setName(event.target.value)}
                    className={inputClass}
                    required
                  />
                </div>

                <div className={fieldClass}>
                  <Mail size={20} className="shrink-0 text-gray-400" />
                  <input
                    type="email"
                    autoComplete="email"
                    placeholder="Email (Optional)"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    className={inputClass}
                  />
                </div>

                <div className={fieldClass}>
                  <Phone size={20} className="shrink-0 text-gray-400" />
                  <input
                    type="tel"
                    inputMode="numeric"
                    autoComplete="tel-national"
                    placeholder="10-digit Mobile (Optional)"
                    value={mobile}
                    onChange={(event) =>
                      setMobile(event.target.value.replace(/\D/g, "").slice(0, 10))
                    }
                    className={inputClass}
                  />
                </div>
              </>
            )}

            {mode === "login" && (
              <div className={fieldClass}>
                <Mail size={20} className="shrink-0 text-gray-400" />
                <input
                  type="text"
                  autoComplete="username"
                  placeholder="Email or Mobile Number"
                  value={identifier}
                  onChange={(event) => setIdentifier(event.target.value)}
                  className={inputClass}
                  required
                />
              </div>
            )}

            {mode === "forgot" && (
              <div className={fieldClass}>
                <Mail size={20} className="shrink-0 text-gray-400" />
                <input
                  type="email"
                  autoComplete="email"
                  placeholder="Registered Gmail Address"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  className={inputClass}
                  required
                />
              </div>
            )}

            {mode === "otp" && (
              <div className={fieldClass}>
                <ShieldCheck size={20} className="shrink-0 text-gray-400" />
                <input
                  type="text"
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  placeholder="6-digit OTP"
                  value={otp}
                  onChange={(event) =>
                    setOtp(event.target.value.replace(/\D/g, "").slice(0, 6))
                  }
                  className={`${inputClass} text-center tracking-[0.35em]`}
                  maxLength={6}
                  required
                />
              </div>
            )}

            {(mode === "login" || mode === "signup" || mode === "reset") && (
              <>
                <div className={fieldClass}>
                  <Lock size={20} className="shrink-0 text-gray-400" />
                  <input
                    type={showPassword ? "text" : "password"}
                    autoComplete={
                      mode === "login"
                        ? "current-password"
                        : mode === "signup"
                        ? "new-password"
                        : "new-password"
                    }
                    placeholder={mode === "reset" ? "New Password (min. 8 characters)" : "Password"}
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    className={inputClass}
                    minLength={mode === "login" ? 1 : 8}
                    required
                  />
                  <button
                    type="button"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                    onClick={() => setShowPassword((shown) => !shown)}
                    className="shrink-0 p-1 text-gray-400 transition hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>

                {mode === "reset" && (
                  <div className={fieldClass}>
                    <Lock size={20} className="shrink-0 text-gray-400" />
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      autoComplete="new-password"
                      placeholder="Confirm New Password"
                      value={confirmPassword}
                      onChange={(event) => setConfirmPassword(event.target.value)}
                      className={inputClass}
                      minLength={8}
                      required
                    />
                    <button
                      type="button"
                      aria-label={
                        showConfirmPassword
                          ? "Hide confirm password"
                          : "Show confirm password"
                      }
                      onClick={() =>
                        setShowConfirmPassword((shown) => !shown)
                      }
                      className="shrink-0 p-1 text-gray-400 transition hover:text-gray-600"
                    >
                      {showConfirmPassword ? (
                        <EyeOff size={18} />
                      ) : (
                        <Eye size={18} />
                      )}
                    </button>
                  </div>
                )}
              </>
            )}

            {mode === "login" && (
              <div className="text-right">
                <button
                  type="button"
                  onClick={() => changeMode("forgot")}
                  className="text-xs text-purple-600 transition hover:text-purple-700 sm:text-sm"
                >
                  Forgot Password?
                </button>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-gradient-to-r from-purple-500 to-indigo-600 py-2.5 text-sm font-semibold text-white shadow-lg transition-all hover:scale-[1.02] disabled:cursor-not-allowed disabled:opacity-50 sm:py-3 sm:text-base"
            >
              {loading
                ? "Please wait..."
                : mode === "login"
                ? "Sign In"
                : mode === "signup"
                ? "Sign Up"
                : mode === "forgot"
                ? "Send OTP"
                : mode === "otp"
                ? "Verify OTP"
                : "Reset Password"}
            </button>

            {mode === "otp" && (
              <button
                type="button"
                disabled={loading}
                onClick={() => {
                  setOtp("");
                  setError("");
                  setNotice("");
                  setMode("forgot");
                }}
                className="w-full text-sm font-medium text-purple-600 hover:underline disabled:opacity-50"
              >
                Change email / Request another OTP
              </button>
            )}

            {mode === "reset" && (
              <button
                type="button"
                onClick={() => {
                  setResetToken("");
                  setOtp("");
                  changeMode("forgot");
                }}
                className="w-full text-sm font-medium text-purple-600 hover:underline"
              >
                Start over
              </button>
            )}

            {(mode === "login" || mode === "signup") && (
              <p className="text-center text-xs text-gray-600 sm:text-sm">
                {mode === "login"
                  ? "Don't have an account? "
                  : "Already have an account? "}
                <button
                  type="button"
                  onClick={() => {
                    clearForm();
                    setMode(mode === "login" ? "signup" : "login");
                  }}
                  className="font-semibold text-purple-600 hover:underline"
                >
                  {mode === "login" ? "Sign Up" : "Sign In"}
                </button>
              </p>
            )}

            {(mode === "forgot" || mode === "otp" || mode === "reset") && (
              <button
                type="button"
                onClick={() => {
                  setError("");
                  setNotice("");
                  setMode("login");
                  setPassword("");
                  setConfirmPassword("");
                  setOtp("");
                  setResetToken("");
                }}
                className="flex w-full items-center justify-center gap-2 text-sm text-gray-500 transition hover:text-gray-800"
              >
                <ArrowLeft size={16} />
                Back to Sign In
              </button>
            )}
          </form>
        )}

        <div className="mt-4 border-t border-gray-100 pt-4 text-center sm:mt-6 sm:pt-6">
          <p className="text-[10px] text-gray-400 sm:text-xs">
            Login required to access study materials
          </p>
        </div>
      </div>
    </div>
  );
};

export default AuthModal;