import React, { useState } from "react";
import {
  Minus,
  Plus,
  Trash2,
  ShoppingBag,
  CreditCard,
  Banknote,
  Smartphone,
} from "lucide-react";
import { Button } from "./Button";
import { useCartStore } from "../store/cart.store";
import type { PaymentMethod } from "../types";

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

  const handleQuantityChange = (productId: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      removeFromCart(productId);
    } else {
      updateQuantity(productId, newQuantity);
    }
  };

  const paymentOptions = [
    { method: "cash" as PaymentMethod, label: "Cash", icon: Banknote },
    { method: "card" as PaymentMethod, label: "Card", icon: CreditCard },
    { method: "mpesa" as PaymentMethod, label: "M-Pesa", icon: Smartphone },
  ];

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 space-y-6 h-fit sticky top-6 min-w-[350px]">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-gray-200">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-amber-100 rounded-lg">
            <ShoppingBag className="h-5 w-5 text-amber-600" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-800">Shopping Cart</h2>
            <p className="text-sm text-gray-500">{items.length} items</p>
          </div>
        </div>
        {items.length > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearCart}
            className="text-red-600 hover:text-red-700 hover:bg-red-50"
          >
            <Trash2 className="h-4 w-4 mr-1" />
            Clear All
          </Button>
        )}
      </div>

      {/* Cart Items */}
      {items.length === 0 ? (
        <div className="text-center py-12">
          <div className="p-4 bg-gray-100 rounded-full w-20 h-20 mx-auto mb-4 flex items-center justify-center">
            <ShoppingBag className="h-10 w-10 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-700 mb-2">
            Your cart is empty
          </h3>
          <p className="text-sm text-gray-500">
            Browse products and add them to get started
          </p>
        </div>
      ) : (
        <>
          {/* Items List */}
          <div className="space-y-4 max-h-80 overflow-y-auto pr-2">
            {items.map((item) => (
              <div
                key={item.product.id}
                className="bg-gray-50 rounded-lg p-4 hover:bg-gray-100 transition-colors"
              >
                <div className="flex items-start gap-4">
                  {/* Product Image */}
                  {item.product.image && (
                    <div className="flex-shrink-0">
                      <img
                        src={item.product.image}
                        alt={item.product.name}
                        className="w-16 h-16 object-cover rounded-lg border border-gray-200"
                      />
                    </div>
                  )}

                  {/* Product Info */}
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-gray-800 mb-1 line-clamp-2">
                      {item.product.name}
                    </h4>
                    <p className="text-sm text-gray-600 mb-3">
                      ${item.product.price.toFixed(2)} each
                    </p>

                    {/* Quantity Controls */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3 bg-white rounded-lg border border-gray-200 p-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() =>
                            handleQuantityChange(
                              item.product.id,
                              item.quantity - 1
                            )
                          }
                          className="w-8 h-8 p-0 hover:bg-gray-100"
                        >
                          <Minus className="h-4 w-4" />
                        </Button>

                        <span className="font-semibold text-gray-800 min-w-[2rem] text-center">
                          {item.quantity}
                        </span>

                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() =>
                            handleQuantityChange(
                              item.product.id,
                              item.quantity + 1
                            )
                          }
                          className="w-8 h-8 p-0 hover:bg-gray-100"
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>

                      {/* Subtotal and Remove */}
                      <div className="flex items-center gap-3">
                        <span className="font-bold text-amber-600 text-lg">
                          ${(item.product.price * item.quantity).toFixed(2)}
                        </span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeFromCart(item.product.id)}
                          className="w-8 h-8 p-0 text-red-500 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Payment Method */}
          <div className="border-t border-gray-200 pt-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              Payment Method
            </h3>
            <div className="grid grid-cols-1 gap-3">
              {paymentOptions.map(({ method, label, icon: Icon }) => (
                <button
                  key={method}
                  onClick={() => setPaymentMethod(method)}
                  className={`flex items-center gap-3 p-3 border-2 rounded-lg transition-all ${
                    paymentMethod === method
                      ? "border-amber-500 bg-amber-50 text-amber-700"
                      : "border-gray-200 hover:border-gray-300 text-gray-700"
                  }`}
                >
                  <Icon className="h-5 w-5" />
                  <span className="font-medium">{label}</span>
                  {paymentMethod === method && (
                    <div className="ml-auto w-2 h-2 bg-amber-500 rounded-full"></div>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Total and Checkout */}
          <div className="border-t border-gray-200 pt-6">
            <div className="space-y-3 mb-6">
              <div className="flex justify-between text-gray-600">
                <span>Subtotal ({items.length} items)</span>
                <span>${totalAmount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center text-xl font-bold text-gray-800">
                <span>Total</span>
                <span className="text-amber-600">
                  ${totalAmount.toFixed(2)}
                </span>
              </div>
            </div>

            <Button
              className={`w-full py-4 text-lg font-semibold transition-all ${
                paymentMethod
                  ? "bg-amber-500 hover:bg-amber-600 text-white"
                  : "bg-gray-300 text-gray-500 cursor-not-allowed"
              }`}
              disabled={!paymentMethod}
            >
              {paymentMethod ? "Complete Checkout" : "Select Payment Method"}
            </Button>
          </div>
        </>
      )}
    </div>
  );
};

export default Cart;
