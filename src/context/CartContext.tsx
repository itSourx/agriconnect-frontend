import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { useSession } from 'next-auth/react';

interface CartItem {
  id: string;
  fields: {
    Name: string;
    price: number;
    mesure: string;
    quantity: number;
  };
  quantity: number;
}

interface CartContextType {
  cart: CartItem[];
  addToCart: (product: any) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  removeFromCart: (productId: string) => void;
  clearCart: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const { data: session } = useSession();
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isHydrated, setIsHydrated] = useState(false);

  // Charger le panier depuis le localStorage après l'hydratation
  useEffect(() => {
    if (session?.user?.email) {
      const savedCart = localStorage.getItem(`cart_${session.user.email}`);
      if (savedCart) {
        setCart(JSON.parse(savedCart));
      }
    } else {
      // Si pas d'utilisateur connecté, vider le panier
      setCart([]);
    }
    setIsHydrated(true);
  }, [session?.user?.email]);

  // Sauvegarder le panier dans le localStorage à chaque modification
  useEffect(() => {
    if (isHydrated && session?.user?.email) {
      localStorage.setItem(`cart_${session.user.email}`, JSON.stringify(cart));
    }
  }, [cart, isHydrated, session?.user?.email]);

  const addToCart = (product: any) => {
    if (!session?.user?.email) {
      return;
    }
    const existingItem = cart.find(item => item.id === product.id);
    if (existingItem) {
      setCart(cart.map(item => 
        item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
      ));
    } else {
      setCart([...cart, { ...product, quantity: 1 }]);
    }
  };

  const updateQuantity = (productId: string, quantity: number) => {
    setCart(cart.map(item => 
      item.id === productId ? { ...item, quantity: Math.max(1, quantity) } : item
    ));
  };

  const removeFromCart = (productId: string) => {
    setCart(cart.filter(item => item.id !== productId));
  };

  const clearCart = () => {
    setCart([]);
  };

  // Ne rendre le contenu qu'après l'hydratation
  if (!isHydrated) {
    return null;
  }

  return (
    <CartContext.Provider value={{ cart, addToCart, updateQuantity, removeFromCart, clearCart }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};