// ** React Imports
import { ReactNode } from 'react'

// ** MUI Imports
import Box from '@mui/material/Box'
import { Theme } from '@mui/material/styles'
import useMediaQuery from '@mui/material/useMediaQuery'

// ** Layout Imports
// !Do not remove this Layout import
import VerticalLayout from 'src/@core/layouts/VerticalLayout'

// ** Navigation Imports **
import useNavigation from 'src/navigation/vertical'

// ** Component Import
import UpgradeToProButton from './components/UpgradeToProButton'
import VerticalAppBarContent from './components/vertical/AppBarContent'

// ** Hook Import
import { useSettings } from 'src/@core/hooks/useSettings'
import { useSession } from 'next-auth/react'

interface Props {
  children: ReactNode
}

// Layout spécial pour les utilisateurs marketplace (sans sidebar)
const MarketplaceLayout = ({ children }: Props) => {
  const { settings, saveSettings } = useSettings()
  const hidden = useMediaQuery((theme: Theme) => theme.breakpoints.down('lg'))

  const handleToggleNav = () => {
    // Pas de sidebar pour les acheteurs, donc pas d'action
  }

  return (
    <Box sx={{ 
      display: 'flex', 
      flexDirection: 'column', 
      minHeight: '100vh',
      backgroundColor: 'background.default'
    }}>
      {/* AppBar simplifié */}
      <Box sx={{ 
        position: 'sticky',
        top: 0,
        zIndex: 1100,
        backgroundColor: 'background.paper',
        borderBottom: '1px solid',
        borderColor: 'divider',
        px: { xs: 1, sm: 3 },
        py: { xs: 0.5, sm: 1 }
      }}>
        <VerticalAppBarContent
          hidden={hidden}
          settings={settings}
          saveSettings={saveSettings}
          toggleNavVisibility={handleToggleNav}
        />
      </Box>
      
      {/* Contenu en pleine largeur */}
      <Box sx={{ 
        flex: 1,
        width: '100%',
        py: 4
      }}>
        {children}
      </Box>
    </Box>
  )
}

const UserLayout = ({ children }: Props) => {
  // ** Hooks
  const { settings, saveSettings } = useSettings()
  const { data: session } = useSession()
  const user = session?.user as any
  const isBuyer = user?.profileType === 'ACHETEUR'
  const verticalNavItems = useNavigation() // Utiliser le hook

  const hidden = useMediaQuery((theme: Theme) => theme.breakpoints.down('lg'))

  // Layout spécial pour les acheteurs (sans sidebar)
  if (isBuyer) {
    return <MarketplaceLayout>{children}</MarketplaceLayout>
  }

  // Layout normal pour les autres utilisateurs
  return (
    <VerticalLayout
      hidden={hidden}
      settings={settings}
      saveSettings={saveSettings}
      verticalNavItems={verticalNavItems} // Utiliser le résultat du hook
      verticalAppBarContent={(
        props // AppBar Content
      ) => (
        <VerticalAppBarContent
          hidden={hidden}
          settings={settings}
          saveSettings={saveSettings}
          toggleNavVisibility={props.toggleNavVisibility}
        />
      )}
    >
      {children}
      <UpgradeToProButton />
    </VerticalLayout>
  )
}

export default UserLayout 