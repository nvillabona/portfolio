import type { Metadata } from "next";
import { Atkinson_Hyperlegible } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/layout/Navbar";



export const metadata: Metadata = {
  title: "Nicolás Villabona",
  description: "Nicolás Villabona Frontend Developer",
  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon.ico',
  },
};

const atkinson = Atkinson_Hyperlegible({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-atkinson",
})

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={atkinson.className}>
        <Navbar />
        <main className="flex min-h-screen flex-col items-center gap-4 md:px-10 lg:px-24 xl:px-60 xs:px-4 pt-20">
          {children}
        </main>
      </body>
    </html>
  );
}
