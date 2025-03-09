import NextAuth from "next-auth";
import type { NextAuthConfig } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import axios from 'axios';
import { JWT } from "next-auth/jwt";
import { User } from "next-auth";

interface UserProfile extends User {
  id: string;
  FirstName: string;
  LastName: string;
  email: string;
  Phone: string | null;
  Address: string | null;
  accessToken?: string;
  Photo: string | null;
  profileType: string;
  products: string[];
}

interface CustomJWT extends JWT {
  accessToken?: string;
  user?: UserProfile;
}

interface LoginResponse {
  access_token: string;
  user: Omit<UserProfile, "accessToken">;
}

export const config = {
  providers: [
    Credentials({
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        try {
          const response = await axios.post<LoginResponse>(
            'https://agriconnect-bc17856a61b8.herokuapp.com/auth/login',
            {
              email: credentials.email,
              password: credentials.password,
            }
          );

          if (response.status === 201) {
            const { user, access_token } = response.data;
            const authenticatedUser: UserProfile = {
              ...user,
              accessToken: access_token,
            };
            return authenticatedUser;
          }
          return null;
        } catch (err: any) {
          console.error("Erreur lors de l'authentification:", err);
          return null;
        }
      },
    }),
  ],
  session: {
    strategy: "jwt",
    maxAge: 60 * 60, // 1 heure
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.accessToken = (user as UserProfile).accessToken;
        token.user = user as UserProfile;
      }
      return token;
    },
    async session({ session, token }) {
      if (token.accessToken) {
        session.accessToken = token.accessToken;
      }
      if (token.user) {
        session.user = token.user;
      }
      return session;
    },
  },
  pages: {
    signIn: '/auth/login',
  },
  secret: process.env.AUTH_SECRET,
} satisfies NextAuthConfig;

export const { handlers, auth, signIn, signOut } = NextAuth(config);