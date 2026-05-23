import type { InputHTMLAttributes, Ref } from "react";
import { cn } from "@/src/lib/utils";

export function Input({
	className,
	type = "text",
	ref,
	...props
}: InputHTMLAttributes<HTMLInputElement> & { ref?: Ref<HTMLInputElement> }) {
	return (
		<input
			ref={ref}
			type={type}
			className={cn(
				"h-9 w-full border border-[var(--b1)] bg-[var(--s1)] px-3 font-mono text-[11px] text-[var(--t2)] outline-none transition-colors",
				"focus:border-[var(--amber)] focus:text-[var(--t)]",
				className,
			)}
			{...props}
		/>
	);
}
