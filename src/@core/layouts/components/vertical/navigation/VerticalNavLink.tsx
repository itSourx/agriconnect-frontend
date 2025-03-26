// ** React Imports
import { ReactNode } from 'react'

// ** Next Imports
import Link from 'next/link'
import { useRouter } from 'next/router'

// ** MUI Imports
import ListItem from '@mui/material/ListItem'
import ListItemIcon from '@mui/material/ListItemIcon'
import ListItemText from '@mui/material/ListItemText'
import { styled } from '@mui/material/styles'
import Typography from '@mui/material/Typography'
import Box, { BoxProps } from '@mui/material/Box'
import Chip from '@mui/material/Chip'
import ListItemButton, { ListItemButtonProps } from '@mui/material/ListItemButton'

// ** Configs Import
import themeConfig from 'src/configs/themeConfig'

// ** Types
import { NavLink } from 'src/@core/layouts/types'
import { Settings } from 'src/@core/context/settingsContext'

// ** Custom Components Imports
import UserIcon from 'src/layouts/components/UserIcon'

// ** Utils
import { handleURLQueries } from 'src/@core/layouts/utils'

interface Props {
  item: NavLink
  settings: Settings
  navVisible?: boolean
  toggleNavVisibility?: () => void
}

// ** Styled Components
const MenuNavLink = styled(ListItemButton)<
  ListItemButtonProps & { component?: ReactNode; target?: '_blank' | undefined }
>(({ theme }) => ({
  width: '100%',
  borderTopRightRadius: 100,
  borderBottomRightRadius: 100,
  color: theme.palette.text.primary,
  padding: theme.spacing(2.25, 3.5),
  transition: 'all .25s ease-in-out',
  '&.active, &.active:hover': {
    boxShadow: theme.shadows[3],
    backgroundImage: `linear-gradient(98deg, ${theme.palette.customColors.primaryGradient}, ${theme.palette.primary.main} 94%)`,
    '& .MuiTypography-root, & .MuiSvgIcon-root': {
      color: `${theme.palette.common.white} !important`
    }
  },
  '&:hover': {
    backgroundColor: theme.palette.action.hover
  }
}))

const MenuItemTextMetaWrapper = styled(Box)<BoxProps>({
  width: '100%',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  transition: 'opacity .25s ease-in-out',
  ...(themeConfig.menuTextTruncate && { overflow: 'hidden' })
})

const StyledListItem = styled(ListItem)(({ theme }) => ({
  padding: 0,
  marginTop: theme.spacing(2),
  transition: 'all .25s ease-in-out',
  '&:hover': {
    backgroundColor: theme.palette.primary.main,
    '& .MuiListItemIcon-root, & .MuiListItemText-primary': {
      color: theme.palette.common.white
    }
  },
  '&.active': {
    backgroundColor: theme.palette.primary.main,
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
    '& .MuiListItemIcon-root, & .MuiListItemText-primary': {
      color: theme.palette.common.white
    }
  }
}))

const VerticalNavLink = (props: Props) => {
  const router = useRouter()
  const { item } = props

  const isActive = router.pathname === item.path

  return (
    <Link href={item.path || '/'} passHref>
      <StyledListItem
        className={isActive ? 'active' : ''}
        onClick={() => {
          if (props.navVisible) {
            props.toggleNavVisibility?.()
          }
        }}
      >
        <ListItemIcon
          sx={{
            minWidth: 0,
            mr: 3,
            color: 'text.primary',
            transition: 'margin .25s ease-in-out, color .25s ease-in-out'
          }}
        >
          {item.icon}
        </ListItemIcon>
        <ListItemText
          primary={item.title}
          sx={{
            color: 'text.primary',
            transition: 'color .25s ease-in-out'
          }}
        />
      </StyledListItem>
    </Link>
  )
}

export default VerticalNavLink
