// ** Type Imports
import { PaletteMode } from '@mui/material'
import { ThemeColor } from 'src/@core/layouts/types'

const DefaultPalette = (mode: PaletteMode, themeColor: ThemeColor) => {
  // ** Vars
  const lightColor = '#7A5C1E' // 122, 92, 30
  const darkColor = '#BFA14A' // 191, 161, 74
  const mainColor = mode === 'light' ? lightColor : darkColor

  const primaryGradient = () => {
    return 'linear-gradient(90deg, #4CAF1B 0%, #388E3C 100%)'
  }

  return {
    customColors: {
      main: mainColor,
      primaryGradient: primaryGradient(),
      tableHeaderBg: mode === 'light' ? '#BFA14A' : '#388E3C'
    },
    common: {
      black: '#000',
      white: '#FFF'
    },
    mode: mode,
    primary: {
      light: '#6fd34a', 
      main: '#4CAF1B',  
      dark: '#388E3C', 
      contrastText: '#FFF'
    },
    secondary: {
      light: '#d6c06a', 
      main: '#BFA14A', 
      dark: '#7A5C1E', 
      contrastText: '#FFF'
    },
    success: {
      light: '#6fd34a',
      main: '#388E3C', 
      dark: '#2a6b23',
      contrastText: '#FFF'
    },
    error: {
      light: '#ff6166',
      main: '#ff4c51',
      dark: '#e04347',
      contrastText: '#FFF'
    },
    warning: {
      light: '#ffe082',
      main: '#ffb300',
      dark: '#ff8f00',
      contrastText: '#FFF'
    },
    info: {
      light: '#64b5f6',
      main: '#2196f3',
      dark: '#1976d2',
      contrastText: '#FFF'
    },
    grey: {
      50: '#FAFAFA',
      100: '#F5F5F5',
      200: '#EEEEEE',
      300: '#E0E0E0',
      400: '#BDBDBD',
      500: '#9E9E9E',
      600: '#757575',
      700: '#616161',
      800: '#424242',
      900: '#212121',
      A100: '#D5D5D5',
      A200: '#AAAAAA',
      A400: '#616161',
      A700: '#303030'
    },
    text: {
      primary: mode === 'light' ? '#7A5C1E' : '#FFFFFF',
      secondary: mode === 'light' ? '#388E3C' : '#B0B0B0',
      disabled: mode === 'light' ? 'rgba(122, 92, 30, 0.38)' : 'rgba(255, 255, 255, 0.38)'
    },
    divider: mode === 'light' ? 'rgba(122, 92, 30, 0.12)' : 'rgba(191, 161, 74, 0.12)',
    background: {
      paper: mode === 'light' ? '#FFFFFF' : '#121212',
      default: mode === 'light' ? '#FFFFFF' : '#121212'
    },
    action: {
      active: mode === 'light' ? 'rgba(122, 92, 30, 0.54)' : 'rgba(191, 161, 74, 0.54)',
      hover: mode === 'light' ? 'rgba(76, 175, 27, 0.04)' : 'rgba(76, 175, 27, 0.08)',
      selected: mode === 'light' ? 'rgba(76, 175, 27, 0.08)' : 'rgba(76, 175, 27, 0.16)',
      disabled: mode === 'light' ? 'rgba(122, 92, 30, 0.3)' : 'rgba(191, 161, 74, 0.3)',
      disabledBackground: mode === 'light' ? 'rgba(122, 92, 30, 0.18)' : 'rgba(191, 161, 74, 0.18)',
      focus: mode === 'light' ? 'rgba(76, 175, 27, 0.12)' : 'rgba(76, 175, 27, 0.24)'
    }
  }
}

export default DefaultPalette
