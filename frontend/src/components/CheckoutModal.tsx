import React, { useState, useEffect } from "react";
import {
  X,
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

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const CheckoutModal: React.FC<CheckoutModalProps> = ({ isOpen, onClose }) => {
  const { items, paymentMethod, clearCart, totalAmount } = useCartStore();
  const { makeOrder } = useOrderStore();
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const { user } = useAuthStore();
  const userId = user?._id || user?.id;
  console.log("user:", userId);

  // Reset state when modal opens
  useEffect(() => {
    if (isOpen) {
      setError(null);
      setSuccess(false);
      setIsProcessing(false);
    }
  }, [isOpen]);

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
        onClose();
      }, 2500);
    } catch (error: unknown) {
      setError("Failed to process order. Please try again.");
        console.error("Order processing error:", error);
    } finally {
      setIsProcessing(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black bg-opacity-50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-2xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-hidden animate-slideUp">
        {success ? (
          // Success State
          <div className="p-8 text-center">
            <div className="mx-auto flex items-center justify-center w-24 h-24 bg-green-100 rounded-2xl mb-6">
              <CheckCircle className="w-12 h-12 text-green-600" />
            </div>
            <h3 className="text-3xl font-bold text-gray-900 mb-4">
              Order Completed!
            </h3>
            <p className="text-gray-600 text-lg mb-6">
              Your order has been processed successfully
            </p>
            <div className="w-full bg-green-100 rounded-full h-2">
              <div className="bg-green-600 h-2 rounded-full animate-pulse"></div>
            </div>
            <p className="text-sm text-green-600 mt-2">Redirecting...</p>
          </div>
        ) : (
          <>
            {/* Header */}
            <div className="flex items-center justify-between p-6 bg-green-50 border-b border-green-100">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 rounded-xl">
                  <Receipt className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">
                    Complete Your Order
                  </h2>
                  <p className="text-gray-600">
                    Review your order and confirm payment
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-green-100 rounded-xl transition-colors"
              >
                <X className="h-6 w-6 text-gray-500" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 max-h-96 overflow-y-auto custom-scroll">
              {/* Order Items */}
              <div className="space-y-4 mb-8">
                <h3 className="font-semibold text-gray-800 text-xl mb-4">
                  Order Summary
                </h3>
                <div className="space-y-3">
                  {items.map((item, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between py-4 px-5 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
                    >
                      <div className="flex items-center gap-4">
                        {item.product.image && (
                          <img
                            src={item.product.image}
                            alt={item.product.name}
                            className="w-16 h-16 object-cover rounded-xl border border-gray-200"
                          />
                        )}
                        <div>
                          <p className="font-semibold text-gray-900 text-lg">
                            {item.product.name}
                          </p>
                          <p className="text-gray-600">
                            ${item.product.price.toFixed(2)} × {item.quantity}
                          </p>
                        </div>
                      </div>
                      <span className="font-bold text-gray-900 text-xl">
                        ${(item.product.price * item.quantity).toFixed(2)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Payment Method Display */}
              {paymentMethod && (
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-5 mb-6">
                  <div className="flex items-center gap-3">
                    <CreditCard className="h-6 w-6 text-blue-600" />
                    <div>
                      <p className="font-semibold text-blue-800 text-lg">
                        {paymentMethod === "Mpesa"
                          ? "M-Pesa Mobile Payment"
                          : "Cash Payment"}
                      </p>
                      <p className="text-blue-600 text-sm">
                        {paymentMethod === "Mpesa"
                          ? "You will receive a payment prompt on your phone"
                          : "Payment will be collected upon delivery"}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Total Section */}
              <div className="border-t border-gray-200 pt-6 mb-6">
                <div className="space-y-3 mb-4">
                  <div className="flex justify-between text-gray-600 text-lg">
                    <span>Subtotal ({items.length} items)</span>
                    <span>${totalAmount.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-gray-600 text-lg">
                    <span>Delivery Fee</span>
                    <span className="text-green-600">Free</span>
                  </div>
                </div>
                <div className="flex justify-between items-center text-3xl font-bold border-t border-gray-200 pt-4">
                  <span className="text-gray-900">Total</span>
                  <span className="text-green-600">
                    ${totalAmount.toFixed(2)}
                  </span>
                </div>
              </div>

              {/* Error Display */}
              {error && (
                <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-xl mb-6">
                  <AlertCircle className="h-6 w-6 text-red-600 flex-shrink-0" />
                  <p className="text-red-800 font-medium">{error}</p>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-6 bg-gray-50 border-t border-gray-200">
              <div className="flex gap-4">
                <Button
                  variant="outline"
                  onClick={onClose}
                  className="flex-1 py-4 text-lg font-semibold border-2 border-gray-300 text-gray-700 hover:bg-gray-100 rounded-xl"
                  disabled={isProcessing}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleCheckout}
                  disabled={isProcessing || !paymentMethod}
                  className={`flex-2 py-4 text-lg font-bold rounded-xl transition-all ${
                    isProcessing
                      ? "bg-gray-400 text-white cursor-not-allowed"
                      : "bg-green-600 hover:bg-green-700 text-white shadow-lg hover:shadow-xl transform hover:-translate-y-1"
                  }`}
                >
                  {isProcessing ? (
                    <div className="flex items-center justify-center gap-3">
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Processing Order...
                    </div>
                  ) : (
                    <div className="flex items-center justify-center gap-3">
                      <Send className="w-6 h-6" />
                      Confirm & Pay ${totalAmount.toFixed(2)}
                    </div>
                  )}
                </Button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default CheckoutModal;
