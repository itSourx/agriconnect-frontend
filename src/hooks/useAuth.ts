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
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
        callbackUrl: '/marketplace'
      });

      if (result?.error) {
        if (result.error.includes('Configuration')) {
          throw new Error('Une erreur est survenue lors de la connexion.');
        } else if (result.error.includes('401')) {
          throw new Error('Email ou mot de passe incorrect');
        } else {
          throw new Error(result.error);
        }
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