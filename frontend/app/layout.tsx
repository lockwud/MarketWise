import "@/app/globals.css";
import { Inter } from "next/font/google";
import { ThemeProvider } from "@/components/theme-provider";


const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "MarketWise – Find the Best Market Prices",
  description:
    "AI-powered market price prediction and comparison. Find the best prices for goods and services near you.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <div className="min-h-screen flex flex-col">
            <main className="flex-grow">{children}</main>
            
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}

import "./globals.css";
