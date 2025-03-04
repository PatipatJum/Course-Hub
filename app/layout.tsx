import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Navbar from "./components/Navbar";
import LeftsideNavbar from "./components/LeftsideNavbar";
import { getServerSession } from "next-auth";
import AuthProvider from "./components/SessionProvider";
import { SidebarProvider } from "./components/SidebarContext";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

const session = await getServerSession(authOptions);
const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Create Next App",
  description: "Generated by create next app",
};

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const session = await getServerSession();

  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <AuthProvider session={session}>
          <SidebarProvider>
            <Navbar />
            <LeftsideNavbar />
            <main className="transition-all duration-300">
              {children}
            </main>
          </SidebarProvider>
        </AuthProvider>
      </body>
    </html>
  );
}