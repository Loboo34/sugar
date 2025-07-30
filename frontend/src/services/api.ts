import axios from "axios";
import type { Item, Order,  User } from "../types";
const ApiUrl = import.meta.env.VITE_API_URL;
type Neworder = {
  products: { product: string; quantity: number }[];
  paymentMethod: "cash" | "Mpesa";
  user: string;
  totalAmount: number;
  phoneNumber?: string;
};

export const api = axios.create({
  baseURL: ApiUrl,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use((config) => {
  const authStorage = localStorage.getItem("auth-storage");
  if (authStorage) {
    const { state } = JSON.parse(authStorage);
    if (state.token) {
      config.headers.Authorization = `Bearer ${state.token}`;
    }
  }
  return config;
});

//authentication service
export const registerUser = async (userData: User) => {
  try {
    const response = await api.post("/auth/register", userData);
    return response.data;
  } catch (error: unknown) {
    if (axios.isAxiosError(error)) {
      throw error.response?.data || error.message;
    }
    throw error;
  }
};
export const loginUser = async (email: string, password: string) => {
  try {
    const response = await api.post("/auth/login", { email, password });
    return response.data;
  } catch (error: unknown) {
    if (axios.isAxiosError(error)) {
      throw error.response?.data || error.message;
    }
    throw error;
  }
};
export const getUserProfile = async () => {
  try {
    const response = await api.get("/auth/profile");
    return response.data;
  } catch (error: unknown) {
    if (axios.isAxiosError(error)) {
      throw error.response?.data || error.message;
    }
    throw error;
  }
};
export const updateUserProfile = async (userData: User) => {
  try {
    const response = await api.put("/auth/profile", userData);
    return response.data;
  } catch (error: unknown) {
    if (axios.isAxiosError(error)) {
      throw error.response?.data || error.message;
    }
    throw error;
  }
};

//product service
export const getProducts = async () => {
  try {
    const response = await api.get("/products");
    return response.data;
  } catch (error: unknown) {
    if (axios.isAxiosError(error)) {
      throw error.response?.data || error.message;
    }
    throw error;
  }
};
export const getProduct = async (id: string) => {
  try {
    const response = await api.get(`/products/${id}`);
    return response.data;
  } catch (error: unknown) {
    if (axios.isAxiosError(error)) {
      throw error.response?.data || error.message;
    }
    throw error;
  }
};
export const addProduct = async (productData: FormData) => {
  try {
    const response = await api.post("/products", productData, {
      headers: {
        "Content-Type": undefined,
      },
    });

    return response.data;
  } catch (error: unknown) {
    if (axios.isAxiosError(error)) {
      throw error.response?.data || error.message;
    }
    throw error;
  }
};
export const updateProduct = async (id: string, productData: FormData) => {
  try {
    const response = await api.put(`/products/${id}`, productData, {
      headers: {
        "Content-Type": undefined,
      },
    });
    return response.data;
  } catch (error: unknown) {
    if (axios.isAxiosError(error)) {
      throw error.response?.data || error.message;
    }
    throw error;
  }
};

export const updateProductStock = async (id: string, stock: number) => {
  try {
    const response = await api.patch(`/products/${id}/stock`, { stock });
    return response.data;
  } catch (error: unknown) {
    if (axios.isAxiosError(error)) {
      throw error.response?.data || error.message;
    }
    throw error;
  }
};

export const deleteProduct = async (id: string) => {
  try {
    const response = await api.delete(`/products/${id}`);
    return response.data;
  } catch (error: unknown) {
    if (axios.isAxiosError(error)) {
      throw error.response?.data || error.message;
    }
    throw error;
  }
};

//order service
export const getOrders = async () => {
  try {
    const response = await api.get("/orders");
    return response.data;
  } catch (error: unknown) {
    if (axios.isAxiosError(error)) {
      throw error.response?.data || error.message;
    }
    throw error;
  }
};

export const getPaidOrders = async () => {
  try {
    const response = await api.get("/orders/paid");
    return response.data;
  } catch (error: unknown) {
    if (axios.isAxiosError(error)) {
      throw error.response?.data || error.message;
    }
    throw error;
  }
};
export const getOrder = async (id: string) => {
  try {
    const response = await api.get(`/orders/${id}`);
    return response.data;
  } catch (error: unknown) {
    if (axios.isAxiosError(error)) {
      throw error.response?.data || error.message;
    }
    throw error;
  }
};
export const createOrder = async (orderData: Neworder) => {
  try {
    const response = await api.post("/orders", orderData);
    return response.data;
  } catch (error: unknown) {
    if (axios.isAxiosError(error)) {
      throw error.response?.data || error.message;
    }
    throw error;
  }
};
export const updateOrder = async (id: string, orderData: Order) => {
  try {
    const response = await api.put(`/orders/${id}`, orderData);
    return response.data;
  } catch (error: unknown) {
    if (axios.isAxiosError(error)) {
      throw error.response?.data || error.message;
    }
    throw error;
  }
};
export const deleteOrder = async (id: string) => {
  try {
    const response = await api.delete(`/orders/${id}`);
    return response.data;
  } catch (error: unknown) {
    if (axios.isAxiosError(error)) {
      throw error.response?.data || error.message;
    }
    throw error;
  }
};

//store service
export const getStoreItems = async () => {
  try {
    const response = await api.get("/stores");
    console.log("data:", response.data);
    return response.data;
  } catch (error: unknown) {
    if (axios.isAxiosError(error)) {
      throw error.response?.data || error.message;
    }
    throw error;
  }
};
export const getStoreItem = async (id: string) => {
  try {
    const response = await api.get(`/stores/${id}`);
    return response.data;
  } catch (error: unknown) {
    if (axios.isAxiosError(error)) {
      throw error.response?.data || error.message;
    }
    throw error;
  }
};
export const addStoreItem = async (itemData: Item) => {
  try {
    const response = await api.post("/stores/", itemData);
    return response.data;
  } catch (error: unknown) {
    if (axios.isAxiosError(error)) {
      throw error.response?.data || error.message;
    }
    throw error;
  }
};
export const updateStoreItem = async (id: string, itemData: Item) => {
  try {
    const response = await api.put(`/stores/${id}`, itemData);
    return response.data;
  } catch (error: unknown) {
    if (axios.isAxiosError(error)) {
      throw error.response?.data || error.message;
    }
    throw error;
  }
};
export const deleteStoreItem = async (id: string) => {
  try {
    const response = await api.delete(`/stores/${id}`);
    return response.data;
  } catch (error: unknown) {
    if (axios.isAxiosError(error)) {
      throw error.response?.data || error.message;
    }
    throw error;
  }
};

export const updateStoreItemQuantity = async (id: string, quantity: number) => {
  try {
    const response = await api.patch(`/stores/${id}/quantity`, { quantity });
    return response.data;
  } catch (error: unknown) {
    if (axios.isAxiosError(error)) {
      throw error.response?.data || error.message;
    }
    throw error;
  }
};

export const transferStoreItem = async (
  id: string,
  transferData: { quantity: number; destination: string }
) => {
  try {
    const response = await api.post(`/stores/${id}/transfer`, transferData);
    return response.data;
  } catch (error: unknown) {
    if (axios.isAxiosError(error)) {
      throw error.response?.data || error.message;
    }
    throw error;
  }
};

export const getRecentTransfers = async () => {
  try {
    const response = await api.get("/stores/transfers/recent");
    return response.data;
  } catch (error: unknown) {
    if (axios.isAxiosError(error)) {
      throw error.response?.data || error.message;
    }
    throw error;
  }
};

//sales service
export const getExpenses = async () => {
  try {
    const response = await api.get("/sales/expenses");
    return response.data;
  } catch (error: unknown) {
    if (axios.isAxiosError(error)) {
      throw error.response?.data || error.message;
    }
    throw error;
  }
};
export const getTotalSales = async () => {
  try {
    const response = await api.get("/sales/total-sales");
    return response.data;
  } catch (error: unknown) {
    if (axios.isAxiosError(error)) {
      throw error.response?.data || error.message;
    }
    throw error;
  }
};
export const getSalesByTimeframe = async (timeFrame: string) => {
  try {
    const response = await api.get(`/sales/timeframe/${timeFrame}`);
    return response.data;
  } catch (error: unknown) {
    if (axios.isAxiosError(error)) {
      throw error.response?.data || error.message;
    }
    throw error;
  }
};
export const getTotalSalesForProduct = async (productId: string) => {
  try {
    const response = await api.get(`/sales/total-sales/${productId}`);
    return response.data;
  } catch (error: unknown) {
    if (axios.isAxiosError(error)) {
      throw error.response?.data || error.message;
    }
    throw error;
  }
};
