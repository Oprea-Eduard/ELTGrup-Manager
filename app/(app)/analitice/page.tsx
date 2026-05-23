import { PermissionGuard } from "@/src/components/auth/permission-guard";
import { Card } from "@/src/components/ui/card";
import { PageHeader } from "@/src/components/ui/page-header";
import { StatRow } from "@/src/components/ui/stat-row";
import { cn } from "@/src/lib/utils";

const MONTHS = ["IAN", "FEB", "MAR", "APR", "MAI", "IUN", "IUL", "AUG", "SEP", "OCT", "NOV", "DEC"];

const ANALYTICS_KPIS = [
	{ label: "EFICIENȚĂ MEDIE", value: "78%", color: "var(--steel)" },
	{ label: "ORE LUCRATE LUNA", value: "1.840", color: "var(--amber)" },
	{ label: "COST / ORĂ MEDIE", value: "48 RON", color: "var(--green)" },
	{ label: "PROIECTE LA TERMEN", value: "9 / 12", color: "var(--purple)" },
];

const PROJ_PROGRESS = [
	{ name: "Bloc C4", prog: 72, color: "var(--steel)" },
	{ name: "Hală Arad", prog: 41, color: "var(--steel)" },
	{ name: "Ansamblu Cluj", prog: 88, color: "var(--red)" },
	{ name: "Depozit Ploiești", prog: 34, color: "var(--amber)" },
	{ name: "Sediu București", prog: 19, color: "var(--steel)" },
];

const DONUT = [
	{ name: "Manoperă", pct: 42, color: "var(--steel)" },
	{ name: "Materiale", pct: 31, color: "var(--amber)" },
	{ name: "Utilaje", pct: 17, color: "var(--purple)" },
	{ name: "Subcontractori", pct: 10, color: "var(--green)" },
];

const PONTAJ_WEEK = [
	{ day: "LUN", h: 92, color: "var(--green)" },
	{ day: "MAR", h: 88, color: "var(--green)" },
	{ day: "MIE", h: 95, color: "var(--green)" },
	{ day: "JOI", h: 84, color: "var(--amber)" },
	{ day: "VIN", h: 79, color: "var(--amber)" },
	{ day: "SÂM", h: 45, color: "var(--red)" },
	{ day: "DUM", h: 12, color: "var(--red)" },
];

const BUGET = [120, 145, 130, 160, 188, 170, 155, 190, 210, 195, 220, 240];
const ACTUAL = [118, 138, 142, 151, 175, null, null, null, null, null, null, null];

function progColor(p: number) {
	return p >= 85 ? "var(--red)" : p >= 65 ? "var(--amber)" : "var(--steel)";
}

function KpiCard({ label, value, color }: { label: string; value: string; color: string }) {
	return (
		<div className="border border-[var(--b1)] bg-[var(--s1)] p-3">
			<p className="text-[8px] font-bold tracking-[2px] text-[var(--t3)]">{label}</p>
			<p className="mt-1 font-mono text-xl font-medium leading-none" style={{ color }}>{value}</p>
		</div>
	);
}

function ProgressBar({ name, prog, color }: { name: string; prog: number; color: string }) {
	const barColor = progColor(prog);
	return (
		<div className="flex items-center gap-2">
			<span className="w-[80px] shrink-0 overflow-hidden text-ellipsis whitespace-nowrap text-[9px] text-[var(--t3)]">{name}</span>
			<div className="flex-1">
				<div className="h-[6px] bg-[var(--b1)]">
					<div className="h-full" style={{ width: `${prog}%`, background: barColor }} />
				</div>
			</div>
			<span className="font-mono text-[9px]" style={{ color: barColor, width: 24, textAlign: "right" }}>{prog}%</span>
		</div>
	);
}

function Donut({ data, size = 90 }: { data: typeof DONUT; size?: number }) {
	const r = 32, cx = 45, cy = 45, circ = 2 * Math.PI * r;
	let offset = 0;
	const slices = data.map(d => {
		const dash = (d.pct / 100) * circ;
		const o = offset; offset += dash;
		return { dash, offset: o, col: d.color };
	});
	return (
		<svg width={size} height={size} viewBox="0 0 90 90">
			<circle cx={cx} cy={cy} r={r} fill="none" stroke="var(--b1)" strokeWidth={12} />
			{slices.map((s, i) => (
				<circle key={i} cx={cx} cy={cy} r={r} fill="none"
					stroke={s.col} strokeWidth={12}
					strokeDasharray={`${s.dash} ${circ - s.dash}`}
					strokeDashoffset={circ / 4 - s.offset}
				/>
			))}
		</svg>
	);
}

function Sparkline({ budget, actual, w = 280, h = 90 }: { budget: number[]; actual: (number | null)[]; w?: number; h?: number }) {
	const maxV = Math.max(...budget);
	const pts = (arr: (number | null)[]) => arr.map((v, i) => v !== null ? [i * (w / (budget.length - 1)), h - ((v / maxV) * h)] as const : null).filter(Boolean) as [number, number][];
	const toPath = (points: [number, number][]) => "M" + points.map(p => p.join(",")).join("L");
	const bp = pts(budget), ap = pts(actual);
	return (
		<svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} className="w-full overflow-visible">
			<path d={toPath(bp)} fill="none" stroke="var(--steel)" strokeWidth={1.5} opacity={0.6} strokeDasharray="4 3" />
			<path d={toPath(ap)} fill="none" stroke="var(--amber)" strokeWidth={2} />
			{ap.map((p, i) => <circle key={i} cx={p[0]} cy={p[1]} r={2.5} fill="var(--amber)" />)}
			{MONTHS.map((m, i) => (
				<text key={m} x={i * (w / (budget.length - 1))} y={h + 11} textAnchor="middle"
					style={{ fontFamily: "var(--font-mono)", fontSize: 7, fill: "var(--t3)" }}>
					{m}
				</text>
			))}
		</svg>
	);
}

export default function AnaliticePage() {
	return (
		<PermissionGuard resource="REPORTS" action="VIEW">
			<div className="flex flex-col gap-3">
				<PageHeader title="ANALITICE" subtitle="INDICATORI DE PERFORMANTA SI ANALIZA" />

				{/* KPI row */}
				<div className="grid grid-cols-4 gap-2">
					{ANALYTICS_KPIS.map(k => <KpiCard key={k.label} {...k} />)}
				</div>

				{/* Charts grid */}
				<div className="grid grid-cols-2 gap-3">
					{/* Progress per project */}
					<div className="border border-[var(--b1)] bg-[var(--s1)]">
						<div className="border-b border-[var(--b1)] px-3 py-2 sm:px-4">
							<p className="text-[8px] font-bold tracking-[2px] text-[var(--t2)]">PROGRES PE PROIECT</p>
						</div>
						<div className="flex flex-col gap-2 p-3 sm:p-4">
							{PROJ_PROGRESS.map(p => <ProgressBar key={p.name} {...p} />)}
						</div>
					</div>

					{/* Cost distribution donut */}
					<div className="border border-[var(--b1)] bg-[var(--s1)]">
						<div className="border-b border-[var(--b1)] px-3 py-2 sm:px-4">
							<p className="text-[8px] font-bold tracking-[2px] text-[var(--t2)]">DISTRIBUȚIE COSTURI</p>
						</div>
						<div className="flex items-center justify-center gap-5 p-4">
							<Donut data={DONUT} size={100} />
							<div className="flex flex-col gap-2">
								{DONUT.map(d => (
									<div key={d.name} className="flex items-center gap-2">
										<div className="size-2 shrink-0" style={{ background: d.color }} />
										<span className="text-[9px] text-[var(--t2)]">{d.name}</span>
										<span className="font-mono text-[10px]" style={{ color: d.color, marginLeft: 8 }}>{d.pct}%</span>
									</div>
								))}
							</div>
						</div>
					</div>
				</div>

				{/* Buget sparkline */}
				<div className="border border-[var(--b1)] bg-[var(--s1)]">
					<div className="flex items-center justify-between border-b border-[var(--b1)] px-3 py-2 sm:px-4">
						<span className="text-[8px] font-bold tracking-[2px] text-[var(--t2)]">BUGET PLANIFICAT VS REALIZAT — 2026</span>
						<span className="text-[8px] font-bold tracking-[2px] text-[var(--t3)]">MII RON</span>
					</div>
					<div className="flex gap-3 px-3 pt-2 pb-1 sm:px-4">
						<div className="flex items-center gap-1.5 text-[8px] text-[var(--t3)]">
							<div className="h-[2px] w-3 bg-[var(--steel)] opacity-60" />
							<span>PLANIFICAT</span>
						</div>
						<div className="flex items-center gap-1.5 text-[8px] text-[var(--t3)]">
							<div className="h-[2px] w-3 bg-[var(--amber)]" />
							<span>REALIZAT</span>
						</div>
					</div>
					<div className="px-3 pb-4 sm:px-4">
						<Sparkline budget={BUGET} actual={ACTUAL} w={320} h={100} />
					</div>
				</div>

				{/* Weekly attendance */}
				<div className="border border-[var(--b1)] bg-[var(--s1)]">
					<div className="border-b border-[var(--b1)] px-3 py-2 sm:px-4">
						<p className="text-[8px] font-bold tracking-[2px] text-[var(--t2)]">PONTAJ ACEASTĂ SĂPTĂMÂNĂ — % DIN ECHIPĂ PREZENTĂ</p>
					</div>
					<div className="flex flex-col gap-1.5 p-3 sm:p-4">
						{PONTAJ_WEEK.map(d => (
							<div key={d.day} className="flex items-center gap-2">
								<span className="font-mono text-[8px] text-[var(--t3)] w-[26px]">{d.day}</span>
								<div className="flex-1">
									<div className="h-[5px] bg-[var(--b1)]">
										<div className="h-full" style={{ width: `${d.h}%`, background: d.color }} />
									</div>
								</div>
								<span className="font-mono text-[9px]" style={{ color: d.color, width: 26, textAlign: "right" }}>{d.h}%</span>
							</div>
						))}
					</div>
				</div>
			</div>
		</PermissionGuard>
	);
}
