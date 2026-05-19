import { cn } from "@/src/lib/utils";

function Skeleton({
	className,
	...props
}: React.HTMLAttributes<HTMLDivElement>) {
	return (
		<div
			className={cn(
				"rounded-[var(--radius-sm)] bg-[var(--border)]",
				className,
			)}
			{...props}
		/>
	);
}

export { Skeleton };
