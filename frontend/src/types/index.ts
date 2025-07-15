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
    name: string;
    quantity: number;
    unit: string;
    stock: number;
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

