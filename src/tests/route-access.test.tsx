import React from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import BuyerStatisticsPage from '../pages/statistics/buyers'

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

interface MockSession {
  user?: {
    id: string
    FirstName: string
    LastName: string
    email: string
    profileType: UserProfile
  }
  accessToken?: string
}

// Configuration des tests par profil
const profileConfigs = {
  SUPERADMIN: {
    profileType: 'SUPERADMIN' as UserProfile,
    expectedAccess: true,
    expectedRedirect: '/dashboard/admin',
  },
  ADMIN: {
    profileType: 'ADMIN' as UserProfile,
    expectedAccess: true,
    expectedRedirect: '/dashboard/admin',
  },
  AGRICULTEUR: {
    profileType: 'AGRICULTEUR' as UserProfile,
    expectedAccess: false,
    expectedRedirect: '/',
  },
  ACHETEUR: {
    profileType: 'ACHETEUR' as UserProfile,
    expectedAccess: true,
    expectedRedirect: null,
  },
}

// Mock des données de test
const mockBuyerStats = {
  success: true,
  buyerId: 'test-buyer-id',
  period: {
    start: '2024-01-01',
    end: '2024-12-31',
  },
  stats: {
    buyerName: 'Test Buyer',
    buyerEmail: 'test@example.com',
    totalOrders: 10,
    totalProducts: 5,
    totalSpent: 50000,
    averageOrderValue: 5000,
    favoriteCategory: 'Fruits',
    products: {
      'product-1': {
        name: 'Pommes',
        category: 'Fruits',
        price: 1000,
        quantity: 10,
        amount: 10000,
        lastOrderDate: '2024-12-01',
      },
      'product-2': {
        name: 'Bananes',
        category: 'Fruits',
        price: 500,
        quantity: 20,
        amount: 10000,
        lastOrderDate: '2024-12-02',
      },
    },
    categories: {
      'Fruits': {
        name: 'Fruits',
        category: 'Fruits',
        price: 750,
        quantity: 30,
        amount: 20000,
      },
    },
  },
}

describe('Route Access Tests - Buyer Statistics Page', () => {
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

    // Mock fetch pour les appels API
    ;(global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => mockBuyerStats,
    })
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  // Test pour chaque profil
  Object.entries(profileConfigs).forEach(([profileName, config]) => {
    describe(`${profileName} Profile`, () => {
      beforeEach(() => {
        mockUseSession.mockReturnValue({
          data: {
            user: {
              id: 'test-user-id',
              FirstName: 'Test',
              LastName: profileName,
              email: `test@${profileName.toLowerCase()}.com`,
              profileType: config.profileType,
            },
            accessToken: 'mock-access-token',
          },
          status: 'authenticated',
          update: jest.fn(),
        } as any)
      })

      it(`should ${config.expectedAccess ? 'allow' : 'deny'} access for ${profileName}`, async () => {
        render(<BuyerStatisticsPage />)

        if (config.expectedAccess) {
          // Vérifier que la page se charge correctement
          await waitFor(() => {
            expect(screen.getByText('Mes Statistiques')).toBeInTheDocument()
          })

          // Vérifier que les éléments principaux sont présents
          expect(screen.getByText('Période d\'analyse')).toBeInTheDocument()
          expect(screen.getByText('Commandes totales')).toBeInTheDocument()
          expect(screen.getByText('Produits achetés')).toBeInTheDocument()
          expect(screen.getByText('Total dépensé')).toBeInTheDocument()
          expect(screen.getByText('Panier moyen')).toBeInTheDocument()

          // Vérifier que l'API est appelée
          expect(global.fetch).toHaveBeenCalledWith(
            expect.stringContaining('/orders/stats/buyers/test-user-id'),
            expect.objectContaining({
              headers: {
                'Authorization': 'bearer mock-access-token',
                'Accept': '*/*',
              },
            })
          )
        } else {
          // Vérifier que l'utilisateur est redirigé
          await waitFor(() => {
            expect(mockRouter.push).toHaveBeenCalledWith(config.expectedRedirect)
          })
        }
      })

      it(`should handle API errors for ${profileName}`, async () => {
        if (!config.expectedAccess) return

        // Mock une erreur API
        ;(global.fetch as jest.Mock).mockRejectedValue(new Error('API Error'))

        render(<BuyerStatisticsPage />)

        await waitFor(() => {
          expect(screen.getByText('Erreur lors du chargement des statistiques')).toBeInTheDocument()
        })
      })

      it(`should handle loading state for ${profileName}`, async () => {
        if (!config.expectedAccess) return

        // Mock un état de chargement
        ;(global.fetch as jest.Mock).mockImplementation(() => new Promise(() => {}))

        render(<BuyerStatisticsPage />)

        expect(screen.getByRole('progressbar')).toBeInTheDocument()
      })
    })
  })

  // Tests spécifiques pour les fonctionnalités
  describe('Buyer-specific functionality', () => {
    beforeEach(() => {
      mockUseSession.mockReturnValue({
        data: {
          user: {
            id: 'test-buyer-id',
            FirstName: 'Test',
            LastName: 'Buyer',
            email: 'test@acheteur.com',
            profileType: 'ACHETEUR',
          },
          accessToken: 'mock-access-token',
        },
        status: 'authenticated',
        update: jest.fn(),
      } as any)
    })

    it('should display buyer statistics correctly', async () => {
      render(<BuyerStatisticsPage />)

      await waitFor(() => {
        expect(screen.getByText('Mes Statistiques')).toBeInTheDocument()
      })

      // Vérifier les statistiques
      expect(screen.getByText('10')).toBeInTheDocument() // totalOrders
      expect(screen.getByText('5')).toBeInTheDocument() // totalProducts
      expect(screen.getByText('50 000 F CFA')).toBeInTheDocument() // totalSpent
      expect(screen.getByText('5 000 F CFA')).toBeInTheDocument() // averageOrderValue
    })

    it('should handle date filtering', async () => {
      render(<BuyerStatisticsPage />)

      await waitFor(() => {
        expect(screen.getByText('Période d\'analyse')).toBeInTheDocument()
      })

      // Vérifier que les sélecteurs de date sont présents
      expect(screen.getByLabelText('Date de début')).toBeInTheDocument()
      expect(screen.getByLabelText('Date de fin')).toBeInTheDocument()
      expect(screen.getByText('Réinitialiser')).toBeInTheDocument()
    })

    it('should display charts', async () => {
      render(<BuyerStatisticsPage />)

      await waitFor(() => {
        expect(screen.getByText('Top 5 des produits achetés')).toBeInTheDocument()
        expect(screen.getByText('Répartition par catégorie')).toBeInTheDocument()
      })

      // Vérifier que les graphiques sont rendus
      expect(screen.getByTestId('bar-chart')).toBeInTheDocument()
      expect(screen.getByTestId('pie-chart')).toBeInTheDocument()
    })

    it('should display products table with pagination', async () => {
      render(<BuyerStatisticsPage />)

      await waitFor(() => {
        expect(screen.getByText('Détail des produits achetés')).toBeInTheDocument()
      })

      // Vérifier les en-têtes de colonnes
      expect(screen.getByText('Produit')).toBeInTheDocument()
      expect(screen.getByText('Catégorie')).toBeInTheDocument()
      expect(screen.getByText('Prix unitaire')).toBeInTheDocument()
      expect(screen.getByText('Quantité')).toBeInTheDocument()
      expect(screen.getByText('Montant total')).toBeInTheDocument()
      expect(screen.getByText('Dernière commande')).toBeInTheDocument()

      // Vérifier le bouton d'export
      expect(screen.getByText('Exporter en CSV')).toBeInTheDocument()
    })
  })

  // Tests pour les états d'authentification
  describe('Authentication states', () => {
    it('should redirect unauthenticated users', () => {
      mockUseSession.mockReturnValue({
        data: null,
        status: 'unauthenticated',
        update: jest.fn(),
      } as any)

      render(<BuyerStatisticsPage />)

      expect(mockRouter.push).toHaveBeenCalledWith('/')
    })

    it('should show loading for loading state', () => {
      mockUseSession.mockReturnValue({
        data: null,
        status: 'loading',
        update: jest.fn(),
      } as any)

      render(<BuyerStatisticsPage />)

      expect(screen.getByRole('progressbar')).toBeInTheDocument()
    })
  })
}) 