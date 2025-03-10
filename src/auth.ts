import NextAuth from "next-auth"
import type { NextAuthConfig } from "next-auth"
import Credentials from "next-auth/providers/credentials"
import axios from 'axios'
import { JWT } from "next-auth/jwt"
import { User } from "next-auth"

interface UserProfile extends User {
  id: string
  FirstName: string
  LastName: string
  email: string
  Phone: string | null
  Address: string | null
  accessToken?: string
  Photo: string | null
  profileType: string
  products: string[]
}

interface CustomJWT extends JWT {
  accessToken?: string
  user?: UserProfile
}

interface LoginResponse {
  access_token: string
  user: Omit<UserProfile, "accessToken">
}

export const config = {
  providers: [
    Credentials({
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Email et mot de passe requis") // Plus explicite qu'un simple null
        }

        try {
          const response = await axios.post<LoginResponse>(
            'https://agriconnect-bc17856a61b8.herokuapp.com/auth/login',
            {
              email: credentials.email,
              password: credentials.password,
            },
            {
              headers: {
                'accept': 'application/json',
                'Content-Type': 'application/json'
              }
            }
          )

          if (response.status === 201) {
            const { user, access_token } = response.data
            const authenticatedUser: UserProfile = {
              ...user,
              accessToken: access_token,
            }
            return authenticatedUser
          }
          throw new Error("Erreur inattendue lors de la connexion") // Si status n'est pas 201
        } catch (err: any) {
          console.error("Erreur lors de l'authentification:", err)
          throw new Error(err.response?.data?.message || "Identifiants invalides")
        }
      }
    })
  ],
  session: {
    strategy: "jwt",
    maxAge: 60 * 60, // 1 heure
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.accessToken = (user as UserProfile).accessToken
        token.user = user as UserProfile // Inclut profileType et toutes les autres données
      }
      return token
    },
    async session({ session, token }) {
      if (token.accessToken) {
        session.accessToken = token.accessToken
      }
      if (token.user) {
        session.user = token.user // Passe toutes les données utilisateur, y compris profileType
      }
      return session
    }
  },
  pages: {
    signIn: '/auth/login',
    error: '/auth/error' // Ajouté pour gérer les erreurs d'authentification
  },
  secret: process.env.AUTH_SECRET, // Utilise AUTH_SECRET au lieu de NEXTAUTH_SECRET (convention App Router)
} satisfies NextAuthConfig

export const { handlers, auth, signIn, signOut } = NextAuth(config)