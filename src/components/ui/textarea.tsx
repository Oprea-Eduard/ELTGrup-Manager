import type { Ref, TextareaHTMLAttributes } from "react";
import { cn } from "@/src/lib/utils";

export function Textarea({
	className,
	rows,
	ref,
	...props
}: TextareaHTMLAttributes<HTMLTextAreaElement> & {
	ref?: Ref<HTMLTextAreaElement>;
}) {
	return (
		<textarea
			ref={ref}
			rows={rows ?? 3}
			className={cn(
				"w-full border-b border-[var(--border-strong)] bg-transparent px-1 pt-2 pb-1 font-mono text-sm text-[var(--text-primary)] placeholder:text-[var(--text-secondary)] outline-none transition-colors",
				"focus:border-b-[var(--text-display)]",
				"disabled:cursor-not-allowed disabled:opacity-60",
				className,
			)}
			{...props}
		/>
	);
}
