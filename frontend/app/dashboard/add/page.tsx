"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Plus, Check } from "lucide-react";
import { getAuthToken } from "@/lib/auth";

export default function AddPriceComparison() {
  const [formData, setFormData] = useState({
    productName: "",
    category: "",
    price: "",
    vendor: "",
    location: "",
    date: new Date().toISOString().split("T")[0],
  });
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Basic validation
    if (!formData.productName || !formData.category || !formData.price || 
        !formData.vendor || !formData.location || !formData.date) {
      toast({
        title: "Missing Information",
        description: "Please fill in all fields to add a price comparison.",
        variant: "destructive",
      });
      return;
    }

    if (parseFloat(formData.price) <= 0) {
      toast({
        title: "Invalid Price",
        description: "Price must be greater than zero.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    
    try {
      const token = getAuthToken();
      const response = await fetch("https://smartpantry-bc4q.onrender.com/prices", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          productName: formData.productName,
          category: formData.category,
          price: parseFloat(formData.price),
          vendor: formData.vendor,
          location: formData.location,
          date: formData.date,
        }),
      });

      if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error(err.message || "Failed to save price comparison");
      }

      toast({
        title: "Price Comparison Added",
        description: "Your price comparison has been successfully recorded.",
      });

      setFormData({
        productName: "",
        category: "",
        price: "",
        vendor: "",
        location: "",
        date: new Date().toISOString().split("T")[0],
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to save price comparison. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col space-y-3">
        <h1 className="text-2xl font-bold text-foreground dark:text-white">
          Add Price Comparison
        </h1>
        <p className="text-sm text-muted-foreground dark:text-muted-foreground/60">
          Record and compare prices for products across different vendors and locations
        </p>
      </div>
      
      <Card className="bg-background dark:bg-popover border border-input hover:border-primary/10">
        <form onSubmit={handleSubmit} className="space-y-6 p-6">
          <div className="space-y-4">
            <label htmlFor="productName" className="text-sm font-medium text-muted-foreground dark:text-muted-foreground/40 mb-1">
              Product Name
            </label>
            <Input
              id="productName"
              placeholder="Enter product name (e.g., Rice, Cooking Oil, Tomatoes)"
              value={formData.productName}
              onChange={(e) => setFormData(prev => ({ ...prev, productName: e.target.value }))}
              required
              className="bg-muted dark:bg-muted/90 border border-input hover:border-primary/30 focus:border-primary focus:ring-0"
            />
          </div>
          
          <div className="space-y-4">
            <label htmlFor="category" className="text-sm font-medium text-muted-foreground dark:text-muted-foreground/40 mb-1">
              Category
            </label>
            <Input
              id="category"
              placeholder="Select category (e.g., Grains, Vegetables, Proteins)"
              value={formData.category}
              onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
              required
              className="bg-muted dark:bg-muted/90 border border-input hover:border-primary/30 focus:border-primary focus:ring-0"
            />
          </div>
          
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-4">
              <label htmlFor="price" className="text-sm font-medium text-muted-foreground dark:text-muted-foreground/40 mb-1">
                Price (GH₵)
              </label>
              <Input
                id="price"
                placeholder="Enter price in Ghana Cedis"
                type="number"
                min="0"
                step="0.01"
                value={formData.price}
                onChange={(e) => setFormData(prev => ({ ...prev, price: e.target.value }))}
                required
                className="bg-muted dark:bg-muted/90 border border-input hover:border-primary/30 focus:border-primary focus:ring-0"
              />
            </div>
            
            <div className="space-y-4">
              <label htmlFor="vendor" className="text-sm font-medium text-muted-foreground dark:text-muted-foreground/40 mb-1">
                Vendor/Store
              </label>
              <Input
                id="vendor"
                placeholder="Enter vendor or store name"
                value={formData.vendor}
                onChange={(e) => setFormData(prev => ({ ...prev, vendor: e.target.value }))}
                required
                className="bg-muted dark:bg-muted/90 border border-input hover:border-primary/30 focus:border-primary focus:ring-0"
              />
            </div>
          </div>
          
          <div className="space-y-4">
            <label htmlFor="location" className="text-sm font-medium text-muted-foreground dark:text-muted-foreground/40 mb-1">
              Location
            </label>
            <Input
              id="location"
              placeholder="Enter location (e.g., Accra Central, Kumasi Market)"
              value={formData.location}
              onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
              required
              className="bg-muted dark:bg-muted/90 border border-input hover:border-primary/30 focus:border-primary focus:ring-0"
            />
          </div>
          
          <div className="space-y-4">
            <label htmlFor="date" className="text-sm font-medium text-muted-foreground dark:text-muted-foreground/40 mb-1">
              Date of Price
            </label>
            <Input
              id="date"
              type="date"
              value={formData.date}
              onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
              required
              className="bg-muted dark:bg-muted/90 border border-input hover:border-primary/30 focus:border-primary focus:ring-0"
            />
          </div>
          
          <div className="flex justify-end pt-4">
            <Button
              type="submit"
              disabled={isLoading}
              className="w-48 bg-primary text-primary-foreground hover:bg-primary/90"
            >
              {isLoading ? (
                <>
                  <span className="mr-2 h-4 w-4 animate-spin">⟳</span>
                  Saving...
                </>
              ) : (
                <>
                  <Plus className="mr-2 h-4 w-4" />
                  Save Price Comparison
                </>
              )}
            </Button>
          </div>
        </form>
      </Card>
      
      {/* Tips for adding effective price comparisons */}
      <Card className="bg-background dark:bg-popover border border-input hover:border-primary/10">
        <div className="p-6">
          <h2 className="text-xl font-semibold text-foreground dark:text-white mb-4">
            Tips for Effective Price Tracking
          </h2>
          <div className="space-y-4">
            <div className="flex items-start gap-3 text-sm text-muted-foreground dark:text-muted-foreground/60">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/20 dark:bg-primary/10 mt-0.5">
                <Check className="h-4 w-4 text-primary dark:text-primary-foreground" />
              </div>
              <span>
                Record prices regularly to track trends and identify the best times to buy
              </span>
            </div>
            <div className="flex items-start gap-3 text-sm text-muted-foreground dark:text-muted-foreground/60">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/20 dark:bg-primary/10 mt-0.5">
                <Check className="h-4 w-4 text-primary dark:text-primary-foreground" />
              </div>
              <span>
                Include specific details like brand, size, and quality for accurate comparisons
              </span>
            </div>
            <div className="flex items-start gap-3 text-sm text-muted-foreground dark:text-muted-foreground/60">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/20 dark:bg-primary/10 mt-0.5">
                <Check className="h-4 w-4 text-primary dark:text-primary-foreground" />
              </div>
              <span>
                Check multiple vendors in the same area to find the best local deals
              </span>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}