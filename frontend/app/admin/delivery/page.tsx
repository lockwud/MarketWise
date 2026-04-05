"use client"

import { cn } from "@/lib/utils"

import { useState } from "react"
import { Check, Clock, Filter, MoreHorizontal, Plus, Search, Truck, X } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import Sidebar from "@/components/ui/adminSideBar"

// Sample delivery data
const deliveries = [
  {
    id: "DEL-1001",
    customer: "John Smith",
    address: "123 Main St, New York, NY",
    date: "2025-04-06",
    status: "delivered",
    driver: "Mike Johnson",
    amount: "$45.99",
  },
  {
    id: "DEL-1002",
    customer: "Sarah Williams",
    address: "456 Park Ave, Boston, MA",
    date: "2025-04-06",
    status: "in-transit",
    driver: "David Lee",
    amount: "$32.50",
  },
  {
    id: "DEL-1003",
    customer: "Emma Davis",
    address: "789 Oak St, Chicago, IL",
    date: "2025-04-05",
    status: "pending",
    driver: "Unassigned",
    amount: "$78.25",
  },
  {
    id: "DEL-1004",
    customer: "Michael Brown",
    address: "321 Pine St, San Francisco, CA",
    date: "2025-04-05",
    status: "delivered",
    driver: "Lisa Chen",
    amount: "$54.75",
  },
  {
    id: "DEL-1005",
    customer: "Jessica Taylor",
    address: "654 Maple Ave, Seattle, WA",
    date: "2025-04-04",
    status: "cancelled",
    driver: "N/A",
    amount: "$29.99",
  },
  {
    id: "DEL-1006",
    customer: "Daniel Wilson",
    address: "987 Cedar Rd, Miami, FL",
    date: "2025-04-04",
    status: "delivered",
    driver: "Mike Johnson",
    amount: "$67.30",
  },
  {
    id: "DEL-1007",
    customer: "Olivia Martinez",
    address: "135 Elm St, Austin, TX",
    date: "2025-04-03",
    status: "in-transit",
    driver: "David Lee",
    amount: "$42.15",
  },
]

export default function DeliveryPage() {
    
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")

  const filteredDeliveries = deliveries.filter((delivery) => {
    const matchesSearch =
      delivery.customer.toLowerCase().includes(searchTerm.toLowerCase()) ||
      delivery.id.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesStatus = statusFilter === "all" || delivery.status === statusFilter

    return matchesSearch && matchesStatus
  })

  return (
    <div className="flex">
        <Sidebar /> 
     

      <Card className="w-full flex-[2]">
        <CardHeader>
          <CardTitle>Deliveries</CardTitle>
          <CardDescription>Manage all your delivery orders from one place.</CardDescription>
        </CardHeader>
        <CardContent>
        <Button className="mb-4">
          <Plus className="mr-2 h-4 w-4" />
          New Delivery
        </Button>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="relative w-full max-w-sm">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search deliveries..."
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex items-center gap-2">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[180px]">
                  <Filter className="mr-2 h-4 w-4" />
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="in-transit">In Transit</SelectItem>
                  <SelectItem value="delivered">Delivered</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="mt-6 rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[100px]">ID</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead className="hidden md:table-cell">Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="hidden lg:table-cell">Driver</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                  <TableHead className="w-[70px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredDeliveries.map((delivery) => (
                  <TableRow key={delivery.id}>
                    <TableCell className="font-medium">{delivery.id}</TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">{delivery.customer}</div>
                        <div className="hidden text-xs text-muted-foreground md:inline-block lg:hidden">
                          {delivery.date}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">{delivery.date}</TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={cn(
                          "capitalize",
                          delivery.status === "delivered" && "border-green-500 text-green-500",
                          delivery.status === "in-transit" && "border-blue-500 text-blue-500",
                          delivery.status === "pending" && "border-yellow-500 text-yellow-500",
                          delivery.status === "cancelled" && "border-red-500 text-red-500",
                        )}
                      >
                        {delivery.status === "delivered" && <Check className="mr-1 h-3 w-3" />}
                        {delivery.status === "in-transit" && <Truck className="mr-1 h-3 w-3" />}
                        {delivery.status === "pending" && <Clock className="mr-1 h-3 w-3" />}
                        {delivery.status === "cancelled" && <X className="mr-1 h-3 w-3" />}
                        {delivery.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="hidden lg:table-cell">{delivery.driver}</TableCell>
                    <TableCell className="text-right">{delivery.amount}</TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                            <span className="sr-only">Actions</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuItem>View details</DropdownMenuItem>
                          <DropdownMenuItem>Update status</DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem>Contact customer</DropdownMenuItem>
                          <DropdownMenuItem>Contact driver</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

