import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

import ScrollToTop from "react-scroll-to-top";
import HeaderTwo from "components/HeaderTwo";
import ColorInit from "helper/ColorInit";
import Preloader from "helper/Preloader";
import Breadcrumb from "components/Breadcrumb";
import FooterTwo from "components/FooterTwo";
import BottomFooter from "components/BottomFooter";
import api from "api/axiosConfig"; // Import your axiosConfig


const ForgotPasswordPage = () => {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false); // Add loading state
  const navigate = useNavigate();

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true); // Set loading to true

    try {
      const response: any = await api.post("/users/reset-password", { email }); // Adjust the endpoint as needed

      if (response.status === 201) { // Check for successful response
        setMessage(response.data.message);
        setTimeout(() => {
         // navigate("/reset-password");
        }, 3000);
      } else {
        setMessage("Error requesting password reset. Please try again."); // Handle non-200 responses
      }


    } catch (error: any) {
      if (error.response) { // Check for Axios error
          setMessage(error.response.data.message || "An error occurred."); // Use error message from backend if available
      } else {
          setMessage("An unknown error occurred.");
      }
      console.error("Error sending password reset email:", error);
    } finally {
      setIsLoading(false); // Set loading to false regardless of success/failure
    }
  };

  return (
    <>
      <ColorInit color={true} />
      <ScrollToTop smooth color="#FA6400" />
      <Preloader />
      <HeaderTwo category={true} />
      <Breadcrumb title={"Forgot Password"} />
      <div className="d-flex flex-column justify-content-center align-items-center p-40">
        <div className="card" style={{ width: "30rem" }}>
          <div className="card-body">
            <h3 className="card-title mb-4">Reset Password</h3>
            {message && <p className={message.startsWith("Password") ? "text-success" : "text-danger"}>{message}</p>}

            <form onSubmit={handleResetPassword}>
              <div className="mb-3">
                <label htmlFor="email" className="form-label">
                  Email address
                </label>
                <input
                  type="email"
                  className="form-control"
                  id="email"
                  aria-describedby="emailHelp"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <button type="submit" style={{ backgroundColor: "#fa6400" }}
                className="btn btn-primary w-100" disabled={isLoading}> {/* Disable button while loading */}
                {isLoading ? "Sending..." : "Reset Password"} {/* Display loading message */}
              </button>
            </form>
          </div>
        </div>
      </div>

     
      <BottomFooter />
    </>
  );
};

export default ForgotPasswordPage;
