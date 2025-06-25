import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { useSession } from 'next-auth/react';
import { toast } from 'react-hot-toast';

export function withAuth<P extends object>(WrappedComponent: React.ComponentType<P>) {
  return function WithAuth(props: P) {
    const router = useRouter();
    const { data: session, status } = useSession();

    useEffect(() => {
      console.log('🔐 withAuth Debug:', {
        status,
        hasSession: !!session,
        hasAccessToken: !!session?.accessToken,
        userEmail: session?.user?.email,
        profileType: session?.user?.profileType
      });

      // Vérifier si l'utilisateur est authentifié
      if (status === 'unauthenticated') {
        console.log('🚫 withAuth: utilisateur non authentifié');
        toast.error('Veuillez vous connecter pour accéder à cette page');
        router.push('/auth/login');
        return;
      }

      // Vérifier si le token est présent
      if (status === 'authenticated' && !session?.accessToken) {
        console.log('🚫 withAuth: utilisateur authentifié mais pas d\'accessToken - redirection vers changement de mot de passe');
        toast.error('Vous devez changer votre mot de passe avant de continuer.');
        router.push('/auth/reset-password');
        return;
      }

      console.log('✅ withAuth: utilisateur authentifié avec accessToken');
    }, [status, session, router]);

    // Afficher un message de chargement pendant la vérification
    if (status === 'loading') {
      return (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
          Chargement...
        </div>
      );
    }

    // Si non authentifié, ne rien afficher (la redirection est gérée dans le useEffect)
    if (status === 'unauthenticated') {
      return null;
    }

    // Si l'utilisateur n'a pas d'accessToken, ne rien afficher (redirection vers reset-password)
    if (status === 'authenticated' && !session?.accessToken) {
      return null;
    }

    // Si authentifié et token présent, afficher le composant
    return <WrappedComponent {...props} />;
  };
} 