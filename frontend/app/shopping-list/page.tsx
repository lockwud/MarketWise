"use client"

import { useState } from "react"
import Link from "next/link"
import { Check, ChevronDown, ChevronUp, Plus, ShoppingBasket, ShoppingCart, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { MobileNav } from "@/components/mobile-nav"
import { Footer } from "@/components/footer"

// Sample data
const initialItems = [
  { id: 1, name: "Milk", category: "Dairy", quantity: "1 gallon", completed: false },
  { id: 2, name: "Eggs", category: "Dairy", quantity: "1 dozen", completed: false },
  { id: 3, name: "Bread", category: "Bakery", quantity: "1 loaf", completed: true },
  { id: 4, name: "Chicken Breast", category: "Meat", quantity: "2 lbs", completed: false },
  { id: 5, name: "Spinach", category: "Vegetables", quantity: "1 bag", completed: false },
  { id: 6, name: "Apples", category: "Fruits", quantity: "6", completed: true },
  { id: 7, name: "Pasta", category: "Grains", quantity: "1 box", completed: false },
  { id: 8, name: "Tomato Sauce", category: "Canned Goods", quantity: "1 jar", completed: false },
]

export default function ShoppingListPage() {
  const { toast } = useToast()
  const [items, setItems] = useState(initialItems)
  const [newItem, setNewItem] = useState({ name: "", category: "", quantity: "" })
  const [showCompleted, setShowCompleted] = useState(true)

  const handleAddItem = (e) => {
    e.preventDefault()
    if (!newItem.name) return

    const item = {
      id: Date.now(),
      name: newItem.name,
      category: newItem.category || "Other",
      quantity: newItem.quantity || "1",
      completed: false,
    }

    setItems([...items, item])
    setNewItem({ name: "", category: "", quantity: "" })
    toast({
      title: "Item added",
      description: `${item.name} has been added to your shopping list.`,
    })
  }

  const toggleItemCompletion = (id) => {
    setItems(items.map((item) => (item.id === id ? { ...item, completed: !item.completed } : item)))
  }

  const removeItem = (id) => {
    setItems(items.filter((item) => item.id !== id))
    toast({
      title: "Item removed",
      description: "The item has been removed from your shopping list.",
    })
  }

  const clearCompletedItems = () => {
    setItems(items.filter((item) => !item.completed))
    toast({
      title: "Completed items cleared",
      description: "All completed items have been removed from your list.",
    })
  }

  // Group items by category
  const groupedItems = items.reduce((acc, item) => {
    if (!acc[item.category]) {
      acc[item.category] = []
    }
    acc[item.category].push(item)
    return acc
  }, {})

  const pendingItems = items.filter((item) => !item.completed)
  const completedItems = items.filter((item) => item.completed)

  return (
    <div className="flex min-h-screen flex-col">
      <header className="px-4 lg:px-6 h-16 flex items-center border-b">
        <Link className="flex items-center justify-center" href="/">
          <ShoppingBasket className="h-6 w-6 text-green-600" />
          <span className="ml-2 text-xl font-bold">FreshTrack</span>
        </Link>
        <nav className="ml-auto hidden md:flex gap-4 sm:gap-6">
          {/* <Link className="text-sm font-medium hover:underline underline-offset-4" href="/">
          {/* <Link className="text-sm font-medium hover:underline underline-offset-4" href="/">
            Home
          </Link> */}
          <Link className="text-sm font-medium hover:underline underline-offset-4" href="/dashboard">
            Dashboard
          </Link>
          <Link className="text-sm font-medium hover:underline underline-offset-4" href="/recipes">
            Recipes
          </Link>
          {/* <Link className="text-sm font-medium hover:underline underline-offset-4" href="/about">
            About
          </Link> */}
          <Link className="text-sm font-medium hover:underline underline-offset-4" href="/profile">
            Profile
          </Link>
        </nav>
        <MobileNav />
      </header>
      <main className="flex-1 py-6 px-4 md:px-6">
        <div className="mx-auto max-w-4xl">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
            <div className="flex items-center">
              <ShoppingCart className="h-6 w-6 text-green-600 mr-2" />
              <h1 className="text-2xl font-bold">Shopping List</h1>
            </div>
            <div className="flex items-center gap-2 mt-2 md:mt-0">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowCompleted(!showCompleted)}
                className="flex items-center"
              >
                {showCompleted ? (
                  <>
                    <ChevronUp className="h-4 w-4 mr-1" />
                    Hide Completed
                  </>
                ) : (
                  <>
                    <ChevronDown className="h-4 w-4 mr-1" />
                    Show Completed
                  </>
                )}
              </Button>
              {completedItems.length > 0 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={clearCompletedItems}
                  className="text-red-500 hover:text-red-700 hover:bg-red-50"
                >
                  <Trash2 className="h-4 w-4 mr-1" />
                  Clear Completed
                </Button>
              )}
            </div>
          </div>

          <div className="grid gap-6 md:grid-cols-[1fr_300px]">
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Items to Buy ({pendingItems.length})</CardTitle>
                  <CardDescription>Check off items as you shop</CardDescription>
                </CardHeader>
                <CardContent>
                  {Object.keys(groupedItems).length > 0 ? (
                    Object.entries(groupedItems).map(([category, categoryItems]) => (
                      <div key={category} className="mb-6 last:mb-0">
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="font-medium text-sm text-gray-500">{category}</h3>
                          <Badge variant="outline">{categoryItems.length}</Badge>
                        </div>
                        <div className="space-y-2">
                          {categoryItems
                            .filter((item) => !item.completed || showCompleted)
                            .map((item) => (
                              <div
                                key={item.id}
                                className={`flex items-center justify-between p-3 rounded-lg border ${
                                  item.completed ? "bg-gray-50" : ""
                                }`}
                              >
                                <div className="flex items-center">
                                  <Checkbox
                                    id={`item-${item.id}`}
                                    checked={item.completed}
                                    onCheckedChange={() => toggleItemCompletion(item.id)}
                                    className="mr-3"
                                  />
                                  <div>
                                    <Label
                                      htmlFor={`item-${item.id}`}
                                      className={`font-medium ${item.completed ? "line-through text-gray-400" : ""}`}
                                    >
                                      {item.name}
                                    </Label>
                                    <p className="text-xs text-gray-500">{item.quantity}</p>
                                  </div>
                                </div>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => removeItem(item.id)}
                                  className="h-8 w-8 text-gray-400 hover:text-red-500"
                                >
                                  <Trash2 className="h-4 w-4" />
                                  <span className="sr-only">Remove item</span>
                                </Button>
                              </div>
                            ))}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8">
                      <ShoppingCart className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                      <h3 className="text-lg font-medium">Your shopping list is empty</h3>
                      <p className="text-sm text-gray-500 mt-1">Add some items to get started</p>
                    </div>
                  )}
                </CardContent>
                <CardFooter className="flex justify-between border-t pt-4">
                  <div className="text-sm text-gray-500">
                    {completedItems.length} of {items.length} items completed
                  </div>
                  {completedItems.length > 0 && (
                    <Button
                      variant="link"
                      size="sm"
                      className="text-green-600"
                      onClick={() => setShowCompleted(!showCompleted)}
                    >
                      {showCompleted ? "Hide" : "Show"} completed items
                    </Button>
                  )}
                </CardFooter>
              </Card>
            </div>

            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Add New Item</CardTitle>
                  <CardDescription>Add items to your shopping list</CardDescription>
                </CardHeader>
                <form onSubmit={handleAddItem}>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="item-name">Item Name</Label>
                      <Input
                        id="item-name"
                        placeholder="e.g., Milk, Eggs, Bread"
                        value={newItem.name}
                        onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="item-category">Category (Optional)</Label>
                      <Input
                        id="item-category"
                        placeholder="e.g., Dairy, Produce"
                        value={newItem.category}
                        onChange={(e) => setNewItem({ ...newItem, category: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="item-quantity">Quantity (Optional)</Label>
                      <Input
                        id="item-quantity"
                        placeholder="e.g., 1 gallon, 2 lbs"
                        value={newItem.quantity}
                        onChange={(e) => setNewItem({ ...newItem, quantity: e.target.value })}
                      />
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button type="submit" className="w-full bg-green-600 hover:bg-green-700">
                      <Plus className="h-4 w-4 mr-2" />
                      Add Item
                    </Button>
                  </CardFooter>
                </form>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Shopping List Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span>Total Items:</span>
                    <Badge variant="outline">{items.length}</Badge>
                  </div>
                  <Separator />
                  <div className="flex justify-between items-center">
                    <span>Items to Buy:</span>
                    <Badge variant="outline">{pendingItems.length}</Badge>
                  </div>
                  <Separator />
                  <div className="flex justify-between items-center">
                    <span>Completed:</span>
                    <Badge variant="outline">{completedItems.length}</Badge>
                  </div>
                  <Separator />
                  <div className="flex justify-between items-center">
                    <span>Categories:</span>
                    <Badge variant="outline">{Object.keys(groupedItems).length}</Badge>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => {
                      if (pendingItems.length === 0) {
                        toast({
                          title: "All items completed",
                          description: "Your shopping list is complete!",
                        })
                      } else {
                        toast({
                          title: "Items remaining",
                          description: `You still have ${pendingItems.length} items to buy.`,
                        })
                      }
                    }}
                  >
                    <Check className="h-4 w-4 mr-2" />
                    Mark All as Complete
                  </Button>
                </CardFooter>
              </Card>
            </div>
          </div>
        </div>
      </main>
      <Footer/>
      {/* <footer className="flex flex-col gap-2 sm:flex-row py-6 w-full shrink-0 items-center px-4 md:px-6 border-t">
        <p className="text-xs text-gray-500">© 2024 FreshTrack. All rights reserved.</p>
        <nav className="sm:ml-auto flex gap-4 sm:gap-6">
          <Link className="text-xs hover:underline underline-offset-4" href="#">
            Terms of Service
          </Link>
          <Link className="text-xs hover:underline underline-offset-4" href="#">
            Privacy
          </Link>
        </nav>
      </footer> */}
    </div>
  )
}

