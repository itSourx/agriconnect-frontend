import Box from '@mui/material/Box';
import { Theme } from '@mui/material/styles';
import TextField from '@mui/material/TextField';
import IconButton from '@mui/material/IconButton';
import useMediaQuery from '@mui/material/useMediaQuery';
import InputAdornment from '@mui/material/InputAdornment';
import Badge from '@mui/material/Badge'; // Pour le badge
import { useRouter } from 'next/navigation'; // Pour la redirection
import Menu from 'mdi-material-ui/Menu';
import Magnify from 'mdi-material-ui/Magnify';
import CartOutline from 'mdi-material-ui/CartOutline'; // Icône pour le panier
import { Settings } from 'src/@core/context/settingsContext';
import ModeToggler from 'src/@core/layouts/components/shared-components/ModeToggler';
import UserDropdown from 'src/@core/layouts/components/shared-components/UserDropdown';
import NotificationDropdown from 'src/@core/layouts/components/shared-components/NotificationDropdown';
import { useCart } from 'src/context/CartContext'; // Importer le contexte

interface Props {
  hidden: boolean;
  settings: Settings;
  toggleNavVisibility: () => void;
  saveSettings: (values: Settings) => void;
}

const AppBarContent = (props: Props) => {
  const { hidden, settings, saveSettings, toggleNavVisibility } = props;
  const hiddenSm = useMediaQuery((theme: Theme) => theme.breakpoints.down('sm'));
  const { cart } = useCart(); // Accéder au panier depuis le contexte
  const router = useRouter();

  const handleCartClick = () => {
    if (cart.length > 0) {
      router.push('/checkout'); // Rediriger vers la page de paiement si le panier n'est pas vide
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
        <TextField
          size="small"
          sx={{ '& .MuiOutlinedInput-root': { borderRadius: 4 } }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Magnify fontSize="small" />
              </InputAdornment>
            ),
          }}
        />
      </Box>
      <Box className="actions-right" sx={{ display: 'flex', alignItems: 'center' }}>
        <IconButton color="inherit" onClick={handleCartClick}>
          <Badge badgeContent={cart.length} color="error">
            <CartOutline />
          </Badge>
        </IconButton>
        <ModeToggler settings={settings} saveSettings={saveSettings} />
        <NotificationDropdown />
        <UserDropdown />
      </Box>
    </Box>
  );
};

export default AppBarContent;