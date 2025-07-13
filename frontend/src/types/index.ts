export interface Product {
    id: string;
    name: string;
    description: string;
    price: number;
    imageUrl: string;
    category: string;
    inStock: boolean;
}

export interface Item {
    id: string;
    name: string;
    quantity: number;
    unit: string;
}

export interface Order {
    id: string;
    products: [
        {
            productId: string;
            quantity: number;
        }
    ];
    totalAmount: number;
    paymentMethod: "cash" | "Mpesa";
}

export interface User{
    id: string;
    name: string;
    email: string;
    role: "admin" | "user"; 
}

export interface CartItem {
    productId: string;
    quantity: number;
    subtotal: number;
}

