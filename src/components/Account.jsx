import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from 'api/axiosConfig';
import { FaEdit, FaSave, FaTimes, FaCamera, FaLock } from 'react-icons/fa';

const Account = () => {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [editMode, setEditMode] = useState(true);
    const [editedUser, setEditedUser] = useState({});
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const [imagePreview, setImagePreview] = useState(null);
    const [passwordChange, setPasswordChange] = useState(false);
    const [passwordData, setPasswordData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmNewPassword: '',
    });
    const [passwordError, setPasswordError] = useState('');
    const [passwordSuccess, setPasswordSuccess] = useState('');
    const [uploadingImage, setUploadingImage] = useState(false);


    useEffect(() => {
        const fetchUser = async () => {
            try {
                const userString = localStorage.getItem('user');
                if (!userString) {
                    navigate('/login');
                    return;
                }
                const storedUser = JSON.parse(userString);
                setUser(storedUser);
                setEditedUser(storedUser);
                setLoading(false);
                if (storedUser.fields?.Photo || storedUser.Photo) {
                   setImagePreview(storedUser.fields?.Photo || storedUser.Photo)
                }

            } catch (error) {
                console.error('Error fetching user data:', error);
                setError('Failed to load user data.');
                setLoading(false);
            }
        };

        fetchUser();
    }, [navigate]);



    const handleLogout = async () => {
        try {
            const response = await api.post('auth/logout');
            if (response.status === 201) {
                localStorage.removeItem('user');
                localStorage.removeItem('token');
                navigate('/login');
            } else {
                setError('Logout failed. Please try again.');
            }
        } catch (error) {
            setError('Logout error. Please try again.');
        }
    };


    const handleEditToggle = () => {
        setEditMode(!editMode);
        if (editMode) {
            setEditedUser(user);
            setImagePreview(user.fields?.Photo || user.Photo);
        }
        setError('');
        setSuccessMessage('');
    };

    const handleInputChange = (e) => {
        setEditedUser({ ...editedUser, [e.target.name]: e.target.value });
    };

    const handleImageChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        if (file.size > 5 * 1024 * 1024) {
            setError('Image size must be less than 5MB.');
            return;
        }
        if (!['image/jpeg', 'image/png', 'image/gif'].includes(file.type)) {
            setError('Invalid image type.  Please use JPG, PNG, or GIF.');
            return;
        }

        const reader = new FileReader();
        reader.onloadend = () => {
            setImagePreview(reader.result);
        };
        reader.readAsDataURL(file);
        setEditedUser({ ...editedUser, Photo: file });
        setError("");
    };


    const handleUpdateProfile = async () => {
        setError('');
        setSuccessMessage('');
        setUploadingImage(true);

        try {
            let updatedUserData = {};
            const formData = new FormData();

            if (editedUser.Photo instanceof File) {
               formData.append('Photo', editedUser.Photo);
            }

            for (const key in editedUser) {
                if (editedUser.hasOwnProperty(key) && key !== 'Photo') {
                    if (user.fields && editedUser[key] !== user.fields[key]) {
                         if(!updatedUserData.fields) updatedUserData.fields={}
                         updatedUserData.fields[key] = editedUser[key];
                    }
                    else if (editedUser[key] !== user[key]) {
                        updatedUserData[key] = editedUser[key];
                    }
                }
            }


           if (Object.keys(formData).length > 0 || Object.keys(updatedUserData).length>0 ) {
                const response = await api.put(`/users/${user.id}`, Object.keys(formData).length > 0 ? formData : updatedUserData, {
                    headers :  Object.keys(formData).length > 0 ? { 'Content-Type': 'multipart/form-data' } : {}
                });

                if (response.status === 200) {
                    setSuccessMessage('Profile updated successfully!');
                    setUser(response.data);
                    localStorage.setItem('user', JSON.stringify(response.data));
                    setEditMode(false);

                } else {
                    setError('Failed to update profile. Please try again.');
                }
            } else {
                setEditMode(false);
                setSuccessMessage('No changes made.');
            }

        } catch (error) {
            console.error("Update error:", error);
            setError(error.response?.data?.message || 'Failed to update profile.');
        } finally {
             setUploadingImage(false);
        }
    };

    const handlePasswordChangeSubmit = async (e) => {
        e.preventDefault();
        setPasswordError('');
        setPasswordSuccess('');

        if (passwordData.newPassword !== passwordData.confirmNewPassword) {
            setPasswordError('New passwords do not match.');
            return;
        }
        if (passwordData.newPassword.length < 8) {
            setPasswordError("Password must be at least 8 characters");
            return;
        }

        try {
            const response = await api.put(`/users/change-password/${user.id}`, passwordData);

            if (response.status === 200) {
                setPasswordSuccess('Password changed successfully!');
                setPasswordChange(false);
                setPasswordData({ currentPassword: '', newPassword: '', confirmNewPassword: '' });
            } else {
                setPasswordError(response.data.message || 'Failed to change password. Please try again.');
            }
        } catch (error) {
            console.error("Password change error:", error);
            setPasswordError(error.response?.data?.message || 'Failed to change password. Please try again.');
        }
    };


    const formatDate = (dateString) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        return date.toLocaleDateString();
    };



    if (loading) {
        return <div className="text-center py-80">Loading...</div>;
    }

    if (!user) {
        return (
            <div className="text-center py-80">
                <p>You are not logged in. Please <Link to="/login">login</Link> to view your account.</p>
            </div>
        );
    }

    return (
        <section className="account py-80">
            <div className="container container-lg">
                <div className="col-xl-8 mx-auto">
                    <div className="border border-gray-100 rounded-16 px-24 py-40">
                        <div className="d-flex justify-content-between align-items-center mb-32">
                            <h2 className="text-xl mb-0">Account Details</h2>
                            {!editMode && (
                                <button onClick={handleEditToggle} className="btn btn-outline-secondary">
                                    <FaEdit className="me-2" /> Edit Profile
                                </button>
                            )}
                        </div>

                        {error && <div className="alert alert-danger mb-24">{error}</div>}
                        {successMessage && <div className="alert alert-success mb-24">{successMessage}</div>}

                        {/* User photo */}
                        <div className="mb-32 text-center">
                            <div className="position-relative d-inline-block">
                                <img
                                    src={imagePreview || '/default-profile.png'}
                                    alt="User Profile"
                                    className="rounded-circle border object-cover"
                                    style={{ width: '200px', height: '200px' }}
                                />

                                {editMode && (
                                    <div className="position-absolute bottom-0 end-0">
                                        <label htmlFor="profile-pic" className="btn btn-secondary btn-sm rounded-circle p-2" style={{ cursor: "pointer" }}>
                                            <FaCamera />
                                        </label>
                                        <input
                                            type="file"
                                            id="profile-pic"
                                            accept="image/*"
                                            onChange={handleImageChange}
                                            style={{ display: 'none' }}
                                        />
                                    </div>
                                )}
                            </div>
                            {uploadingImage && <p className="mt-2">Uploading...</p>}
                        </div>

                        {/* Personal Information */}
                        <div className="mb-40">
                            <h3 className="text-lg font-semibold mb-16">Personal Information</h3>
                            <div className="row">
                                <div className="col-md-6 mb-24">
                                    <label className="text-neutral-900 text-lg mb-8 fw-medium d-block">
                                        <strong>First Name:</strong>
                                    </label>
                                    {editMode ? (
                                        <input
                                            type="text"
                                            name="FirstName"
                                            value={editedUser.fields?.FirstName || editedUser.FirstName || ''}
                                            onChange={handleInputChange}
                                            className="form-control mb-8"
                                        />
                                    ) : (
                                        <p className="text-lg">{user.fields?.FirstName || user.FirstName}</p>
                                    )}
                                </div>
                                <div className="col-md-6 mb-24">
                                    <label className="text-neutral-900 text-lg mb-8 fw-medium d-block">
                                        <strong>Last Name:</strong>
                                    </label>
                                    {editMode ? (
                                        <input
                                            type="text"
                                            name="LastName"
                                            value={editedUser.fields?.LastName || editedUser.LastName || ''}
                                            onChange={handleInputChange}
                                            className="form-control mb-8"
                                        />
                                    ) : (
                                        <p className="text-lg">{user.fields?.LastName || user.LastName}</p>
                                    )}
                                </div>
                                <div className="col-md-6 mb-24">
                                     <label className="text-neutral-900 text-lg mb-8 fw-medium d-block">
                                        <strong>BirthDate:</strong>
                                    </label>
                                    {editMode ? (
                                        <input
                                            type="date"
                                            name="BirthDate"
                                            value={editedUser.fields?.BirthDate || editedUser.BirthDate || ''}
                                            onChange={handleInputChange}
                                            className="form-control mb-8"
                                        />
                                    ) : (
                                        <p className="text-lg">{formatDate(user.fields?.BirthDate || user.BirthDate)}</p>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Contact Information */}
                        <div className="mb-40">
                            <h3 className="text-lg font-semibold mb-16">Contact Information</h3>
                            <div className="row">
                                <div className="col-md-6 mb-24">
                                    <label className="text-neutral-900 text-lg mb-8 fw-medium d-block">
                                        <strong>Email:</strong>
                                    </label>
                                    <p className="text-lg">{user.fields?.email || user.email}</p>
                                </div>
                                <div className="col-md-6 mb-24">
                                    <label className="text-neutral-900 text-lg mb-8 fw-medium d-block">
                                        <strong>Phone:</strong>
                                    </label>
                                    {editMode ? (
                                        <input
                                            type="text"
                                            name="Phone"
                                            value={editedUser.fields?.Phone || editedUser.Phone || ''}
                                            onChange={handleInputChange}
                                            className="form-control mb-8"
                                        />
                                    ) : (
                                        <p className="text-lg">{user.fields?.Phone || user.Phone}</p>
                                    )}
                                </div>
                                <div className="col-md-12 mb-24">
                                    <label className="text-neutral-900 text-lg mb-8 fw-medium d-block">
                                        <strong>Address:</strong>
                                    </label>
                                    {editMode ? (
                                        <input
                                            type="text"
                                            name="Address"
                                            value={editedUser.fields?.Address || editedUser.Address || ''}
                                            onChange={handleInputChange}
                                            className="form-control mb-8"
                                        />
                                    ) : (
                                        <p className="text-lg">{user.fields?.Address || user.Address}</p>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Business Information (Conditional) */}
                        {(user.fields?.profileType === 'business' || user.profileType === 'business') && (  // Only show if profileType is 'business'
                            <div className="mb-40">
                                <h3 className="text-lg font-semibold mb-16">Business Information</h3>
                                <div className="row">
                                    <div className="col-md-6 mb-24">
                                        <label className="text-neutral-900 text-lg mb-8 fw-medium d-block">
                                            <strong>RCCM:</strong>
                                        </label>
                                        {editMode ? (
                                            <input
                                                type="text"
                                                name="RCCM"
                                                value={editedUser.fields?.RCCM || editedUser.RCCM || ''}
                                                onChange={handleInputChange}
                                                className="form-control mb-8"
                                            />
                                        ) : (
                                            <p className="text-lg">{user.fields?.RCCM || user.RCCM}</p>
                                        )}
                                    </div>
                                    <div className="col-md-6 mb-24">
                                        <label className="text-neutral-900 text-lg mb-8 fw-medium d-block">
                                            <strong>Raison Sociale:</strong>
                                        </label>
                                        {editMode ? (
                                            <input
                                                type="text"
                                                name="raisonSociale"
                                                value={editedUser.fields?.raisonSociale || editedUser.raisonSociale || ''}
                                                onChange={handleInputChange}
                                                className="form-control mb-8"
                                            />
                                        ) : (
                                            <p className="text-lg">{user.fields?.raisonSociale || user.raisonSociale}</p>
                                        )}
                                    </div>
                                    <div className="col-md-6 mb-24">
                                        <label className="text-neutral-900 text-lg mb-8 fw-medium d-block">
                                            <strong>IFU:</strong>
                                        </label>
                                        {editMode ? (
                                            <input
                                                type="text"
                                                name="ifu"
                                                value={editedUser.fields?.ifu || editedUser.ifu || ''}
                                                onChange={handleInputChange}
                                                className="form-control mb-8"
                                            />
                                        ) : (
                                            <p className="text-lg">{user.fields?.ifu || user.ifu}</p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}

                         {/* Status and Profile Type - Usually not editable */}
                        {(user.fields?.status || user.status) && (
                            <div className="mb-24">
                                <p className="text-neutral-900 text-lg mb-8 fw-medium">
                                    <strong>Status:</strong> {user.fields?.status || user.status}
                                </p>
                            </div>
                        )}

                        <div className="mb-24">
                            <p className="text-neutral-900 text-lg mb-8 fw-medium">
                                <strong>Profile Type:</strong> {user.fields?.profileType || user.profileType}
                            </p>
                        </div>


                        {editMode && (
                            <div className="mb-32 text-center">
                                <button onClick={handleUpdateProfile} style={{ backgroundColor: "#fd7e14" }} className="btn btn-primary me-2" disabled={uploadingImage}>
                                    <FaSave className="me-2" /> Save Changes
                                </button>
                                <button onClick={handleEditToggle} className="btn btn-outline-danger">
                                    <FaTimes className="me-2" /> Cancel
                                </button>
                            </div>
                        )}

                        <div className="text-center">
                            <button onClick={handleLogout} className="btn btn-danger">
                                Logout
                            </button>
                        </div>

                       {/* Change Password Section */}
                        <div className="mb-32">
                            <button
                                onClick={() => setPasswordChange(!passwordChange)}
                                className="btn btn-outline-secondary mb-2"
                            >
                                <FaLock className="me-2" /> Change Password
                            </button>
                            {passwordChange && (
                                <form onSubmit={handlePasswordChangeSubmit} className="mt-3">
                                    {passwordError && <div className="alert alert-danger">{passwordError}</div>}
                                    {passwordSuccess && <div className="alert alert-success">{passwordSuccess}</div>}

                                    <div className="mb-3">
                                        <label className="form-label">Current Password:</label>
                                        <input
                                            type="password"
                                            className="form-control"
                                            value={passwordData.currentPassword}
                                            onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                                            required
                                        />
                                    </div>
                                    <div className="mb-3">
                                        <label className="form-label">New Password:</label>
                                        <input
                                            type="password"
                                            className="form-control"
                                            value={passwordData.newPassword}
                                            onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                                            required
                                        />
                                    </div>
                                    <div className="mb-3">
                                        <label className="form-label">Confirm New Password:</label>
                                        <input
                                            type="password"
                                            className="form-control"
                                            value={passwordData.confirmNewPassword}
                                            onChange={(e) => setPasswordData({ ...passwordData, confirmNewPassword: e.target.value })}
                                            required
                                        />
                                    </div>
                                    <button type="submit" className="btn btn-primary">
                                        Change Password
                                    </button>
                                </form>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default Account;