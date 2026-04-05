"use client"; // This indicates that the component should run on the client-side

import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input"; // Ensure you have an Input component
import { Card } from "@/components/ui/card"; // Ensure you have a Card component
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table"; // Ensure you have these components
import Sidebar from "@/components/ui/adminSideBar"; // Ensure you have a Sidebar component
import { InventoryItem, fetchItems, addItem, updateItem, deleteItem } from "@/lib/api/inventory";

export default function Inventory() {
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [search, setSearch] = useState("");
  const [newItem, setNewItem] = useState<InventoryItem>({
    itemName: "",
    category: "",
    quantity: 0,
    unit: "",
    expiryDate: "",
  });

  // Fetch initial inventory when the component mounts
  useEffect(() => {
    const loadInventory = async () => {
      try {
        const items = await fetchItems();
        setInventory(items);
      } catch (error) {
        console.error("Failed to fetch inventory:", error);
      }
    };
    loadInventory();
  }, []);

  // Filter inventory based on search input
  const filteredInventory = inventory.filter((item) =>
    item.itemName.toLowerCase().includes(search.toLowerCase())
  );

  // Handle adding a new inventory item
  const handleAddItem = async () => {
    if (!newItem.itemName || newItem.quantity <= 0) return; // Simple validation
    try {
      const addedItem = await addItem(newItem);
      setInventory((prev) => [...prev, addedItem]);
      setNewItem({ itemName: "", category: "", quantity: 0, unit: "", expiryDate: "" }); // Reset form
    } catch (error) {
      console.error("Failed to add item:", error);
    }
  };

  // Handle deleting an inventory item
  const handleDeleteItem = async (id: string) => {
    try {
      await deleteItem(id);
      setInventory((prev) => prev.filter((item) => item.id !== id));
    } catch (error) {
      console.error("Failed to delete item:", error);
    }
  };

  // Render the inventory management UI
  return (
    <div className="flex">
      <Sidebar />
      <div className="p-6 w-full flex flex-col items-center flex-1">
        <div className="w-full max-w-6xl">
          <h2 className="text-xl font-semibold mb-4">Inventory Management</h2>
          <Input
            placeholder="Search inventory..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="mb-4 w-full p-2 border rounded-md"
          />
          
          <Card className="overflow-x-auto shadow-lg rounded-lg p-4 w-full mb-4">
            <div className="flex flex-row justify-between mb-4">
              <h3 className="text-lg">Add New Item</h3>
              <button
                onClick={handleAddItem}
                className="bg-green-500 text-white py-2 px-4 rounded-md"
              >
                Add Item
              </button>
            </div>
            <Input
              placeholder="Item Name"
              value={newItem.itemName}
              onChange={(e) => setNewItem({ ...newItem, itemName: e.target.value })}
              className="mb-2 w-full p-2 border rounded-md"
            />
            <Input
              placeholder="Category"
              value={newItem.category}
              onChange={(e) => setNewItem({ ...newItem, category: e.target.value })}
              className="mb-2 w-full p-2 border rounded-md"
            />
            <Input
              placeholder="Quantity"
              type="number"
              value={newItem.quantity}
              onChange={(e) => setNewItem({ ...newItem, quantity: Number(e.target.value) })}
              className="mb-2 w-full p-2 border rounded-md"
            />
            <Input
              placeholder="Unit"
              value={newItem.unit}
              onChange={(e) => setNewItem({ ...newItem, unit: e.target.value })}
              className="mb-2 w-full p-2 border rounded-md"
            />
            <Input
              placeholder="Expiry Date"
              type="date"
              value={newItem.expiryDate}
              onChange={(e) => setNewItem({ ...newItem, expiryDate: e.target.value })}
              className="mb-2 w-full p-2 border rounded-md"
            />
          </Card>

          <Card className="overflow-x-auto shadow-lg rounded-lg p-4 w-full">
            <Table className="w-full border-collapse">
              <TableHeader>
                <TableRow className="bg-gray-100 text-left text-sm font-medium border-b">
                  <TableHead className="px-4 py-2">Item Name</TableHead>
                  <TableHead className="px-4 py-2">Category</TableHead>
                  <TableHead className="px-4 py-2">Quantity</TableHead>
                  <TableHead className="px-4 py-2">Expiry Date</TableHead>
                  <TableHead className="px-4 py-2">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredInventory.map((item) => (
                  <TableRow key={item.id} className="border-b hover:bg-gray-50">
                    <TableCell className="px-4 py-2">{item.itemName}</TableCell>
                    <TableCell className="px-4 py-2">{item.category}</TableCell>
                    <TableCell className="px-4 py-2">{item.quantity}</TableCell>
                    <TableCell className="px-4 py-2">{item.expiryDate}</TableCell>
                    <TableCell className="px-4 py-2">
                      <button
                        onClick={() => handleDeleteItem(item.id!)}
                        className="bg-red-500 text-white py-1 px-2 rounded-md"
                      >
                        Delete
                      </button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        </div>
      </div>
    </div>
  );
}