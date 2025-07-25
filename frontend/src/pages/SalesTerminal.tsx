import Cart from "../components/Cart";
import ProductGrid from "../components/ProductGrid";
import { useCartStore } from "../store/cart.store";
import { ShoppingCart, Package, TrendingUp } from "lucide-react";

const SalesTerminal = () => {
  const { items, totalAmount } = useCartStore();
  const hasItems = items.length > 0;
  const itemCount = items.reduce((total, item) => total + item.quantity, 0);

  return (
    <div className="min-h-screen bg-amber-50">
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Header Section  */}
        <div className="mb-12">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-8">
            <div>
              <h1 className="text-5xl font-bold text-amber-800 mb-4 flex items-center gap-4">
                <div className="p-3 bg-amber-600 rounded-2xl">
                  <Package className="h-10 w-10 text-white" />
                </div>
                Sales Terminal
              </h1>
              <p className="text-xl text-amber-600 max-w-2xl">
                Select products to build your order. Changes are saved
                automatically.
              </p>
            </div>

            {/* Stats Cards */}
            <div className="flex flex-col sm:flex-row gap-6">
              <div className="bg-white rounded-2xl shadow-sm p-6 border border-amber-200 min-w-[160px]">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-amber-50 rounded-xl">
                    <ShoppingCart className="h-6 w-6 text-amber-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-amber-600 mb-1">
                      Cart Items
                    </p>
                    <p className="text-3xl font-bold text-amber-800">
                      {itemCount}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl shadow-sm p-6 border border-amber-200 min-w-[160px]">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-amber-50 rounded-xl">
                    <TrendingUp className="h-6 w-6 text-amber-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-amber-600 mb-1">
                      Total
                    </p>
                    <p className="text-3xl font-bold text-amber-800">
                      ${totalAmount.toFixed(2)}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          {/* Products Section */}
          <div className="xl:col-span-2">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="p-8 bg-gradient-to-r from-blue-600 to-indigo-600">
                <h2 className="text-2xl font-bold text-white mb-2">
                  Available Products
                </h2>
                <p className="text-blue-100">
                  Click any product to add it to your cart
                </p>
              </div>
              <div className="p-8">
                <ProductGrid />
              </div>
            </div>
          </div>

          {/* Sidebar  */}
          <div className="xl:col-span-1">
            <div className="space-y-8 sticky top-8">
              <Cart />

              {!hasItems && (
                <div className="bg-white rounded-2xl shadow-sm p-12 text-center border border-gray-200">
                  <div className="p-6 bg-gray-50 rounded-2xl w-24 h-24 mx-auto mb-6 flex items-center justify-center">
                    <ShoppingCart className="h-12 w-12 text-gray-400" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-800 mb-3">
                    Ready to Start?
                  </h3>
                  <p className="text-gray-600">
                    Browse our products and add items to your cart to continue
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SalesTerminal;
