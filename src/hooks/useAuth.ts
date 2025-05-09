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
  const { data: session, status } = useSession();
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
      });

      if (result?.error) {
        throw new Error(result.error);
      }

      return session?.user;
    } catch (error) {
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