import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Item } from "../types";
import { addStoreItem, getStoreItem, getStoreItems, updateStoreItem } from "../services/api";

interface InventoryStore {
    items: Item[];
    isLoading: boolean;
    addItem: (item: Item) => Promise<void>;
    updateItem: (id: string, updatedItem: Item) => Promise<void>;
    removeItem: (id: string) => void;
    fetchItems: () => Promise<void>;
    fetchItem: (id: string) => Promise<Item | null>;
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
            removeItem: (id: string) => {
                set((state) => ({
                    items: state.items.filter((item) => item.id !== id),
                }));
            },
            fetchItems: async () => {
                try {
                    set({ isLoading: true });
                    const items = await getStoreItems();
                    set({ items, isLoading: false });
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
        }),
        { name: "inventory-store" }
    )
);