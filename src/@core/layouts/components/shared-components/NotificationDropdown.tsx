// ** React Imports
import { useState, SyntheticEvent, Fragment, ReactNode, useEffect } from 'react'

// ** MUI Imports
import Box from '@mui/material/Box'
import Chip from '@mui/material/Chip'
import Button from '@mui/material/Button'
import IconButton from '@mui/material/IconButton'
import { styled, Theme } from '@mui/material/styles'
import useMediaQuery from '@mui/material/useMediaQuery'
import MuiMenu, { MenuProps } from '@mui/material/Menu'
import MuiAvatar, { AvatarProps } from '@mui/material/Avatar'
import MuiMenuItem, { MenuItemProps } from '@mui/material/MenuItem'
import Typography, { TypographyProps } from '@mui/material/Typography'

// ** Icons Imports
import NotificationsNoneIcon from '@mui/icons-material/NotificationsNone'
import AccountCircleIcon from '@mui/icons-material/AccountCircle'
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline'
import EditIcon from '@mui/icons-material/Edit'
import AddIcon from '@mui/icons-material/Add'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'

// ** Third Party Components
import PerfectScrollbarComponent from 'react-perfect-scrollbar'

// ** Types
interface Notification {
  id: string
  type: 'success' | 'info' | 'warning' | 'error'
  title: string
  message: string
  timestamp: number
  read: boolean
}

// ** Styled Menu component
const Menu = styled(MuiMenu)<MenuProps>(({ theme }) => ({
  '& .MuiMenu-paper': {
    width: 380,
    overflow: 'hidden',
    marginTop: theme.spacing(4),
    [theme.breakpoints.down('sm')]: {
      width: '100%'
    }
  },
  '& .MuiMenu-list': {
    padding: 0
  }
}))

// ** Styled MenuItem component
const MenuItem = styled(MuiMenuItem)<MenuItemProps>(({ theme }) => ({
  paddingTop: theme.spacing(3),
  paddingBottom: theme.spacing(3),
  borderBottom: `1px solid ${theme.palette.divider}`
}))

const styles = {
  maxHeight: 349,
  '& .MuiMenuItem-root:last-of-type': {
    border: 0
  }
}

// ** Styled PerfectScrollbar component
const PerfectScrollbar = styled(PerfectScrollbarComponent)({
  ...styles
})

// ** Styled Avatar component
const Avatar = styled(MuiAvatar)<AvatarProps>(({ theme }) => ({
  width: '2.375rem',
  height: '2.375rem',
  fontSize: '1.125rem',
  backgroundColor: theme.palette.primary.main
}))

// ** Styled component for the title in MenuItems
const MenuItemTitle = styled(Typography)<TypographyProps>(({ theme }) => ({
  fontWeight: 600,
  flex: '1 1 100%',
  overflow: 'hidden',
  fontSize: '0.875rem',
  whiteSpace: 'nowrap',
  textOverflow: 'ellipsis',
  marginBottom: theme.spacing(0.75)
}))

// ** Styled component for the subtitle in MenuItems
const MenuItemSubtitle = styled(Typography)<TypographyProps>({
  flex: '1 1 100%',
  overflow: 'hidden',
  whiteSpace: 'nowrap',
  textOverflow: 'ellipsis'
})

// ** Notification Service
const NotificationService = {
  getNotifications: (): Notification[] => {
    const notifications = localStorage.getItem('notifications')
    return notifications ? JSON.parse(notifications) : []
  },

  addNotification: (notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => {
    const notifications = NotificationService.getNotifications()
    const newNotification: Notification = {
      ...notification,
      id: Math.random().toString(36).substr(2, 9),
      timestamp: Date.now(),
      read: false
    }
    notifications.unshift(newNotification)
    localStorage.setItem('notifications', JSON.stringify(notifications))
    return newNotification
  },

  markAllAsRead: () => {
    const notifications = NotificationService.getNotifications()
    notifications.forEach(n => n.read = true)
    localStorage.setItem('notifications', JSON.stringify(notifications))
  },

  clearAll: () => {
    localStorage.removeItem('notifications')
  }
}

// ** Event Types
export const NotificationEvents = {
  LOGIN_SUCCESS: 'login_success',
  PRODUCT_CREATED: 'product_created',
  PRODUCT_UPDATED: 'product_updated',
  PRODUCT_DELETED: 'product_deleted',
  ORDER_CREATED: 'order_created',
  ORDER_UPDATED: 'order_updated',
  ORDER_DELETED: 'order_deleted'
} as const

type NotificationEvent = typeof NotificationEvents[keyof typeof NotificationEvents]

// ** Event Handlers
const eventHandlers: Record<NotificationEvent, (...args: any[]) => Omit<Notification, 'id' | 'timestamp' | 'read'>> = {
  [NotificationEvents.LOGIN_SUCCESS]: () => ({
    type: 'success',
    title: 'Connexion réussie',
    message: 'Vous êtes maintenant connecté à votre compte'
  }),
  [NotificationEvents.PRODUCT_CREATED]: (name: string) => ({
    type: 'success',
    title: 'Produit créé',
    message: `Le produit "${name}" a été créé avec succès`
  }),
  [NotificationEvents.PRODUCT_UPDATED]: (name: string) => ({
    type: 'info',
    title: 'Produit modifié',
    message: `Le produit "${name}" a été modifié`
  }),
  [NotificationEvents.PRODUCT_DELETED]: (name: string) => ({
    type: 'warning',
    title: 'Produit supprimé',
    message: `Le produit "${name}" a été supprimé`
  }),
  [NotificationEvents.ORDER_CREATED]: (id: string) => ({
    type: 'success',
    title: 'Commande créée',
    message: `La commande #${id} a été créée`
  }),
  [NotificationEvents.ORDER_UPDATED]: (id: string) => ({
    type: 'info',
    title: 'Commande modifiée',
    message: `La commande #${id} a été mise à jour`
  }),
  [NotificationEvents.ORDER_DELETED]: (id: string) => ({
    type: 'warning',
    title: 'Commande supprimée',
    message: `La commande #${id} a été supprimée`
  })
}

// ** Event Emitter
export const emitNotification = (event: NotificationEvent, ...args: any[]) => {
  const handler = eventHandlers[event]
  if (handler) {
    const notification = handler(...args)
    NotificationService.addNotification(notification)
  }
}

const NotificationDropdown = () => {
  // ** States
  const [anchorEl, setAnchorEl] = useState<(EventTarget & Element) | null>(null)
  const [notifications, setNotifications] = useState<Notification[]>([])

  // ** Hook
  const hidden = useMediaQuery((theme: Theme) => theme.breakpoints.down('lg'))

  useEffect(() => {
    setNotifications(NotificationService.getNotifications())
  }, [])

  const handleDropdownOpen = (event: SyntheticEvent) => {
    setAnchorEl(event.currentTarget)
  }

  const handleDropdownClose = () => {
    setAnchorEl(null)
  }

  const handleReadAll = () => {
    NotificationService.markAllAsRead()
    setNotifications(NotificationService.getNotifications())
    handleDropdownClose()
  }

  const getNotificationIcon = (type: Notification['type']) => {
    switch (type) {
      case 'success':
        return <CheckCircleIcon />
      case 'info':
        return <EditIcon />
      case 'warning':
        return <DeleteOutlineIcon />
      case 'error':
        return <AccountCircleIcon />
      default:
        return <NotificationsNoneIcon />
    }
  }

  const formatTimestamp = (timestamp: number) => {
    const now = Date.now()
    const diff = now - timestamp

    if (diff < 60000) return 'À l\'instant'
    if (diff < 3600000) return `Il y a ${Math.floor(diff / 60000)} minutes`
    if (diff < 86400000) return `Il y a ${Math.floor(diff / 3600000)} heures`
    return new Date(timestamp).toLocaleDateString('fr-FR')
  }

  const ScrollWrapper = ({ children }: { children: ReactNode }) => {
    if (hidden) {
      return <Box sx={{ ...styles, overflowY: 'auto', overflowX: 'hidden' }}>{children}</Box>
    } else {
      return (
        <PerfectScrollbar options={{ wheelPropagation: false, suppressScrollX: true }}>{children}</PerfectScrollbar>
      )
    }
  }

  const unreadCount = notifications.filter(n => !n.read).length

  return (
    <Fragment>
      <IconButton color='inherit' aria-haspopup='true' onClick={handleDropdownOpen} aria-controls='customized-menu'>
        <NotificationsNoneIcon />
        {unreadCount > 0 && (
          <Chip
            size='small'
            label={unreadCount}
            color='error'
            sx={{
              position: 'absolute',
              top: 0,
              right: 0,
              height: 16,
              minWidth: 16,
              fontSize: '0.75rem'
            }}
          />
        )}
      </IconButton>
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleDropdownClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <MenuItem disableRipple>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
            <Typography sx={{ fontWeight: 600 }}>Notifications</Typography>
            {unreadCount > 0 && (
              <Chip
                size='small'
                label={`${unreadCount} Nouveau${unreadCount > 1 ? 'x' : ''}`}
                color='primary'
                sx={{ height: 20, fontSize: '0.75rem', fontWeight: 500, borderRadius: '10px' }}
              />
            )}
          </Box>
        </MenuItem>
        <ScrollWrapper>
          {notifications.length === 0 ? (
            <MenuItem>
              <Box sx={{ width: '100%', textAlign: 'center', py: 2 }}>
                <Typography variant='body2' color='text.secondary'>
                  Aucune notification
                </Typography>
              </Box>
            </MenuItem>
          ) : (
            notifications.map(notification => (
              <MenuItem key={notification.id} onClick={handleDropdownClose}>
                <Box sx={{ width: '100%', display: 'flex', alignItems: 'center' }}>
                  <Avatar sx={{ 
                    color: 'common.white',
                    backgroundColor: `${notification.type}.main`
                  }}>
                    {getNotificationIcon(notification.type)}
                  </Avatar>
                  <Box sx={{ mx: 4, flex: '1 1', display: 'flex', overflow: 'hidden', flexDirection: 'column' }}>
                    <MenuItemTitle>{notification.title}</MenuItemTitle>
                    <MenuItemSubtitle variant='body2'>{notification.message}</MenuItemSubtitle>
                  </Box>
                  <Typography variant='caption' sx={{ color: 'text.disabled' }}>
                    {formatTimestamp(notification.timestamp)}
                  </Typography>
                </Box>
              </MenuItem>
            ))
          )}
        </ScrollWrapper>
        {notifications.length > 0 && (
          <MenuItem
            disableRipple
            sx={{ py: 3.5, borderBottom: 0, borderTop: theme => `1px solid ${theme.palette.divider}` }}
          >
            <Button fullWidth variant='contained' onClick={handleReadAll}>
              Marquer tout comme lu
            </Button>
          </MenuItem>
        )}
      </Menu>
    </Fragment>
  )
}

export default NotificationDropdown
