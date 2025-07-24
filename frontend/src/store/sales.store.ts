import {create} from 'zustand';
import {persist} from 'zustand/middleware';
import {getTotalSales, getTotalSalesForProduct, getSalesByTimeframe } from "../services/api";

interface SalesState {
  totalSales: number;
  salesByTimeframe: Record<string, number>;
  salesForProduct: Record<string, number>;
  fetchTotalSales: () => Promise<void>;
  fetchSalesByTimeframe: (timeframe: string) => Promise<void>;
  fetchSalesForProduct: (productId: string) => Promise<void>;
}

export const useSalesStore = create<SalesState>()(
  persist(
    (set) => ({
      totalSales: 0,
      salesByTimeframe: {},
      salesForProduct: {},
      fetchTotalSales: async () => {
        const data = await getTotalSales();
        set({ totalSales: data });
      },
      fetchSalesByTimeframe: async (timeframe: string) => {
        const data = await getSalesByTimeframe(timeframe);
        set({ salesByTimeframe: data });
      },
      fetchSalesForProduct: async (productId: string) => {
        const data = await getTotalSalesForProduct(productId);
        set({ salesForProduct: data });
      },
    }),
    {
      name: "sales-storage",
    }
  )
);