import React from 'react'
import { Link, useNavigate } from "react-router-dom";
import { useRef, useState } from 'react';
import { useAuth } from 'contexts/AuthContext'; // Assuming you have an AuthContext

const LogingForm = () => {
    const [showPassword, setShowPassword] = useState(false);
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const { login } = useAuth(); // Use the login function from your AuthContext
    const navigate = useNavigate();

    const passwordInputRef = useRef<HTMLInputElement>(null);
    const passwordToggleRef = useRef<HTMLSpanElement>(null);


    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword);
        if (passwordInputRef.current && passwordToggleRef.current) {
            passwordInputRef.current.type = showPassword ? "text" : "password";
            passwordToggleRef.current.classList.toggle("ph-eye");
            passwordToggleRef.current.classList.toggle("ph-eye-slash");
          }
    };

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        try {
          setError("");
          setLoading(true);
          await login(username, password);
          navigate("/"); // Redirect to home page after successful login
        } catch {
          setError("Failed to log in");
        }
      
        setLoading(false);
      };

    return (
        <div className="col-xl-6 pe-xl-5">
            {error && <div className="alert alert-danger">{error}</div>}
            <form onSubmit={handleSubmit} className="border border-gray-100 hover-border-main-600 transition-1 rounded-16 px-24 py-40 h-100">
                <h6 className="text-xl mb-32">Login</h6>
                <div className="mb-24">
                    <label
                        htmlFor="username"
                        className="text-neutral-900 text-lg mb-8 fw-medium"
                    >
                        Username or email address <span className="text-danger">*</span>{" "}
                    </label>
                    <input
                        type="text"
                        className="common-input"
                        id="username"
                        placeholder="Username or Email"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                    />
                </div>
                <div className="mb-24">
                    <label
                        htmlFor="password"
                        className="text-neutral-900 text-lg mb-8 fw-medium"
                    >
                        Password
                    </label>
                    <div className="position-relative">
                        <input
                            type="password"
                            className="common-input"
                            id="password"
                            placeholder="Enter Password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            ref={passwordInputRef}
                        />

                        <span
                            className="toggle-password position-absolute top-50 inset-inline-end-0 me-16 translate-middle-y cursor-pointer ph ph-eye-slash"
                            onClick={togglePasswordVisibility}
                            ref={passwordToggleRef}
                        />
                    </div>
                </div>
                <div className="mb-24 mt-48">
                    <div className="flex-align gap-48 flex-wrap">
                        <button disabled={loading} type="submit" className="btn btn-main py-18 px-40">
                            Log in
                        </button>

                    </div>
                </div>
                <div className="mt-48">
                    <Link
                        to="/forgot-password" // Link to a Forgot Password page/component
                        className="text-danger-600 text-sm fw-semibold hover-text-decoration-underline"
                    >
                        Forgot your password?
                    </Link>
                </div>

            </form>
        </div>

    )
}

export default LogingForm
