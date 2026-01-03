import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Sidebar from "../components/Sidebar";
import { Toaster } from "@/components/ui/sonner";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Sistema Chiphone",
  description: "Sistema de gestión comercial",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body
        className={`
          ${geistSans.variable} 
          ${geistMono.variable} 
          antialiased
          bg-[#1C1C1B] 
          text-[#E2E2DE]
        `}
      >
        <div className="min-h-screen flex">
          {/* SIDEBAR */}
          <Sidebar />

          {/* CONTENIDO */}
          <main className="flex-1 p-4 md:p-6 lg:p-8 bg-[#1C1C1B]">
            {children}
          </main>
        </div>

        {/* TOAST GLOBAL */}
        <Toaster
          richColors
          position="top-right"
          toastOptions={{
            classNames: {
              toast:
                "bg-[#2A2A29] text-[#E2E2DE] border border-[#3A3A38]",
              description: "text-[#B7AC9B]",
              actionButton: "bg-[#6A5D52] text-white",
              cancelButton: "bg-[#3A2F2A] text-[#E2E2DE]",
            },
          }}
        />
      </body>
    </html>
  );
}
