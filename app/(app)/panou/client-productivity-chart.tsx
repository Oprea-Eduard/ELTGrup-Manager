"use client";

import dynamic from "next/dynamic";

const ProductivityChartInner = dynamic(
	() =>
		import("@/src/modules/dashboard/charts").then((m) => ({
			default: m.ProductivityChart,
		})),
	{
		ssr: false,
		loading: () => (
			<div className="h-[280px] w-full animate-pulse rounded-lg bg-[var(--surface-card)]" />
		),
	},
);

export function ClientProductivityChart({
	data,
}: {
	data: { name: string; ore: number }[];
}) {
	return <ProductivityChartInner data={data} />;
}
