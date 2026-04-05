"use client"

import { useState } from "react"
import Link from "next/link"
import { Camera, ChevronRight, Edit, LogOut, Mail, Phone, Save, ShoppingBasket, User } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Footer } from "@/components/footer"


export default function ProfilePage() {
  const { toast } = useToast()
  const [isEditing, setIsEditing] = useState(false)
  const [profileData, setProfileData] = useState({
    name: "Jane Smith",
    email: "jane.smith@example.com",
    phone: "+1 (555) 123-4567",
    bio: "Food enthusiast and waste reduction advocate. I love finding creative ways to use ingredients before they expire.",
    notifications: {
      email: true,
      push: true,
      expiryAlerts: true,
      weeklyReport: true,
      newRecipes: false,
    },
  })

  const handleChange = (e:any) => {
    const { name, value } = e.target
    setProfileData((prev) => ({ ...prev, [name]: value }))
  }

  const handleNotificationChange = (key:any, checked:any) => {
    setProfileData((prev) => ({
      ...prev,
      notifications: {
        ...prev.notifications,
        [key]: checked,
      },
    }))
  }

  const handleSave = () => {
    setIsEditing(false)
    toast({
      title: "Profile updated",
      description: "Your profile has been updated successfully.",
    })
  }

  return (
    <div className="flex min-h-screen flex-col">
      <header className="px-4 lg:px-6 h-16 flex items-center border-b">
        <Link className="flex items-center justify-center" href="/">
          <ShoppingBasket className="h-6 w-6 text-green-600" />
          <span className="ml-2 text-xl font-bold">FreshTrack</span>
        </Link>
        <nav className="ml-auto flex gap-4 sm:gap-6">
          <Link className="text-sm font-medium hover:underline underline-offset-4" href="/dashboard">
            Dashboard
          </Link>
          <Link className="text-sm font-medium hover:underline underline-offset-4" href="/recipes">
            Recipes
          </Link>
          {/* <Link className="text-sm font-medium hover:underline underline-offset-4" href="/about">
            About
          </Link> */}
        </nav>
      </header>
      <main className="flex-1 py-6 px-4 md:px-6">
        <div className="mx-auto max-w-4xl">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
            <h1 className="text-2xl font-bold">My Profile</h1>
            <div className="flex items-center mt-2 md:mt-0">
              <Button variant="outline" size="sm" className="mr-2" asChild>
                <Link href="/dashboard">Back to Dashboard</Link>
              </Button>
              <Button variant="destructive" size="sm">
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>

          <div className="grid gap-6 md:grid-cols-[250px_1fr]">
            <Card>
              <CardContent className="p-6 flex flex-col items-center">
                <div className="relative mb-4">
                  <Avatar className="h-32 w-32">
                    <AvatarImage src="/placeholder.svg?height=128&width=128" alt="Profile picture" />
                    <AvatarFallback>JS</AvatarFallback>
                  </Avatar>
                  <Button
                    size="icon"
                    className="absolute bottom-0 right-0 rounded-full bg-green-600 hover:bg-green-700 h-8 w-8"
                  >
                    <Camera className="h-4 w-4" />
                    <span className="sr-only">Change profile picture</span>
                  </Button>
                </div>
                <h2 className="text-xl font-bold">{profileData.name}</h2>
                <p className="text-sm text-gray-500 text-center mt-1">{profileData.email}</p>
                <Separator className="my-4" />
                <nav className="w-full">
                  <div className="space-y-1 w-full">
                    <Button variant="ghost" className="w-full justify-start" asChild>
                      <Link href="/profile">
                        <User className="mr-2 h-4 w-4" />
                        Personal Information
                      </Link>
                    </Button>
                    <Button variant="ghost" className="w-full justify-start" asChild>
                      <Link href="/profile/preferences">
                        <ChevronRight className="mr-2 h-4 w-4" />
                        Preferences
                      </Link>
                    </Button>
                    <Button variant="ghost" className="w-full justify-start" asChild>
                      <Link href="/profile/security">
                        <ChevronRight className="mr-2 h-4 w-4" />
                        Security
                      </Link>
                    </Button>
                    <Button variant="ghost" className="w-full justify-start" asChild>
                      <Link href="/profile/connected-accounts">
                        <ChevronRight className="mr-2 h-4 w-4" />
                        Connected Accounts
                      </Link>
                    </Button>
                  </div>
                </nav>
              </CardContent>
            </Card>

            <div className="space-y-6">
              <Tabs defaultValue="profile">
                <TabsList className="mb-4">
                  <TabsTrigger value="profile">Profile</TabsTrigger>
                  <TabsTrigger value="notifications">Notifications</TabsTrigger>
                  <TabsTrigger value="activity">Activity</TabsTrigger>
                </TabsList>
                <TabsContent value="profile">
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                      <div>
                        <CardTitle>Personal Information</CardTitle>
                        <CardDescription>Update your personal details</CardDescription>
                      </div>
                      {!isEditing ? (
                        <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}>
                          <Edit className="h-4 w-4 mr-2" />
                          Edit
                        </Button>
                      ) : (
                        <Button className="bg-green-600 hover:bg-green-700" size="sm" onClick={handleSave}>
                          <Save className="h-4 w-4 mr-2" />
                          Save
                        </Button>
                      )}
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="name">Full Name</Label>
                        <div className="relative">
                          <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                          <Input
                            id="name"
                            name="name"
                            value={profileData.name}
                            onChange={handleChange}
                            className="pl-10"
                            disabled={!isEditing}
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <div className="relative">
                          <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                          <Input
                            id="email"
                            name="email"
                            type="email"
                            value={profileData.email}
                            onChange={handleChange}
                            className="pl-10"
                            disabled={!isEditing}
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="phone">Phone</Label>
                        <div className="relative">
                          <Phone className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                          <Input
                            id="phone"
                            name="phone"
                            value={profileData.phone}
                            onChange={handleChange}
                            className="pl-10"
                            disabled={!isEditing}
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="bio">Bio</Label>
                        <Textarea
                          id="bio"
                          name="bio"
                          value={profileData.bio}
                          onChange={handleChange}
                          rows={4}
                          disabled={!isEditing}
                          placeholder="Tell us a bit about yourself"
                        />
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
                <TabsContent value="notifications">
                  <Card>
                    <CardHeader>
                      <CardTitle>Notification Settings</CardTitle>
                      <CardDescription>Manage how you receive notifications</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label htmlFor="email-notifications">Email Notifications</Label>
                          <p className="text-sm text-gray-500">Receive notifications via email</p>
                        </div>
                        <Switch
                          id="email-notifications"
                          checked={profileData.notifications.email}
                          onCheckedChange={(checked) => handleNotificationChange("email", checked)}
                        />
                      </div>
                      <Separator />
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label htmlFor="push-notifications">Push Notifications</Label>
                          <p className="text-sm text-gray-500">Receive notifications on your device</p>
                        </div>
                        <Switch
                          id="push-notifications"
                          checked={profileData.notifications.push}
                          onCheckedChange={(checked) => handleNotificationChange("push", checked)}
                        />
                      </div>
                      <Separator />
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label htmlFor="expiry-alerts">Expiry Alerts</Label>
                          <p className="text-sm text-gray-500">Get alerts when items are about to expire</p>
                        </div>
                        <Switch
                          id="expiry-alerts"
                          checked={profileData.notifications.expiryAlerts}
                          onCheckedChange={(checked) => handleNotificationChange("expiryAlerts", checked)}
                        />
                      </div>
                      <Separator />
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label htmlFor="weekly-report">Weekly Report</Label>
                          <p className="text-sm text-gray-500">Receive a weekly summary of your inventory</p>
                        </div>
                        <Switch
                          id="weekly-report"
                          checked={profileData.notifications.weeklyReport}
                          onCheckedChange={(checked) => handleNotificationChange("weeklyReport", checked)}
                        />
                      </div>
                      <Separator />
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label htmlFor="new-recipes">New Recipe Suggestions</Label>
                          <p className="text-sm text-gray-500">Get notified about new recipe suggestions</p>
                        </div>
                        <Switch
                          id="new-recipes"
                          checked={profileData.notifications.newRecipes}
                          onCheckedChange={(checked) => handleNotificationChange("newRecipes", checked)}
                        />
                      </div>
                    </CardContent>
                    <CardFooter>
                      <Button
                        className="bg-green-600 hover:bg-green-700"
                        onClick={() =>
                          toast({
                            title: "Notification settings updated",
                            description: "Your notification preferences have been saved.",
                          })
                        }
                      >
                        Save Preferences
                      </Button>
                    </CardFooter>
                  </Card>
                </TabsContent>
                <TabsContent value="activity">
                  <Card>
                    <CardHeader>
                      <CardTitle>Recent Activity</CardTitle>
                      <CardDescription>Your recent actions and changes</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="border-l-4 border-green-600 pl-4 py-2">
                          <p className="font-medium">Added 3 new items to inventory</p>
                          <p className="text-sm text-gray-500">Today at 10:30 AM</p>
                        </div>
                        <div className="border-l-4 border-amber-500 pl-4 py-2">
                          <p className="font-medium">Milk is expiring soon</p>
                          <p className="text-sm text-gray-500">Yesterday at 2:15 PM</p>
                        </div>
                        <div className="border-l-4 border-blue-500 pl-4 py-2">
                          <p className="font-medium">Updated profile information</p>
                          <p className="text-sm text-gray-500">March 15, 2024 at 9:45 AM</p>
                        </div>
                        <div className="border-l-4 border-green-600 pl-4 py-2">
                          <p className="font-medium">Added 5 new items to inventory</p>
                          <p className="text-sm text-gray-500">March 12, 2024 at 11:20 AM</p>
                        </div>
                        <div className="border-l-4 border-red-500 pl-4 py-2">
                          <p className="font-medium">Removed expired items (2)</p>
                          <p className="text-sm text-gray-500">March 10, 2024 at 4:30 PM</p>
                        </div>
                      </div>
                    </CardContent>
                    <CardFooter>
                      <Button variant="outline" className="w-full">
                        View All Activity
                      </Button>
                    </CardFooter>
                  </Card>
                </TabsContent>
              </Tabs>
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

