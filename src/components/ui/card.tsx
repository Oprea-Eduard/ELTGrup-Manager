import type { ReactNode } from "react";
import { cn } from "@/src/lib/utils";

type CardProps = {
	className?: string;
	children: ReactNode;
	rail?: "project" | "task" | "finance" | "material" | "alert";
	flush?: boolean;
	as?: "div" | "article" | "section";
};

export function Card({
	className,
	children,
	rail,
	flush,
	as: Tag = "div",
}: CardProps) {
	return (
		<Tag
			className={cn(
				"rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface)]",
				flush ? "p-0" : "p-4 sm:p-5",
				rail === "alert" && "border-[var(--accent)]",
				className,
			)}
		>
			{children}
		</Tag>
	);
}
