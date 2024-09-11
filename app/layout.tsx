import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/layout/Navbar";
import { Jersey_10 } from "next/font/google"

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Nicolas Villabona",
  description: "Generated by create next app",
  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon.ico',
  },
};


const jersey = Jersey_10({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-jersey",
})

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Navbar />
        <main className={`${jersey.className} flex min-h-screen flex-col items-center gap-4 md:px-10 lg:px-24 xl:px-60 xs:px-4 pt-20 `}>
          {children}
        </main>
      </body>
    </html>
  );
}
