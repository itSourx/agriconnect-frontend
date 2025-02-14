import React, { createContext, useContext, useState } from 'react';
import api from 'api/axiosConfig';
import { ReactNode } from 'react';



type User = {
    id: number;
    username: string;
    email: string;
  
};


interface AuthContextType {
    user: any | null;
    token: string | null; // Add token to the context
    login: (username: string, password: string) => Promise<void>;
    logout: () => void;
    setUser: React.Dispatch<React.SetStateAction<User | null>>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [token, setToken] = useState<string | null>(localStorage.getItem('token') || null); // Initialize token from localStorage

    const login = async (email: string, password: string) => {
        try {
            const response: any  = await api.post('/auth/login', {
                email,
                password
            });

            const userData: User = response.data // Assuming user data is under 'user' key
            const userToken: string = response.data.access_token; 

            setUser(userData);
            setToken(userToken); // Set the token in state

            localStorage.setItem('user', JSON.stringify(userData));
            localStorage.setItem('token', userToken); // Store the token in localStorage

            // Add the token to the Authorization header for future requests
            api.defaults.headers.common['Authorization'] = `Bearer ${userToken}`; 


        } catch (error: any) {
            let errorMessage = "Failed to log in";
            if (error.response && error.response.data && error.response.data.message) {
                errorMessage = error.response.data.message;
            } else if (error.message) {
                errorMessage = error.message;
            }
            throw new Error(errorMessage);
        }
    };


    const logout = () => {
        setUser(null);
        setToken(null); // Clear the token from state
        localStorage.removeItem('user');
        localStorage.removeItem('token'); // Remove token from localStorage
        delete api.defaults.headers.common['Authorization']; // Remove Authorization header

    };


    const authValue = { user, token,setUser , login, logout }; // Include token in the context value

    return (
        <AuthContext.Provider value={authValue}>
            {children}
        </AuthContext.Provider>
    );
};


export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

