import { redirect } from "next/navigation";
import { auth } from "@/src/lib/auth";
import { LoginForm } from "./login-form";

export const dynamic = "force-dynamic";

export default async function LoginPage() {
	const session = await auth();
	if (session?.user) redirect("/panou");

	return (
		<main className="grid min-h-screen place-items-center bg-[radial-gradient(1400px_800px_at_15%_0%,color-mix(in oklab,var(--accent)_22%,transparent),transparent_55%),radial-gradient(900px_650px_at_100%_100%,color-mix(in oklab,var(--accent)_22%,transparent),transparent_50%),var(--shell)] px-4">
			<section className="relative w-full max-w-md overflow-hidden rounded-3xl border border-[var(--border)] bg-[linear-gradient(180deg,color-mix(in oklab,var(--surface) 96%,transparent),color-mix(in oklab,var(--surface) 96%,transparent))] p-6 shadow-[var(--shadow-panel)] sm:p-8">
				<div className="pointer-events-none absolute -right-16 -top-10 size-40 rounded-full bg-[color-mix(in oklab,var(--accent)_20%,transparent)] blur-3xl" />
				<p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--accent-strong)]">
					ELTGRUP Manager
				</p>
				<h1 className="mt-2 text-2xl font-semibold text-[var(--foreground)]">
					Platforma operationala pentru constructii
				</h1>
				<p className="mt-2 text-sm text-[var(--muted)]">
					Acces securizat pentru management, echipe de teren si coordonare
					executie.
				</p>
				<LoginForm />
			</section>
		</main>
	);
}
