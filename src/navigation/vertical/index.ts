// ** Icon imports
import Login from 'mdi-material-ui/Login'
import Table from 'mdi-material-ui/Table'
import CubeOutline from 'mdi-material-ui/CubeOutline'
import HomeOutline from 'mdi-material-ui/HomeOutline'
import FormatLetterCase from 'mdi-material-ui/FormatLetterCase'
import AccountCogOutline from 'mdi-material-ui/AccountCogOutline'
import CreditCardOutline from 'mdi-material-ui/CreditCardOutline'
import AccountPlusOutline from 'mdi-material-ui/AccountPlusOutline'
import AlertCircleOutline from 'mdi-material-ui/AlertCircleOutline'
import GoogleCirclesExtended from 'mdi-material-ui/GoogleCirclesExtended'

// ** Type import
import { VerticalNavItemsType } from 'src/@core/layouts/types'

const navigation = (profileType?: string): VerticalNavItemsType => {
  const upperProfileType = profileType?.toUpperCase()

  // Liste complète des éléments de navigation
  const allNavItems: VerticalNavItemsType = [
    {
      title: 'Dashboard',
      icon: HomeOutline,
      path: '/'
    },
    {
      sectionTitle: 'Pages'
    },
    {
      title: 'Login',
      icon: Login,
      path: '/auth/login',
      openInNewTab: true
    },
    {
      title: 'Register',
      icon: AccountPlusOutline,
      path: '/auth/register',
      openInNewTab: true
    },
    {
      title: 'Error',
      icon: AlertCircleOutline,
      path: '/auth/error',
      openInNewTab: true
    },
    {
      title: 'Marketplace',
      icon: FormatLetterCase,
      path: '/marketplace'
    },
    {
      title: 'Manage my products',
      icon: FormatLetterCase,
      path: '/marketplace/myproducts'
    },
    {
      sectionTitle: 'Gestion des utilisateurs'
    },
    {
      title: 'Utilisateurs',
      icon: FormatLetterCase,
      path: '/users'
    },
    {
      sectionTitle: 'Produits'
    },
    {
      title: 'Produits',
      icon: FormatLetterCase,
      path: '/products'
    },
    {
      title: 'Commandes',
      icon: FormatLetterCase,
      path: '/orders'
    },
    {
      title: 'Gérer mes commandes',
      icon: FormatLetterCase,
      path: '/orders/myorders'
    },
    {
      title: 'Categories',
      icon: FormatLetterCase,
      path: '/products/categories'
    },
    {
      title: 'Add Categories',
      icon: FormatLetterCase,
      path: '/categories/add'
    }
  ]

  // Filtrer les éléments selon le profileType
  return allNavItems.filter(item => {
    if ('sectionTitle' in item) return true

    const { path } = item
    if (path === '/') {
      return upperProfileType === 'ADMIN' 
    }
    if (path === '/marketplace') {
      return ['ACHETEUR', 'USER'].includes(upperProfileType || '') 
    }
    if (path === '/marketplace/myproducts') {
      return ['AGRICULTEUR', 'SUPPLIER'].includes(upperProfileType || '') 
    }
    if (['/auth/login', '/auth/register', '/auth/error'].includes(path || '')) {
      return true
    }
    return true
  })
}

export default navigation