import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { useSession } from 'next-auth/react';
import { toast } from 'react-hot-toast';

export function withAuth<P extends object>(WrappedComponent: React.ComponentType<P>) {
  return function WithAuth(props: P) {
    const router = useRouter();
    const { data: session, status } = useSession();

    useEffect(() => {
      // Vérifier si l'utilisateur est authentifié
      if (status === 'unauthenticated') {
        toast.error('Veuillez vous connecter pour accéder à cette page');
        router.push('/auth/login');
        return;
      }

      // Vérifier si le token est présent
      if (status === 'authenticated' && !session?.accessToken) {
        toast.error('Session expirée. Veuillez vous reconnecter.');
        router.push('/auth/login');
        return;
      }
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

    // Si authentifié et token présent, afficher le composant
    return <WrappedComponent {...props} />;
  };
} 