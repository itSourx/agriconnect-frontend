import Box from '@mui/material/Box';
import { Theme, useTheme } from '@mui/material/styles';
import IconButton from '@mui/material/IconButton';
import useMediaQuery from '@mui/material/useMediaQuery';
import Badge from '@mui/material/Badge';
import { useRouter } from 'next/navigation';
import Menu from 'mdi-material-ui/Menu';
import CartOutline from 'mdi-material-ui/CartOutline';
import { Settings } from 'src/@core/context/settingsContext';
import ModeToggler from 'src/@core/layouts/components/shared-components/ModeToggler';
import UserDropdown from 'src/@core/layouts/components/shared-components/UserDropdown';
import NotificationDropdown from 'src/@core/layouts/components/shared-components/NotificationDropdown';
import { useCart } from 'src/context/CartContext';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import themeConfig from 'src/configs/themeConfig';

interface Props {
  hidden: boolean;
  settings: Settings;
  toggleNavVisibility: () => void;
  saveSettings: (values: Settings) => void;
}

const AppBarContent = (props: Props) => {
  const { hidden, settings, saveSettings, toggleNavVisibility } = props;
  const hiddenSm = useMediaQuery((theme: Theme) => theme.breakpoints.down('sm'));
  const { cart = [] } = useCart();
  const router = useRouter();
  const theme = useTheme();
  const { data: session } = useSession();
  const user = session?.user as any;
  const isBuyer = user?.profileType === 'ACHETEUR';

  const handleCartClick = () => {
    if (cart?.length > 0) {
      router.push('/checkout');
    }
  };

  return (
    <Box sx={{ 
      width: '100%', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'space-between',
      px: { xs: 1, sm: 2 },
      gap: { xs: 1, sm: 2 }
    }}>
      <Box className="actions-left" sx={{ 
        display: 'flex', 
        alignItems: 'center',
        flexShrink: 0
      }}>
        {isBuyer ? (
          <Link href="/marketplace" passHref legacyBehavior>
            <Box
              component="a"
              sx={{
                display: 'flex',
                alignItems: 'center',
                textDecoration: 'none',
                cursor: 'pointer'
              }}
            >
              <Box
                component="img"
                src={themeConfig.logo.src}
                alt={`${themeConfig.templateName} Logo`}
                sx={{
                  width: { xs: '120px', sm: themeConfig.logo.width },
                  height: { xs: 'auto', sm: themeConfig.logo.height },
                  objectFit: 'contain'
                }}
              />
            </Box>
          </Link>
        ) : (
          hidden ? (
            <IconButton
              color="inherit"
              onClick={toggleNavVisibility}
              sx={{ 
                ml: { xs: 0, sm: -2.75 },
                mr: { xs: 1, sm: 3.5 }
              }}
            >
              <Menu />
            </IconButton>
          ) : null
        )}
      </Box>
      <Box className="actions-right" sx={{ 
        display: 'flex', 
        alignItems: 'center', 
        gap: { xs: 0.5, sm: 2 },
        flexShrink: 0
      }}>
        {isBuyer && (
        <IconButton
          color='inherit'
          aria-label='Panier'
          component={Link}
          href='/checkout/'
          sx={{ 
            color: 'text.primary',
            position: 'relative',
            p: { xs: 1, sm: 1.5 },
            '& .MuiBadge-badge': {
              right: -3,
              top: 3,
              border: `2px solid ${theme.palette.background.paper}`,
              padding: '0 4px'
            }
          }}
        >
          <CartOutline />
            {cart && cart.length > 0 && (
            <Badge
              badgeContent={cart.length}
              color='error'
            />
          )}
        </IconButton>
        )}
        <ModeToggler settings={settings} saveSettings={saveSettings} />
        <Box sx={{ display: { xs: 'none', sm: 'block' } }}>
          <NotificationDropdown />
        </Box>
        <UserDropdown />
      </Box>
    </Box>
  );
};

export default AppBarContent;