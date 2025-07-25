import React, { useEffect, useState } from "react";
import { Bar, Doughnut, Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  LineElement,
  PointElement,
} from "chart.js";
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  ShoppingCart,
  Package,
  Calendar,
  Download,
  Filter,
} from "lucide-react";
import { useSalesStore } from "../store/sales.store";
import { getTotalSales, getSalesByTimeframe } from "../services/api";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  LineElement,
  PointElement
);

interface TimeframeSales {
  totalAmount: number;
  totalQuantity: number;
  totalOrders: number;
}

interface ProductSales {
  productId: string;
  totalQuantity: number;
  totalAmount: number;
  totalOrders: number;
  product: {
    name: string;
    price: number;
    category: string;
  };
}

const Reports: React.FC = () => {
  const [productSales, setProductSales] = useState<ProductSales[]>([]);
  const [dailySales, setDailySales] = useState<TimeframeSales>(
    {} as TimeframeSales
  );
  const [weeklySales, setWeeklySales] = useState<TimeframeSales>(
    {} as TimeframeSales
  );
  const [monthlySales, setMonthlySales] = useState<TimeframeSales>(
    {} as TimeframeSales
  );
  const [loading, setLoading] = useState(true);
  const [selectedTimeframe, setSelectedTimeframe] = useState<
    "daily" | "weekly" | "monthly"
  >("weekly");
  const [error, setError] = useState<string | null>(null);

  // Use the sales store
  const {
    totalSales,
    salesByTimeframe,
    fetchTotalSales,
    fetchSalesByTimeframe,
  } = useSalesStore();

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    setLoading(true);
    setError(null);
    try {
      // Use sales store methods
      await fetchTotalSales();

      // Fetch timeframe data using store methods
      await Promise.all([
        fetchSalesByTimeframe("daily"),
        fetchSalesByTimeframe("weekly"),
        fetchSalesByTimeframe("monthly"),
      ]);

      // Also fetch product sales data directly since store doesn't handle it yet
      const prodRes = await getTotalSales();
      setProductSales(prodRes.data || []);

      // Fetch timeframe data for state
      const [dailyRes, weeklyRes, monthlyRes] = await Promise.all([
        getSalesByTimeframe("daily"),
        getSalesByTimeframe("weekly"),
        getSalesByTimeframe("monthly"),
      ]);

      setDailySales(dailyRes.data || {});
      setWeeklySales(weeklyRes.data || {});
      setMonthlySales(monthlyRes.data || {});
    } catch (err: any) {
      console.error("Error fetching data:", err);
      setError("Failed to load reports data. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const getCurrentTimeframeData = (): TimeframeSales => {
    switch (selectedTimeframe) {
      case "daily":
        return dailySales;
      case "weekly":
        return weeklySales;
      case "monthly":
        return monthlySales;
      default:
        return weeklySales;
    }
  };

  // Chart configurations
  const productSalesBarData = {
    labels: productSales.map((p) => p.product?.name || "Unknown"),
    datasets: [
      {
        label: "Revenue (KSH)",
        data: productSales.map((p) => p.totalAmount),
        backgroundColor: "rgba(251, 146, 60, 0.8)",
        borderColor: "rgba(251, 146, 60, 1)",
        borderWidth: 1,
        borderRadius: 8,
      },
    ],
  };

  const productQuantityDoughnutData = {
    labels: productSales.map((p) => p.product?.name || "Unknown"),
    datasets: [
      {
        label: "Quantity Sold",
        data: productSales.map((p) => p.totalQuantity),
        backgroundColor: [
          "#f59e0b",
          "#ef4444",
          "#10b981",
          "#3b82f6",
          "#8b5cf6",
          "#f97316",
          "#06b6d4",
          "#84cc16",
        ],
        borderWidth: 2,
        borderColor: "#ffffff",
      },
    ],
  };

  const timeComparisonData = {
    labels: ["Daily", "Weekly", "Monthly"],
    datasets: [
      {
        label: "Revenue (KSH)",
        data: [
          dailySales.totalAmount || 0,
          weeklySales.totalAmount || 0,
          monthlySales.totalAmount || 0,
        ],
        fill: false,
        borderColor: "rgb(251, 146, 60)",
        backgroundColor: "rgba(251, 146, 60, 0.2)",
        tension: 0.4,
      },
      {
        label: "Orders",
        data: [
          dailySales.totalOrders || 0,
          weeklySales.totalOrders || 0,
          monthlySales.totalOrders || 0,
        ],
        fill: false,
        borderColor: "rgb(59, 130, 246)",
        backgroundColor: "rgba(59, 130, 246, 0.2)",
        tension: 0.4,
        yAxisID: "y1",
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: "top" as const,
      },
    },
    scales: {
      y: {
        type: "linear" as const,
        display: true,
        position: "left" as const,
      },
      y1: {
        type: "linear" as const,
        display: true,
        position: "right" as const,
        grid: {
          drawOnChartArea: false,
        },
      },
    },
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-amber-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600 mx-auto mb-4"></div>
          <p className="text-amber-700">Loading reports...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-amber-50 flex items-center justify-center">
        <div className="text-center">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md">
            <h3 className="text-red-800 font-semibold mb-2">
              Error Loading Reports
            </h3>
            <p className="text-red-600 mb-4">{error}</p>
            <button
              onClick={fetchAllData}
              className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  const currentData = getCurrentTimeframeData();

  return (
    <div className="min-h-screen bg-amber-50">
      <div className="max-w-7xl mx-auto p-4 sm:p-6">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 sm:gap-6 mb-6 sm:mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-amber-800 mb-2 flex items-center gap-2 sm:gap-3">
              <TrendingUp className="h-6 w-6 sm:h-8 sm:w-8 lg:h-10 lg:w-10" />
              Sales Reports
            </h1>
            <p className="text-amber-600 text-sm sm:text-base lg:text-lg">
              Comprehensive overview of your bakery's performance
            </p>
          </div>

          <div className="flex flex-col sm:flex-row flex-wrap gap-3">
            {/* Timeframe Selector */}
            <div className="flex bg-white rounded-lg p-1 shadow-sm">
              {(["daily", "weekly", "monthly"] as const).map((timeframe) => (
                <button
                  key={timeframe}
                  onClick={() => setSelectedTimeframe(timeframe)}
                  className={`px-3 sm:px-4 py-2 rounded-md font-medium capitalize transition-colors text-sm ${
                    selectedTimeframe === timeframe
                      ? "bg-amber-600 text-white"
                      : "text-amber-700 hover:bg-amber-50"
                  }`}
                >
                  {timeframe}
                </button>
              ))}
            </div>

            {/* Export Button */}
            <button className="flex items-center justify-center gap-2 bg-white px-3 sm:px-4 py-2 rounded-lg shadow-sm border border-amber-200 text-amber-700 hover:bg-amber-50 text-sm">
              <Download className="h-4 w-4" />
              <span className="hidden sm:inline">Export</span>
            </button>
          </div>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          <div className="bg-white rounded-xl shadow-sm p-6 border border-amber-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">
                  {selectedTimeframe.charAt(0).toUpperCase() +
                    selectedTimeframe.slice(1)}{" "}
                  Revenue
                </p>
                <p className="text-3xl font-bold text-amber-600">
                  KSH {currentData.totalAmount?.toLocaleString() || 0}
                </p>
              </div>
              <div className="p-3 bg-amber-100 rounded-full">
                <DollarSign className="h-6 w-6 text-amber-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border border-green-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">
                  Items Sold
                </p>
                <p className="text-3xl font-bold text-green-600">
                  {currentData.totalQuantity?.toLocaleString() || 0}
                </p>
              </div>
              <div className="p-3 bg-green-100 rounded-full">
                <Package className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border border-blue-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">
                  Total Orders
                </p>
                <p className="text-3xl font-bold text-blue-600">
                  {currentData.totalOrders?.toLocaleString() || 0}
                </p>
              </div>
              <div className="p-3 bg-blue-100 rounded-full">
                <ShoppingCart className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border border-purple-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">
                  Avg. Order Value
                </p>
                <p className="text-3xl font-bold text-purple-600">
                  KSH{" "}
                  {currentData.totalOrders
                    ? (
                        currentData.totalAmount / currentData.totalOrders
                      ).toFixed(0)
                    : "0"}
                </p>
              </div>
              <div className="p-3 bg-purple-100 rounded-full">
                <TrendingUp className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 sm:gap-8 mb-8 sm:mb-10">
          {/* Product Sales Bar Chart */}
          <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6 border border-gray-100">
            <div className="flex items-center justify-between mb-4 sm:mb-6">
              <h2 className="text-lg sm:text-xl font-bold text-gray-800">
                Revenue by Product
              </h2>
              <Filter className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
            </div>
            <div className="h-64 sm:h-80">
              <Bar
                data={productSalesBarData}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: { legend: { display: false } },
                }}
              />
            </div>
          </div>

          {/* Product Quantity Distribution */}
          <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6 border border-gray-100">
            <h2 className="text-xl font-bold text-gray-800 mb-6">
              Quantity Distribution
            </h2>
            <div className="h-80 flex items-center justify-center">
              <Doughnut
                data={productQuantityDoughnutData}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: {
                      position: "bottom",
                      labels: { boxWidth: 12, padding: 15 },
                    },
                  },
                }}
              />
            </div>
          </div>
        </div>

        {/* Time Comparison Chart */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 mb-10">
          <h2 className="text-xl font-bold text-gray-800 mb-6">
            Performance Comparison
          </h2>
          <div className="h-80">
            <Line
              data={timeComparisonData}
              options={{
                ...chartOptions,
                responsive: true,
                maintainAspectRatio: false,
              }}
            />
          </div>
        </div>

        {/* Product Performance Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-4 sm:p-6 border-b border-gray-100">
            <h2 className="text-lg sm:text-xl font-bold text-gray-800">
              Product Performance
            </h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[600px]">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Product
                  </th>
                  <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden sm:table-cell">
                    Category
                  </th>
                  <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Quantity Sold
                  </th>
                  <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Revenue
                  </th>
                  <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">
                    Orders
                  </th>
                  <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden lg:table-cell">
                    Avg. per Order
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {productSales.map((product) => (
                  <tr key={product.productId} className="hover:bg-gray-50">
                    <td className="px-3 sm:px-6 py-4 whitespace-nowrap">
                      <div className="font-medium text-gray-900 text-sm">
                        {product.product?.name || "Unknown"}
                      </div>
                      {/* Mobile category display */}
                      <div className="sm:hidden mt-1">
                        <span className="px-2 py-1 text-xs font-medium bg-amber-100 text-amber-800 rounded-full">
                          {product.product?.category || "N/A"}
                        </span>
                      </div>
                    </td>
                    <td className="px-3 sm:px-6 py-4 whitespace-nowrap hidden sm:table-cell">
                      <span className="px-2 py-1 text-xs font-medium bg-amber-100 text-amber-800 rounded-full">
                        {product.product?.category || "N/A"}
                      </span>
                    </td>
                    <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-gray-900 text-sm">
                      {product.totalQuantity.toLocaleString()}
                    </td>
                    <td className="px-3 sm:px-6 py-4 whitespace-nowrap font-medium text-gray-900 text-sm">
                      KSH {product.totalAmount.toLocaleString()}
                    </td>
                    <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-gray-900 text-sm hidden md:table-cell">
                      {product.totalOrders}
                    </td>
                    <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-gray-900 text-sm hidden lg:table-cell">
                      {product.totalOrders > 0
                        ? (product.totalQuantity / product.totalOrders).toFixed(
                            1
                          )
                        : "0"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Reports;
