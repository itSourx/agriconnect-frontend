import React from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'

// Mock des composants externes
jest.mock('recharts', () => ({
  BarChart: ({ children }: { children: React.ReactNode }) => <div data-testid="bar-chart">{children}</div>,
  Bar: () => <div data-testid="bar" />,
  XAxis: () => <div data-testid="x-axis" />,
  YAxis: () => <div data-testid="y-axis" />,
  CartesianGrid: () => <div data-testid="cartesian-grid" />,
  Tooltip: () => <div data-testid="tooltip" />,
  Legend: () => <div data-testid="legend" />,
  ResponsiveContainer: ({ children }: { children: React.ReactNode }) => <div data-testid="responsive-container">{children}</div>,
  PieChart: ({ children }: { children: React.ReactNode }) => <div data-testid="pie-chart">{children}</div>,
  Pie: () => <div data-testid="pie" />,
  Cell: () => <div data-testid="cell" />,
}))

// Types pour les profils utilisateur
type UserProfile = 'SUPERADMIN' | 'ADMIN' | 'AGRICULTEUR' | 'ACHETEUR'

// Configuration complète des routes et accès par profil
const routeAccessConfig = {
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
    
    // Marketplace (pour acheteurs)
    '/marketplace': {
      SUPERADMIN: { access: true, redirect: null },
      ADMIN: { access: true, redirect: null },
      AGRICULTEUR: { access: true, redirect: null },
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
      SUPERADMIN: { access: true, redirect: null },
      ADMIN: { access: true, redirect: null },
      AGRICULTEUR: { access: true, redirect: null },
      ACHETEUR: { access: false, redirect: '/' },
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
      AGRICULTEUR: { access: false, redirect: '/' },
      ACHETEUR: { access: false, redirect: '/' },
    },
    '/users/edit/[id]': {
      SUPERADMIN: { access: true, redirect: null },
      ADMIN: { access: true, redirect: null },
      AGRICULTEUR: { access: false, redirect: '/' },
      ACHETEUR: { access: false, redirect: '/' },
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

// Composant de test pour simuler une page
const TestPage = ({ route, profileType }: { route: string; profileType: UserProfile }) => {
  const { data: session } = useSession()
  const router = useRouter()
  
  React.useEffect(() => {
    if (!session?.user) {
      router.push('/auth/login')
      return
    }
    
    const userProfile = session.user.profileType as UserProfile
    const routeConfig = routeAccessConfig.routes[route as keyof typeof routeAccessConfig.routes]
    
    if (routeConfig && routeConfig[userProfile]) {
      const { access, redirect } = routeConfig[userProfile]
      if (!access && redirect) {
        router.push(redirect)
      }
    }
  }, [session, router, route])
  
  if (!session?.user) {
    return <div>Redirection vers login...</div>
  }
  
  const userProfile = session.user.profileType as UserProfile
  const routeConfig = routeAccessConfig.routes[route as keyof typeof routeAccessConfig.routes]
  
  if (routeConfig && routeConfig[userProfile] && !routeConfig[userProfile].access) {
    return <div>Accès refusé - Redirection...</div>
  }
  
  return <div>Page {route} accessible pour {userProfile}</div>
}

describe('Route Access Analysis - Complete Application', () => {
  let mockRouter: any
  let mockUseSession: jest.MockedFunction<typeof useSession>

  beforeEach(() => {
    mockRouter = {
      push: jest.fn(),
      replace: jest.fn(),
      prefetch: jest.fn(),
      back: jest.fn(),
      forward: jest.fn(),
      refresh: jest.fn(),
    }

    mockUseSession = useSession as jest.MockedFunction<typeof useSession>
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  // Test pour chaque profil sur toutes les routes
  Object.entries(routeAccessConfig.routes).forEach(([route, profileConfigs]) => {
    describe(`Route: ${route}`, () => {
      Object.entries(profileConfigs).forEach(([profileName, config]) => {
        it(`should ${config.access ? 'allow' : 'deny'} access for ${profileName}`, () => {
          mockUseSession.mockReturnValue({
            data: {
              user: {
                id: 'test-user-id',
                FirstName: 'Test',
                LastName: profileName,
                email: `test@${profileName.toLowerCase()}.com`,
                profileType: profileName as UserProfile,
              },
              accessToken: 'mock-access-token',
            },
            status: 'authenticated',
            update: jest.fn(),
          } as any)

          render(<TestPage route={route} profileType={profileName as UserProfile} />)

          if (config.access) {
            expect(screen.getByText(`Page ${route} accessible pour ${profileName}`)).toBeInTheDocument()
          } else {
            expect(screen.getByText('Accès refusé - Redirection...')).toBeInTheDocument()
            if (config.redirect) {
              expect(mockRouter.push).toHaveBeenCalledWith(config.redirect)
            }
          }
        })
      })
    })
  })

  // Test des routes publiques
  describe('Public Routes', () => {
    routeAccessConfig.public.forEach(route => {
      it(`should allow access to ${route} without authentication`, () => {
        mockUseSession.mockReturnValue({
          data: null,
          status: 'unauthenticated',
          update: jest.fn(),
        } as any)

        render(<TestPage route={route} profileType="ACHETEUR" />)
        
        // Les routes publiques ne devraient pas rediriger vers login
        expect(mockRouter.push).not.toHaveBeenCalledWith('/auth/login')
      })
    })
  })

  // Test des redirections spécifiques
  describe('Specific Redirects', () => {
    it('should redirect AGRICULTEUR from /products to /products/myproducts', () => {
      mockUseSession.mockReturnValue({
        data: {
          user: {
            id: 'test-user-id',
            FirstName: 'Test',
            LastName: 'Agriculteur',
            email: 'test@agriculteur.com',
            profileType: 'AGRICULTEUR',
          },
          accessToken: 'mock-access-token',
        },
        status: 'authenticated',
        update: jest.fn(),
      } as any)

      render(<TestPage route="/products" profileType="AGRICULTEUR" />)
      
      expect(mockRouter.push).toHaveBeenCalledWith('/products/myproducts')
    })

    it('should redirect ACHETEUR from / to /marketplace', () => {
      mockUseSession.mockReturnValue({
        data: {
          user: {
            id: 'test-user-id',
            FirstName: 'Test',
            LastName: 'Acheteur',
            email: 'test@acheteur.com',
            profileType: 'ACHETEUR',
          },
          accessToken: 'mock-access-token',
        },
        status: 'authenticated',
        update: jest.fn(),
      } as any)

      render(<TestPage route="/" profileType="ACHETEUR" />)
      
      expect(mockRouter.push).toHaveBeenCalledWith('/marketplace')
    })
  })

  // Test des états d'authentification
  describe('Authentication States', () => {
    it('should redirect unauthenticated users to login', () => {
      mockUseSession.mockReturnValue({
        data: null,
        status: 'unauthenticated',
        update: jest.fn(),
      } as any)

      render(<TestPage route="/marketplace" profileType="ACHETEUR" />)
      
      expect(mockRouter.push).toHaveBeenCalledWith('/auth/login')
    })

    it('should handle loading state', () => {
      mockUseSession.mockReturnValue({
        data: null,
        status: 'loading',
        update: jest.fn(),
      } as any)

      render(<TestPage route="/marketplace" profileType="ACHETEUR" />)
      
      // Ne devrait pas rediriger pendant le chargement
      expect(mockRouter.push).not.toHaveBeenCalled()
    })
  })
})

// Test pour générer le tableau récapitulatif
describe('Access Summary Table', () => {
  it('should generate correct access matrix', () => {
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

    // Vérifier que la matrice est correcte
    expect(accessMatrix).toHaveLength(routes.length)
    
    // Vérifier quelques cas spécifiques
    const marketplaceAccess = accessMatrix.find(m => m.route === '/marketplace')
    expect(marketplaceAccess?.access.every(a => a.access)).toBe(true)
    
    const adminDashboardAccess = accessMatrix.find(m => m.route === '/dashboard/admin')
    expect(adminDashboardAccess?.access.find(a => a.profile === 'SUPERADMIN')?.access).toBe(true)
    expect(adminDashboardAccess?.access.find(a => a.profile === 'ACHETEUR')?.access).toBe(false)
    
    const buyerStatsAccess = accessMatrix.find(m => m.route === '/statistics/buyers')
    expect(buyerStatsAccess?.access.find(a => a.profile === 'ACHETEUR')?.access).toBe(true)
    expect(buyerStatsAccess?.access.find(a => a.profile === 'AGRICULTEUR')?.access).toBe(false)
  })
}) 