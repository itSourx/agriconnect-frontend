// ** React Imports
import { ElementType } from 'react'

// ** Next Imports
import Link from 'next/link'
import { useRouter } from 'next/router'

// ** MUI Imports
import { styled } from '@mui/material/styles'
import ListItemIcon from '@mui/material/ListItemIcon'
import ListItemText from '@mui/material/ListItemText'
import ListItemButton, { ListItemButtonProps } from '@mui/material/ListItemButton'

// ** Types
import { NavLink } from 'src/@core/layouts/types'
import { Settings } from 'src/@core/context/settingsContext'

interface Props {
  item: NavLink
  settings: Settings
  navVisible?: boolean
  toggleNavVisibility?: () => void
}

const MenuNavLink = styled(ListItemButton)<ListItemButtonProps>(({ theme }) => ({
  width: '90%',
  margin: '4px auto',
  borderRadius: '10px',
  padding: theme.spacing(2.5, 3.5),
  transition: 'all 0.3s ease-in-out',
  '&.active, &.active:hover': {
    backgroundColor: theme.palette.primary.main,
    color: `${theme.palette.common.white} !important`,
    '& .MuiListItemIcon-root': {
      color: `${theme.palette.common.white} !important`
    }
  },
  '&:hover': {
    backgroundColor: theme.palette.action.hover,
    transform: 'translateX(5px)',
    '& .MuiListItemIcon-root': {
      color: theme.palette.primary.main
    }
  },
  '& .MuiListItemIcon-root': {
    marginRight: theme.spacing(2),
    transition: 'margin .25s ease-in-out'
  }
}))

const VerticalNavLink = ({ item, navVisible, toggleNavVisibility }: Props) => {
  const router = useRouter()
  const isActive = router.pathname === item.path

  return (
    <Link href={item.path || '/'} passHref legacyBehavior>
      <MenuNavLink
        className={isActive ? 'active' : ''}
        onClick={() => {
          if (item.path === undefined) {
            return
          }
          if (navVisible && toggleNavVisibility) {
            toggleNavVisibility()
          }
        }}
        sx={{
          ...(item.disabled ? { pointerEvents: 'none' } : { cursor: 'pointer' })
        }}
      >
        <ListItemIcon
          sx={{
            transition: 'margin .25s ease-in-out',
            '& svg': {
              fontSize: '1.5rem'
            }
          }}
        >
          {item.icon}
        </ListItemIcon>

        <ListItemText
          primary={item.title}
          sx={{
            '& .MuiTypography-root': {
              color: 'inherit',
              fontWeight: 500
            }
          }}
        />
      </MenuNavLink>
    </Link>
  )
}

export default VerticalNavLink
