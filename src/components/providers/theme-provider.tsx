"use client";

import type { ReactNode } from "react";
import {
	createContext,
	use,
	useCallback,
	useEffect,
	useRef,
	useState,
} from "react";

type Theme = "dark" | "light";

type ThemeState = { theme: Theme; hydrated: boolean };

const _initialState: ThemeState = { theme: "dark", hydrated: false };

const ThemeContext = createContext<{ theme: Theme; toggle: () => void }>({
	theme: "dark",
	toggle: () => {},
});

export function useTheme() {
	return use(ThemeContext);
}

function getSystemPreference(): Theme {
	if (typeof window === "undefined") return "dark";
	return window.matchMedia("(prefers-color-scheme: light)").matches
		? "light"
		: "dark";
}

function applyTheme(theme: Theme) {
	document.documentElement.setAttribute("data-theme", theme);
	const meta = document.querySelector('meta[name="theme-color"]');
	if (meta) {
		meta.setAttribute("content", theme === "dark" ? "#000000" : "#F5F5F5");
	}
}

export function ThemeProvider({ children }: { children: ReactNode }) {
	const [theme, setTheme] = useState<Theme>("dark");
	const hydrated = useRef(false);

	useEffect(() => {
		const stored = localStorage.getItem("theme") as Theme | null;
		const initial = stored || getSystemPreference();
		const id = setTimeout(() => {
			setTheme(initial);
			applyTheme(initial);
			hydrated.current = true;
		}, 0);
		return () => clearTimeout(id);
	}, []);

	useEffect(() => {
		if (!hydrated.current) return;
		const meta = document.querySelector('meta[name="theme-color"]');
		if (!meta) {
			const m = document.createElement("meta");
			m.name = "theme-color";
			document.head.appendChild(m);
		}
		applyTheme(theme);
	}, [theme]);

	const toggle = useCallback(() => {
		setTheme((prev) => {
			const next = prev === "dark" ? "light" : "dark";
			localStorage.setItem("theme", next);
			applyTheme(next);
			return next;
		});
	}, []);

	return (
		<ThemeContext.Provider value={{ theme, toggle }}>
			{children}
		</ThemeContext.Provider>
	);
}
