import { SpeedInsights } from "@vercel/speed-insights/next";
import type { Metadata, Viewport } from "next";
import {
	Barlow_Condensed,
	JetBrains_Mono,
} from "next/font/google";
import { Toaster } from "sonner";
import { HeroUIRouterProvider } from "@/src/components/providers/heroui-provider";
import { ReactQueryProvider } from "@/src/components/providers/react-query-provider";
import { SyncProvider } from "@/src/components/providers/sync-provider";
import { ThemeProvider } from "@/src/components/providers/theme-provider";
import "./globals.css";

const barlowCondensed = Barlow_Condensed({
	subsets: ["latin", "latin-ext"],
	variable: "--font-barlow-condensed",
	weight: ["400", "500", "600", "700", "800"],
	display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
	subsets: ["latin", "latin-ext"],
	variable: "--font-jetbrains-mono",
	weight: ["400", "500"],
	display: "swap",
});

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
		{ media: "(prefers-color-scheme: dark)", color: "#0b0c0f" },
		{ media: "(prefers-color-scheme: light)", color: "#f0eee8" },
	],
	colorScheme: "dark light",
};

export default function RootLayout({
	children,
}: Readonly<{ children: React.ReactNode }>) {
	return (
		<html
			lang="ro"
			className={`${barlowCondensed.variable} ${jetbrainsMono.variable}`}
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
