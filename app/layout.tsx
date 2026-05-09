import type { Metadata, Viewport } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import { Toaster } from "sonner";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { ReactQueryProvider } from "@/src/components/providers/react-query-provider";
import { HeroUIRouterProvider } from "@/src/components/providers/heroui-provider";
import { ThemeProvider } from "@/src/components/providers/theme-provider";
import { SyncProvider } from "@/src/components/providers/sync-provider";
import "./globals.css";

export const metadata: Metadata = {
  title: "ELTGRUP Manager",
  description: "Platforma operationala pentru constructii si echipe de teren",
  manifest: "/manifest.json",
  icons: {
    icon: "/icon.svg",
    shortcut: "/icon.svg",
    apple: "/icon.svg",
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "ELTManager",
  },
  formatDetection: {
    telephone: false,
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: [
    { media: "(prefers-color-scheme: dark)", color: "#090c12" },
    { media: "(prefers-color-scheme: light)", color: "#f8f9fb" },
  ],
  colorScheme: "dark light",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="ro"
      className={`${GeistSans.variable} ${GeistMono.variable}`}
      suppressHydrationWarning
    >
      <body className="antialiased">
        <ThemeProvider>
          <HeroUIRouterProvider>
            <ReactQueryProvider>
              <SyncProvider>
                {children}
                <Toaster richColors position="top-right" />
              </SyncProvider>
            </ReactQueryProvider>
          </HeroUIRouterProvider>
        </ThemeProvider>
        <SpeedInsights />
      </body>
    </html>
  );
}
