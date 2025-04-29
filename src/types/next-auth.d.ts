import NextAuth from 'next-auth';

declare module 'next-auth' {
  interface Session {
    accessToken?: string;
    user?: {
      id: string;
      FirstName: string;
      LastName: string;
      email: string;
      Phone: string | null;
      Address: string | null;
      Photo: string | null;
      profileType: string;
      products: string[];
    };
  }

  interface User {
    id: string;
    FirstName: string;
    LastName: string;
    email: string;
    Phone: string | null;
    Address: string | null;
    Photo: string | null;
    profileType: string;
    products: string[];
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    accessToken?: string;
    user?: {
      id: string;
      FirstName: string;
      LastName: string;
      email: string;
      Phone: string | null;
      Address: string | null;
      Photo: string | null;
      profileType: string;
      products: string[];
    };
  }
} 