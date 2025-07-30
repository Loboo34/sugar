import  { useEffect } from "react";
import { useOrderStore } from "../store/order.store";
import { CheckCircle, Calendar, CreditCard, Smartphone } from "lucide-react";

export const PaidOrders = () => {
  const { paidOrders, isLoading, fetchPaidOrders } = useOrderStore();

  useEffect(() => {
    fetchPaidOrders();
  }, [fetchPaidOrders]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-KE", {
      style: "currency",
      currency: "KES",
    }).format(amount);
  };

  const getPaymentIcon = (method: string) => {
    return method === "Mpesa" ? (
      <Smartphone className="h-4 w-4" />
    ) : (
      <CreditCard className="h-4 w-4" />
    );
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600"></div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center gap-2 mb-6">
        <CheckCircle className="h-6 w-6 text-green-600" />
        <h2 className="text-xl font-semibold text-gray-800">Paid Orders</h2>
        <span className="bg-green-100 text-green-800 text-sm font-medium px-2.5 py-0.5 rounded-full">
          {paidOrders.length} orders
        </span>
      </div>

      {paidOrders.length === 0 ? (
        <div className="text-center py-8">
          <CheckCircle className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">No paid orders found</p>
        </div>
      ) : (
        <div className="space-y-4">
          {paidOrders.map((order) => (
            <div
              key={order.id}
              className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
            >
              <div className="flex justify-between items-start mb-3">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-gray-600">
                    Order #{order.id?.slice(-8)}
                  </span>
                  <div className="flex items-center gap-1 text-sm text-gray-500">
                    {getPaymentIcon(order.paymentMethod)}
                    <span>{order.paymentMethod}</span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-lg font-semibold text-gray-900">
                    {formatCurrency(order.totalAmount)}
                  </div>
                  <div className="flex items-center gap-1 text-sm text-gray-500">
                    <Calendar className="h-3 w-3" />
                    {formatDate(order.createdAt)}
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <div className="text-sm text-gray-600 font-medium">
                  Products:
                </div>
                {order.products.map((item, index) => (
                  <div
                    key={index}
                    className="flex justify-between text-sm text-gray-600 ml-4"
                  >
                    <span>
                      {item.product?.name || "Unknown Product"} x{" "}
                      {item.quantity}
                    </span>
                    <span>
                      {formatCurrency(
                        (item.product?.price || 0) * item.quantity
                      )}
                    </span>
                  </div>
                ))}
              </div>

              {order.phoneNumber && order.paymentMethod === "Mpesa" && (
                <div className="mt-3 flex items-center gap-2 text-sm">
                  <Smartphone className="h-4 w-4 text-blue-600" />
                  <span className="text-gray-600">
                    M-Pesa Phone:{" "}
                    <span className="font-medium text-gray-900">
                      {order.phoneNumber}
                    </span>
                  </span>
                </div>
              )}

              {order.phoneNumber && order.paymentMethod === "cash" && (
                <div className="mt-3 text-sm text-gray-500">
                  Phone: {order.phoneNumber}
                </div>
              )}

              {order.mpesaReceiptNumber && (
                <div className="mt-2 text-sm text-green-600 font-medium">
                  M-Pesa Receipt: {order.mpesaReceiptNumber}
                </div>
              )}

              <div className="mt-3 flex items-center gap-2">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Paid
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default PaidOrders;
