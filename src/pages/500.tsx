// ** React Imports
import { ReactNode } from 'react'

// ** Next Import
import Link from 'next/link'

// ** MUI Components
import Button from '@mui/material/Button'
import { styled } from '@mui/material/styles'
import Typography from '@mui/material/Typography'
import Box, { BoxProps } from '@mui/material/Box'

// ** Layout Import
import BlankLayout from 'src/@core/layouts/BlankLayout'

// ** Demo Imports
import FooterIllustrations from 'src/views/pages/misc/FooterIllustrations'

// ** Config Import
import themeConfig from 'src/configs/themeConfig'

// ** Styled Components
const BoxWrapper = styled(Box)<BoxProps>(({ theme }) => ({
  [theme.breakpoints.down('md')]: {
    width: '90vw'
  }
}))

const Img = styled('img')(({ theme }) => ({
  marginBottom: theme.spacing(10),
  [theme.breakpoints.down('lg')]: {
    height: 450,
    marginTop: theme.spacing(10)
  },
  [theme.breakpoints.down('md')]: {
    height: 400
  },
  [theme.breakpoints.up('lg')]: {
    marginTop: theme.spacing(13)
  }
}))

const TreeIllustration = styled('img')(({ theme }) => ({
  left: 0,
  bottom: '5rem',
  position: 'absolute',
  [theme.breakpoints.down('lg')]: {
    bottom: 0
  }
}))

const Error500 = () => {
  return (
    <Box className='content-center'>
      <Box sx={{ p: 5, display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
        <BoxWrapper>
          <Typography variant='h1'>500</Typography>
          <Typography variant='h5' sx={{ mb: 1, fontSize: '1.5rem !important' }}>
            Internal server error 👨🏻‍💻
          </Typography>
          <Typography variant='body2'>Oops, something went wrong!</Typography>
        </BoxWrapper>
        <Box
          component="img"
          src={themeConfig.logo.src}
          alt={`${themeConfig.templateName} Logo`}
          sx={{
            width: { xs: '150px', sm: '200px', md: themeConfig.logo.width },
            height: { xs: 'auto', sm: 'auto', md: themeConfig.logo.height },
            objectFit: 'contain',
            maxWidth: '100%'
          }}
        />
        <Link passHref href='/'>
          <Button component='a' variant='contained' sx={{ px: 5.5 }}>
            Back to Home
          </Button>
        </Link>
      </Box>
      <FooterIllustrations />
    </Box>
  )
}

Error500.getLayout = (page: ReactNode) => <BlankLayout>{page}</BlankLayout>

export default Error500
