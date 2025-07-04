import axios from 'axios';

interface LoginResponse {
  access_token: string;
  user: {
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

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Email et mot de passe requis' });
  }

  try {
    const response = await axios.post<LoginResponse>(
      `${process.env.NEXT_PUBLIC_API_URL}/auth/login`,
      {
        email,
        password,
      },
      {
        headers: {
          accept: "application/json",
          "Content-Type": "application/json",
        },
      }
    );

    if (response.status === 201) {
      const { user, access_token } = response.data;
      
      // Return the user data and token
      return res.status(200).json({
        user,
        accessToken: access_token,
      });
    }

    return res.status(response.status).json(response.data);
  } catch (err: any) {
    console.error('Login API error:', err.response?.data || err.message);
    
    // Return the exact error from the backend
    const status = err.response?.status || 500;
    const message = err.response?.data?.message || err.message || 'Erreur lors de la connexion';
    
    return res.status(status).json({ message });
  }
} 