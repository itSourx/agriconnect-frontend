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
    }
  ]

  // Ajouter la section de gestion des utilisateurs uniquement pour les administrateurs
  if (upperProfileType === 'ADMIN') {
    allNavItems.push(
      {
        sectionTitle: 'Gestion des utilisateurs'
      },
      {
        title: 'Utilisateurs',
        icon: AccountGroup,
        path: '/users'
      }
    )
  }

  // Ajouter les sections communes
  allNavItems.push(
    {
      sectionTitle: 'Produits'
    },
    {
      title: 'Produits',
      icon: PackageVariantClosed,
      path: '/products'
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
  )

  return allNavItems
}

export default navigation