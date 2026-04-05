"use client";

import { SetStateAction, useState } from "react";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import Sidebar from "@/components/ui/adminSideBar";

const initialUsers = [
  { id: 1, name: "John Doe", role: "Admin", status: "Active" },
  { id: 2, name: "Jane Smith", role: "User", status: "Inactive" },
  { id: 3, name: "Michael Johnson", role: "Moderator", status: "Active" },
  { id: 4, name: "Emily Davis", role: "User", status: "Active" },
  { id: 5, name: "Robert Brown", role: "Admin", status: "Inactive" },
];

export default function UserManagement() {
  const [users] = useState(initialUsers);
  const [search, setSearch] = useState("");

  const filteredUsers = users.filter(
    (user) =>
      user.name.toLowerCase().includes(search.toLowerCase()) ||
      user.role.toLowerCase().includes(search.toLowerCase()) ||
      user.status.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex h-screen overflow-hidden">
     <Sidebar/>
      <div className="p-6 w-full flex flex-1 flex-col items-center overflow-auto">
        <div className="w-full max-w-6xl">
          <h2 className="text-xl font-semibold mb-4">User Management</h2>
          <Input
            placeholder="Search users..."
            value={search}
            onChange={(e: { target: { value: SetStateAction<string> } }) =>
              setSearch(e.target.value)
            }
            className="mb-4 w-full p-2 border rounded-md"
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 w-full">
            {filteredUsers.map((user) => (
              <Card
                key={user.id}
                className="shadow-md p-4 rounded-lg text-center bg-white border border-gray-200"
              >
                <h3 className="text-lg font-medium">{user.name}</h3>
                <p className="text-sm text-gray-600">Role: {user.role}</p>
                <p
                  className={`text-sm font-semibold ${
                    user.status === "Active" ? "text-green-600" : "text-red-600"
                  }`}
                >
                  {user.status}
                </p>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
