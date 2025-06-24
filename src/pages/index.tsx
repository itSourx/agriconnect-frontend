import { useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/router'
import { Box, CircularProgress, Typography } from '@mui/material'

const HomePage = () => {
  const { data: session, status } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (status === 'loading') return

    if (status === 'unauthenticated') {
      router.push('/auth/login')
      return
    }

    if (status === 'authenticated' && session?.user) {
      const userRole = session.user.profileType?.[0]
      
      // Redirection selon le rôle de l'utilisateur
      switch (userRole) {
        case 'SUPERADMIN':
          router.push('/dashboard/admin')
          break
        case 'ADMIN':
          router.push('/dashboard/admin')
          break
        case 'AGRICULTEUR':
        case 'SUPPLIER':
          router.push('/products/myproducts')
          break
        case 'ACHETEUR':
          router.push('/marketplace')
          break
        default:
          router.push('/marketplace')
          break
      }
    }
  }, [status, session, router])

  if (status === 'loading') {
    return (
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh',
          gap: 2
        }}
      >
        <CircularProgress size={60} />
        <Typography variant="h6" color="text.secondary">
          Chargement...
        </Typography>
      </Box>
    )
  }

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        gap: 2
      }}
    >
      <CircularProgress size={60} />
      <Typography variant="h6" color="text.secondary">
        Redirection en cours...
      </Typography>
    </Box>
  )
}

export default HomePage
