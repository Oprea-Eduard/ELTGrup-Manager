"use client";

import dynamic from "next/dynamic";

const ProfitabilityChartInner = dynamic(
	() =>
		import("@/src/components/dashboard/profitability-chart").then((m) => ({
			default: m.ProfitabilityChart,
		})),
	{
		ssr: false,
		loading: () => (
			<div className="h-[400px] w-full animate-pulse rounded-lg bg-[var(--surface-card)]" />
		),
	},
);

type ProfitData = {
	name: string;
	revenue: number;
	costs: number;
	profit: number;
};

export function ClientProfitabilityChart({ data }: { data: ProfitData[] }) {
	return <ProfitabilityChartInner data={data} />;
}
