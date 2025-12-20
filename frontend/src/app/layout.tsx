import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import { ThemeInit } from "@/components/theme/themeInit";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Blind CU | Anonymous Community",
  description:
    "A safe, anonymous community for Chandigarh University students.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {

  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        <div className="fixed top-4 right-4 z-50">
          <ThemeInit/>
          <ThemeToggle />
        </div>
        <Toaster />
        {children}
      </body>
    </html>
  );
}
