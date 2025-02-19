import React from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axiosConfig';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';



const Breadcrumb = ({ title }) => {
    
    const navigate = useNavigate();
    
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

    const user = JSON.parse(localStorage.getItem('user')); // Get user from localStorage

    return (
        <div className="breadcrumb py-26 bg-main-two-50">
            <div className="container container-lg">
                <div className="breadcrumb-wrapper flex-between flex-wrap gap-16">
                    <ul className="flex-align gap-8 flex-wrap">
                        <li className="text-sm">
                            <Link
                                to="/"
                                className="text-gray-900 flex-align gap-8 hover-text-main-600"
                            >
                                <i className="ph ph-house" />
                                Home
                            </Link>
                        </li>
                        <li className="flex-align">
                            <i className="ph ph-caret-right" />
                        </li>
                        <li className="text-sm text-main-600"> {title} </li>
                    </ul>
                    <div className="profile flex-align gap-8 flex-wrap justify-end align-center items-center  ">


                        {user && ( // Conditionally render the image if user exists
                        <>

                   
                         <p className="text-neutral-900 text-lg fw-medium">
                             <span>Profile:</span> {user.fields?.profileType || user.profileType}
                         </p>
                             <ul className="header-top__right style-two flex-align flex-wrap">
                                    <li className="on-hover-item border-right-item border-right-item-sm-space has-submenu arrow-white">
                                       
                                        <img
                                            src={user.Photo || (user.fields && user.fields.Photo)}
                                            alt="User Profile"
                                            // Add any necessary styling or error handling as needed
                                            style={{ width: '50px', height: '50px', borderRadius: '50%' }}
                                            onError={(e) => { e.target.onerror = null; e.target.src = "/path/to/default/image.jpg"}} // Example error handling
                                        />
                                        <ul className="selectable-text-list on-hover-dropdown common-dropdown common-dropdown--sm max-h-200 scroll-sm px-0 py-8">
                                      
                                            <li onClick={handleLogout} >
                                                <span className='hover-bg-gray-100 text-gray-500 text-xs py-6 px-16 flex-align gap-8 rounded-0'>

                                                Logout
                                                </span>
                                            </li>
                                        </ul>
                                    </li>
                                   
                                </ul>
                                                

                           
                          
                        </>
                        
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Breadcrumb;

