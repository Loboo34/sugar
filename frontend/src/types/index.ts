export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  category: string;
  stock: number;
}

export interface Item {
  id: string;
  itemName: string;
  quantity: number;
  unit: string;
}

export interface Order {
  id: string;
  user: string;
  products: {
    product: Product;
    quantity: number;
  }[];
  totalAmount: number;
  paymentMethod: "cash" | "Mpesa";
  paymentStatus: "pending" | "paid" | "failed" | "cancelled" | "timeout";
  phoneNumber?: string;
  mpesaCheckoutRequestID?: string;
  mpesaReceiptNumber?: string;
  createdAt: string;
  resultDesc?: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: "admin" | "user";
}

export interface CartItem {
  product: Product;
  quantity: number;
  subtotal: number;
}
export type PaymentMethod = "cash" | "Mpesa";
