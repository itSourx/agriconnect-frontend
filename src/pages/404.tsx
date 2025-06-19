// ** React Imports
import { ReactNode } from 'react'

// ** Next Import
import Link from 'next/link'

// ** MUI Components
import Button from '@mui/material/Button'
import { styled, useTheme } from '@mui/material/styles'
import Typography from '@mui/material/Typography'
import Box, { BoxProps } from '@mui/material/Box'
import Container from '@mui/material/Container'

// ** Layout Import
import BlankLayout from 'src/@core/layouts/BlankLayout'

// ** Config Import
import themeConfig from 'src/configs/themeConfig'

// ** Styled Components
const BoxWrapper = styled(Box)<BoxProps>(({ theme }) => ({
  [theme.breakpoints.down('md')]: {
    width: '90vw'
  }
}))

const Error404 = () => {
  const theme = useTheme()

  return (
    <Box 
      className='content-center' 
      sx={{ 
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: theme.palette.background.default
      }}
    >
      <Container maxWidth='md'>
        <Box 
          sx={{ 
            p: 5, 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center', 
            textAlign: 'center',
            gap: 4
          }}
        >
        <BoxWrapper>
            <Box
              component="img"
              src={themeConfig.logo.src}
              alt={`${themeConfig.templateName} Logo`}
              sx={{
                width: themeConfig.logo.width,
                height: themeConfig.logo.height,
                objectFit: 'contain',
                mb: 4
              }}
            />
            <Typography 
              variant='h1' 
              sx={{ 
                fontSize: '6rem',
                fontWeight: 700,
                color: theme.palette.primary.main,
                mb: 2
              }}
            >
              404
            </Typography>
            <Typography 
              variant='h4' 
              sx={{ 
                mb: 2,
                color: theme.palette.text.primary,
                fontWeight: 600
              }}
            >
              Oups ! Page non trouvée
            </Typography>
            <Typography 
              variant='body1' 
              sx={{ 
                mb: 4,
                color: theme.palette.text.secondary,
                maxWidth: '500px',
                mx: 'auto'
              }}
            >
              La page que vous recherchez n'existe pas ou a été déplacée. 
              Retournez à l'accueil pour continuer votre navigation.
          </Typography>
        </BoxWrapper>
          <Link href='/' passHref>
            <Button 
              component='a' 
              variant='contained' 
              size='large'
              sx={{ 
                px: 6,
                py: 1.5,
                borderRadius: 2,
                textTransform: 'none',
                fontSize: '1rem',
                fontWeight: 600,
                boxShadow: theme.shadows[4],
                '&:hover': {
                  boxShadow: theme.shadows[8]
                }
              }}
            >
              Retour à l'accueil
          </Button>
        </Link>
      </Box>
      </Container>
    </Box>
  )
}

Error404.getLayout = (page: ReactNode) => <BlankLayout>{page}</BlankLayout>

export default Error404
