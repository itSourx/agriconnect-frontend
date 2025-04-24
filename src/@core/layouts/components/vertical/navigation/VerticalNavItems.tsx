// ** Types Import
import { Settings } from 'src/@core/context/settingsContext'
import { NavLink, NavSectionTitle, VerticalNavItemsType } from 'src/@core/layouts/types'

// ** Next Imports
import Link from 'next/link'
import { useRouter } from 'next/router'

// ** Custom Menu Components
import VerticalNavLink from './VerticalNavLink'
import VerticalNavSectionTitle from './VerticalNavSectionTitle'

// ** MUI Imports
import { ListItemButton, ListItemIcon, ListItemText } from '@mui/material'
import { styled } from '@mui/material/styles'
import Box from '@mui/material/Box'
import { useTheme } from '@mui/material/styles'
import { UserIcon } from 'src/@core/components/UserIcon'

interface Props {
  settings: Settings
  navVisible?: boolean
  groupActive: string[]
  currentActiveGroup: string[]
  verticalNavItems?: VerticalNavItemsType
  saveSettings: (values: Settings) => void
  setGroupActive: (value: string[]) => void
  setCurrentActiveGroup: (item: string[]) => void
}

interface Settings {
  navCollapsed: boolean
}

const resolveNavItemComponent = (item: NavLink | NavSectionTitle) => {
  if ((item as NavSectionTitle).sectionTitle) return VerticalNavSectionTitle

  return VerticalNavLink
}

const StyledListItem = styled(ListItemButton)(({ theme }) => ({
  width: '90%',
  borderRadius: '10px',
  margin: '4px auto',
  padding: theme.spacing(2, 3),
  color: theme.palette.text.primary,
  transition: 'all 0.3s ease',
  '&:hover': {
    backgroundColor: theme.palette.primary.light,
    color: theme.palette.primary.main,
    transform: 'translateX(5px)',
    '& .MuiListItemIcon-root': {
      color: theme.palette.primary.main
    }
  },
  '&.Mui-selected': {
    backgroundColor: theme.palette.primary.main,
    color: theme.palette.common.white,
    '&:hover': {
      backgroundColor: theme.palette.primary.dark
    },
    '& .MuiListItemIcon-root': {
      color: theme.palette.common.white
    }
  },
  '& .MuiListItemIcon-root': {
    minWidth: 40,
    marginRight: theme.spacing(2),
    color: theme.palette.text.secondary
  }
}))

interface ListItemComponentProps {
  item: NavLink
  navHover?: boolean
  parent?: NavLink
  navVisible?: boolean
  isSubItem?: boolean
  settings: Settings
}

const ListItemComponent = ({ item, navHover, parent, isSubItem, settings }: ListItemComponentProps) => {
  const theme = useTheme()
  const router = useRouter()
  const { navCollapsed } = settings

  return (
    <Link href={item.path || '/'} passHref legacyBehavior>
      <StyledListItem
        component="a"
        disabled={item.disabled || false}
        sx={{
          width: '90%',
          borderRadius: '10px',
          margin: '4px auto',
          ...(router.pathname === item.path && {
            backgroundColor: theme.palette.primary.main,
            color: theme.palette.common.white,
            '& .MuiListItemIcon-root': {
              color: theme.palette.common.white
            }
          }),
          ...(isSubItem && {
            pl: 5.5
          })
        }}
      >
        {isSubItem ? (
          <Box
            sx={{
              width: 4,
              height: 4,
              borderRadius: '50%',
              backgroundColor: 'text.disabled',
              transition: 'backgroundColor 0.3s',
              mr: 2.5,
              ...(router.pathname === item.path && {
                backgroundColor: 'common.white'
              })
            }}
          />
        ) : (
          <ListItemIcon
            sx={{
              transition: 'margin .25s ease-in-out',
              ...(navCollapsed && !navHover && { mr: 0 }),
              '& svg': {
                fontSize: '1.5rem'
              }
            }}
          >
            {parent?.icon || item.icon}
          </ListItemIcon>
        )}
        <ListItemText
          primary={item.title}
          sx={{
            '& .MuiTypography-root': {
              fontWeight: 500,
              color: 'inherit'
            }
          }}
        />
      </StyledListItem>
    </Link>
  )
}

const VerticalNavItems = (props: Props) => {
  const { verticalNavItems } = props

  const RenderMenuItems = verticalNavItems?.map((item: NavLink | NavSectionTitle, index: number) => {
    const TagName: any = resolveNavItemComponent(item)

    return <TagName {...props} key={index} item={item} />
  })

  return <>{RenderMenuItems}</>
}

export default VerticalNavItems
