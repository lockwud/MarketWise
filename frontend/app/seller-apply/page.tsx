"use client";

import { useState, FormEvent, ChangeEvent } from "react";
import Link from "next/link";
import { TrendingUp, User, Mail, Lock, Phone, MapPin, Briefcase, Eye, EyeOff, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { sellerApply } from "@/lib/api/auth";

interface FormData {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  phone: string;
  location: string;
  businessName: string;
}

const EMPTY: FormData = { name: "", email: "", password: "", confirmPassword: "", phone: "", location: "", businessName: "" };
const EMPTY_ERRORS = { name: "", email: "", password: "", confirmPassword: "", phone: "", location: "", businessName: "" };

export default function SellerApplyPage() {
  const { toast } = useToast();
  const [formData, setFormData] = useState<FormData>(EMPTY);
  const [errors, setErrors] = useState<typeof EMPTY_ERRORS>(EMPTY_ERRORS);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name as keyof typeof EMPTY_ERRORS]) {
      setErrors(prev => ({ ...prev, [name]: "" }));
    }
  };

  const validate = (): boolean => {
    const e = { ...EMPTY_ERRORS };
    let ok = true;
    if (!formData.name.trim()) { e.name = "Name is required"; ok = false; }
    if (!formData.email.trim()) { e.email = "Email is required"; ok = false; }
    else if (!/\S+@\S+\.\S+/.test(formData.email)) { e.email = "Invalid email address"; ok = false; }
    if (!formData.password) { e.password = "Password is required"; ok = false; }
    else if (formData.password.length < 8) { e.password = "Password must be at least 8 characters"; ok = false; }
    if (formData.password !== formData.confirmPassword) { e.confirmPassword = "Passwords do not match"; ok = false; }
    if (!formData.businessName.trim()) { e.businessName = "Business name is required"; ok = false; }
    setErrors(e);
    return ok;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setIsLoading(true);
    try {
      await sellerApply({
        name: formData.name,
        email: formData.email,
        password: formData.password,
        phone: formData.phone || undefined,
        location: formData.location || undefined,
        businessName: formData.businessName,
      });
      setSubmitted(true);
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : "Submission failed. Please try again.";
      toast({ variant: "destructive", title: "Application failed", description: msg });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-white dark:bg-gray-950">
      <header className="px-4 lg:px-8 h-16 flex items-center border-b bg-white/80 dark:bg-gray-950/80 backdrop-blur-md sticky top-0 z-30">
        <Link className="flex items-center gap-2" href="/">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-600">
            <TrendingUp className="h-5 w-5 text-white" />
          </div>
          <span className="text-xl font-bold tracking-tight text-gray-900 dark:text-white">
            Market<span className="text-emerald-600">Wise</span>
          </span>
        </Link>
        <nav className="ml-auto flex items-center gap-1">
          <Link className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white rounded-md transition-colors" href="/">Home</Link>
          <Link className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white rounded-md transition-colors" href="/login">Login</Link>
        </nav>
      </header>

      <main className="flex-1 flex items-center justify-center p-4 md:p-8">
        {submitted ? (
          <div className="mx-auto max-w-md w-full text-center space-y-6">
            <div className="flex justify-center">
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-900/30">
                <CheckCircle2 className="h-10 w-10 text-emerald-600" />
              </div>
            </div>
            <div className="space-y-2">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Application Submitted!</h1>
              <p className="text-gray-600 dark:text-gray-400">
                Thank you for applying to sell on MarketWise. Our team will review your application and activate your account within <strong>1–2 business days</strong>.
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-500">
                You will be able to log in once an admin has verified and approved your account.
              </p>
            </div>
            <Link href="/login">
              <Button className="bg-emerald-600 hover:bg-emerald-700 w-full max-w-xs">
                Return to Login
              </Button>
            </Link>
          </div>
        ) : (
          <Card className="mx-auto max-w-lg w-full">
            <CardHeader className="space-y-1">
              <CardTitle className="text-2xl font-bold">Seller Application</CardTitle>
              <CardDescription>
                Apply to sell on MarketWise. An admin will review and verify your account before you can log in.
              </CardDescription>
            </CardHeader>
            <form onSubmit={handleSubmit}>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name *</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input id="name" name="name" placeholder="John Doe" className="pl-10" value={formData.name} onChange={handleChange} />
                    </div>
                    {errors.name && <p className="text-sm text-red-500">{errors.name}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="businessName">Business Name *</Label>
                    <div className="relative">
                      <Briefcase className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input id="businessName" name="businessName" placeholder="My Stall / Shop" className="pl-10" value={formData.businessName} onChange={handleChange} />
                    </div>
                    {errors.businessName && <p className="text-sm text-red-500">{errors.businessName}</p>}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email *</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input id="email" name="email" type="email" placeholder="seller@example.com" className="pl-10" value={formData.email} onChange={handleChange} />
                  </div>
                  {errors.email && <p className="text-sm text-red-500">{errors.email}</p>}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone</Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input id="phone" name="phone" placeholder="+1 555 0000" className="pl-10" value={formData.phone} onChange={handleChange} />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="location">Location</Label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input id="location" name="location" placeholder="City, Country" className="pl-10" value={formData.location} onChange={handleChange} />
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Password *</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input id="password" name="password" type={showPassword ? "text" : "password"} placeholder="••••••••" className="pl-10 pr-10" value={formData.password} onChange={handleChange} />
                    <Button type="button" variant="ghost" size="icon" className="absolute right-0 top-0 h-10 w-10 text-gray-400" onClick={() => setShowPassword(v => !v)}>
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      <span className="sr-only">{showPassword ? "Hide password" : "Show password"}</span>
                    </Button>
                  </div>
                  {errors.password && <p className="text-sm text-red-500">{errors.password}</p>}
                  <p className="text-xs text-gray-500">Must be at least 8 characters</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm Password *</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input id="confirmPassword" name="confirmPassword" type={showPassword ? "text" : "password"} placeholder="••••••••" className="pl-10" value={formData.confirmPassword} onChange={handleChange} />
                  </div>
                  {errors.confirmPassword && <p className="text-sm text-red-500">{errors.confirmPassword}</p>}
                </div>

                <div className="rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 px-4 py-3 text-sm text-blue-800 dark:text-blue-300">
                  Your application will be reviewed by an admin. You will not be able to log in until your account is verified.
                </div>
              </CardContent>

              <CardFooter className="flex flex-col gap-3">
                <Button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-700" disabled={isLoading}>
                  {isLoading ? "Submitting..." : "Submit Application"}
                </Button>
                <div className="text-center text-sm text-gray-500">
                  Already have an account?{" "}
                  <Link href="/login" className="text-emerald-600 hover:underline">Login</Link>
                  {" · "}
                  <Link href="/signup" className="text-emerald-600 hover:underline">Register as Buyer</Link>
                </div>
              </CardFooter>
            </form>
          </Card>
        )}
      </main>

      <footer className="flex flex-col gap-2 sm:flex-row py-6 w-full shrink-0 items-center px-4 md:px-6 border-t">
        <p className="text-xs text-gray-500">© 2026 MarketWise. All rights reserved.</p>
        <nav className="sm:ml-auto flex gap-4 sm:gap-6">
          <Link className="text-xs hover:underline underline-offset-4" href="#">Terms of Service</Link>
          <Link className="text-xs hover:underline underline-offset-4" href="#">Privacy</Link>
        </nav>
      </footer>
    </div>
  );
}
