"use client";

import { ChevronRight, Home } from "lucide-react";
import Link from "next/link";

type Crumb = {
	label: string;
	href?: string;
};

export function Breadcrumbs({ items }: { items: Crumb[] }) {
	return (
		<nav
			className="flex items-center gap-1.5 text-xs text-[var(--muted)] mb-3"
			aria-label="Breadcrumb"
		>
			<Link
				href="/panou"
				className="hover:text-[var(--accent-strong)] transition-colors"
			>
				<Home className="size-3.5" />
			</Link>
			{items.map((item) => (
				<span key={item.label} className="flex items-center gap-1.5">
					<ChevronRight className="size-3" />
					{item.href ? (
						<Link
							href={item.href}
							className="hover:text-[var(--accent-strong)] transition-colors"
						>
							{item.label}
						</Link>
					) : (
						<span className="text-[var(--muted-strong)] font-medium">
							{item.label}
						</span>
					)}
				</span>
			))}
		</nav>
	);
}
