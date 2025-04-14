// ** React Imports
import { ReactNode } from 'react'

// ** MUI Imports
import { styled } from '@mui/material/styles'
import MuiDrawer, { DrawerProps } from '@mui/material/Drawer'

// ** Type Import
import { Settings } from 'src/@core/context/settingsContext'

// Définition de la largeur de navigation
const navWidth = 260

const StyledDrawer = styled(MuiDrawer)<DrawerProps>(({ theme }) => ({
  width: navWidth,
  '& .MuiDrawer-paper': {
    border: 'none',
    width: navWidth,
    boxShadow: theme.shadows[3],
    backgroundColor: theme.palette.background.paper,
    '&::-webkit-scrollbar': {
      width: 6,
    },
    '&::-webkit-scrollbar-thumb': {
      borderRadius: 20,
      background: theme.palette.grey[300],
    },
    '& .MuiList-root': {
      padding: theme.spacing(2, 2),
      '& .MuiListSubheader-root': {
        marginBottom: theme.spacing(2),
        color: theme.palette.text.secondary,
        fontSize: '0.875rem',
        fontWeight: 600,
        lineHeight: '24px',
        textTransform: 'uppercase'
      }
    }
  }
}))

interface Props {
  hidden: boolean
  navWidth: number
  settings: Settings
  navVisible: boolean
  children: ReactNode
  toggleNavVisibility: () => void
  setNavVisible: (value: boolean) => void
}

const Drawer = (props: Props) => {
  const { hidden, children, navWidth, navVisible, setNavVisible, toggleNavVisibility } = props

  return (
    <StyledDrawer
      className='layout-vertical-nav'
      variant={hidden ? 'temporary' : 'permanent'}
      PaperProps={{
        sx: {
          width: navWidth
        }
      }}
      open={navVisible}
      onClose={toggleNavVisibility}
      ModalProps={{
        disablePortal: true,
        keepMounted: true
      }}
    >
      {children}
    </StyledDrawer>
  )
}

export default Drawer
