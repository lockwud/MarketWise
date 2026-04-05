"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { Clock, Filter, Heart, Search, ShoppingBasket, Utensils } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { MobileNav } from "@/components/mobile-nav"
import { useToast } from "@/hooks/use-toast"

// Sample recipe data
const recipeData = [
  {
    id: 1,
    title: "Creamy Spinach Pasta",
    description: "A quick and easy pasta dish with creamy spinach sauce.",
    image: "/placeholder.svg?height=300&width=400",
    prepTime: 10,
    cookTime: 20,
    ingredients: ["Pasta", "Spinach", "Milk", "Garlic", "Parmesan Cheese"],
    mealType: "Dinner",
    dietType: ["Vegetarian"],
    instructions: [
      "Cook pasta according to package instructions.",
      "In a large pan, sauté garlic until fragrant.",
      "Add spinach and cook until wilted.",
      "Pour in milk and bring to a simmer.",
      "Add cooked pasta and parmesan cheese, stir until creamy.",
      "Season with salt and pepper to taste.",
    ],
    nutrition: {
      calories: 450,
      protein: "15g",
      carbs: "65g",
      fat: "12g",
    },
  },
  {
    id: 2,
    title: "Chicken and Vegetable Stir Fry",
    description: "A healthy and flavorful stir fry with chicken and seasonal vegetables.",
    image: "/placeholder.svg?height=300&width=400",
    prepTime: 15,
    cookTime: 15,
    ingredients: ["Chicken Breast", "Bell Peppers", "Broccoli", "Carrots", "Soy Sauce"],
    mealType: "Dinner",
    dietType: ["High Protein"],
    instructions: [
      "Slice chicken breast into thin strips.",
      "Chop all vegetables into bite-sized pieces.",
      "Heat oil in a wok or large frying pan over high heat.",
      "Add chicken and cook until no longer pink.",
      "Add vegetables and stir fry for 3-4 minutes.",
      "Pour in soy sauce and other seasonings.",
      "Cook for another 2 minutes until everything is well coated.",
    ],
    nutrition: {
      calories: 320,
      protein: "28g",
      carbs: "18g",
      fat: "14g",
    },
  },
  {
    id: 3,
    title: "Apple Cinnamon Oatmeal",
    description: "A warm and comforting breakfast with fresh apples and cinnamon.",
    image: "/placeholder.svg?height=300&width=400",
    prepTime: 5,
    cookTime: 10,
    ingredients: ["Oats", "Apples", "Milk", "Cinnamon", "Honey"],
    mealType: "Breakfast",
    dietType: ["Vegetarian", "Low Fat"],
    instructions: [
      "Dice apples into small cubes.",
      "In a pot, combine oats and milk.",
      "Bring to a simmer over medium heat.",
      "Add diced apples and cinnamon.",
      "Cook for 5-7 minutes, stirring occasionally.",
      "Drizzle with honey before serving.",
    ],
    nutrition: {
      calories: 280,
      protein: "8g",
      carbs: "52g",
      fat: "5g",
    },
  },
  {
    id: 4,
    title: "Greek Yogurt Parfait",
    description: "A refreshing and protein-packed breakfast or snack.",
    image: "/placeholder.svg?height=300&width=400",
    prepTime: 5,
    cookTime: 0,
    ingredients: ["Greek Yogurt", "Berries", "Granola", "Honey"],
    mealType: "Breakfast",
    dietType: ["Vegetarian", "High Protein"],
    instructions: [
      "In a glass or bowl, add a layer of Greek yogurt.",
      "Add a layer of mixed berries.",
      "Sprinkle granola on top.",
      "Drizzle with honey.",
      "Repeat layers if desired.",
    ],
    nutrition: {
      calories: 220,
      protein: "18g",
      carbs: "28g",
      fat: "6g",
    },
  },
  {
    id: 5,
    title: "Spinach and Feta Omelette",
    description: "A protein-rich breakfast with spinach and feta cheese.",
    image: "/placeholder.svg?height=300&width=400",
    prepTime: 5,
    cookTime: 10,
    ingredients: ["Eggs", "Spinach", "Feta Cheese", "Milk"],
    mealType: "Breakfast",
    dietType: ["Vegetarian", "High Protein", "Low Carb"],
    instructions: [
      "Whisk eggs and milk together in a bowl.",
      "Heat a non-stick pan over medium heat.",
      "Pour in egg mixture and let it cook for 1-2 minutes.",
      "Add spinach and crumbled feta cheese on one half of the omelette.",
      "Fold the other half over the filling.",
      "Cook for another 1-2 minutes until eggs are fully set.",
    ],
    nutrition: {
      calories: 280,
      protein: "22g",
      carbs: "4g",
      fat: "20g",
    },
  },
  {
    id: 6,
    title: "Chicken and Vegetable Soup",
    description: "A hearty and nutritious soup perfect for using up leftover chicken and vegetables.",
    image: "/placeholder.svg?height=300&width=400",
    prepTime: 15,
    cookTime: 30,
    ingredients: ["Chicken", "Carrots", "Celery", "Onion", "Chicken Broth"],
    mealType: "Lunch",
    dietType: ["High Protein", "Low Fat"],
    instructions: [
      "Dice chicken, carrots, celery, and onion.",
      "In a large pot, sauté onion until translucent.",
      "Add carrots and celery, cook for 3-4 minutes.",
      "Add chicken and chicken broth.",
      "Bring to a boil, then reduce heat and simmer for 20-25 minutes.",
      "Season with salt, pepper, and herbs to taste.",
    ],
    nutrition: {
      calories: 210,
      protein: "24g",
      carbs: "12g",
      fat: "8g",
    },
  },
]

export default function RecipesPage() {
  const { toast } = useToast()
  const [searchQuery, setSearchQuery] = useState("")
  const [filters, setFilters] = useState({
    mealTypes: [],
    dietTypes: [],
    ingredients: [],
  })
  const [selectedRecipe, setSelectedRecipe] = useState(null)
  const [favorites, setFavorites] = useState([])

  // Get unique meal types, diet types, and ingredients for filters
  const mealTypes = Array.from(new Set(recipeData.map((recipe) => recipe.mealType)))
  const dietTypes = Array.from(new Set(recipeData.flatMap((recipe) => recipe.dietType)))
  const allIngredients = Array.from(new Set(recipeData.flatMap((recipe) => recipe.ingredients)))

  const toggleFilter = (category:any, value:any) => {
    setFilters((prev) => {
      const updated = { ...prev }
      if (updated[category].includes(value)) {
        updated[category] = updated[category].filter((item:any) => item !== value)
      } else {
        updated[category] = [...updated[category], value]
      }
      return updated
    })
  }

  const toggleFavorite = (recipeId:any) => {
    setFavorites((prev:any) => {
      if (prev.includes(recipeId)) {
        toast({
          title: "Removed from favorites",
          description: "Recipe has been removed from your favorites.",
        })
        return prev.filter((id:any) => id !== recipeId)
      } else {
        toast({
          title: "Added to favorites",
          description: "Recipe has been added to your favorites.",
        })
        return [...prev, recipeId]
      }
    })
  }

  const filteredRecipes = recipeData.filter((recipe) => {
    // Search query filter
    const matchesSearch =
      recipe.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      recipe.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      recipe.ingredients.some((ingredient) => ingredient.toLowerCase().includes(searchQuery.toLowerCase()))

    // Meal type filter
    const matchesMealType = filters.mealTypes.length === 0 || filters.mealTypes.includes(recipe.mealType)

    // Diet type filter
    const matchesDietType =
      filters.dietTypes.length === 0 || filters.dietTypes.some((diet) => recipe.dietType.includes(diet))

    // Ingredient filter
    const matchesIngredients =
      filters.ingredients.length === 0 ||
      filters.ingredients.every((ingredient) =>
        recipe.ingredients.some((recipeIngredient) =>
          recipeIngredient.toLowerCase().includes(ingredient.toLowerCase()),
        ),
      )

    return matchesSearch && matchesMealType && matchesDietType && matchesIngredients
  })

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 dark:bg-gray-950">
      <header className="px-4 lg:px-20 h-16 flex items-center border-b bg-white dark:bg-gray-900 dark:border-gray-800 sticky top-0 z-30">
        <Link className="flex items-center justify-center" href="/">
          <ShoppingBasket className="h-6 w-6 text-emerald-600 dark:text-emerald-500" />
          <span className="ml-2 text-xl font-bold text-gray-900 dark:text-white">FreshTrack</span>
        </Link>
        <nav className="ml-auto hidden md:flex gap-4 sm:gap-6">
          {/* <Link
            className="text-sm font-medium text-gray-700 hover:text-emerald-600 dark:text-gray-300 dark:hover:text-emerald-500 hover:underline underline-offset-4"
            href="/"
          >
            Home
          </Link> */}
          <Link
            className="text-sm font-medium text-gray-700 hover:text-emerald-600 dark:text-gray-300 dark:hover:text-emerald-500 hover:underline underline-offset-4"
            href="/dashboard"
          >
            Dashboard
          </Link>
          <Link
            className="text-sm font-medium text-emerald-600 dark:text-emerald-500 hover:underline underline-offset-4"
            href="/recipes"
          >
            Recipes
          </Link>
          <Link
            className="text-sm font-medium text-gray-700 hover:text-emerald-600 dark:text-gray-300 dark:hover:text-emerald-500 hover:underline underline-offset-4"
            href="/shopping-list"
          >
            Shopping List
          </Link>
          <Link
            className="text-sm font-medium text-gray-700 hover:text-emerald-600 dark:text-gray-300 dark:hover:text-emerald-500 hover:underline underline-offset-4"
            href="/profile"
          >
            Profile
          </Link>
        </nav>
        <MobileNav />
      </header>
      <main className="flex-1 py-6 px-4 md:px-20">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Recipe Suggestions</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Find recipes based on ingredients you have or discover new meal ideas.
          </p>
        </div>
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500 dark:text-gray-400" />
            <Input
              type="search"
              placeholder="Search recipes or ingredients..."
              className="pl-8 bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Sheet>
            <SheetTrigger asChild>
              <Button
                variant="outline"
                className="md:w-auto border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300"
              >
                <Filter className="h-4 w-4 mr-2" />
                Filters
                {(filters.mealTypes.length > 0 || filters.dietTypes.length > 0 || filters.ingredients.length > 0) && (
                  <Badge
                    variant="secondary"
                    className="ml-2 bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400"
                  >
                    {filters.mealTypes.length + filters.dietTypes.length + filters.ingredients.length}
                  </Badge>
                )}
              </Button>
            </SheetTrigger>
            <SheetContent className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800">
              <SheetHeader>
                <SheetTitle className="text-gray-900 dark:text-white">Filter Recipes</SheetTitle>
                <SheetDescription className="text-gray-600 dark:text-gray-400">
                  Narrow down recipes by meal type, diet, or ingredients.
                </SheetDescription>
              </SheetHeader>
              <div className="py-4 space-y-6">
                <div className="space-y-4">
                  <h3 className="text-sm font-medium text-gray-900 dark:text-white">Meal Type</h3>
                  <div className="grid grid-cols-2 gap-2">
                    {mealTypes.map((type) => (
                      <div key={type} className="flex items-center space-x-2">
                        <Checkbox
                          id={`meal-${type}`}
                          checked={filters.mealTypes.includes(type)}
                          onCheckedChange={() => toggleFilter("mealTypes", type)}
                          className="border-gray-300 dark:border-gray-600 data-[state=checked]:bg-emerald-600 data-[state=checked]:border-emerald-600 dark:data-[state=checked]:bg-emerald-600 dark:data-[state=checked]:border-emerald-600"
                        />
                        <Label htmlFor={`meal-${type}`} className="text-gray-700 dark:text-gray-300">
                          {type}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="space-y-4">
                  <h3 className="text-sm font-medium text-gray-900 dark:text-white">Diet Type</h3>
                  <div className="grid grid-cols-2 gap-2">
                    {dietTypes.map((type) => (
                      <div key={type} className="flex items-center space-x-2">
                        <Checkbox
                          id={`diet-${type}`}
                          checked={filters.dietTypes.includes(type)}
                          onCheckedChange={() => toggleFilter("dietTypes", type)}
                          className="border-gray-300 dark:border-gray-600 data-[state=checked]:bg-emerald-600 data-[state=checked]:border-emerald-600 dark:data-[state=checked]:bg-emerald-600 dark:data-[state=checked]:border-emerald-600"
                        />
                        <Label htmlFor={`diet-${type}`} className="text-gray-700 dark:text-gray-300">
                          {type}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="space-y-4">
                  <h3 className="text-sm font-medium text-gray-900 dark:text-white">Ingredients</h3>
                  <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto">
                    {allIngredients.map((ingredient) => (
                      <div key={ingredient} className="flex items-center space-x-2">
                        <Checkbox
                          id={`ingredient-${ingredient}`}
                          checked={filters.ingredients.includes(ingredient)}
                          onCheckedChange={() => toggleFilter("ingredients", ingredient)}
                          className="border-gray-300 dark:border-gray-600 data-[state=checked]:bg-emerald-600 data-[state=checked]:border-emerald-600 dark:data-[state=checked]:bg-emerald-600 dark:data-[state=checked]:border-emerald-600"
                        />
                        <Label htmlFor={`ingredient-${ingredient}`} className="text-gray-700 dark:text-gray-300">
                          {ingredient}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>
                <Button
                  variant="outline"
                  className="w-full border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300"
                  onClick={() => setFilters({ mealTypes: [], dietTypes: [], ingredients: [] })}
                >
                  Clear All Filters
                </Button>
              </div>
            </SheetContent>
          </Sheet>
        </div>

        {filteredRecipes.length > 0 ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filteredRecipes.map((recipe) => (
              <Card
                key={recipe.id}
                className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800 overflow-hidden group"
              >
                <div className="aspect-video relative">
                  <Image src={recipe.image || "/placeholder.svg"} alt={recipe.title} fill className="object-cover" />
                  <Button
                    variant="ghost"
                    size="icon"
                    className={`absolute top-2 right-2 bg-white/80 dark:bg-gray-900/80 hover:bg-white dark:hover:bg-gray-900 ${
                      favorites.includes(recipe.id)
                        ? "text-red-500 dark:text-red-400"
                        : "text-gray-500 dark:text-gray-400 opacity-0 group-hover:opacity-100"
                    }`}
                    onClick={() => toggleFavorite(recipe.id)}
                  >
                    <Heart className={`h-5 w-5 ${favorites.includes(recipe.id) ? "fill-current" : ""}`} />
                    <span className="sr-only">
                      {favorites.includes(recipe.id) ? "Remove from favorites" : "Add to favorites"}
                    </span>
                  </Button>
                </div>
                <CardHeader>
                  <div className="flex justify-between items-start gap-4">
                    <div>
                      <CardTitle className="text-gray-900 dark:text-white">{recipe.title}</CardTitle>
                      <CardDescription className="mt-1 text-gray-600 dark:text-gray-400">
                        {recipe.description}
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400 mb-4">
                    <div className="flex items-center">
                      <Clock className="h-4 w-4 mr-1" />
                      <span>{recipe.prepTime + recipe.cookTime} min</span>
                    </div>
                    <div>
                      <Badge
                        variant="outline"
                        className="border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300"
                      >
                        {recipe.mealType}
                      </Badge>
                    </div>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">Main Ingredients:</h4>
                    <div className="flex flex-wrap gap-1">
                      {recipe.ingredients.map((ingredient) => (
                        <Badge
                          key={ingredient}
                          variant="secondary"
                          className="text-xs bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400"
                        >
                          {ingredient}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button
                        className="w-full bg-emerald-600 hover:bg-emerald-700 text-white dark:bg-emerald-600 dark:hover:bg-emerald-700"
                        onClick={() => setSelectedRecipe(recipe)}
                      >
                        <Utensils className="h-4 w-4 mr-2" />
                        View Recipe
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[700px] bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800">
                      <DialogHeader>
                        <DialogTitle className="text-gray-900 dark:text-white text-xl">{recipe.title}</DialogTitle>
                        <DialogDescription className="text-gray-600 dark:text-gray-400">
                          {recipe.description}
                        </DialogDescription>
                      </DialogHeader>
                      <div className="relative aspect-video w-full overflow-hidden rounded-lg mb-4">
                        <Image
                          src={recipe.image || "/placeholder.svg"}
                          alt={recipe.title}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <Tabs defaultValue="instructions">
                        <TabsList className="bg-gray-100 dark:bg-gray-800">
                          <TabsTrigger
                            value="instructions"
                            className="data-[state=active]:bg-white dark:data-[state=active]:bg-gray-900 data-[state=active]:text-emerald-600 dark:data-[state=active]:text-emerald-500"
                          >
                            Instructions
                          </TabsTrigger>
                          <TabsTrigger
                            value="ingredients"
                            className="data-[state=active]:bg-white dark:data-[state=active]:bg-gray-900 data-[state=active]:text-emerald-600 dark:data-[state=active]:text-emerald-500"
                          >
                            Ingredients
                          </TabsTrigger>
                          <TabsTrigger
                            value="nutrition"
                            className="data-[state=active]:bg-white dark:data-[state=active]:bg-gray-900 data-[state=active]:text-emerald-600 dark:data-[state=active]:text-emerald-500"
                          >
                            Nutrition
                          </TabsTrigger>
                        </TabsList>
                        <TabsContent value="instructions" className="pt-4">
                          <div className="space-y-4">
                            <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                              <div className="flex items-center">
                                <Clock className="h-4 w-4 mr-1" />
                                <span>Prep: {recipe.prepTime} min</span>
                              </div>
                              <div className="flex items-center">
                                <Clock className="h-4 w-4 mr-1" />
                                <span>Cook: {recipe.cookTime} min</span>
                              </div>
                              <div className="flex items-center">
                                <Clock className="h-4 w-4 mr-1" />
                                <span>Total: {recipe.prepTime + recipe.cookTime} min</span>
                              </div>
                            </div>
                            <h3 className="text-lg font-medium text-gray-900 dark:text-white">Steps</h3>
                            <ol className="space-y-2">
                              {recipe.instructions.map((step, index) => (
                                <li key={index} className="flex gap-2 text-gray-700 dark:text-gray-300">
                                  <span className="font-bold">{index + 1}.</span>
                                  <span>{step}</span>
                                </li>
                              ))}
                            </ol>
                          </div>
                        </TabsContent>
                        <TabsContent value="ingredients" className="pt-4">
                          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Ingredients</h3>
                          <ul className="space-y-2">
                            {recipe.ingredients.map((ingredient, index) => (
                              <li key={index} className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                                <div className="h-2 w-2 rounded-full bg-emerald-600 dark:bg-emerald-500"></div>
                                <span>{ingredient}</span>
                              </li>
                            ))}
                          </ul>
                        </TabsContent>
                        <TabsContent value="nutrition" className="pt-4">
                          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                            Nutrition Information
                          </h3>
                          <div className="grid grid-cols-2 gap-4">
                            <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg">
                              <p className="text-sm text-gray-600 dark:text-gray-400">Calories</p>
                              <p className="text-xl font-bold text-gray-900 dark:text-white">
                                {recipe.nutrition.calories}
                              </p>
                            </div>
                            <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg">
                              <p className="text-sm text-gray-600 dark:text-gray-400">Protein</p>
                              <p className="text-xl font-bold text-gray-900 dark:text-white">
                                {recipe.nutrition.protein}
                              </p>
                            </div>
                            <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg">
                              <p className="text-sm text-gray-600 dark:text-gray-400">Carbs</p>
                              <p className="text-xl font-bold text-gray-900 dark:text-white">
                                {recipe.nutrition.carbs}
                              </p>
                            </div>
                            <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg">
                              <p className="text-sm text-gray-600 dark:text-gray-400">Fat</p>
                              <p className="text-xl font-bold text-gray-900 dark:text-white">{recipe.nutrition.fat}</p>
                            </div>
                          </div>
                        </TabsContent>
                      </Tabs>
                      <div className="flex justify-between mt-4">
                        <Button
                          variant="outline"
                          className="border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300"
                          onClick={() => {
                            toast({
                              title: "Added to shopping list",
                              description: "Ingredients have been added to your shopping list.",
                            })
                          }}
                        >
                          Add to Shopping List
                        </Button>
                        <Button
                          className="bg-emerald-600 hover:bg-emerald-700 text-white dark:bg-emerald-600 dark:hover:bg-emerald-700"
                          onClick={() => toggleFavorite(recipe.id)}
                        >
                          {favorites.includes(recipe.id) ? (
                            <>
                              <Heart className="h-4 w-4 mr-2 fill-current" />
                              Remove from Favorites
                            </>
                          ) : (
                            <>
                              <Heart className="h-4 w-4 mr-2" />
                              Add to Favorites
                            </>
                          )}
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                </CardFooter>
              </Card>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-12 text-center bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800">
            <Utensils className="h-12 w-12 text-gray-300 dark:text-gray-700 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">No recipes found</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 mb-4 max-w-md">
              {searchQuery ||
              filters.mealTypes.length > 0 ||
              filters.dietTypes.length > 0 ||
              filters.ingredients.length > 0
                ? "Try adjusting your search or filters to find more recipes"
                : "Add some ingredients to your inventory to get personalized recipe suggestions"}
            </p>
            <Button
              variant="outline"
              className="border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300"
              onClick={() => {
                setSearchQuery("")
                setFilters({ mealTypes: [], dietTypes: [], ingredients: [] })
              }}
            >
              Clear All Filters
            </Button>
          </div>
        )}
      </main>
      <footer className="flex flex-col gap-2 sm:flex-row py-6 w-full shrink-0 items-center px-4 md:px-6 border-t bg-white dark:bg-gray-900 dark:border-gray-800">
        <p className="text-xs text-gray-500 dark:text-gray-400">© 2024 FreshTrack. All rights reserved.</p>
        <nav className="sm:ml-auto flex gap-4 sm:gap-6">
          <Link
            className="text-xs text-gray-500 hover:text-emerald-600 dark:text-gray-400 dark:hover:text-emerald-500 hover:underline underline-offset-4"
            href="#"
          >
            Terms of Service
          </Link>
          <Link
            className="text-xs text-gray-500 hover:text-emerald-600 dark:text-gray-400 dark:hover:text-emerald-500 hover:underline underline-offset-4"
            href="#"
          >
            Privacy
          </Link>
        </nav>
      </footer>
    </div>
  )
}

