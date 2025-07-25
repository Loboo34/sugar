import React, { useEffect, useState } from "react";
import {
  Package,
  ArrowRight,
  Search,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import { Button } from "../components/Button";
import { useInventoryStore } from "../store/inventory.store";
import { transferStoreItem, getRecentTransfers } from "../services/api";

interface TransferRequest {
  itemId: string;
  quantity: number;
  destination: "kitchen" | "shop";
}

interface RecentTransfer {
  _id: string;
  itemName: string;
  quantity: number;
  unit: string;
  destination: "kitchen" | "shop";
  transferredAt: string;
}

export const Transfer = () => {
  const { items, fetchItems, isLoading } = useInventoryStore();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedItems, setSelectedItems] = useState<TransferRequest[]>([]);
  const [transferring, setTransferring] = useState(false);
  const [transferStatus, setTransferStatus] = useState<{
    success: boolean;
    message: string;
  } | null>(null);
  const [recentTransfers, setRecentTransfers] = useState<RecentTransfer[]>([]);
  const [loadingTransfers, setLoadingTransfers] = useState(false);

  useEffect(() => {
    fetchItems();
    fetchRecentTransfers();
  }, [fetchItems]);

  const fetchRecentTransfers = async () => {
    try {
      setLoadingTransfers(true);
      const response = await getRecentTransfers();
      setRecentTransfers(response.data || []);
    } catch (error) {
      console.error("Error fetching recent transfers:", error);
    } finally {
      setLoadingTransfers(false);
    }
  };

  const filteredItems = items.filter((item) =>
    item.itemName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleQuantityChange = (
    itemId: string,
    quantity: number,
    destination: "kitchen" | "shop"
  ) => {
    setSelectedItems((prev) => {
      const existing = prev.find(
        (item) => item.itemId === itemId && item.destination === destination
      );
      if (existing) {
        if (quantity === 0) {
          return prev.filter(
            (item) =>
              !(item.itemId === itemId && item.destination === destination)
          );
        }
        return prev.map((item) =>
          item.itemId === itemId && item.destination === destination
            ? { ...item, quantity }
            : item
        );
      } else if (quantity > 0) {
        return [...prev, { itemId, quantity, destination }];
      }
      return prev;
    });
  };

  const getSelectedQuantity = (
    itemId: string,
    destination: "kitchen" | "shop"
  ) => {
    const selected = selectedItems.find(
      (item) => item.itemId === itemId && item.destination === destination
    );
    return selected?.quantity || 0;
  };

  const getTotalSelectedForItem = (itemId: string) => {
    return selectedItems
      .filter((item) => item.itemId === itemId)
      .reduce((total, item) => total + item.quantity, 0);
  };

  const handleTransferAll = async () => {
    if (selectedItems.length === 0) return;

    setTransferring(true);
    setTransferStatus(null);

    try {
      const transferPromises = selectedItems.map(
        ({ itemId, quantity, destination }) =>
          transferStoreItem(itemId, { quantity, destination })
      );

      await Promise.all(transferPromises);

      setTransferStatus({
        success: true,
        message: `Successfully transferred ${selectedItems.length} item(s)`,
      });

      
      setSelectedItems([]);
      await fetchItems();
    } catch (error) {
      console.error("Transfer error:", error);
      setTransferStatus({
        success: false,
        message: "Failed to complete transfers. Please try again.",
      });
    } finally {
      setTransferring(false);
    }
  };

  const clearAllSelections = () => {
    setSelectedItems([]);
  };

  const getTotalItems = () => selectedItems.length;
  const getTotalQuantity = () =>
    selectedItems.reduce((total, item) => total + item.quantity, 0);

  return (
    <div className="min-h-screen bg-amber-50">
      <div className="max-w-7xl mx-auto p-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-amber-800 mb-2">
            Transfer Items
          </h1>
          <p className="text-amber-600">
            Transfer items from store to kitchen or shop
          </p>
        </div>

        {/* Status Messages */}
        {transferStatus && (
          <div
            className={`mb-6 p-4 rounded-lg flex items-center gap-3 ${
              transferStatus.success
                ? "bg-green-50 border border-green-200 text-green-700"
                : "bg-red-50 border border-red-200 text-red-700"
            }`}
          >
            {transferStatus.success ? (
              <CheckCircle className="h-5 w-5" />
            ) : (
              <AlertCircle className="h-5 w-5" />
            )}
            <span>{transferStatus.message}</span>
          </div>
        )}

        {/* Search and Summary */}
        <div className="mb-6 bg-white rounded-lg shadow-sm p-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <input
                type="text"
                placeholder="Search items..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            {/* Transfer Summary */}
            {selectedItems.length > 0 && (
              <div className="flex items-center gap-4">
                <div className="text-sm text-gray-600">
                  <span className="font-medium">{getTotalItems()}</span>{" "}
                  selections,
                  <span className="font-medium ml-1">
                    {getTotalQuantity()}
                  </span>{" "}
                  total quantity
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={clearAllSelections}
                    className="text-gray-600 border-gray-300 hover:bg-gray-50"
                  >
                    Clear All
                  </Button>
                  <Button
                    size="sm"
                    onClick={handleTransferAll}
                    disabled={transferring}
                    className="bg-amber-600 hover:bg-amber-700 text-white"
                  >
                    {transferring ? "Transferring..." : "Transfer All"}
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Items Table */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-amber-50 border-b border-amber-200 sticky top-0">
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-medium text-amber-800 uppercase tracking-wider">
                    Item
                  </th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-amber-800 uppercase tracking-wider">
                    Available
                  </th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-amber-800 uppercase tracking-wider">
                    Unit
                  </th>
                  <th className="px-3 py-2 text-center text-xs font-medium text-amber-800 uppercase tracking-wider">
                    To Kitchen
                  </th>
                  <th className="px-3 py-2 text-center text-xs font-medium text-amber-800 uppercase tracking-wider">
                    To Shop
                  </th>
                </tr>
              </thead>
            </table>
          </div>
          <div className="max-h-[400px] overflow-y-auto">
            <table className="w-full">
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredItems.map((item) => {
                  const totalSelected = getTotalSelectedForItem(item.id);
                  const remainingQuantity = item.quantity - totalSelected;
                  const kitchenSelected = getSelectedQuantity(
                    item.id,
                    "kitchen"
                  );
                  const shopSelected = getSelectedQuantity(item.id, "shop");

                  // Transfer handler for one item/destination
                  const handleSingleTransfer = async (
                    destination: "kitchen" | "shop"
                  ) => {
                    const quantity =
                      destination === "kitchen"
                        ? kitchenSelected
                        : shopSelected;
                    if (!quantity || quantity > item.quantity) return;
                    setTransferring(true);
                    setTransferStatus(null);
                    try {
                      await transferStoreItem(item.id, {
                        quantity,
                        destination,
                      });
                      setTransferStatus({
                        success: true,
                        message: `Transferred ${quantity} ${item.unit} of ${item.itemName} to ${destination}`,
                      });
                      // Clear selection for this item/destination
                      handleQuantityChange(item.id, 0, destination);
                      await fetchItems();
                      await fetchRecentTransfers();
                    } catch (error) {
                      console.error("Transfer error:", error);
                      setTransferStatus({
                        success: false,
                        message: "Transfer failed. Please try again.",
                      });
                    } finally {
                      setTransferring(false);
                    }
                  };

                  return (
                    <tr key={item.id} className="hover:bg-gray-50">
                      <td className="px-4 py-2">
                        <div className="flex items-center gap-2">
                          <Package className="h-4 w-4 text-amber-600 flex-shrink-0" />
                          <span className="font-medium text-sm truncate">
                            {item.itemName}
                          </span>
                        </div>
                      </td>
                      <td className="px-3 py-2">
                        <span
                          className={`text-sm font-medium ${
                            remainingQuantity <= 5
                              ? "text-red-600"
                              : "text-gray-900"
                          }`}
                        >
                          {remainingQuantity}
                        </span>
                      </td>
                      <td className="px-3 py-2">
                        <span className="text-sm text-gray-500">
                          {item.unit}
                        </span>
                      </td>
                      <td className="px-3 py-2">
                        <div className="flex flex-col sm:flex-row gap-1 sm:gap-2 items-center justify-center">
                          <input
                            type="number"
                            min={0}
                            max={remainingQuantity + kitchenSelected}
                            value={kitchenSelected || ""}
                            onChange={(e) =>
                              handleQuantityChange(
                                item.id,
                                parseInt(e.target.value) || 0,
                                "kitchen"
                              )
                            }
                            disabled={item.quantity === 0}
                            className="w-16 px-2 py-1 text-xs border border-gray-300 rounded text-center focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            placeholder="0"
                          />
                          <Button
                            size="sm"
                            disabled={
                              !kitchenSelected ||
                              kitchenSelected > item.quantity ||
                              transferring
                            }
                            onClick={() => handleSingleTransfer("kitchen")}
                            className="bg-blue-600 hover:bg-blue-700 text-white text-xs px-2 py-1 h-7"
                          >
                            Transfer
                          </Button>
                        </div>
                      </td>
                      <td className="px-3 py-2">
                        <div className="flex flex-col sm:flex-row gap-1 sm:gap-2 items-center justify-center">
                          <input
                            type="number"
                            min={0}
                            max={remainingQuantity + shopSelected}
                            value={shopSelected || ""}
                            onChange={(e) =>
                              handleQuantityChange(
                                item.id,
                                parseInt(e.target.value) || 0,
                                "shop"
                              )
                            }
                            disabled={item.quantity === 0}
                            className="w-16 px-2 py-1 text-xs border border-gray-300 rounded text-center focus:ring-2 focus:ring-green-500 focus:border-green-500"
                            placeholder="0"
                          />
                          <Button
                            size="sm"
                            disabled={
                              !shopSelected ||
                              shopSelected > item.quantity ||
                              transferring
                            }
                            onClick={() => handleSingleTransfer("shop")}
                            className="bg-green-600 hover:bg-green-700 text-white text-xs px-2 py-1 h-7"
                          >
                            Transfer
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Loading and Empty States */}
        {isLoading && (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-600"></div>
          </div>
        )}

        {!isLoading && filteredItems.length === 0 && (
          <div className="text-center py-12 bg-white rounded-lg shadow-sm mt-4">
            <Package className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No items found
            </h3>
            <p className="text-gray-500">
              {searchTerm
                ? "Try adjusting your search criteria"
                : "No items available for transfer"}
            </p>
          </div>
        )}

        {/* Recent Transfers Table */}
        <div className="mt-8 bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">
              Recent Transfers
            </h3>
            <p className="text-sm text-gray-500">Last 3 transfers made</p>
          </div>

          {loadingTransfers ? (
            <div className="flex justify-center items-center py-8">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-amber-600"></div>
            </div>
          ) : recentTransfers.length === 0 ? (
            <div className="text-center py-8">
              <Package className="h-12 w-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-500">No recent transfers</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Item
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Quantity
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Destination
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      When
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {recentTransfers.map((transfer) => (
                    <tr key={transfer._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <Package className="h-4 w-4 text-amber-600 mr-2" />
                          <span className="text-sm font-medium text-gray-900">
                            {transfer.itemName}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm text-gray-900">
                          {transfer.quantity} {transfer.unit}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                            transfer.destination === "kitchen"
                              ? "bg-blue-100 text-blue-800"
                              : "bg-green-100 text-green-800"
                          }`}
                        >
                          {transfer.destination.charAt(0).toUpperCase() +
                            transfer.destination.slice(1)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(transfer.transferredAt).toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
