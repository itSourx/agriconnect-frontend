import Login from 'mdi-material-ui/Login'
import HomeOutline from 'mdi-material-ui/HomeOutline'
import Shopping from 'mdi-material-ui/Shopping'
import AccountGroup from 'mdi-material-ui/AccountGroup'
import PackageVariantClosed from 'mdi-material-ui/PackageVariantClosed'
import Cart from 'mdi-material-ui/Cart'
import Tag from 'mdi-material-ui/Tag'
import Plus from 'mdi-material-ui/Plus'
import AccountPlusOutline from 'mdi-material-ui/AccountPlusOutline'
import AlertCircleOutline from 'mdi-material-ui/AlertCircleOutline'
import { VerticalNavItemsType } from 'src/@core/layouts/types'

const navigation = (profileType?: string): VerticalNavItemsType => {
  const upperProfileType = profileType?.toUpperCase()

  const allNavItems: VerticalNavItemsType = [
    {
      title: 'Dashboard',
      icon: HomeOutline,
      path: '/'
    },
    {
      title: 'Marketplace',
      icon: Shopping,
      path: '/marketplace'
    },
    {
      sectionTitle: 'Gestion des utilisateurs'
    },
    {
      title: 'Utilisateurs',
      icon: AccountGroup,
      path: '/users'
    },
    {
      sectionTitle: 'Produits'
    },
    {
      title: 'Produits',
      icon: PackageVariantClosed,
      path: '/products'
    },
    {
      title: 'Manage my products',
      icon: PackageVariantClosed,
      path: '/products/myproducts'
    },
    {
      title: 'Commandes',
      icon: Cart,
      path: '/orders'
    },
    {
      title: 'Gérer mes commandes',
      icon: Cart,
      path: '/orders/myorders'
    },
    {
      title: 'Mes clients',
      icon: AccountGroup,
      path: '/customers'
    },
    {
      title: 'Categories',
      icon: Tag,
      path: '/products/categories'
    },
    {
      title: 'Add Categories',
      icon: Plus,
      path: '/categories/add'
    }
  ]

  return allNavItems.filter(item => {
    if ('sectionTitle' in item) return true

    const { path } = item
    // if (upperProfileType === 'AGRICULTEUR') {
    //   return [
    //     '/',
    //     '/products/myproducts',
    //     '/orders/myorders',
    //     '/customers'
    //   ].includes(path || '')
    // }
    if (path === '/') {
      return upperProfileType === 'ADMIN'
    }
    if (path === '/marketplace') {
      return ['ACHETEUR', 'USER'].includes(upperProfileType || '')
    }
    if (path === '/products/myproducts') {
      return ['AGRICULTEUR', 'SUPPLIER'].includes(upperProfileType || '')
    }
    if (['/auth/login', '/auth/register', '/auth/error'].includes(path || '')) {
      return true
    }
    return true
  })
}

export default navigation