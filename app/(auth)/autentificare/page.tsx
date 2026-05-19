import { redirect } from "next/navigation";
import { auth } from "@/src/lib/auth";
import { LoginForm } from "./login-form";

export const dynamic = "force-dynamic";

export default async function LoginPage() {
	const session = await auth();
	if (session?.user) redirect("/panou");

	return (
		<main className="grid min-h-screen place-items-center bg-[var(--black)] px-4">
			<section className="relative w-full max-w-md border border-[var(--border-visible)] bg-[var(--surface)] p-6 sm:p-8">
				<div className="dot-grid-subtle pointer-events-none absolute inset-0 opacity-30" />
				<div className="relative">
					<p className="font-mono text-[11px] uppercase tracking-[0.08em] text-[var(--accent)]">
						ELTGRUP
					</p>
					<h1 className="mt-2 font-doto text-[28px] font-medium leading-none tracking-tight text-[var(--text-display)] sm:text-[36px]">
						Manager
					</h1>
					<p className="mt-3 font-mono text-[11px] uppercase tracking-[0.08em] text-[var(--text-secondary)]">
						Platforma operationala pentru constructii si echipe de teren
					</p>
					<LoginForm />
				</div>
			</section>
		</main>
	);
}
