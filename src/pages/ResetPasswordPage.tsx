import React, { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import api from "api/axiosConfig";

// Components
import ScrollToTop from "react-scroll-to-top";
import HeaderTwo from "components/HeaderTwo";
import ColorInit from "helper/ColorInit";
import Preloader from "helper/Preloader";
import Breadcrumb from "components/Breadcrumb";
import FooterTwo from "components/FooterTwo";
import BottomFooter from "components/BottomFooter";


const ResetPasswordPage = () => {
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [temporaryPassword, setTemporaryPassword] = useState(""); // Renamed for consistency


  // Refs for password inputs and toggle icons
  const newPasswordInputRef = useRef<HTMLInputElement>(null);
  const confirmPasswordInputRef = useRef<HTMLInputElement>(null);
  const temporaryPasswordInputRef = useRef<HTMLInputElement>(null);

  const newPasswordToggleRef = useRef<HTMLSpanElement>(null);
  const confirmPasswordToggleRef = useRef<HTMLSpanElement>(null);
  const temporaryPasswordToggleRef = useRef<HTMLSpanElement>(null);


  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showTemporaryPassword, setShowTemporaryPassword] = useState(false);

  
  const togglePasswordVisibility = (
    inputRef: React.RefObject<HTMLInputElement | null>,
    iconRef: React.RefObject<HTMLSpanElement | null>,
    showState: boolean,
    setShowState: React.Dispatch<React.SetStateAction<boolean>>
  ) => {
    setShowState(!showState);
    if (inputRef.current && iconRef.current) {
      inputRef.current.type = showState ? "text" : "password";
      iconRef.current.classList.toggle("ph-eye");
      iconRef.current.classList.toggle("ph-eye-slash");
    }
  };



  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (newPassword !== confirmPassword) {
      setMessage("Passwords do not match.");
      return;
    }

    setIsLoading(true);

    try {
      const response = await api.post("/users/validate-reset-password", {
        email: email,
        temporaryPassword: temporaryPassword, // Use temporaryPassword here
        newPassword: newPassword
      });

      if (response.status === 200) {
        setMessage("Password reset successful!");
        setTimeout(() => {
          navigate("/login");
        }, 3000);
      } else {
        setMessage((response.data as { message: string }).message || "Error resetting password. Please try again.");
      }
    } catch (error: any) {
      if (error.response) {
        setMessage((error.response.data as { message: string }).message || "Error resetting password.");
      } else {
        setMessage("An unknown error occurred.");
      }
      console.error("Password reset error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <ColorInit color={true} />
      <ScrollToTop smooth color="#FA6400" />
      <Preloader />
      <HeaderTwo category={true} />
      <Breadcrumb title={"Reset Password"} />

      <div className="d-flex flex-column justify-content-center align-items-center p-40">
        <div className="card" style={{ width: "30rem" }}>
          <div className="card-body">
            <h3 className="card-title mb-10">Reset Password</h3>

            {message && (
              <p className={message.startsWith("Password reset successful") ? "text-success" : "text-danger"}>
                {message}
              </p>
            )}

            <form onSubmit={handleResetPassword}>
              <div className="mb-3">
                <label htmlFor="email" className="form-label">Email address</label>
                <input
                  type="email"
                  className="form-control"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="mb-3 position-relative"> {/* Added position-relative for icon positioning */}
                <label htmlFor="temporaryPassword" className="form-label">Temporary Password</label>
                <div className="position-relative">
                <input
                  type="password"
                  className="form-control"
                  id="temporaryPassword"
                  value={temporaryPassword}
                  onChange={(e) => setTemporaryPassword(e.target.value)}
                  required
                  ref={temporaryPasswordInputRef} // Ref added
                />
                <span
                  className="toggle-password position-absolute top-50 inset-inline-end-0 me-16 translate-middle-y cursor-pointer ph ph-eye-slash" // Icon styling and positioning
                  onClick={() => togglePasswordVisibility(temporaryPasswordInputRef, temporaryPasswordToggleRef, showTemporaryPassword, setShowTemporaryPassword)}
                  ref={temporaryPasswordToggleRef} // Ref added
                ></span>
                </div>
              </div>
              <div className="mb-3 position-relative"> {/* Added position-relative for icon positioning */}
                <label htmlFor="newPassword" className="form-label">New Password</label>
               <div className="position-relative">
               <input
                  type="password"
                  className="form-control"
                  id="newPassword"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  ref={newPasswordInputRef} // Ref added
                />
                <span
                  className="toggle-password position-absolute top-50 inset-inline-end-0 me-16 translate-middle-y cursor-pointer ph ph-eye-slash" // Icon styling and positioning
                  onClick={() => togglePasswordVisibility(newPasswordInputRef, newPasswordToggleRef, showNewPassword, setShowNewPassword)}
                  ref={newPasswordToggleRef} // Ref added
                ></span>
               </div>
              </div>
              <div className="mb-3 position-relative"> {/* Added position-relative for icon positioning */}
                <label htmlFor="confirmPassword" className="form-label">Confirm Password</label>
               <div className="position-relative">
               <input
                  type="password"
                  className="form-control"
                  id="confirmPassword"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  ref={confirmPasswordInputRef} // Ref added
                />
                 <span
                  className="toggle-password position-absolute top-50 inset-inline-end-0 me-16 translate-middle-y cursor-pointer ph ph-eye-slash" // Icon styling and positioning
                  onClick={() => togglePasswordVisibility(confirmPasswordInputRef, confirmPasswordToggleRef, showConfirmPassword, setShowConfirmPassword)}
                  ref={confirmPasswordToggleRef} // Ref added
                ></span>
               </div>
              </div>
              <button type="submit" style={{ backgroundColor: "#fa6400" }} className="btn w-100" disabled={isLoading}>
                {isLoading ? "Resetting..." : "Reset Password"}
              </button>
            </form>
          </div>
        </div>
      </div>

      <BottomFooter />
    </>
  );
};

export default ResetPasswordPage;
