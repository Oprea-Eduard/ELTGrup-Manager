import type { ReactNode } from "react";
import { cn } from "@/src/lib/utils";

export function ListItem({
	children,
	className,
	onClick,
	disabled,
}: {
	children: ReactNode;
	className?: string;
	onClick?: () => void;
	disabled?: boolean;
}) {
	return (
		<div
			className={cn(
				"flex items-center justify-between gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors",
				disabled
					? "opacity-50 cursor-not-allowed"
					: "hover:bg-[var(--surface)]",
				className,
			)}
			{...(onClick && !disabled
				? {
						onClick,
						role: "button",
						tabIndex: 0,
						onKeyDown: (e: React.KeyboardEvent) =>
							e.key === "Enter" && onClick(),
					}
				: {})}
		>
			{children}
		</div>
	);
}

export function ListItemSlim({
	children,
	className,
}: {
	children: ReactNode;
	className?: string;
}) {
	return (
		<div
			className={cn(
				"flex items-center justify-between gap-2 rounded-md px-2.5 py-1.5 text-sm transition-colors hover:bg-[var(--surface)]",
				className,
			)}
		>
			{children}
		</div>
	);
}
