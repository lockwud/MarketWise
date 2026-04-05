"use client";

import { SetStateAction, useState } from "react";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Sidebar from "@/components/ui/adminSideBar";

const initialOrders = [
  {
    id: 1,
    customer: "Alice Johnson",
    item: "Apples",
    quantity: 3,
    status: "Pending",
  },
  {
    id: 2,
    customer: "Bob Smith",
    item: "Bananas",
    quantity: 2,
    status: "Approved",
  },
  {
    id: 3,
    customer: "Charlie Brown",
    item: "Carrots",
    quantity: 5,
    status: "Declined",
  },
  {
    id: 4,
    customer: "Diana Prince",
    item: "Tomatoes",
    quantity: 4,
    status: "Pending",
  },
];

export default function OrdersManagement() {
  const [orders, setOrders] = useState(initialOrders);
  const [search, setSearch] = useState("");

  const handleStatusChange = (id: number, newStatus: string) => {
    setOrders((prevOrders) =>
      prevOrders.map((order) =>
        order.id === id ? { ...order, status: newStatus } : order
      )
    );
  };

  const filteredOrders = orders.filter(
    (order) =>
      order.customer.toLowerCase().includes(search.toLowerCase()) ||
      order.item.toLowerCase().includes(search.toLowerCase()) ||
      order.status.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <div className="p-6 w-full flex flex-col flex-1 items-center overflow-auto">
        <div className="w-full max-w-6xl">
          <h2 className="text-lg font-semibold mb-4">Orders Management</h2>
          <Input
            placeholder="Search orders..."
            value={search}
            onChange={(e: { target: { value: SetStateAction<string> } }) =>
              setSearch(e.target.value)
            }
            className="mb-4 w-full p-2 border rounded-md"
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 w-full">
            {filteredOrders.map((order) => (
              <Card
                key={order.id}
                className="shadow-sm p-4 rounded-md text-center bg-white border border-gray-200 text-sm"
              >
                <h3 className="text-sm font-medium">{order.customer}</h3>
                <p className="text-sm text-gray-600">Item: {order.item}</p>
                <p className="text-sm text-gray-600">
                  Quantity: {order.quantity}
                </p>
                <p
                  className={`text-sm font-semibold ${
                    order.status === "Approved"
                      ? "text-green-600"
                      : order.status === "Declined"
                      ? "text-red-600"
                      : "text-yellow-600"
                  }`}
                >
                  {order.status}
                </p>
                <div className="flex justify-center gap-2 mt-2">
                  <Button
                    onClick={() => handleStatusChange(order.id, "Approved")}
                    className="px-2 py-1 text-sm bg-green-500 text-white rounded"
                  >
                    Approve
                  </Button>
                  <Button
                    onClick={() => handleStatusChange(order.id, "Declined")}
                    className="px-2 py-1 text-sm bg-red-500 text-white rounded"
                  >
                    Decline
                  </Button>
                  <Button
                    onClick={() => handleStatusChange(order.id, "Pending")}
                    className="px-2 py-1 text-sm bg-yellow-500 text-white rounded"
                  >
                    Review
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
