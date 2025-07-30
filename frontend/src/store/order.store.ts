import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Order } from "../types";
import {
  createOrder,
  deleteOrder,
  getOrder,
  getOrders,
  updateOrder,
  getPaidOrders,
} from "../services/api";
type Neworder = {
  products: { product: string; quantity: number }[];
  paymentMethod: "cash" | "Mpesa";
  user: string;
  totalAmount: number;
  phoneNumber?: string;
};
interface OrderStore {
  orders: Order[];
  paidOrders: Order[];
  isLoading: boolean;
  makeOrder: (
    order: Neworder
  ) => Promise<{ success: boolean; data: Order } | null>;
  fetchOrders: () => Promise<void>;
  fetchPaidOrders: () => Promise<void>;
  fetchOrder: (id: string) => Promise<Order | null>;
  updateOrder: (id: string, order: Order) => Promise<void>;
  removeOrder: (id: string) => Promise<void>;
}

export const useOrderStore = create<OrderStore>()(
  persist(
    (set) => ({
      orders: [],
      paidOrders: [],
      isLoading: false,
      makeOrder: async (order: Neworder) => {
        try {
          set({ isLoading: true });
          const newOrder = await createOrder(order);
          set((state) => ({
            orders: [...state.orders, newOrder],
            isLoading: false,
          }));
          return newOrder;
        } catch (error) {
          console.error("Error creating order:", error);
          set({ isLoading: false });
          return null;
        }
      },
      fetchOrders: async () => {
        try {
          set({ isLoading: true });
          const orders = await getOrders();
          set({ orders, isLoading: false });
        } catch (error) {
          console.error("Error fetching orders:", error);
          set({ isLoading: false });
        }
      },
      fetchPaidOrders: async () => {
        try {
          set({ isLoading: true });
          const response = await getPaidOrders();
          set({ paidOrders: response.data, isLoading: false });
        } catch (error) {
          console.error("Error fetching paid orders:", error);
          set({ isLoading: false });
        }
      },
      fetchOrder: async (id: string) => {
        try {
          set({ isLoading: true });
          const order = await getOrder(id);
          set({ isLoading: false });
          return order;
        } catch (error) {
          console.error("Error fetching order:", error);
          set({ isLoading: false });
          return null;
        }
      },
      updateOrder: async (id: string, order: Order) => {
        set({ isLoading: true });
        try {
          const update = await updateOrder(id, order);
          set((state) => ({
            orders: state.orders.map((o) => (o.id === id ? update : o)),
            isLoading: false,
          }));
        } catch (error) {
          console.error("Error updating order:", error);
          set({ isLoading: false });
        }
      },
      removeOrder: async (id: string) => {
        set({ isLoading: true });
        try {
          const removed = await deleteOrder(id);
          set((state) => ({
            orders: state.orders.filter((o) => o.id !== id),
            isLoading: false,
          }));
          return removed;
        } catch (error) {
          console.error("Error removing order:", error);
          set({ isLoading: false });
        }
      },
    }),
    {
      name: "order-store", // Name for persistence
    }
  )
);
