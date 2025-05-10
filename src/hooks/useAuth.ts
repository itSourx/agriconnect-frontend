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
        throw new Error(result.error);
      }

      // Forcer la mise à jour de la session
      await update();

      // Attendre que la session soit mise à jour
      let attempts = 0;
      const maxAttempts = 10;
      
      while (attempts < maxAttempts) {
        await new Promise(resolve => setTimeout(resolve, 300));
        
        // Vérifier si la session est mise à jour
        const currentSession = await update();
        
        if (currentSession?.user) {
          return currentSession.user as User;
        }
        
        attempts++;
      }

      // Si on arrive ici, c'est qu'on n'a pas réussi à obtenir la session
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