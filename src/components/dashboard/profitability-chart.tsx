"use client";

import dynamic from "next/dynamic";
import { Card } from "@/src/components/ui/card";

type ProfitData = {
	name: string;
	revenue: number;
	costs: number;
	profit: number;
};

const toRON = (value: number) => `${value.toLocaleString()} RON`;

const ProfitChart = dynamic(
	() =>
		import("recharts").then((m) => ({
			default: ({ data }: { data: ProfitData[] }) => (
				<m.ResponsiveContainer width="100%" height="100%">
					<m.BarChart
						data={data}
						margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
						barGap={8}
					>
						<m.CartesianGrid
							strokeDasharray="3 3"
							stroke="rgba(255,255,255,0.05)"
							vertical={false}
						/>
						<m.XAxis
							dataKey="name"
							stroke="var(--muted-strong)"
							fontSize={12}
							tickLine={false}
							axisLine={false}
						/>
						<m.YAxis
							stroke="var(--muted-strong)"
							fontSize={12}
							tickLine={false}
							axisLine={false}
							tickFormatter={toRON}
						/>
						<m.Tooltip
							contentStyle={{
								backgroundColor: "rgba(15, 24, 34, 0.95)",
								border: "1px solid var(--border)",
								borderRadius: "8px",
								color: "var(--foreground)",
							}}
							itemStyle={{ fontSize: "12px" }}
							formatter={(value) => [toRON(Number(value))]}
						/>
						<m.Legend
							verticalAlign="top"
							align="right"
							iconType="circle"
							wrapperStyle={{ paddingBottom: "20px" }}
						/>
						<m.Bar
							dataKey="revenue"
							name="Venituri"
							fill="var(--accent)"
							radius={[4, 4, 0, 0]}
							barSize={32}
						/>
						<m.Bar
							dataKey="costs"
							name="Cheltuieli"
							fill="var(--danger)"
							radius={[4, 4, 0, 0]}
							barSize={32}
						/>
					</m.BarChart>
				</m.ResponsiveContainer>
			),
		})),
	{ ssr: false },
);

export function ProfitabilityChart({ data }: { data: ProfitData[] }) {
	if (data.length === 0) {
		return (
			<Card className="p-6">
				<h3 className="mb-2 text-lg font-semibold text-[var(--foreground)]">
					Analiză Profitabilitate pe Proiect
				</h3>
				<div className="flex h-[300px] items-center justify-center text-sm text-[var(--muted)]">
					Nu există date de profitabilitate disponibile.
				</div>
			</Card>
		);
	}

	return (
		<Card className="p-6">
			<div className="mb-6 flex items-center justify-between">
				<div>
					<h3 className="text-lg font-semibold text-[var(--foreground)]">
						Analiză Profitabilitate pe Proiect
					</h3>
					<p className="text-sm text-[var(--muted)]">
						Compararea veniturilor cu cheltuielile reale
					</p>
				</div>
			</div>
			<div className="h-[400px] w-full">
				<ProfitChart data={data} />
			</div>
		</Card>
	);
}
