import type { Metadata } from "next";
import { Inter } from "next/font/google";

import HomeLayout from "./layout.client";

import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Off The Beaten Path",
  description: "Design studio to plan your next adventure",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <HomeLayout>{children}</HomeLayout>
      </body>
    </html>
  );
}
