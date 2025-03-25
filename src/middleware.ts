import { NextRequest, NextResponse } from 'next/server'
import { getToken } from 'next-auth/jwt'

const publicRoutes = [
  '/auth/login',
  '/auth/reset',
  '/api/auth/signin',
  '/api/auth/callback',
  '/api/auth/providers',
  '/api/auth/session',
  '/pages/login',
  '/pages/register'
]

export async function middleware(req: NextRequest) {
  const url = req.nextUrl.pathname
  const session = await getToken({ req, secret: process.env.AUTH_SECRET })
  const isLoggedIn = !!session
  const isPublicRoute = publicRoutes.includes(url)

  // Si l'utilisateur est connecté et tente d'accéder à une route publique, rediriger vers /
  if (isPublicRoute && isLoggedIn) {
    return NextResponse.redirect(new URL('/', req.url))
  }

  // Si l'utilisateur n'est pas connecté et tente d'accéder à une route protégée, rediriger vers /auth/login
  if (!isPublicRoute && !isLoggedIn) {
    return NextResponse.redirect(new URL('/auth/login', req.url))
  }

  if (isLoggedIn) {
    const profileType = session?.user?.profileType?.toUpperCase()

    // Restriction pour la page de gestion des utilisateurs (admin uniquement)
    if (url.startsWith('/users') && profileType !== 'ADMIN') {
      return NextResponse.redirect(new URL('/auth/error', req.url))
    }

    // Restriction pour le marketplace (acheteurs et utilisateurs uniquement)
    if (url === '/marketplace' && !['ACHETEUR', 'USER'].includes(profileType || '')) {
      return NextResponse.redirect(new URL('/auth/error', req.url))
    }

    // Restriction pour la page des produits (agriculteurs et fournisseurs uniquement)
    if (url === '/products/myproducts' && !['AGRICULTEUR', 'SUPPLIER'].includes(profileType || '')) {
      return NextResponse.redirect(new URL('/auth/error', req.url))
    }
  }

  // Si aucune restriction ne s'applique, continuer
  return NextResponse.next()
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|auth/login|auth/reset|pages/login|pages/register).*)'
  ]
}