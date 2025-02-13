import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from 'contexts/AuthContext';  // Import your AuthContext
import api from 'api/axiosConfig'; // Import your axios instance

const RegisterForm = () => {
    
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [FirstName, setFirstName] = useState("");
    const [LastName, setLastName] = useState("");
    const [profileType, setProfileType] = useState("ACHETEUR"); // Default value
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();


    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        try {
            setError("");
            setLoading(true);

            const response: any = await api.post('/users/register', { // Use your correct registration endpoint
               
                email,
                password,
                FirstName,
                LastName,
                profileType,
            });

            
            if (response.status === 201) {
                // Success: registration complete, redirect to login
                navigate("/login");
            } else {
                // Handle other success codes or messages as needed
                setError(response.data.message || "Registration failed.");
            }
            
            navigate("/login"); // Redirect to login after successful registration
        } catch (error: any) {
            setLoading(false);
            // Set error message from the API response if available
            if (error.response && error.response.data && error.response.data.message) {
                setError(error.response.data.message);
            } else {
                setError("Registration failed. Please try again later.");
            }
        }
    };

    return (
        <div className="col-xl-6">
            {error && <div className="alert alert-danger">{error}</div>}
            <form onSubmit={handleSubmit} className="border border-gray-100 hover-border-main-600 transition-1 rounded-16 px-24 py-40">
                <h6 className="text-xl mb-32">Register</h6>

               


                <div className="mb-24">
                    <label htmlFor="firstName" className="text-neutral-900 text-lg mb-8 fw-medium">
                        First Name <span className="text-danger">*</span>
                    </label>
                    <input
                        type="text"
                        className="common-input"
                        id="firstName"
                        placeholder="Enter your first name"
                        value={FirstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        required
                    />
                </div>
                <div className="mb-24">
                    <label htmlFor="lastName" className="text-neutral-900 text-lg mb-8 fw-medium">
                        Last Name <span className="text-danger">*</span>
                    </label>
                    <input
                        type="text"
                        className="common-input"
                        id="lastName"
                        placeholder="Enter your last name"
                        value={LastName}
                        onChange={(e) => setLastName(e.target.value)}
                        required
                    />
                </div>

                {/* ... other input fields ... */}
                <div className="mb-24">
                    <label htmlFor="email" className="text-neutral-900 text-lg mb-8 fw-medium">
                        Email address <span className="text-danger">*</span>
                    </label>
                    <input
                        type="email"
                        className="common-input"
                        id="email"
                        placeholder="Enter Email Address"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />
                </div>

                <div className="mb-24">
                    <label htmlFor="password" className="text-neutral-900 text-lg mb-8 fw-medium">
                        Password <span className="text-danger">*</span>
                    </label>
                    <input
                        type="password"
                        className="common-input"
                        id="password"
                        placeholder="Enter Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                </div>



                {/* Profile Type selection (if needed) */}
                <div className="mb-24">
                    <label htmlFor="profileType" className="text-neutral-900 text-lg mb-8 fw-medium">
                        Profile Type
                    </label>
                    <select
                        className="common-input"
                        id="profileType"
                        value={profileType}
                        onChange={(e) => setProfileType(e.target.value)}
                    >
                        <option value="ACHETEUR">ACHETEUR</option>
                        <option value="VENDEUR">VENDEUR</option>
                        {/* ... other options ... */}
                    </select>
                </div>



                <div className="my-48">
                    <p className="text-gray-500">
                        Your personal data will be used to process your order, support your experience throughout this website, and for other purposes described in our
                        <Link to="#" className="text-main-600 text-decoration-underline"> privacy policy</Link>.
                    </p>
                </div>
                <div className="mt-48">
                    <button disabled={loading} type="submit" className="btn btn-main py-18 px-40">
                        Register
                    </button>
                </div>

            </form>
        </div>
    );
};

export default RegisterForm;
