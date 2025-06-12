// ** MUI Imports
import { PaletteMode } from '@mui/material'

// ** Types
import { ContentWidth } from 'src/@core/layouts/types'

type ThemeConfig = {
  mode: PaletteMode
  templateName: string
  routingLoader: boolean
  disableRipple: boolean
  navigationSize: number
  menuTextTruncate: boolean
  contentWidth: ContentWidth
  responsiveFontSizes: boolean
  logo: {
    src: string
    width: number
    height: number
  }
}

const themeConfig: ThemeConfig = {
  templateName: 'Agriconnect',
  mode: 'light' /* light | dark */,
  contentWidth: 'boxed' /* full | boxed */,

  routingLoader: true /* true | false */,

  menuTextTruncate: true /* true | false */,
  navigationSize: 260 /* Number in PX(Pixels) /*! Note: This is for Vertical navigation menu only */,

  responsiveFontSizes: true /* true | false */,
  disableRipple: false /* true | false */,

  logo: {
    src: '/images/logos/logo.png',
    width: 200,
    height: 70
  }
}

export default themeConfig
