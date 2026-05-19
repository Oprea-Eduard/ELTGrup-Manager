import { SpeedInsights } from "@vercel/speed-insights/next";
import type { Metadata, Viewport } from "next";
import { Space_Grotesk, Space_Mono, Doto } from "next/font/google";
import { Toaster } from "sonner";
import { HeroUIRouterProvider } from "@/src/components/providers/heroui-provider";
import { ReactQueryProvider } from "@/src/components/providers/react-query-provider";
import { SyncProvider } from "@/src/components/providers/sync-provider";
import { ThemeProvider } from "@/src/components/providers/theme-provider";
import "./globals.css";

const spaceGrotesk = Space_Grotesk({
	subsets: ["latin", "latin-ext"],
	variable: "--font-space-grotesk",
	display: "swap",
});

const spaceMono = Space_Mono({
	subsets: ["latin", "latin-ext"],
	variable: "--font-space-mono",
	weight: ["400", "700"],
	display: "swap",
});

const doto = Doto({
	subsets: ["latin", "latin-ext"],
	variable: "--font-doto",
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
		{ media: "(prefers-color-scheme: dark)", color: "#000000" },
		{ media: "(prefers-color-scheme: light)", color: "#F5F5F5" },
	],
	colorScheme: "dark light",
};

export default function RootLayout({
	children,
}: Readonly<{ children: React.ReactNode }>) {
	return (
		<html
			lang="ro"
			className={`${spaceGrotesk.variable} ${spaceMono.variable} ${doto.variable}`}
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
