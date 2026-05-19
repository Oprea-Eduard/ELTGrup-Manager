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
				"h-10 w-full border-b border-[var(--border-visible)] bg-transparent px-1 pb-1 pt-2 font-mono text-sm text-[var(--text-primary)] outline-none placeholder:text-[var(--text-secondary)] transition-colors",
				"focus:border-b-[var(--text-display)]",
				"sm:h-11",
				className,
			)}
			{...props}
		/>
	);
}
