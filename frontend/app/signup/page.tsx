"use client";

import { useState, FormEvent, ChangeEvent, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Lock, Mail, TrendingUp, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Checkbox } from "@/components/ui/checkbox";
import { toast, useToast } from "@/hooks/use-toast";
import { signup } from "@/lib/api/auth";
import { setAuthCookies, isAuthenticated } from "@/lib/auth";
import Image from "next/image";
import google from "@/public/images/google.png";
import facebook from "@/public/images/facebooklog.png";

interface FormData {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  agreeTerms: boolean;
}

interface FormErrors {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  agreeTerms: string;
}

export default function SignupPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [isOAuthLoading, setIsOAuthLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [redirectUri, setRedirectUri] = useState("");
  const [formData, setFormData] = useState<FormData>({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    agreeTerms: false,
  });
  const [errors, setErrors] = useState<FormErrors>({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    agreeTerms: "",
  });

  useEffect(() => {
    if (typeof window !== "undefined") {
      setRedirectUri(encodeURIComponent(`${window.location.origin}/signup`));
    }

    const checkAuthAndRedirect = async () => {
      try {
        const params = new URLSearchParams(window.location.search);
        const token = params.get("token");
        const role = params.get("role");
        const error = params.get("error");

        if (error) {
          toast({
            variant: "destructive",
            title: "Authentication Error",
            description: error,
          });
          return;
        }

        if (token && role) {
          setAuthCookies(token, role);
          toast({ title: "Signup successful", description: "Welcome to MarketWise!" });
          window.history.replaceState({}, document.title, window.location.pathname);

          const returnUrl = params.get("returnUrl");
          const redirectTo = returnUrl ? `/${returnUrl}` : role === "admin" ? "/admin" : "/dashboard";
          router.push(redirectTo);
          return;
        }
      } catch (error) {
        toast({
          variant: "destructive",
          title: "Authentication Error",
          description: "Failed to process authentication. Please try again.",
        });
      }
    };

    checkAuthAndRedirect();
  }, [router, toast]);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));

    // Clear error when field is edited
    if (errors[name as keyof FormErrors]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const validateForm = () => {
    let isValid = true;
    const newErrors = { ...errors };

    // Email and Password Validations
    if (!formData.name.trim()) {
      newErrors.name = "Name is required";
      isValid = false;
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
      isValid = false;
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Email is invalid";
      isValid = false;
    }

    if (!formData.password) {
      newErrors.password = "Password is required";
      isValid = false;
    } else if (formData.password.length < 8) {
      newErrors.password = "Password must be at least 8 characters";
      isValid = false;
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
      isValid = false;
    }

    if (!formData.agreeTerms) {
      newErrors.agreeTerms = "You must agree to the terms and conditions";
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSignup = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!validateForm()) return;
    setIsLoading(true);

    try {
      const response = await fetch("https://smartpantry-bc4q.onrender.com/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Signup failed. Please try again.");
      }

      const data = await response.json();
      setAuthCookies(data.token, data.role);
      toast({ title: "Signup successful", description: "Welcome to MarketWise!" });

      // Redirect based on role
      router.push(data.role === "admin" ? "/admin/dashboard" : "/dashboard");
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Signup failed",
        description: error.message || "Signup failed. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleOAuthSignup = (provider: "google" | "facebook") => {
    try {
      const baseUrl = "https://smartpantry-bc4q.onrender.com/auth";
      const url =
        provider === "google"
          ? `${baseUrl}/google/redirect?redirect_uri=${redirectUri}`
          : `${baseUrl}/facebook/redirect?redirect_uri=${redirectUri}`;

      window.location.href = url;
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: `Failed to initiate ${provider} signup. Please try again.`,
      });
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
          <Link
            className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white rounded-md transition-colors"
            href="/"
          >
            Home
          </Link>
          <Link
            className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white rounded-md transition-colors"
            href="/about"
          >
            About
          </Link>
        </nav>
      </header>
      <main className="flex-1 flex items-center justify-center p-4 md:p-8">
        <Card className="mx-auto max-w-md w-full">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold">
              Create an account
            </CardTitle>
            <CardDescription>
              Enter your details to start finding the best market prices
            </CardDescription>
          </CardHeader>
          <form onSubmit={handleSignup}>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <div className="relative">
                  <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="name"
                    name="name"
                    placeholder="John Doe"
                    className="pl-10"
                    value={formData.name}
                    onChange={handleChange}
                  />
                </div>
                {errors.name && (
                  <p className="text-sm text-red-500">{errors.name}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="name@example.com"
                    className="pl-10"
                    value={formData.email}
                    onChange={handleChange}
                  />
                </div>
                {errors.email && (
                  <p className="text-sm text-red-500">{errors.email}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    className="pl-10"
                    value={formData.password}
                    onChange={handleChange}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-0 top-0 h-10 w-10 text-gray-400"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                    <span className="sr-only">
                      {showPassword ? "Hide password" : "Show password"}
                    </span>
                  </Button>
                </div>
                {errors.password && (
                  <p className="text-sm text-red-500">{errors.password}</p>
                )}
                <p className="text-xs text-gray-500">
                  Password must be at least 8 characters long
                </p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    className="pl-10"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                  />
                </div>
                {errors.confirmPassword && (
                  <p className="text-sm text-red-500">
                    {errors.confirmPassword}
                  </p>
                )}
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="agreeTerms"
                  name="agreeTerms"
                  checked={formData.agreeTerms}
                  onCheckedChange={(checked) =>
                    setFormData((prev) => ({
                      ...prev,
                      agreeTerms: checked === true,
                    }))
                  }
                />
                <label
                  htmlFor="agreeTerms"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  I agree to the{" "}
                  <Link href="#" className="text-green-600 hover:underline">
                    terms of service
                  </Link>{" "}
                  and{" "}
                  <Link href="#" className="text-green-600 hover:underline">
                    privacy policy
                  </Link>
                </label>
              </div>
              {errors.agreeTerms && (
                <p className="text-sm text-red-500">{errors.agreeTerms}</p>
              )}
            </CardContent>
            <CardFooter className="flex flex-col">
              <Button
                type="submit"
                className="w-full bg-green-600 hover:bg-green-700"
                disabled={isLoading}
              >
                {isLoading ? "Signing up..." : "Sign Up"}
              </Button>
              <div className="mt-4 text-center text-sm">
                Already have an account?{" "}
                <Link href="/login" className="text-green-600 hover:underline">
                  Login
                </Link>
              </div>
              <div className="mt-6 flex items-center gap-2 w-full">
                <Separator className="flex-1" />
                <span className="text-xs text-gray-500">OR</span>
                <Separator className="flex-1" />
              </div>
              <div className="mt-4 grid w-full gap-2">
                <Button
                  variant="outline"
                  type="button"
                  className="w-full"
                  onClick={() => handleOAuthSignup("google")}
                  disabled={isOAuthLoading}
                >
                  <Image
                    src={google}
                    alt="Google Icon"
                    className="w-[30px] rounded-[5%]"
                  />
                  {isOAuthLoading ? "Authenticating..." : "Continue with Google"}
                </Button>
                <Button
                  variant="outline"
                  type="button"
                  className="w-full"
                  onClick={() => handleOAuthSignup("facebook")}
                  disabled={isOAuthLoading}
                >
                  <Image
                    src={facebook}
                    alt="Facebook Icon"
                    className="w-[30px] rounded-[5%]"
                  />
                  Continue with Facebook
                </Button>
              </div>
            </CardFooter>
          </form>
        </Card>
      </main>
      <footer className="flex flex-col gap-2 sm:flex-row py-6 w-full shrink-0 items-center px-4 md:px-6 border-t">
        <p className="text-xs text-gray-500">
          © 2026 MarketWise. All rights reserved.
        </p>
        <nav className="sm:ml-auto flex gap-4 sm:gap-6">
          <Link className="text-xs hover:underline underline-offset-4" href="#">
            Terms of Service
          </Link>
          <Link className="text-xs hover:underline underline-offset-4" href="#">
            Privacy
          </Link>
        </nav>
      </footer>
    </div>
  );
}
