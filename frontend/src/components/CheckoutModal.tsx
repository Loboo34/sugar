import React, { useState, useEffect } from "react";
import {
  X,
  CreditCard,
  Send,
  CheckCircle,
  AlertCircle,
  Receipt,
  Phone,
  Smartphone,
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
  const [phoneInput, setPhoneInput] = useState("");
  const [phoneError, setPhoneError] = useState<string | null>(null);
  const { user } = useAuthStore();
  const userId = user?._id || user?.id;
  const [paymentStatus, setPaymentStatus] = useState<
    "idle" | "processing" | "waiting" | "success" | "failed"
  >("idle");
  const [mpesaOrderId, setMpesaOrderId] = useState<string | null>(null);

  
  const formatPhoneNumber = (phone: string): string => {

    const digits = phone.replace(/\D/g, "");

   
    if (digits.startsWith("07")) {
      return "254" + digits.substring(1);
    }
    if (digits.startsWith("254")) {
      return digits;
    }
    if (digits.startsWith("7")) {
      return "254" + digits;
    }

    return digits;
  };


  const validatePhoneNumber = (phone: string): boolean => {
    const formatted = formatPhoneNumber(phone);
    return /^2547\d{8}$/.test(formatted);
  };
  const getFormattedPhoneNumber = (): string => {
    return formatPhoneNumber(phoneInput);
  };

  const handlePhoneInputChange = (value: string) => {
    setPhoneInput(value);
    setPhoneError(null);

    if (value && !validatePhoneNumber(value)) {
      setPhoneError("Please enter a valid phone number (e.g., 0712345678)");
    }
  };

  useEffect(() => {
    if (isOpen) {
      setError(null);
      setSuccess(false);
      setIsProcessing(false);
      setPaymentStatus("idle");
      setMpesaOrderId(null);
      setPhoneInput("");
      setPhoneError(null);
    }
  }, [isOpen]);

  useEffect(() => {
    let interval: number;

    if (paymentStatus === "waiting" && mpesaOrderId) {
      interval = setInterval(async () => {
        try {
          
          const response = await fetch(
            `${import.meta.env.VITE_API_URL}/api/v1/orders/${mpesaOrderId}`,
            {
              headers: {
                Authorization: `Bearer ${getAuthToken()}`, 
              },
            }
          );
          const orderData = await response.json();

          if (orderData.success && orderData.data.paymentStatus === "paid") {
            setPaymentStatus("success");
            setSuccess(true);
            setTimeout(() => {
              clearCart();
              setSuccess(false);
              setPaymentStatus("idle");
              onClose();
            }, 3000);
          } else if (orderData.data.paymentStatus === "failed") {
            setPaymentStatus("failed");
            setError("Payment failed. Please try again.");
          }
        } catch (error) {
          console.error("Error checking payment status:", error);
        }
      }, 3000); // Check every 3 seconds
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [paymentStatus, mpesaOrderId]);

  // Helper to get auth token
  const getAuthToken = () => {
    const authStorage = localStorage.getItem("auth-storage");
    if (authStorage) {
      const { state } = JSON.parse(authStorage);
      return state.token;
    }
    return null;
  };

  const handleCheckout = async () => {
    if (!paymentMethod) {
      setError("Please select a payment method");
      return;
    }

    if (!userId) {
      setError("User not authenticated");
      return;
    }

    
    if (paymentMethod === "Mpesa") {
      if (!phoneInput) {
        setError("Phone number is required for M-Pesa payment");
        return;
      }
      if (!validatePhoneNumber(phoneInput)) {
        setError("Please enter a valid phone number (e.g., 0712345678)");
        return;
      }
    }

    setIsProcessing(true);
    setPaymentStatus("processing");
    setError(null);

    try {
      const orderData = {
        products: items.map((item) => ({
          product: item.product.id,
          quantity: item.quantity,
        })),
        paymentMethod: paymentMethod,
        user: userId,
        totalAmount: totalAmount,
        ...(paymentMethod === "Mpesa" && {
          phoneNumber: getFormattedPhoneNumber(),
        }),
      };

      const response = await makeOrder(orderData);

      if (paymentMethod === "Mpesa") {
        // For M-Pesa, wait for payment confirmation
        setPaymentStatus("waiting");
      setMpesaOrderId(response?.id || response?._id);
        setIsProcessing(false);
      } else {
        // For cash, complete immediately
        setPaymentStatus("success");
        setSuccess(true);
        setTimeout(() => {
          clearCart();
          setSuccess(false);
          setPaymentStatus("idle");
          onClose();
        }, 2500);
      }
    } catch (error: unknown) {
      setPaymentStatus("failed");
      setError("Failed to process order. Please try again.");
      console.error("Order processing error:", error);
      setIsProcessing(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black bg-opacity-50 backdrop-blur-sm"
        onClick={() => {
          if (paymentStatus !== "waiting") {
            onClose();
          }
        }}
      />

      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-2xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-hidden animate-slideUp">
        {/* M-Pesa Waiting State */}
        {paymentStatus === "waiting" ? (
          <div className="p-8 text-center">
            <div className="mx-auto flex items-center justify-center w-24 h-24 bg-orange-100 rounded-2xl mb-6">
              <Smartphone className="w-12 h-12 text-orange-600 animate-pulse" />
            </div>
            <h3 className="text-3xl font-bold text-gray-900 mb-4">
              Waiting for M-Pesa Payment
            </h3>
            <p className="text-gray-600 text-lg mb-6">
              Please check your phone for the M-Pesa prompt and complete the
              payment
            </p>

            {/* Phone number display */}
            <div className="bg-orange-50 border border-orange-200 rounded-xl p-4 mb-6 mx-auto max-w-sm">
              <p className="text-orange-800 font-medium">Payment sent to:</p>
              <p className="text-2xl font-bold text-orange-600">
                {getFormattedPhoneNumber()}
              </p>
            </div>

            {/* Amount display */}
            <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 mb-6 mx-auto max-w-sm">
              <p className="text-gray-600">Amount to pay:</p>
              <p className="text-3xl font-bold text-gray-900">
                ${totalAmount.toFixed(2)}
              </p>
            </div>

            {/* Loading animation */}
            <div className="flex items-center justify-center gap-2 mb-6">
              <div
                className="w-3 h-3 bg-orange-500 rounded-full animate-bounce"
                style={{ animationDelay: "0ms" }}
              ></div>
              <div
                className="w-3 h-3 bg-orange-500 rounded-full animate-bounce"
                style={{ animationDelay: "150ms" }}
              ></div>
              <div
                className="w-3 h-3 bg-orange-500 rounded-full animate-bounce"
                style={{ animationDelay: "300ms" }}
              ></div>
            </div>

            <p className="text-sm text-gray-500 mb-6">
              This window will automatically update when payment is received
            </p>

            {/* Cancel button */}
            <Button
              variant="outline"
              onClick={() => {
                setPaymentStatus("idle");
                setMpesaOrderId(null);
                onClose();
              }}
              className="px-8 py-3 text-lg font-semibold border-2 border-gray-300 text-gray-700 hover:bg-gray-100 rounded-xl"
            >
              Cancel & Close
            </Button>
          </div>
        ) : success || paymentStatus === "success" ? (
          // Success State
          <div className="p-8 text-center">
            <div className="mx-auto flex items-center justify-center w-24 h-24 bg-green-100 rounded-2xl mb-6">
              <CheckCircle className="w-12 h-12 text-green-600" />
            </div>
            <h3 className="text-3xl font-bold text-gray-900 mb-4">
              {paymentMethod === "Mpesa"
                ? "Payment Successful!"
                : "Order Completed!"}
            </h3>
            <p className="text-gray-600 text-lg mb-6">
              {paymentMethod === "Mpesa"
                ? "M-Pesa payment received successfully"
                : "Your order has been processed successfully"}
            </p>
            <div className="w-full bg-green-100 rounded-full h-2">
              <div className="bg-green-600 h-2 rounded-full animate-pulse"></div>
            </div>
            <p className="text-sm text-green-600 mt-2">Redirecting...</p>
          </div>
        ) : (
          // Normal checkout form
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
                disabled={isProcessing}
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

              {/* Phone Number Input for M-Pesa */}
              {paymentMethod === "Mpesa" && (
                <div className="bg-orange-50 border border-orange-200 rounded-xl p-5 mb-6">
                  <div className="flex items-center gap-3 mb-4">
                    <Phone className="h-6 w-6 text-orange-600" />
                    <div>
                      <p className="font-semibold text-orange-800 text-lg">
                        Phone Number Required
                      </p>
                      <p className="text-orange-600 text-sm">
                        Enter your M-Pesa registered phone number
                      </p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <input
                      type="tel"
                      value={phoneInput}
                      onChange={(e) => handlePhoneInputChange(e.target.value)}
                      placeholder="e.g., 0712345678"
                      className={`w-full px-4 py-3 border-2 rounded-xl text-lg font-medium transition-colors ${
                        phoneError
                          ? "border-red-300 focus:border-red-500 bg-red-50"
                          : "border-orange-200 focus:border-orange-500 bg-white"
                      } focus:outline-none`}
                    />
                    {phoneError && (
                      <p className="text-red-600 text-sm font-medium flex items-center gap-1">
                        <AlertCircle className="h-4 w-4" />
                        {phoneError}
                      </p>
                    )}
                    {phoneInput && !phoneError && (
                      <p className="text-green-600 text-sm font-medium">
                        ✓ Will be formatted as: {getFormattedPhoneNumber()}
                      </p>
                    )}
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
                  disabled={
                    isProcessing ||
                    !paymentMethod ||
                    (paymentMethod === "Mpesa" && (!phoneInput || !!phoneError))
                  }
                  className={`flex-2 py-4 text-lg font-bold rounded-xl transition-all ${
                    isProcessing ||
                    (paymentMethod === "Mpesa" && (!phoneInput || phoneError))
                      ? "bg-gray-400 text-white cursor-not-allowed"
                      : "bg-green-600 hover:bg-green-700 text-white shadow-lg hover:shadow-xl transform hover:-translate-y-1"
                  }`}
                >
                  {isProcessing ? (
                    <div className="flex items-center justify-center gap-3">
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      {paymentMethod === "Mpesa"
                        ? "Initiating M-Pesa..."
                        : "Processing Order..."}
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
