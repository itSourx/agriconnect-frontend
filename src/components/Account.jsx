import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from 'api/axiosConfig'; // Import your custom API client

const Account = () => {
    const navigate = useNavigate();
    const userString = localStorage.getItem('user');
    const user = userString ? JSON.parse(userString) : null;

    const handleLogout = async () => {
        try {
            const response = await api.post('/logout'); // Assuming your logout endpoint is /logout
            if (response.ok) {
                localStorage.removeItem('user');
                localStorage.removeItem('token');
                navigate('/login'); // Redirect to login after successful logout
            } else {
                console.error('Logout failed:', response.status, response.statusText);
                // Handle logout error, e.g., display an error message to the user
            }
        } catch (error) {
            console.error('Logout error:', error);
            // Handle logout error, e.g., display an error message to the user
        }
    };

    return (
<section className="account py-80">
            <div className="container container-lg">
                <div className="col-xl-6 mx-auto"> {/* Center the content */}
                    {user ? (
                        <div className="border border-gray-100 hover-border-main-600 transition-1 rounded-16 px-24 py-40"> {/* Apply register form styling */}
                            <h2 className="text-xl mb-32">Account Details</h2>

                            {/* User details in a more structured format */}
                            <div className="mb-24">
                                <p className="text-neutral-900 text-lg mb-8 fw-medium">
                                    <strong>First Name:</strong> {user.fields.FirstName}
                                </p>
                            </div>
                            <div className="mb-24">
                                <p className="text-neutral-900 text-lg mb-8 fw-medium">
                                    <strong>Last Name:</strong> {user.fields.LastName}
                                </p>
                            </div>
                            <div className="mb-24">
                                <p className="text-neutral-900 text-lg mb-8 fw-medium">
                                    <strong>Email:</strong> {user.fields.email}
                                </p>
                            </div>
                            <div className="mb-24">
                                <p className="text-neutral-900 text-lg mb-8 fw-medium">
                                    <strong>Status:</strong> {user.fields.Status}
                                </p>
                            </div>
                            <div className="mb-24">
                                <p className="text-neutral-900 text-lg mb-8 fw-medium">
                                    <strong>Profile Type:</strong> {user.fields.profileType.join(', ')}
                                </p>
                            </div>

                            <div className="mt-48 text-center"> {/* Centered Logout button */}
                                <button onClick={handleLogout} className="btn btn-main py-18 px-40">
                                    Logout
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="border border-gray-100 hover-border-main-600 transition-1 rounded-16 px-24 py-40 text-center">
                            <p>
                                You are not logged in. Please <Link to="/login">login</Link> to view your account.
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </section>
    );
};


export default Account;

