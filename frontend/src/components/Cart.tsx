import React, { useState } from "react";
import {
  Minus,
  Plus,
  Trash2,
  ShoppingBag,
  Banknote,
  Smartphone,
  CreditCard,
} from "lucide-react";
import { Button } from "./Button";
import { useCartStore } from "../store/cart.store";
import type { PaymentMethod } from "../types";
import CheckoutModal from "./CheckoutModal";

const Cart = () => {
  const {
    items,
    removeFromCart,
    clearCart,
    updateQuantity,
    paymentMethod,
    setPaymentMethod,
    totalAmount,
  } = useCartStore();

  const [showCheckout, setShowCheckout] = useState(false);

  const handleQuantityChange = (productId: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      removeFromCart(productId);
    } else {
      updateQuantity(productId, newQuantity);
    }
  };

  const paymentOptions = [
    { method: "cash" as PaymentMethod, label: "Cash Payment", icon: Banknote },
    {
      method: "Mpesa" as PaymentMethod,
      label: "M-Pesa Mobile",
      icon: Smartphone,
    },
  ];

  const handleProceedToPayment = () => {
    setShowCheckout(true);
  };

  return (
    <>
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        {/* Header - More Space */}
        <div className="p-6 bg-amber-50 border-b border-amber-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-amber-100 rounded-xl">
                <ShoppingBag className="h-6 w-6 text-amber-600" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-amber-800">
                  Shopping Cart
                </h2>
                <p className="text-sm text-amber-600">
                  {items.length} items selected
                </p>
              </div>
            </div>
            {items.length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearCart}
                className="text-red-500 hover:text-red-700 hover:bg-red-50"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Clear All
              </Button>
            )}
          </div>
        </div>

        <div className="p-6">
          {items.length === 0 ? (
            <div className="text-center py-16">
              <div className="p-4 bg-gray-100 rounded-2xl w-20 h-20 mx-auto mb-6 flex items-center justify-center">
                <ShoppingBag className="h-10 w-10 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">
                Cart is Empty
              </h3>
              <p className="text-gray-600">Add some products to get started</p>
            </div>
          ) : (
            <div className="space-y-8">
              {/* Items List - Better Spacing */}
              <div className="space-y-4 max-h-96 overflow-y-auto custom-scroll pr-2">
                {items.map((item) => (
                  <div
                    key={item.product.id}
                    className="bg-gray-50 rounded-xl p-5 hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex items-start gap-4">
                      {/* Product Image with Quantity Controls */}
                      {item.product.image && (
                        <div className="flex-shrink-0">
                          <img
                            src={item.product.image}
                            alt={item.product.name}
                            className="w-20 h-20 object-cover rounded-xl border border-gray-200"
                          />
                          {/* Quantity Controls Below Image */}
                          <div className="mt-3">
                            <div className="flex items-center gap-2 bg-white rounded-xl border border-gray-300 p-1">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() =>
                                  handleQuantityChange(
                                    item.product.id,
                                    item.quantity - 1
                                  )
                                }
                                className="w-8 h-8 p-0 hover:bg-gray-100 rounded-lg"
                              >
                                <Minus className="h-3 w-3" />
                              </Button>

                              {/* Number Input for Quantity */}
                              <input
                                type="number"
                                min={1}
                                max={item.product.stock}
                                value={item.quantity}
                                onChange={(e) => {
                                  const val = Number(e.target.value);
                                  if (val > 0 && val <= item.product.stock) {
                                    handleQuantityChange(item.product.id, val);
                                  }
                                }}
                                className="w-14 text-center font-bold text-sm text-gray-900 border border-gray-200 rounded-lg px-2 py-1 focus:outline-none focus:ring-2 focus:ring-amber-500"
                              />

                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() =>
                                  handleQuantityChange(
                                    item.product.id,
                                    item.quantity + 1
                                  )
                                }
                                className="w-8 h-8 p-0 hover:bg-gray-100 rounded-lg"
                                disabled={item.quantity >= item.product.stock}
                              >
                                <Plus className="h-3 w-3" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Product Info */}
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-gray-900 mb-2 text-lg leading-tight">
                          {item.product.name}
                        </h4>
                        <p className="text-gray-600 mb-4">
                          ${item.product.price.toFixed(2)} each
                        </p>

                        {/* Subtotal and Remove */}
                        <div className="flex items-center justify-between">
                          <div className="text-left">
                            <div className="font-bold text-amber-600 text-xl">
                              ${(item.product.price * item.quantity).toFixed(2)}
                            </div>
                            <div className="text-sm text-gray-500 mt-1">
                              {item.quantity} × ${item.product.price.toFixed(2)}{" "}
                              each
                            </div>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeFromCart(item.product.id)}
                            className="w-10 h-10 p-0 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Payment Method - Cleaner */}
              <div className="border-t border-gray-200 pt-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Choose Payment Method
                </h3>
                <div className="space-y-3">
                  {paymentOptions.map(({ method, label, icon: Icon }) => (
                    <button
                      key={method}
                      onClick={() => setPaymentMethod(method)}
                      className={`w-full flex items-center gap-4 p-4 border-2 rounded-xl transition-all font-medium ${
                        paymentMethod === method
                          ? "border-amber-500 bg-amber-50 text-amber-700"
                          : "border-gray-200 hover:border-gray-300 text-gray-700 hover:bg-gray-50"
                      }`}
                    >
                      <Icon className="h-6 w-6" />
                      <span className="flex-1 text-left">{label}</span>
                      {paymentMethod === method && (
                        <div className="w-3 h-3 bg-amber-500 rounded-full"></div>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Total - Bigger and Cleaner */}
              <div className="border-t border-gray-200 pt-6">
                <div className="space-y-4 mb-6">
                  <div className="flex justify-between text-gray-600 text-lg">
                    <span>Subtotal ({items.length} items)</span>
                    <span>${totalAmount.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between items-center text-2xl font-bold text-gray-900">
                    <span>Total Amount</span>
                    <span className="text-amber-600">
                      ${totalAmount.toFixed(2)}
                    </span>
                  </div>
                </div>

                {/* Proceed to Payment Button */}
                <Button
                  onClick={handleProceedToPayment}
                  disabled={!paymentMethod}
                  className={`w-full py-5 text-lg font-bold rounded-xl transition-all ${
                    !paymentMethod
                      ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                      : "bg-amber-600 hover:bg-amber-700 text-white shadow-lg hover:shadow-xl transform hover:-translate-y-1"
                  }`}
                >
                  {!paymentMethod ? (
                    "Select Payment Method First"
                  ) : (
                    <div className="flex items-center justify-center gap-3">
                      <CreditCard className="w-6 h-6" />
                      Proceed to Payment - ${totalAmount.toFixed(2)}
                    </div>
                  )}
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Checkout Modal */}
      <CheckoutModal
        isOpen={showCheckout}
        onClose={() => setShowCheckout(false)}
      />
    </>
  );
};

export default Cart;
