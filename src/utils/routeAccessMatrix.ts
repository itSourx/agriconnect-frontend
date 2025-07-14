// Types pour les profils utilisateur
export type UserProfile = 'SUPERADMIN' | 'ADMIN' | 'AGRICULTEUR' | 'ACHETEUR'

// Configuration complète des routes et accès par profil
export const routeAccessConfig = {
  // Routes publiques (accessibles à tous)
  public: [
    '/auth/login',
    '/auth/register',
    '/auth/reset',
    '/auth/reset-password',
  ],
  
  // Routes par profil
  routes: {
    // Dashboard et pages principales
    '/': {
      SUPERADMIN: { access: true, redirect: '/dashboard/admin' },
      ADMIN: { access: true, redirect: '/dashboard/admin' },
      AGRICULTEUR: { access: true, redirect: '/products/myproducts' },
      ACHETEUR: { access: true, redirect: '/marketplace' },
    },
    '/dashboard/admin': {
      SUPERADMIN: { access: true, redirect: null },
      ADMIN: { access: true, redirect: null },
      AGRICULTEUR: { access: false, redirect: '/' },
      ACHETEUR: { access: false, redirect: '/' },
    },
    
    // Marketplace (pour acheteurs uniquement selon le middleware)
    '/marketplace': {
      SUPERADMIN: { access: false, redirect: '/auth/error' },
      ADMIN: { access: false, redirect: '/auth/error' },
      AGRICULTEUR: { access: false, redirect: '/auth/error' },
      ACHETEUR: { access: true, redirect: null },
    },
    
    // Produits
    '/products': {
      SUPERADMIN: { access: true, redirect: null },
      ADMIN: { access: true, redirect: null },
      AGRICULTEUR: { access: true, redirect: '/products/myproducts' },
      ACHETEUR: { access: true, redirect: null },
    },
    '/products/myproducts': {
      SUPERADMIN: { access: false, redirect: '/auth/error' },
      ADMIN: { access: false, redirect: '/auth/error' },
      AGRICULTEUR: { access: true, redirect: null },
      ACHETEUR: { access: false, redirect: '/auth/error' },
    },
    '/products/add': {
      SUPERADMIN: { access: true, redirect: null },
      ADMIN: { access: true, redirect: null },
      AGRICULTEUR: { access: true, redirect: null },
      ACHETEUR: { access: false, redirect: '/' },
    },
    
    // Commandes
    '/orders': {
      SUPERADMIN: { access: true, redirect: null },
      ADMIN: { access: true, redirect: null },
      AGRICULTEUR: { access: true, redirect: null },
      ACHETEUR: { access: true, redirect: null },
    },
    
    // Checkout
    '/checkout': {
      SUPERADMIN: { access: true, redirect: null },
      ADMIN: { access: true, redirect: null },
      AGRICULTEUR: { access: true, redirect: null },
      ACHETEUR: { access: true, redirect: null },
    },
    
    // Utilisateurs (administration)
    '/users': {
      SUPERADMIN: { access: true, redirect: null },
      ADMIN: { access: true, redirect: null },
      AGRICULTEUR: { access: false, redirect: '/auth/error' },
      ACHETEUR: { access: false, redirect: '/auth/error' },
    },
    '/users/edit/[id]': {
      SUPERADMIN: { access: true, redirect: null },
      ADMIN: { access: true, redirect: null },
      AGRICULTEUR: { access: false, redirect: '/auth/error' },
      ACHETEUR: { access: false, redirect: '/auth/error' },
    },
    
    // Statistiques
    '/statistics/global': {
      SUPERADMIN: { access: true, redirect: null },
      ADMIN: { access: true, redirect: null },
      AGRICULTEUR: { access: false, redirect: '/' },
      ACHETEUR: { access: false, redirect: '/' },
    },
    '/statistics/buyers': {
      SUPERADMIN: { access: true, redirect: null },
      ADMIN: { access: true, redirect: null },
      AGRICULTEUR: { access: false, redirect: '/' },
      ACHETEUR: { access: true, redirect: null },
    },
    
    // Paramètres du compte
    '/account-settings': {
      SUPERADMIN: { access: true, redirect: null },
      ADMIN: { access: true, redirect: null },
      AGRICULTEUR: { access: true, redirect: null },
      ACHETEUR: { access: true, redirect: null },
    },
  }
}

// Fonction pour générer la matrice d'accès
export function generateAccessMatrix() {
  const profiles: UserProfile[] = ['SUPERADMIN', 'ADMIN', 'AGRICULTEUR', 'ACHETEUR']
  const routes = Object.keys(routeAccessConfig.routes)
  
  const accessMatrix = routes.map(route => {
    const routeConfig = routeAccessConfig.routes[route as keyof typeof routeAccessConfig.routes]
    const access = profiles.map(profile => ({
      profile,
      access: routeConfig[profile].access,
      redirect: routeConfig[profile].redirect
    }))
    
    return {
      route,
      access
    }
  })

  return accessMatrix
}

// Fonction pour générer le tableau récapitulatif en format markdown
export function generateAccessTableMarkdown() {
  const profiles: UserProfile[] = ['SUPERADMIN', 'ADMIN', 'AGRICULTEUR', 'ACHETEUR']
  const routes = Object.keys(routeAccessConfig.routes)
  
  let markdown = '# Tableau Récapitulatif des Accès aux Routes\n\n'
  markdown += '| Route | SUPERADMIN | ADMIN | AGRICULTEUR | ACHETEUR |\n'
  markdown += '|-------|------------|-------|-------------|----------|\n'
  
  routes.forEach(route => {
    const routeConfig = routeAccessConfig.routes[route as keyof typeof routeAccessConfig.routes]
    const accessCells = profiles.map(profile => {
      const config = routeConfig[profile]
      if (config.access) {
        return '✅'
      } else {
        return config.redirect ? `❌ (→ ${config.redirect})` : '❌'
      }
    })
    
    markdown += `| ${route} | ${accessCells.join(' | ')} |\n`
  })
  
  return markdown
}

// Fonction pour vérifier l'accès d'un utilisateur à une route
export function checkUserAccess(userProfile: UserProfile, route: string) {
  const routeConfig = routeAccessConfig.routes[route as keyof typeof routeAccessConfig.routes]
  
  if (!routeConfig) {
    return { access: false, redirect: '/auth/login', reason: 'Route non configurée' }
  }
  
  const userConfig = routeConfig[userProfile]
  if (!userConfig) {
    return { access: false, redirect: '/auth/login', reason: 'Profil non configuré' }
  }
  
  return {
    access: userConfig.access,
    redirect: userConfig.redirect,
    reason: userConfig.access ? 'Accès autorisé' : 'Accès refusé'
  }
}

// Fonction pour obtenir toutes les routes accessibles pour un profil
export function getAccessibleRoutes(userProfile: UserProfile) {
  const routes = Object.keys(routeAccessConfig.routes)
  return routes.filter(route => {
    const routeConfig = routeAccessConfig.routes[route as keyof typeof routeAccessConfig.routes]
    return routeConfig[userProfile]?.access
  })
}

// Fonction pour obtenir toutes les routes avec redirection pour un profil
export function getRedirectRoutes(userProfile: UserProfile) {
  const routes = Object.keys(routeAccessConfig.routes)
  return routes.filter(route => {
    const routeConfig = routeAccessConfig.routes[route as keyof typeof routeAccessConfig.routes]
    return routeConfig[userProfile]?.redirect
  }).map(route => ({
    route,
    redirect: routeAccessConfig.routes[route as keyof typeof routeAccessConfig.routes][userProfile].redirect
  }))
} 