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
    <Box sx={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
      <Box className="actions-left" sx={{ mr: 2, display: 'flex', alignItems: 'center' }}>
        {hidden ? (
          <IconButton
            color="inherit"
            onClick={toggleNavVisibility}
            sx={{ ml: -2.75, ...(hiddenSm ? {} : { mr: 3.5 }) }}
          >
            <Menu />
          </IconButton>
        ) : null}
      </Box>
      <Box className="actions-right" sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        {isBuyer && (
        <IconButton
          color='inherit'
          aria-label='Panier'
          component={Link}
          href='/checkout/'
          sx={{ 
            color: 'text.primary',
            position: 'relative',
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
        <NotificationDropdown />
        <UserDropdown />
      </Box>
    </Box>
  );
};

export default AppBarContent;