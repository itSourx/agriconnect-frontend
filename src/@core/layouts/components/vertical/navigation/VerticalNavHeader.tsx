// ** React Import
import { ReactNode } from 'react'

// ** Next Import
import Link from 'next/link'
import { useSession } from 'next-auth/react'

// ** MUI Imports
import Box, { BoxProps } from '@mui/material/Box'
import { styled, useTheme } from '@mui/material/styles'
import Typography, { TypographyProps } from '@mui/material/Typography'

// ** Type Import
import { Settings } from 'src/@core/context/settingsContext'

// ** Configs
import themeConfig from 'src/configs/themeConfig'

interface Props {
  hidden: boolean
  settings: Settings
  toggleNavVisibility: () => void
  saveSettings: (values: Settings) => void
  verticalNavMenuBranding?: (props?: any) => ReactNode
}

// ** Styled Components
const MenuHeaderWrapper = styled(Box)<BoxProps>(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  paddingRight: theme.spacing(4.5),
  paddingTop: theme.spacing(4),
  paddingBottom: theme.spacing(4),
  transition: 'padding .25s ease-in-out',
  minHeight: theme.mixins.toolbar.minHeight
}))

const HeaderTitle = styled(Typography)<TypographyProps>(({ theme }) => ({
  fontWeight: 600,
  lineHeight: 'normal',
  textTransform: 'uppercase',
  color: theme.palette.text.primary,
  transition: 'opacity .25s ease-in-out, margin .25s ease-in-out'
}))

const StyledLink = styled('a')({
  display: 'flex',
  alignItems: 'center',
  textDecoration: 'none'
})

const VerticalNavHeader = (props: Props) => {
  // ** Props
  const { verticalNavMenuBranding: userVerticalNavMenuBranding } = props
  const { data: session } = useSession()
  const userType = session?.user?.profileType

  // ** Hooks
  const theme = useTheme()

  const getHomePath = () => {
    switch (userType) {
      case 'ACHETEUR':
        return '/marketplace'
      case 'AGRICULTEUR':
        return '/dashboard/agriculteur'
      case 'ADMIN':
      case 'SUPERADMIN':
        return '/dashboard/admin'
      default:
        return '/'
    }
  }

  return (
    <MenuHeaderWrapper className='nav-header' sx={{ pl: 6 }}>
      {userVerticalNavMenuBranding ? (
        userVerticalNavMenuBranding(props)
      ) : (
        <Link href={getHomePath()} passHref legacyBehavior>
          <StyledLink>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Box
                component="img"
                src={themeConfig.logo.src}
                alt={`${themeConfig.templateName} Logo`}
                sx={{
                  width: themeConfig.logo.width,
                  height: themeConfig.logo.height,
                  objectFit: 'contain'
                }}
              />
            </Box>
          </StyledLink>
        </Link>
      )}
    </MenuHeaderWrapper>
  )
}

export default VerticalNavHeader
