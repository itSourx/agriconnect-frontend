// ** React Imports
import { useState, useEffect, SyntheticEvent, Fragment } from 'react'
import { useSession } from 'next-auth/react';

// ** Next Import
import { useRouter } from 'next/router'

// ** MUI Imports
import Box from '@mui/material/Box'
import Menu from '@mui/material/Menu'
import Badge from '@mui/material/Badge'
import Avatar from '@mui/material/Avatar'
import Divider from '@mui/material/Divider'
import MenuItem from '@mui/material/MenuItem'
import { styled } from '@mui/material/styles'
import Typography from '@mui/material/Typography'

// ** Icons Imports
import CogOutline from 'mdi-material-ui/CogOutline'
import LogoutVariant from 'mdi-material-ui/LogoutVariant'
import AccountOutline from 'mdi-material-ui/AccountOutline'
import Cart from 'mdi-material-ui/Cart'
import Shopping from 'mdi-material-ui/Shopping'
import TrendingUp from 'mdi-material-ui/TrendingUp'
import { signOut } from 'next-auth/react'

// ** Styled Components
const BadgeContentSpan = styled('span')(({ theme }) => ({
  width: 8,
  height: 8,
  borderRadius: '50%',
  backgroundColor: theme.palette.success.main,
  boxShadow: `0 0 0 2px ${theme.palette.background.paper}`
}))

const UserDropdown = () => {
  // ** States
  const [anchorEl, setAnchorEl] = useState<Element | null>(null);
  const { data: session, status } = useSession();

  // ** Hooks
  const router = useRouter()

  const fullName = session?.user ? `${session.user.FirstName || ''} ${session.user.LastName || ''}`.trim() : 'Utilisateur';
  const profileType = session?.user?.profileType || 'Utilisateur';
  const photo = session?.user?.Photo || '/images/avatars/1.png';
  const isBuyer = profileType === 'ACHETEUR';

  const handleDropdownOpen = (event: SyntheticEvent) => {
    setAnchorEl(event.currentTarget)
  }

  const handleDropdownClose = async (url?: string) => {
    if (url) {
      if (url.includes('/auth/login')) {
        await signOut({ redirect: false }); // NextAuth gère la déconnexion
      }
      router.push(url);
    }
    setAnchorEl(null);
  };

  const styles = {
    py: 2,
    px: 4,
    width: '100%',
    display: 'flex',
    alignItems: 'center',
    color: 'text.primary',
    textDecoration: 'none',
    '& svg': {
      fontSize: '1.375rem',
      color: 'text.secondary'
    }
  }

  return (
    <Fragment>
      <Badge
        overlap='circular'
        onClick={handleDropdownOpen}
        sx={{ 
          ml: { xs: 0.5, sm: 2 },
          cursor: 'pointer' 
        }}
        badgeContent={<BadgeContentSpan />}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Avatar
          alt={fullName}
          onClick={handleDropdownOpen}
          sx={{ 
            width: { xs: 32, sm: 40 },
            height: { xs: 32, sm: 40 }
          }}
          src={photo}
        />
      </Badge>
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={() => handleDropdownClose()}
        sx={{ '& .MuiMenu-paper': { width: 230, marginTop: 4 } }}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Box sx={{ pt: 2, pb: 3, px: 4 }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Badge
              overlap='circular'
              badgeContent={<BadgeContentSpan />}
              anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            >
              <Avatar 
                alt={fullName} 
                src={photo} 
                sx={{ width: '2.5rem', height: '2.5rem' }} 
              />
            </Badge>
            <Box sx={{ display: 'flex', marginLeft: 3, alignItems: 'flex-start', flexDirection: 'column' }}>
              <Typography sx={{ fontWeight: 600 }}>{fullName}</Typography>
              <Typography variant='body2' sx={{ fontSize: '0.8rem', color: 'text.disabled' }}>
                {profileType}
              </Typography>
            </Box>
          </Box>
        </Box>
        <Divider sx={{ mt: 0, mb: 1 }} />
        {isBuyer && (
          <>
            <MenuItem sx={{ p: 0 }} onClick={() => handleDropdownClose('/marketplace')}>
              <Box sx={styles}>
                <Shopping sx={{ marginRight: 2 }} />
                Marketplace
              </Box>
            </MenuItem>
            <Divider />
            <MenuItem sx={{ p: 0 }} onClick={() => handleDropdownClose('/orders/myorders')}>
              <Box sx={styles}>
                <Cart sx={{ marginRight: 2 }} />
                Mes commandes
              </Box>
            </MenuItem>
            <Divider />
            <MenuItem sx={{ p: 0 }} onClick={() => handleDropdownClose('/statistics/buyer-dashboard')}>
              <Box sx={styles}>
                <TrendingUp sx={{ marginRight: 2 }} />
                Mes Statistiques
              </Box>
            </MenuItem>
            <Divider />
          </>
        )}
        <MenuItem sx={{ p: 0 }} onClick={() => handleDropdownClose('/account-settings')}>
          <Box sx={styles}>
            <CogOutline sx={{ marginRight: 2 }} />
            Paramètres
          </Box>
        </MenuItem>
        <Divider />
        <MenuItem sx={{ py: 2 }} onClick={() => handleDropdownClose('/auth/login')}>
          <Box sx={styles}>
            <LogoutVariant sx={{ marginRight: 2 }} />
            Déconnexion
          </Box>
        </MenuItem>
      </Menu>
    </Fragment>
  )
}

export default UserDropdown