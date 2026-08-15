import type { Metadata } from "next";
import { Fraunces, Inter } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "AgriSetu — Farm advice for your crop and soil",
  description:
    "Plain-language farming advice for small and marginal farmers — localized agro-advisories, crop disease diagnosis from a photo, and soil health, built for the BRICS AgriN initiative.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${fraunces.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col">
        <Header />
        <main className="mx-auto w-full max-w-4xl flex-1 px-4 py-6 sm:px-6">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
