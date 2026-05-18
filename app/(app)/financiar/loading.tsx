import { Card } from "@/src/components/ui/card";
import { PageHeader } from "@/src/components/ui/page-header";
import { Skeleton } from "@/src/components/ui/skeleton";

const statCardKeys = ["stat-1", "stat-2", "stat-3", "stat-4"];
const rowSkeletonKeys = ["row-1", "row-2", "row-3", "row-4", "row-5", "row-6"];

export default function Loading() {
	return (
		<div className="space-y-6">
			<PageHeader title="Financiar operational" subtitle="..." />

			<div className="h-[400px]">
				<Skeleton className="h-full w-full rounded-xl" />
			</div>

			<div className="grid gap-3 md:grid-cols-4">
				{statCardKeys.map((key) => (
					<Card key={key} className="h-28">
						<Skeleton className="h-full w-full" />
					</Card>
				))}
			</div>

			<Card>
				<div className="space-y-3">
					{rowSkeletonKeys.map((key) => (
						<Skeleton key={key} className="h-14 w-full" />
					))}
				</div>
			</Card>
		</div>
	);
}
