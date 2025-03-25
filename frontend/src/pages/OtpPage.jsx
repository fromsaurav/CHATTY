// import { useState, useEffect, useRef } from "react";
// import { useAuthStore } from "../store/useAuthStore";
// import { useNavigate, useLocation } from "react-router-dom";
// import { Loader } from "lucide-react";
// import { Link } from "react-router-dom";

// const OtpPage = () => {
//   const [otp, setOtp] = useState(["", "", "", "", "", ""]);
//   const [userData, setUserData] = useState(null);
//   const [countdown, setCountdown] = useState(60);
//   const [email, setEmail] = useState("");
//   const { isSendingOtp, isVerifyingOtp, sendOtp, verifyOtpAndSignup } = useAuthStore();
//   const navigate = useNavigate();
//   const location = useLocation();
//   const inputRefs = useRef([]);

//   // Get passed user data from sign up page
//   useEffect(() => {
//     if (location.state?.userData) {
//       setUserData(location.state.userData);
//       setEmail(location.state.userData.email);
//     }
//   }, [location]);

//   // Start countdown timer
//   useEffect(() => {
//     if (countdown > 0) {
//       const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
//       return () => clearTimeout(timer);
//     }
//   }, [countdown]);
                      
//   // Handle OTP input
//   const handleChange = (e, index) => {
//     const value = e.target.value;
    
//     // Only allow numbers
//     if (value && !/^[0-9]$/.test(value)) return;
    
//     const newOtp = [...otp];
//     newOtp[index] = value;
//     setOtp(newOtp);

//     // Auto-focus to next input
//     if (value && index < 5) {
//       inputRefs.current[index + 1].focus();
//     }
//   };

//   // Handle backspace to move to previous input
//   const handleKeyDown = (e, index) => {
//     if (e.key === "Backspace" && !otp[index] && index > 0) {
//       inputRefs.current[index - 1].focus();
//     }
//   };

//   // Handle paste event for OTP
//   const handlePaste = (e) => {
//     e.preventDefault();
//     const pastedData = e.clipboardData.getData("text");
    
//     if (/^[0-9]{6}$/.test(pastedData)) {
//       const newOtp = pastedData.split("");
//       setOtp(newOtp);
//       inputRefs.current[5].focus();
//     }
//   };

//   // Resend OTP
//   const handleResendOtp = async () => {
//     if (email) {
//       await sendOtp(email);
//       setCountdown(60);
//     }
//   };

//   // Verify OTP
//   const handleVerifyOtp = async () => {
//     if (otp.some(digit => digit === "")) {
//       return alert("Please enter a complete OTP");
//     }

//     if (!userData) {
//       return alert("User data is missing. Please try signing up again.");
//     }

//     const otpString = otp.join("");
    
//     await verifyOtpAndSignup({
//       ...userData,
//       otp: otpString
//     });
//   };

//   return (
//     <div className="max-w-md mx-auto mt-10 p-6 bg-base-200 rounded-lg shadow-lg">
//       <h1 className="text-2xl font-bold text-center mb-6">Verify Your Email</h1>
      
//       {email ? (
//         <p className="text-center mb-6">
//           We've sent a verification code to <span className="font-medium">{email}</span>
//         </p>
//       ) : (
//         <p className="text-center mb-6 text-error">
//           Email information is missing. Please go back to sign up.
//         </p>
//       )}

//       {/* OTP Input Fields */}
//       <div className="flex justify-center gap-2 mb-6">
//         {otp.map((digit, index) => (
//           <input
//             key={index}
//             ref={el => inputRefs.current[index] = el}
//             type="text"
//             maxLength={1}
//             className="w-12 h-12 text-center text-xl font-bold border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
//             value={digit}
//             onChange={(e) => handleChange(e, index)}
//             onKeyDown={(e) => handleKeyDown(e, index)}
//             onPaste={index === 0 ? handlePaste : null}
//           />
//         ))}
//       </div>

//       {/* Verify Button */}
//       <button 
//         className="btn btn-primary w-full mb-4"
//         onClick={handleVerifyOtp}
//         disabled={isVerifyingOtp || otp.some(digit => digit === "")}
//       >
//         {isVerifyingOtp ? (
//           <>
//             <Loader className="animate-spin mr-2" size={20} />
//             Verifying...
//           </>
//         ) : (
//           "Verify & Complete Signup"
//         )}
//       </button>

//       {/* Resend OTP Section */}
//       <div className="text-center mt-4">
//         <p>Didn't receive the code?</p>
//         {countdown > 0 ? (
//           <p className="text-sm text-gray-500">
//             Resend code in {countdown} seconds
//           </p>
//         ) : (
//           <button
//             className="btn btn-link btn-sm p-0"
//             onClick={handleResendOtp}
//             disabled={isSendingOtp || countdown > 0}
//           >
//             {isSendingOtp ? (
//               <>
//                 <Loader className="animate-spin mr-2" size={16} />
//                 Sending...
//               </>
//             ) : (
//               "Resend OTP"
//             )}
//           </button>
//         )}
//       </div>

//       {/* Back to Login */}
//       <div className="text-center mt-6">
//         <Link to="/login" className="text-primary">Back to Login</Link>
//       </div>
//     </div>
//   );
// };

// export default OtpPage;