export interface Order {
  id: string;
  createdTime: string;
  fields: {
    buyerFirstName?: string[];
    buyerLastName?: string[];
    buyerEmail?: string[];
    buyerPhone?: string[];
    buyerAddress?: string[];
    farmerFirstName?: (string | undefined)[];
    farmerLastName?: (string | undefined)[];
    farmerEmail?: string[];
    farmerPhone?: string[];
    farmerAddress?: string[];
    productName?: (string | undefined)[];
    totalPrice: number;
    Status: 'pending' | 'confirmed' | 'delivered';
    productImage?: string[];
    farmerId?: (string | undefined)[];
    products?: {
      productId: string;
      name: string;
      quantity: number;
      price: number;
      total: number;
      unit?: string;
    }[];
  };
}

export interface User {
  id: string;
  email: string;
  FirstName?: string;
  LastName?: string;
  Address?: string;
  Phone?: string;
  ifu?: string;
  raisonSociale?: string;
  accessToken?: string;
}

export interface Session {
  user: User;
  accessToken?: string;
} 