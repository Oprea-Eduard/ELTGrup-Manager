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
				"border border-[var(--b1)] bg-[var(--s1)]",
				rail === "alert" && "border-[var(--red)]",
				flush ? "p-0" : "p-3 sm:p-4",
				className,
			)}
		>
			{children}
		</Tag>
	);
}
