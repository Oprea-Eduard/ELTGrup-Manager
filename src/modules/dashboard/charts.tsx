"use client";

import dynamic from "next/dynamic";
import { memo } from "react";

const tooltipContentStyle = {
	background: "#151f2a",
	border: "1px solid #33465a",
	color: "#ecf2fb",
	borderRadius: "10px",
};

const tooltipLabelStyle = { color: "#ecf2fb", fontWeight: 600 };

const ProductivityChartInner = dynamic(
	() =>
		import("recharts").then((m) => ({
			default: ({ data }: { data: { name: string; ore: number }[] }) => (
				<m.ResponsiveContainer width="100%" height={280} minWidth={0}>
					<m.AreaChart
						data={data}
						margin={{ left: 8, right: 8, top: 10, bottom: 0 }}
					>
						<defs>
							<linearGradient id="oreGradient" x1="0" x2="0" y1="0" y2="1">
								<stop offset="5%" stopColor="#6a93c6" stopOpacity={0.46} />
								<stop offset="95%" stopColor="#6a93c6" stopOpacity={0.03} />
							</linearGradient>
						</defs>
						<m.CartesianGrid stroke="#2f4154" strokeDasharray="4 4" />
						<m.XAxis
							dataKey="name"
							tick={{ fontSize: 12, fill: "#9baec4" }}
							axisLine={false}
							tickLine={false}
							minTickGap={16}
						/>
						<m.YAxis
							tick={{ fontSize: 12, fill: "#9baec4" }}
							axisLine={false}
							tickLine={false}
						/>
						<m.Tooltip
							contentStyle={tooltipContentStyle}
							labelStyle={tooltipLabelStyle}
						/>
						<m.Area
							type="monotone"
							dataKey="ore"
							stroke="#6a93c6"
							fill="url(#oreGradient)"
							strokeWidth={2}
							isAnimationActive={false}
						/>
					</m.AreaChart>
				</m.ResponsiveContainer>
			),
		})),
	{ ssr: false },
);

export const ProductivityChart = memo(function ProductivityChart({
	data,
}: {
	data: { name: string; ore: number }[];
}) {
	return (
		<div className="w-full min-w-0">
			<ProductivityChartInner data={data} />
		</div>
	);
});
