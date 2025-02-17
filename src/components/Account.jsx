import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from 'api/axiosConfig'; // Import your custom API client

const Account = () => {
    const navigate = useNavigate();
    const userString = localStorage.getItem('user');
    const user = userString ? JSON.parse(userString) : null;
    console.log("user", user);

    const handleLogout = async () => {
        try {
            const response = await api.post('auth/logout'); // Assuming your logout endpoint is /logout
            if (response.status == 201) {
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
                        <div className="border border-gray-100 hover-border-main-600 transition-1 rounded-16 px-24 py-40">
                            <h2 className="text-xl mb-32">Account Details</h2>

                             {/* User photo */}
                             <div className="mb-24 text-center"> {/* Center the image */}
                                {user.fields?.Photo || user.Photo ? (
                                    <img
                                        src={user.fields?.Photo || user.Photo}
                                        alt="User Profile"
                                        className="rounded-circle border w-48 h-48 object-cover" // Adjust size and styling as needed
                                        style={{ width: '100px', height: '100px' }} // Inline styles for quick adjustments
                                    />
                                ) : (
                                    <div className="bg-gray-200 rounded-circle w-48 h-48 flex items-center justify-center">{/* Placeholder */}
                                        <span className="text-gray-500">No Photo</span>
                                    </div>
                                )}
                            </div>
                            



                            <div className="mb-24">
                                <p className="text-neutral-900 text-lg mb-8 fw-medium">
                                    <strong>First Name:</strong> {user.fields?.FirstName || user.FirstName}
                                </p>
                            </div>
                            <div className="mb-24">
                                <p className="text-neutral-900 text-lg mb-8 fw-medium">
                                    <strong>Last Name:</strong> {user.fields?.LastName || user.LastName}
                                </p>
                            </div>
                            <div className="mb-24">
                                <p className="text-neutral-900 text-lg mb-8 fw-medium">
                                    <strong>Email:</strong> {user.fields?.email || user.email}
                                </p>
                            </div>

                            <div className="mb-24">
                                <p className="text-neutral-900 text-lg mb-8 fw-medium">
                                    <strong>Phone:</strong> {user.fields?.Phone || user.Phone}
                                </p>
                            </div>
                            <div className="mb-24">
                                {user.fields?.status || user.status ? ( // Conditionally render the status
                                    <p className="text-neutral-900 text-lg mb-8 fw-medium">
                                        <strong>Status:</strong> {user.fields?.status || user.status}
                                    </p>
                                ) : null} {/* Or use a fragment <></> instead of null */}
                            </div>

                            <div className="mb-24">
                                <p className="text-neutral-900 text-lg mb-8 fw-medium">
                                    <strong>Profile Type:</strong> {(user.fields?.profileType || user.profileType)}
                                </p>
                            </div>

                            <div className="mt-48 text-center">
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
