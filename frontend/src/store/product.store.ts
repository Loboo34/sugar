import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Product } from "../types";
import {
  addProduct,
  deleteProduct,
  getProduct,
  getProducts,
  updateProduct,
  updateProductStock,
} from "../services/api";

interface ProductStore {
  products: Product[];
  isLoading: boolean; // Fixed: was "flase"
  createProduct: (product: FormData) => Promise<void>; // Fixed: should be async
  update_product: (id: string, updatedProduct: FormData) => Promise<void>; // Fixed: should be async
  updateStock: (id: string, stock: number) => Promise<void>;
  removeProduct: (id: string) => void;
  fetchProducts: () => Promise<void>;
  fetchProduct: (id: string) => Promise<Product | null>;
}

export const useProductStore = create<ProductStore>()(
  persist(
    (set) => ({
      // Added get parameter
      products: [],
      isLoading: false, // Added missing implementation
      createProduct: async (product: FormData) => {
        try {
          set({ isLoading: true });
          const response = await addProduct(product);
          set((state) => ({
            products: [...state.products, response.product],
            isLoading: false,
          }));
        } catch (error) {
          console.error("Error creating product:", error);
          set({ isLoading: false });
        }
      },
      update_product: async (id: string, updatedProduct: FormData) => {
        try {
          set({ isLoading: true });
          const product = await updateProduct(id, updatedProduct);
          if (product) {
            set((state) => ({
              products: state.products.map((p) =>
                p.id === id ? { ...p, ...updatedProduct } : p
              ),
              isLoading: false,
            }));
          } else {
            set({ isLoading: false });
          }
        } catch (error) {
          console.error("Error updating product:", error);
          set({ isLoading: false });
        }
      },
      updateStock: async (id: string, stock: number) => {
        try {
          set({ isLoading: true });
          await updateProductStock(id, stock);
          set((state) => ({
            products: state.products.map((p) =>
              p.id === id ? { ...p, stock } : p
            ),
            isLoading: false,
          }));
        } catch (error) {
          console.error("Error updating stock:", error);
          set({ isLoading: false });
          throw error;
        }
      },
      removeProduct: async (id: string) => {
        try {
          await deleteProduct(id);
          set((state) => ({
            products: state.products.filter((product) => product.id !== id),
          }));
        } catch (error) {
          console.error("Error removing product:", error);
        }
      },
      fetchProducts: async () => {
        try {
          set({ isLoading: true });
          const products = await getProducts();
          
          const mapped = products.map((p: any) => ({
            ...p,
            id: p._id || p.id,
          }));
          console.log("data:", mapped);
          set({ products: mapped, isLoading: false });
        } catch (error) {
          console.error("Error fetching products:", error);
          set({ isLoading: false });
        }
      },
      fetchProduct: async (id: string) => {
        try {
          set({ isLoading: true });
          const product = await getProduct(id);
          if (product) {
            set((state) => ({
              products: state.products.map((p) => (p.id === id ? product : p)),
              isLoading: false,
            }));
            return product;
          }
          set({ isLoading: false });
          return null;
        } catch (error) {
          console.error("Error fetching product:", error);
          set({ isLoading: false });
          return null;
        }
      },
    }),
    {
      name: "product-store",
    }
  )
);
