import React, { useState } from "react";
import { CreditCard, Printer, Send } from "lucide-react";
import { useCartStore } from "../store/cart.store";
import { useOrderStore } from "../store/order.store";
import { Button } from "./Button";

const Checkout = () => {
    const {items, paymentMethod, clearCart} = useCartStore();
    const {makeOrder} = useOrderStore();
    const [isProcessing, setIsProcessing] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleCheckout = async () => {
        setIsProcessing(true);
        setError(null);
        try {
            await makeOrder(items, paymentMethod);
            clearCart();
        } catch (err) {
            setError("Failed to process order. Please try again.");
        } finally {
            setIsProcessing(false);
        }
    };
    return (
        <div className="p-4 bg-white rounded shadow-md">
            <h2 className="text-lg font-semibold mb-4">Checkout</h2>
            {items.length === 0 ? (
                <p className="text-gray-500">Your cart is empty.</p>
            ) : (
                <>
                    <ul className="mb-4">
                        {items.map((item, index) => (
                            <li key={index} className="flex justify-between mb-2">
                                <span>{item.product.name}</span>
                                <span>${item.product.price.toFixed(2)}</span>
                            </li>
                        ))}
                    </ul>
                    <div className="flex items-center justify-between mb-4">
                        <span>Total:</span>
                        <span>${items.reduce((total, item) => total + item.product.price, 0).toFixed(2)}</span>
                    </div>
                    {error && <p className="text-red-500 mb-4">{error}</p>}
                    <Button
                        onClick={handleCheckout}
                        disabled={isProcessing}
                        className="w-full"
                    >
                        {isProcessing ? "Processing..." : "Complete Order"}
                    </Button>
                </>
            )}
        </div>
    );
}

export default Checkout;