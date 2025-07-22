import React, { useState } from "react";
import {
  CreditCard,
  Send,
  CheckCircle,
  AlertCircle,
  Receipt,
} from "lucide-react";
import { useCartStore } from "../store/cart.store";
import { useOrderStore } from "../store/order.store";
import { Button } from "./Button";
import { useAuthStore } from "../store/auth.store";

const Checkout = () => {
  const { items, paymentMethod, clearCart, totalAmount } = useCartStore();
  const { makeOrder } = useOrderStore();
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const { user } = useAuthStore();
  const userId = user?.id;

  const handleCheckout = async () => {
    if (!paymentMethod) {
      setError("Please select a payment method");
      return;
    }

    if (!userId) {
      setError("User not authenticated");
      return;
    }

    setIsProcessing(true);
    setError(null);
    setSuccess(false);

    try {
      const orderData = {
        products: items.map((item) => ({
          productId: item.product.id,
          quantity: item.quantity,
        })),
        paymentMethod: paymentMethod,
        user: userId,
        totalAmount: totalAmount,
      };
      await makeOrder(orderData);
      setSuccess(true);
      setTimeout(() => {
        clearCart();
        setSuccess(false);
      }, 2500);
    } catch (error: any) {
      setError("Failed to process order. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  if (success) {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-green-200 p-8">
        <div className="text-center">
          <div className="mx-auto flex items-center justify-center w-20 h-20 bg-green-100 rounded-2xl mb-6">
            <CheckCircle className="w-10 h-10 text-green-600" />
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-3">
            Order Completed!
          </h3>
          <p className="text-gray-600 text-lg">
            Your order has been processed successfully
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="p-6 bg-green-50 border-b border-green-100">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-green-100 rounded-xl">
            <Receipt className="h-6 w-6 text-green-600" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900">Order Summary</h2>
            <p className="text-gray-600">Review and complete your order</p>
          </div>
        </div>
      </div>

      <div className="p-6">
        {/* Order Items - Simplified */}
        <div className="space-y-4 mb-8">
          <h3 className="font-semibold text-gray-800 text-lg">Order Details</h3>
          <div className="space-y-3 max-h-48 overflow-y-auto custom-scroll">
            {items.map((item, index) => (
              <div
                key={index}
                className="flex items-center justify-between py-3 px-4 bg-gray-50 rounded-xl"
              >
                <div className="flex items-center gap-3">
                  {item.product.image && (
                    <img
                      src={item.product.image}
                      alt={item.product.name}
                      className="w-12 h-12 object-cover rounded-lg"
                    />
                  )}
                  <div>
                    <p className="font-medium text-gray-900">
                      {item.product.name}
                    </p>
                    <p className="text-gray-600 text-sm">
                      ${item.product.price.toFixed(2)} × {item.quantity}
                    </p>
                  </div>
                </div>
                <span className="font-bold text-gray-900 text-lg">
                  ${(item.product.price * item.quantity).toFixed(2)}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Payment Method Display */}
        {paymentMethod && (
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
            <div className="flex items-center gap-3">
              <CreditCard className="h-5 w-5 text-blue-600" />
              <span className="font-medium text-blue-800">
                Payment Method: {paymentMethod === "Mpesa" ? "M-Pesa" : "Cash"}
              </span>
            </div>
          </div>
        )}

        {/* Total Section */}
        <div className="border-t border-gray-200 pt-6 mb-6">
          <div className="flex justify-between items-center text-2xl font-bold">
            <span className="text-gray-900">Total Amount</span>
            <span className="text-green-600">${totalAmount.toFixed(2)}</span>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-xl mb-6">
            <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0" />
            <p className="text-red-800 font-medium">{error}</p>
          </div>
        )}

        {/* Checkout Button */}
        <Button
          onClick={handleCheckout}
          disabled={isProcessing || !paymentMethod}
          className={`w-full py-5 text-lg font-bold rounded-xl transition-all ${
            isProcessing
              ? "bg-gray-400 text-white cursor-not-allowed"
              : !paymentMethod
              ? "bg-gray-300 text-gray-500 cursor-not-allowed"
              : "bg-green-600 hover:bg-green-700 text-white shadow-lg hover:shadow-xl transform hover:-translate-y-1"
          }`}
        >
          {isProcessing ? (
            <div className="flex items-center justify-center gap-3">
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              Processing Order...
            </div>
          ) : !paymentMethod ? (
            "Select Payment Method First"
          ) : (
            <div className="flex items-center justify-center gap-3">
              <Send className="w-6 h-6" />
              Complete Order - ${totalAmount.toFixed(2)}
            </div>
          )}
        </Button>
      </div>
    </div>
  );
};

export default Checkout;
