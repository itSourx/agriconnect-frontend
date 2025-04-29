import NextAuth from "next-auth";
import type { NextAuthConfig } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import axios from "axios";
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
  emailVerified: Date | null;
}

interface CustomJWT extends JWT {
  accessToken?: string;
  user?: UserProfile;
}

interface LoginResponse {
  access_token: string;
  user: Omit<UserProfile, "accessToken" | "emailVerified">;
}

if (!process.env.AUTH_SECRET) {
  throw new Error("AUTH_SECRET is not defined");
}
else {
  console.log("AUTH_SECRET is defined");
}

export const authConfig = {
  providers: [
    Credentials({
      async authorize(credentials) {
        console.log("Authorize called with credentials:", credentials);
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Email et mot de passe requis");
        }

        try {
          console.log("Attempting API call to login endpoint");
          const response = await axios.post<LoginResponse>(
            "https://agriconnect-bc17856a61b8.herokuapp.com/auth/login",
            {
              email: credentials.email,
              password: credentials.password,
            },
            {
              headers: {
                accept: "application/json",
                "Content-Type": "application/json",
              },
            }
          );

          console.log("API response status:", response.status);
          if (response.status === 201) {
            const { user, access_token } = response.data;
            const authenticatedUser: UserProfile = {
              ...user,
              accessToken: access_token,
              emailVerified: new Date(),
            };
            console.log("Authenticated user:", authenticatedUser);
            return authenticatedUser;
          }
          throw new Error("Erreur inattendue lors de la connexion");
        } catch (err: any) {
          console.error("Erreur lors de l'authentification:", err.response?.data || err.message);
          throw new Error(err.response?.data?.message || "Identifiants invalides");
        }
      },
    }),
  ],
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 jours
  },
  callbacks: {
    async jwt({ token, user }) {
      console.log("JWT callback called, user:", user, "token:", token);
      if (user) {
        token.accessToken = (user as UserProfile).accessToken;
        token.user = user as UserProfile;
      }
      return token;
    },
    async session({ session, token }) {
      console.log("Session callback called, token:", token, "session:", session);
      if (token.accessToken) {
        session.accessToken = token.accessToken;
      }
      if (token.user) {
        session.user = token.user as UserProfile;
      }
      return session;
    },
    async redirect({ url, baseUrl }) {
      console.log("Redirect callback called, url:", url, "baseUrl:", baseUrl);
      if (url.startsWith("/")) {
        return `${baseUrl}${url}`;
      } else if (new URL(url).origin === baseUrl) {
        return url;
      }
      return baseUrl;
    },
  },
  pages: {
    signIn: "/auth/login",
    error: "/auth/error",
  },
  secret: process.env.AUTH_SECRET,
  debug: true,
} satisfies NextAuthConfig;

export const { handlers, auth, signIn, signOut } = NextAuth(authConfig);