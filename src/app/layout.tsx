import type { Metadata } from "next";
import { Geist_Mono, Inter } from "next/font/google";

import { ToastProvider } from "@/components/ui/toast";

import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Synapse",
  description: "One fast, searchable, AI-enhanced hub for everything a developer keeps scattered.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`dark ${inter.variable} ${geistMono.variable} h-full overflow-hidden antialiased`}
    >
      <body className="h-full flex flex-col overflow-hidden">
        <ToastProvider>{children}</ToastProvider>
      </body>
    </html>
  );
}
