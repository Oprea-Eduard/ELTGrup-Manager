import { Card } from "@/src/components/ui/card";
import { PageHeader } from "@/src/components/ui/page-header";
import { Skeleton } from "@/src/components/ui/skeleton";

const statCardKeys = ["stat-1", "stat-2", "stat-3", "stat-4"];
const rowSkeletonKeys = ["row-1", "row-2", "row-3", "row-4", "row-5"];

export default function Loading() {
	return (
		<div className="space-y-6">
			<PageHeader title="Ordine de Lucru" subtitle="..." />

			<div className="grid gap-4 md:grid-cols-4">
				{statCardKeys.map((key) => (
					<Card key={key} className="h-24">
						<Skeleton className="h-full w-full" />
					</Card>
				))}
			</div>

			<Card>
				<div className="space-y-4">
					{rowSkeletonKeys.map((key) => (
						<Skeleton key={key} className="h-12 w-full" />
					))}
				</div>
			</Card>
		</div>
	);
}
