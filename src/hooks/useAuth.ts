import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { signIn, signOut, useSession } from 'next-auth/react';

interface User {
  id: string;
  FirstName: string;
  LastName: string;
  email: string;
  Phone: string | null;
  Address: string | null;
  Photo: string | null;
  profileType: string;
  products: string[];
}

export const useAuth = () => {
  const { data: session, status, update } = useSession();
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    if (status !== 'loading') {
      setLoading(false);
    }
  }, [status]);

  const login = async (email: string, password: string) => {
    try {
      // Use our custom API endpoint to get the exact backend response
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        // This will contain the exact error message from the backend
        throw new Error(data.message);
      }

      // If successful, manually create a session with NextAuth
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
        callbackUrl: '/marketplace'
      });

      if (result?.error) {
          throw new Error(result.error);
      }

      await update();

      let attempts = 0;
      const maxAttempts = 10;
      
      while (attempts < maxAttempts) {
        await new Promise(resolve => setTimeout(resolve, 300));
        
        const currentSession = await update();
        
        if (currentSession?.user) {
          return currentSession.user as User;
        }
        
        attempts++;
      }

      throw new Error('Erreur lors de la connexion - Session non disponible');
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };

  const logout = async () => {
    await signOut({ redirect: false });
    router.push('/auth/login');
  };

  const getToken = () => {
    return session?.accessToken;
  };

  return {
    user: session?.user as User | null,
    loading,
    login,
    logout,
    getToken,
  };
}; 