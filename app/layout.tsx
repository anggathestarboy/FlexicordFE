import type { Metadata } from "next";
import "./globals.css";
import { AppProvider } from "@/context/AppContext";
import LayoutWrapper from "@/components/LayoutWrapper";
import Providers from "./providers"; // ← tambah ini
import PWARegister from "@/components/PWARegister";

export const metadata: Metadata = {
  title: "Flexicord",
  description: "A community-driven Q&A platform for developers.",
  manifest: "/manifest.json",
    verification: {
    google: "nNKuI2XYFZPj2T72QHx-xbbgiKJE4cqFEnhX5D3LIEk",
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen bg-zinc-50 dark:bg-zinc-950 transition-colors duration-200">
        <Providers>        
          <AppProvider>
            <LayoutWrapper>
              {children}
            </LayoutWrapper>
            <PWARegister />
          </AppProvider>
        </Providers>
      </body>
    </html>
  );
}
