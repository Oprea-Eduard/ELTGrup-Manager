import { redirect } from "next/navigation";
import { auth } from "@/src/lib/auth";
import { LoginForm } from "./login-form";

export const dynamic = "force-dynamic";

export default async function LoginPage() {
	const session = await auth();
	if (session?.user) redirect("/panou");

	return (
		<main className="grid-bg flex min-h-screen items-center justify-center bg-[var(--bg)] px-4">
			<div className="flex w-full max-w-[800px] border border-[var(--b1)]">
				{/* Brand panel */}
				<div className="hidden w-[42%] flex-col justify-between border-r border-[var(--b1)] bg-[var(--s1)] p-6 sm:flex">
					<div>
						<div className="flex items-center gap-2.5">
							<div className="flex size-8 items-center justify-center bg-[var(--amber)] text-[13px] font-extrabold text-black">
								EG
							</div>
							<div>
								<div className="text-xl font-bold tracking-[3px] text-[var(--t)]">
									ELT GRUP
								</div>
								<div className="text-[9px] font-bold tracking-[3px] text-[var(--t3)]">
									MANAGER
								</div>
							</div>
						</div>
						<h1 className="mt-6 text-[30px] font-bold leading-[1.1] tracking-[0.5px] text-[var(--t)]">
							CONTROL<br />
							OPERAȚIONAL<br />
							<span className="text-[var(--amber)]">CENTRALIZAT</span>
						</h1>
						<p className="mt-2 text-[11px] leading-[1.7] tracking-[0.3px] text-[var(--t3)]">
							Gestionează proiecte, pontaj,<br />
							materiale și echipe din teren.
						</p>
					</div>
					<div className="flex gap-5 border-t border-[var(--b1)] pt-4">
						<div>
							<div className="font-mono text-xl font-medium text-[var(--amber)]">12</div>
							<div className="text-[9px] font-bold tracking-[2px] text-[var(--t3)]">
								PROIECTE
							</div>
						</div>
						<div>
							<div className="font-mono text-xl font-medium text-[var(--steel)]">47</div>
							<div className="text-[9px] font-bold tracking-[2px] text-[var(--t3)]">
								MUNCITORI
							</div>
						</div>
						<div>
							<div className="font-mono text-xl font-medium text-[var(--green)]">94%</div>
							<div className="text-[9px] font-bold tracking-[2px] text-[var(--t3)]">
								PONTAJ
							</div>
						</div>
					</div>
				</div>
				{/* Form panel */}
				<div className="flex flex-1 flex-col justify-center p-7 sm:p-8">
					<p className="text-[10px] font-bold tracking-[2.5px] text-[var(--t3)]">
						AUTENTIFICARE
					</p>
					<LoginForm />
				</div>
			</div>
		</main>
	);
}
