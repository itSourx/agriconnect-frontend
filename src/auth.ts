import NextAuth from "next-auth";
import type { NextAuthConfig } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import axios from 'axios'
import { JWT } from "next-auth/jwt";
import { User } from "next-auth";

interface UserProfile extends User {
  id: string;
  FirstName: string;
  LastName: string;
  email: string;
  Phone: string | null; // Phone can be null
  Address: string | null;
  accessToken?: string;
  Photo: string | null; // Photo can be null
  profileType: string;
  products: string[];
}

interface CustomJWT extends JWT {
  accessToken?: string;
  user?: UserProfile;
}

interface LoginResponse {
  access_token: string; // Changed to match the API response
  user: Omit<UserProfile, "accessToken">; // use the omit utility to avoid a duplicated accessToken
}

export const config = {
  providers: [
    Credentials({
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        try {
          const response = await axios.post<LoginResponse>('https://agriconnect-bc17856a61b8.herokuapp.com/auth/login', {
            email: credentials.email,
            password: credentials.password,
          });

          if (response.status === 201) {
            const { user, access_token } = response.data; // Changed access_token here
            // Add accessToken to the user object
            const authenticatedUser : UserProfile = {
              ...user,
              accessToken : access_token
            } as UserProfile;
            return authenticatedUser;
          }
          return null;
        } catch (err: any) {
          
            console.error("An unexpected error occurred:", err);
        
          return null;
        }

      },
    }),
  ],
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
         (token as CustomJWT).accessToken = (user as UserProfile).accessToken;
         (token as CustomJWT).user = {
          ...user,
          
        } as UserProfile;
      }
      return token as CustomJWT;
    },

    async session({ session, token }) {
        // Make sure the access token exists before assigning it
      if ((token as CustomJWT).accessToken) {
        (session as any).accessToken = (token as CustomJWT).accessToken;
      }
      if ((token as CustomJWT).user) {
        (session as any).user = (token as CustomJWT).user;
      }
      return session;
    },
    
},

    pages: {
    signIn: '/auth/login',
    },

} satisfies NextAuthConfig;

export const { handlers, auth, signIn, signOut } = NextAuth(config);
