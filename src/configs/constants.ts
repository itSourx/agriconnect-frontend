// Configuration des constantes de l'application
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://agriconnect-bc17856a61b8.herokuapp.com';

// Autres constantes de l'application
export const APP_NAME = 'AgriConnect';
export const APP_VERSION = '1.0.0';

// Limites de validation
export const VALIDATION_LIMITS = {
  NAME_MAX_LENGTH: 50,
  EMAIL_MAX_LENGTH: 100,
  PHONE_MAX_LENGTH: 20,
  ADDRESS_MAX_LENGTH: 200,
  DESCRIPTION_MAX_LENGTH: 500,
  PASSWORD_MIN_LENGTH: 8,
  PASSWORD_MAX_LENGTH: 128
};

// Messages d'erreur communs
export const ERROR_MESSAGES = {
  NETWORK_ERROR: 'Erreur de connexion. Veuillez vérifier votre connexion internet.',
  UNAUTHORIZED: 'Session expirée. Veuillez vous reconnecter.',
  FORBIDDEN: 'Accès refusé. Vous n\'avez pas les permissions nécessaires.',
  NOT_FOUND: 'Ressource non trouvée.',
  SERVER_ERROR: 'Erreur serveur. Veuillez réessayer plus tard.',
  VALIDATION_ERROR: 'Données invalides. Veuillez vérifier vos informations.'
}; 