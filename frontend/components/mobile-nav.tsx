"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, Moon, TrendingUp, Sun, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { useTheme } from "next-themes";

export function MobileNav() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();

  const routes = [
    { href: "/", label: "Home" },
    { href: "/about", label: "About" },
    { href: "/dashboard", label: "Explore Markets" },
    { href: "/login", label: "Log in" },
    { href: "/signup", label: "Sign Up" },
  ];

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden text-muted-foreground dark:text-muted-foreground/40 hover:bg-muted/50 dark:hover:bg-muted/40"
        >
          <Menu className="h-6 w-6 text-muted-foreground dark:text-muted-foreground/40" />
          <span className="sr-only">Toggle menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent
        side="left"
        className="flex flex-col bg-background dark:bg-popover border-r border-input"
      >
        <div className="flex items-center justify-between border-b pb-6 dark:border-muted/20">
          <Link
            href="/"
            className="flex items-center gap-3 font-semibold text-foreground dark:text-white tracking-tight"
            onClick={() => setOpen(false)}
          >
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-600">
              <TrendingUp className="h-4 w-4 text-white" />
            </div>
            <span>Market<span className="text-emerald-600">Wise</span></span>
          </Link>
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="p-1 rounded-full hover:bg-muted/50 dark:hover:bg-muted/40"
            >
              {theme === "dark" ? (
                <Sun className="h-5 w-5 text-muted-foreground dark:text-muted-foreground/40" />
              ) : (
                <Moon className="h-5 w-5 text-muted-foreground dark:text-muted-foreground/40" />
              )}
              <span className="sr-only">Toggle theme</span>
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setOpen(false)}
              className="p-1 rounded-full hover:bg-muted/50 dark:hover:bg-muted/40"
            >
              <X className="h-6 w-6 text-muted-foreground dark:text-muted-foreground/40" />
              <span className="sr-only">Close menu</span>
            </Button>
          </div>
        </div>
        <nav className="flex flex-col gap-4 mt-6">
          {routes.map((route) => (
            <Link
              key={route.href}
              href={route.href}
              onClick={() => setOpen(false)}
              className={cn(
                "flex items-center gap-3 py-3 text-lg font-medium rounded-lg transition-colors hover:bg-muted/50 dark:hover:bg-muted/40",
                pathname === route.href
                  ? "bg-primary/10 text-primary dark:text-primary-foreground"
                  : "text-muted-foreground dark:text-muted-foreground/60 hover:text-muted-foreground/40"
              )}
            >
              {route.label}
            </Link>
          ))}
        </nav>
      </SheetContent>
    </Sheet>
  );
}
