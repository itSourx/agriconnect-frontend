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
import ChartLine from 'mdi-material-ui/ChartLine'
import { VerticalNavItemsType } from 'src/@core/layouts/types'
import { useSession } from 'next-auth/react'
import React from 'react'

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

  // Les ACHETEUR n'ont pas de sidebar, tout est dans le dropdown
  if (profileType === 'ACHETEUR') {
    return []
  }

  const allNavItems: VerticalNavItemsType = [
    {
      title: 'Dashboard',
      icon: renderIcon(HomeOutline),
      path: profileType === 'ADMIN' || profileType === 'SUPERADMIN' ? '/dashboard/admin' : 
            profileType === 'AGRICULTEUR' ? '/dashboard/agriculteur' : '/'
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

  // Navigation pour l'ADMIN
  if (profileType === 'ADMIN' || profileType === 'SUPERADMIN') {
    allNavItems.push(
      {
        sectionTitle: 'Statistiques et Analyses'
      },
      {
        title: 'Statistiques',
        icon: renderIcon(ChartLine),
        path: '/statistics'
      },
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