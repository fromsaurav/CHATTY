import { useState, useEffect } from "react";
import { useAuthStore } from "../store/useAuthStore";
import { Eye, EyeOff, Loader2, Lock, Mail, MessageSquare, User, ArrowRight, Shield } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { auth } from "../lib/firebaseConfig";
import AuthImagePattern from "../components/AuthImagePattern";
import toast from "react-hot-toast";

const SignUpPage = () => {
  const location = useLocation();
  const isOtpVerification = location.pathname === "/verifyOtpAndSignUp";
  
  const [showPassword, setShowPassword] = useState(false);
  const [signupMethod, setSignupMethod] = useState(isOtpVerification ? "otp" : "password"); // "password" or "otp"
  const [step, setStep] = useState(1); // 1: initial form, 2: OTP verification
  const [otp, setOtp] = useState("");
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
  });

  const { 
    signupWithPassword, 
    sendOtp, 
    verifyOtpAndSignUp, 
    googleSignup,
    isSigningUp, 
    isSendingOtp,
    isVerifyingOtp 
  } = useAuthStore();

  // Check if this is OTP verification route
  useEffect(() => {
    if (isOtpVerification) {
      const email = new URLSearchParams(location.search).get('email') || localStorage.getItem('emailForSignIn');
      if (email) {
        setFormData(prev => ({...prev, email}));
        setStep(2);
        setSignupMethod("otp");
      }
    }
  }, [isOtpVerification, location]);

  const validateForm = () => {
    if (!formData.fullName.trim()) return toast.error("Full name is required");
    if (!formData.email.trim()) return toast.error("Email is required");
    if (!/\S+@\S+\.\S+/.test(formData.email)) return toast.error("Invalid email format");
    if (signupMethod === "password") {
      if (!formData.password) return toast.error("Password is required");
      if (formData.password.length < 6) return toast.error("Password must be at least 6 characters");
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    if (signupMethod === "password") {
      // Direct password signup
      await signupWithPassword(formData);
    } else if (signupMethod === "otp" && step === 1) {
      // Step 1: Send OTP
      localStorage.setItem('emailForSignIn', formData.email);
      const success = await sendOtp(formData.email);
      if (success) {
        setStep(2);
        toast.success("OTP sent to your email. Please check your inbox.");
      }
    } else if (signupMethod === "otp" && step === 2) {
      // Step 2: Complete signup with OTP
      if (!otp) {
        return toast.error("Please enter the 6-digit OTP");
      }
      
      if (otp.length !== 6) {
        return toast.error("OTP must be 6 digits");
      }
      
      await verifyOtpAndSignUp({
        email: formData.email,
        fullName: formData.fullName,
        password: formData.password,
        otp: otp
      });
    }
  };

  const handleGoogleSignUp = async () => {
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const credential = GoogleAuthProvider.credentialFromResult(result);
      
      if (credential) {
        await googleSignup(credential.idToken);
      }
    } catch (error) {
      console.error("Google sign up error:", error);
      toast.error("Google sign up failed. Please try again.");
    }
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      {/* left side */}
      <div className="flex flex-col justify-center items-center p-6 sm:p-12">
        <div className="w-full max-w-md space-y-8">
          {/* LOGO */}
          <div className="text-center mb-8">
            <div className="flex flex-col items-center gap-2 group">
              <div
                className="size-12 rounded-xl bg-primary/10 flex items-center justify-center 
                group-hover:bg-primary/20 transition-colors"
              >
                <MessageSquare className="size-6 text-primary" />
              </div>
              <h1 className="text-2xl font-bold mt-2">Create Account</h1>
              <p className="text-base-content/60">Get started with your free account</p>
            </div>
          </div>

          {/* Signup Method Selector */}
          {step === 1 && (
            <div className="flex justify-center gap-4 mb-6">
              <button
                type="button"
                className={`btn ${signupMethod === "password" ? "btn-primary" : "btn-outline"}`}
                onClick={() => setSignupMethod("password")}
              >
                <Lock className="size-4" />
                Password
              </button>
              <button
                type="button"
                className={`btn ${signupMethod === "otp" ? "btn-primary" : "btn-outline"}`}
                onClick={() => setSignupMethod("otp")}
              >
                <Shield className="size-4" />
                Email Verification
              </button>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {step === 1 ? (
              <>
                <div className="form-control">
                  <label className="label">
                    <span className="label-text font-medium">Full Name</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <User className="size-5 text-base-content/40" />
                    </div>
                    <input
                      type="text"
                      className="input input-bordered w-full pl-10"
                      placeholder="John Doe"
                      value={formData.fullName}
                      onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    />
                  </div>
                </div>

                <div className="form-control">
                  <label className="label">
                    <span className="label-text font-medium">Email</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Mail className="size-5 text-base-content/40" />
                    </div>
                    <input
                      type="email"
                      className="input input-bordered w-full pl-10"
                      placeholder="you@example.com"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    />
                  </div>
                </div>

                <div className="form-control">
                  <label className="label">
                    <span className="label-text font-medium">Password</span>
                    {signupMethod === "otp" && <span className="label-text-alt">Optional with email verification</span>}
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Lock className="size-5 text-base-content/40" />
                    </div>
                    <input
                      type={showPassword ? "text" : "password"}
                      className="input input-bordered w-full pl-10"
                      placeholder="••••••••"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      required={signupMethod === "password"}
                    />
                    <button
                      type="button"
                      className="absolute inset-y-0 right-0 pr-3 flex items-center"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <EyeOff className="size-5 text-base-content/40" />
                      ) : (
                        <Eye className="size-5 text-base-content/40" />
                      )}
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <div className="form-control">
                <label className="label">
                  <span className="label-text font-medium">Enter OTP</span>
                  <span className="label-text-alt">Check your email for 6-digit code</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Shield className="h-5 w-5 text-base-content/40" />
                  </div>
                  <input
                    type="text"
                    className="input input-bordered w-full pl-10 text-center text-2xl font-mono tracking-widest"
                    placeholder="000000"
                    value={otp}
                    onChange={(e) => {
                      const value = e.target.value.replace(/\D/g, '').slice(0, 6);
                      setOtp(value);
                    }}
                    maxLength={6}
                  />
                </div>
                <div className="text-center mt-2">
                  <p className="text-sm text-base-content/60">
                    Didn't receive the code?{" "}
                    <button 
                      type="button" 
                      onClick={async () => {
                        const success = await sendOtp(formData.email);
                        if (success) toast.success("OTP sent again!");
                      }}
                      className="link link-primary"
                      disabled={isSendingOtp}
                    >
                      Resend OTP
                    </button>
                  </p>
                </div>
              </div>
            )}

            <button 
              type="submit" 
              className="btn btn-primary w-full" 
              disabled={isSigningUp || isSendingOtp || isVerifyingOtp}
            >
              {isSigningUp || isSendingOtp || isVerifyingOtp ? (
                <>
                  <Loader2 className="size-5 animate-spin" />
                  {isSendingOtp ? "Sending..." : isVerifyingOtp ? "Verifying..." : "Loading..."}
                </>
              ) : step === 1 && signupMethod === "otp" ? (
                <>
                  Send OTP <ArrowRight className="size-4" />
                </>
              ) : step === 2 ? (
                "Complete Signup"
              ) : (
                "Create Account"
              )}
            </button>
          </form>

          <div className="divider">OR</div>

          <button 
            type="button" 
            onClick={handleGoogleSignUp}
            className="btn btn-outline w-full"
          >
            <svg className="size-5" viewBox="0 0 24 24">
              <path
                fill="currentColor"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="currentColor"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="currentColor"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
              />
              <path
                fill="currentColor"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            Continue with Google
          </button>

          <div className="text-center">
            <p className="text-base-content/60">
              Already have an account?{" "}
              <Link to="/login" className="link link-primary">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>

      {/* right side */}
      <AuthImagePattern
        title="Join our community"
        subtitle="Connect with friends, share moments, and stay in touch with your loved ones."
      />
    </div>
  );
};
export default SignUpPage;