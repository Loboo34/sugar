import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { CartItem, PaymentMethod } from "../types";

interface CartStore {
  items: CartItem[];
  totalAmount: number;
  addToCart: (item: CartItem) => void;
  removeFromCart: (productId: string) => void;
  clearCart: () => void;
  paymentMethod?: PaymentMethod;

  updateQuantity: (productId: string, quantity: number) => void;
  setPaymentMethod: (method: PaymentMethod) => void;
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      totalAmount: 0,
      addToCart: (item) => {
        const existing = get().items.find(
          (i) => i.product.id === item.product.id
        );
        let newItems;
        if (existing) {
          newItems = get().items.map((i) =>
            i.product.id === item.product.id
              ? { ...i, quantity: i.quantity + item.quantity }
              : i
          );
        } else {
          newItems = [...get().items, item];
        }
        set({
          items: newItems,
          totalAmount: newItems.reduce(
            (sum, i) => sum + i.product.price * i.quantity,
            0
          ),
        });
      },
      removeFromCart: (productId) => {
        const newItems = get().items.filter((i) => i.product.id !== productId);
        set({
          items: newItems,
          totalAmount: newItems.reduce(
            (sum, i) => sum + i.product.price * i.quantity,
            0
          ),
        });
      },
      clearCart: () => set({ items: [], totalAmount: 0 }),
      updateQuantity: (productId, quantity) => {
        if (quantity <= 0) {
          // Remove item if quantity is 0 or less
          const newItems = get().items.filter(
            (i) => i.product.id !== productId
          );
          set({
            items: newItems,
            totalAmount: newItems.reduce(
              (sum, i) => sum + i.product.price * i.quantity,
              0
            ),
          });
        } else {
          const newItems = get().items.map((i) =>
            i.product.id === productId ? { ...i, quantity } : i
          );
          set({
            items: newItems,
            totalAmount: newItems.reduce(
              (sum, i) => sum + i.product.price * i.quantity,
              0
            ),
          });
        }
      },
      setPaymentMethod: (method) => set({ paymentMethod: method }),
    }),
    {
      name: "cart-store",
    }
  )
);
