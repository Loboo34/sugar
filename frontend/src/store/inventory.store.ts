import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Item } from "../types";
import {
  addStoreItem,
  deleteStoreItem,
  getStoreItem,
  getStoreItems,
  updateStoreItem,
  updateStoreItemQuantity,
  transferStoreItem,
} from "../services/api";

interface InventoryStore {
  items: Item[];
  isLoading: boolean;
  addItem: (item: Item) => Promise<void>;
  updateItem: (id: string, updatedItem: Item) => Promise<void>;
  updateQuantity: (id: string, quantity: number) => Promise<void>;
  removeItem: (id: string) => void;
  fetchItems: () => Promise<void>;
  fetchItem: (id: string) => Promise<Item | null>;
  transferItem: (id: string, transferData: { quantity: number; destination: string }) => Promise<void>;
}

export const useInventoryStore = create<InventoryStore>()(
  persist(
    (set) => ({
      items: [],
      isLoading: false,
      addItem: async (item: Item) => {
        try {
          set({ isLoading: true });
          await addStoreItem(item);
          set((state) => ({
            items: [...state.items, item],
            isLoading: false,
          }));
        } catch (error) {
          console.error("Error adding item:", error);
          set({ isLoading: false });
        }
      },
      updateItem: async (id: string, updatedItem: Item) => {
        try {
          set({ isLoading: true });
          await updateStoreItem(id, updatedItem);
          set((state) => ({
            items: state.items.map((i) =>
              i.id === id ? { ...i, ...updatedItem } : i
            ),
            isLoading: false,
          }));
        } catch (error) {
          console.error("Error updating item:", error);
          set({ isLoading: false });
        }
      },
      updateQuantity: async (id: string, quantity: number) => {
        try {
          set({ isLoading: true });
          await updateStoreItemQuantity(id, quantity);
          set((state) => ({
            items: state.items.map((item) =>
              item.id === id ? { ...item, quantity } : item
            ),
            isLoading: false,
          }));
        } catch (error) {
          console.error("Error updating item quantity:", error);
          set({ isLoading: false });
        }
      },
      removeItem: async (id: string) => {
        const response = await deleteStoreItem(id);
        if (response.error) {
          console.error("Error deleting item:", response.error);
          return;
        }
        set((state) => ({
          items: state.items.filter((item) => item.id !== id),
        }));
      },
      fetchItems: async () => {
        try {
          set({ isLoading: true });
          const response = await getStoreItems();
          //  set({ items: response.data || [], isLoading: false });
          const mapped = response.map((item: any) => ({
            ...item,
            id: item._id, 
          }));
          set({ items: mapped, isLoading: false });
        } catch (error) {
          console.error("Error fetching items:", error);
          set({ isLoading: false });
        }
      },
      fetchItem: async (id: string) => {
        try {
          set({ isLoading: true });
          const item = await getStoreItem(id);
          set({ isLoading: false });
          return item;
        } catch (error) {
          console.error("Error fetching item:", error);
          set({ isLoading: false });
          return null;
        }
      },
      transferItem: async (id: string, transferData: { quantity: number; destination: string }) => {
        try {
          set({ isLoading: true });
          await transferStoreItem(id, transferData);
          set({ isLoading: false });
        } catch (error) {
          console.error("Error transferring item:", error);
          set({ isLoading: false });
        }
      },
    }),

    { name: "inventory-store" }
  )
);
