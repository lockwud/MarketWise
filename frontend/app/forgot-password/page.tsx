"use client"

import { useState } from "react"
import Link from "next/link"
import { ArrowLeft, Mail, ShoppingBasket } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { Footer } from "@/components/footer"

export default function ForgotPasswordPage() {
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [email, setEmail] = useState("")
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1500))

      // In a real app, this would call a password reset API
      setSubmitted(true)
      toast({
        title: "Reset link sent",
        description: "Check your email for a link to reset your password.",
      })
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Failed to send reset link",
        description: "An error occurred. Please try again.",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen flex-col">
      <header className="px-4 lg:px-6 h-16 flex items-center border-b">
        <Link className="flex items-center justify-center" href="/">
          <ShoppingBasket className="h-6 w-6 text-green-600" />
          <span className="ml-2 text-xl font-bold">FreshTrack</span>
        </Link>
        <nav className="ml-auto flex gap-4 sm:gap-6">
          <Link className="text-sm font-medium hover:underline underline-offset-4" href="/">
            Home
          </Link>
          <Link className="text-sm font-medium hover:underline underline-offset-4" href="/about">
            About
          </Link>
        </nav>
      </header>
      <main className="flex-1 flex items-center justify-center p-4 md:p-8">
        <Card className="mx-auto max-w-md w-full">
          <CardHeader className="space-y-1">
            <div className="flex items-center">
              <Button variant="ghost" size="sm" className="mr-2" asChild>
                <Link href="/login">
                  <ArrowLeft className="h-4 w-4 mr-1" />
                  Back
                </Link>
              </Button>
              <CardTitle className="text-2xl font-bold">Forgot Password</CardTitle>
            </div>
            <CardDescription>
              {!submitted
                ? "Enter your email and we'll send you a link to reset your password"
                : "Check your email for a link to reset your password"}
            </CardDescription>
          </CardHeader>
          {!submitted ? (
            <form onSubmit={handleSubmit}>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="name@example.com"
                      className="pl-10"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button type="submit" className="w-full bg-green-600 hover:bg-green-700" disabled={isLoading}>
                  {isLoading ? "Sending..." : "Send Reset Link"}
                </Button>
              </CardFooter>
            </form>
          ) : (
            <CardContent className="space-y-4">
              <div className="rounded-lg bg-green-50 p-4 text-sm text-green-800">
                <p>
                  We've sent a password reset link to <strong>{email}</strong>. Please check your email and follow the
                  instructions to reset your password.
                </p>
              </div>
              <div className="text-center text-sm text-gray-500">
                <p>Didn't receive an email? Check your spam folder or</p>
                <Button variant="link" className="p-0 text-green-600" onClick={() => setSubmitted(false)}>
                  try again with a different email
                </Button>
              </div>
            </CardContent>
          )}
          <CardFooter className="flex justify-center border-t pt-4">
            <div className="text-center text-sm">
              Remember your password?{" "}
              <Link href="/login" className="text-green-600 hover:underline">
                Back to login
              </Link>
            </div>
          </CardFooter>
        </Card>
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

