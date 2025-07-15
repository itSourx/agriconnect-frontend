import { NextRequest, NextResponse } from 'next/server'
import { getToken } from 'next-auth/jwt'

const publicRoutes = [
  '/auth/login',
  '/auth/register',
  '/auth/reset',
  '/auth/reset-password',
  '/api/auth/signin',
  '/api/auth/callback',
  '/api/auth/providers',
  '/api/auth/session',
  '/pages/login',
  '/pages/register'
]

export async function middleware(req: NextRequest) {
  const url = req.nextUrl.pathname
  const session = await getToken({ 
    req,
    secret: process.env.AUTH_SECRET
  })
  const isLoggedIn = !!session
  const isPublicRoute = publicRoutes.includes(url)

  // Logs de débogage
  console.log('🔍 Middleware Debug:', {
    url,
    isLoggedIn,
    isPublicRoute,
    session: session ? {
      user: session.user?.email,
      profileType: session.user?.profileType,
      hasAccessToken: !!session.accessToken
    } : null
  })

  // Vérifier d'abord si l'utilisateur est connecté et est un agriculteur
  if (isLoggedIn && session?.user?.profileType?.toUpperCase() === 'AGRICULTEUR') {
    // Rediriger les agriculteurs de /products vers /products/myproducts
    if (url === '/products') {
      return NextResponse.redirect(new URL('/products/myproducts', req.url))
    }
  }

  // Rediriger les acheteurs de la page d'accueil vers la marketplace
  if (isLoggedIn && session?.user?.profileType?.toUpperCase() === 'ACHETEUR' && url === '/') {
    return NextResponse.redirect(new URL('/marketplace', req.url))
  }

  // Si l'utilisateur est connecté et tente d'accéder à une route publique, rediriger vers /dashboard
  if (isPublicRoute && isLoggedIn) {
    console.log('🔄 Redirection: utilisateur connecté vers route publique -> /dashboard')
    return NextResponse.redirect(new URL('/dashboard', req.url))
  }

  // Si l'utilisateur n'est pas connecté et tente d'accéder à une route protégée, rediriger vers /auth/login
  if (!isPublicRoute && !isLoggedIn) {
    console.log('🚫 Redirection: utilisateur non connecté vers route protégée -> /auth/login')
    return NextResponse.redirect(new URL('/auth/login', req.url))
  }

  if (isLoggedIn) {
    const profileType = session?.user?.profileType?.toUpperCase();
    // Restriction pour la page de gestion des utilisateurs (admin et superadmin uniquement)
    if ((url.startsWith('/users')) && (profileType !== 'ADMIN' && profileType !== 'SUPERADMIN')) {
      return NextResponse.redirect(new URL('/auth/error', req.url))
    }

    // Restriction pour le marketplace (acheteurs, utilisateurs et agriculteurs uniquement)
    if (url === '/marketplace' && !['ACHETEUR', 'USER', 'AGRICULTEUR'].includes(profileType || '')) {
      return NextResponse.redirect(new URL('/auth/error', req.url))
    }

    // Restriction pour la page des produits (agriculteurs et fournisseurs uniquement)
    if (url === '/products/myproducts' && !['AGRICULTEUR', 'SUPPLIER'].includes(profileType || '')) {
      return NextResponse.redirect(new URL('/auth/error', req.url))
    }

    // Restriction pour les pages d'ajout et d'édition de produits (agriculteurs uniquement)
    if ((url === '/products/add' || url.startsWith('/products/edit-product/')) && profileType !== 'AGRICULTEUR') {
      return NextResponse.redirect(new URL('/auth/error', req.url))
    }

    // Restriction pour les pages d'ajout et d'édition d'utilisateurs (admin et superadmin uniquement)
    if ((url === '/users/create' || url.startsWith('/users/edit/')) && !['ADMIN', 'SUPERADMIN'].includes(profileType || '')) {
      return NextResponse.redirect(new URL('/auth/error', req.url))
    }
  }

  // Si aucune restriction ne s'applique, continuer
  return NextResponse.next()
}

export const config = {
  matcher: [
    '/',
    '/((?!api|_next/static|_next/image|favicon.ico|images|auth/login|auth/reset|auth/forgot-password|pages/login|pages/register).*)'
  ]
}