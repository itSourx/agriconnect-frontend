// ** React Imports
import { ReactNode } from 'react'

// ** Icon Imports
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
import AccountOutline from 'mdi-material-ui/AccountOutline'
import HeartOutline from 'mdi-material-ui/HeartOutline'
import MapMarkerOutline from 'mdi-material-ui/MapMarkerOutline'
import MessageOutline from 'mdi-material-ui/MessageOutline'
import BellOutline from 'mdi-material-ui/BellOutline'
import HistoryIcon from 'mdi-material-ui/History'
import StarOutline from 'mdi-material-ui/StarOutline'
import Store from 'mdi-material-ui/Store'
import FilterVariant from 'mdi-material-ui/FilterVariant'

// ** Type Imports
import { VerticalNavItemsType } from 'src/@core/layouts/types'
import { useSession } from 'next-auth/react'

interface UserProfile {
  id: string
  FirstName: string
  LastName: string
  email: string
  Phone: string | null
  Address: string | null
  accessToken?: string
  Photo: string | null
  profileType: string
  products: string[]
}

const renderIcon = (Icon: any) => {
  return <Icon sx={{ fontSize: '1.375rem' }} />
}

const navigation = (): VerticalNavItemsType => {
  const { data: session } = useSession()
  const user = session?.user as UserProfile
  const profileType = user?.profileType

  const allNavItems: VerticalNavItemsType = [
    {
      title: 'Tableau de bord',
      icon: renderIcon(HomeOutline),
      path: profileType === 'AGRICULTEUR' ? '/dashboard/agriculteur' : profileType === 'ADMIN' ? '/dashboard/admin' : '/dashboard/acheteur'
    }
  ]

  // Navigation spécifique pour l'AGRICULTEUR
  if (profileType === 'AGRICULTEUR') {
    allNavItems.push(
      {
        sectionTitle: 'Gestion des produits'
      },
      {
        title: 'Mes Produits', 
        icon: renderIcon(PackageVariantClosed),
        path: '/products/myproducts'
      },
      {
        title: 'Ajouter un produit',
        icon: renderIcon(Plus),
        path: '/products/add'
      },
      {
        sectionTitle: 'Gestion des commandes'
      },
      {
        title: 'Mes Commandes',
        icon: renderIcon(Cart),
        path: '/orders/myorders'
      },
      {
        sectionTitle: 'Gestion des clients'
      },
      {
        title: 'Mes Clients',
        icon: renderIcon(AccountGroup),
        path: '/customers'
      }
    )
  }

  // Navigation pour l'ACHETEUR
  if (profileType === 'ACHETEUR') {
    allNavItems.push(
      {
        sectionTitle: 'Marketplace'
      },
      {
        title: 'Explorer',
        icon: renderIcon(Shopping),
        path: '/marketplace'
      },
      {
        title: 'Mon Panier',
        icon: renderIcon(Cart),
        path: '/cart'
      },
      {
        title: 'Mes Commandes',
        icon: renderIcon(HistoryIcon),
        path: '/orders/myorders'
      }
    )
  }

  // Navigation pour l'ADMIN
  if (profileType === 'ADMIN') {
    allNavItems.push(
      {
        sectionTitle: 'Gestion des utilisateurs'
      },
      {
        title: 'Utilisateurs',
        icon: renderIcon(AccountGroup),
        path: '/users'
      },
      {
        sectionTitle: 'Gestion des produits'
      },
      {
        title: 'Produits',
        icon: renderIcon(PackageVariantClosed),
        path: '/products'
      },
      {
        sectionTitle: 'Gestion des commandes'
      },
      {
        title: 'Commandes',
        icon: renderIcon(Cart),
        path: '/orders'
      }
    )
  }

  return allNavItems
}

export default navigation