import type { Metadata } from "next";
import "./globals.css";
import { AppProvider } from "@/context/AppContext";
import LayoutWrapper from "@/components/LayoutWrapper";
import Providers from "./providers"; // ← tambah ini

export const metadata: Metadata = {
  title: "Flexicord - Developer Q&A",
  description: "A community-driven Q&A platform for developers.",
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
          </AppProvider>
        </Providers>
      </body>
    </html>
  );
}