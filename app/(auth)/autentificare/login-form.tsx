"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import { Suspense, useState } from "react";
import { Button } from "@/src/components/ui/button";

function LoginFormInner() {
	const [email, setEmail] = useState("eduard@eltgrup.ro");
	const [password, setPassword] = useState("");
	const [error, setError] = useState("");
	const [loading, setLoading] = useState(false);
	const { push } = useRouter();
	const searchParams = useSearchParams();

	async function onSubmit(event: React.FormEvent) {
		event.preventDefault();
		setLoading(true);
		setError("");

		const callbackUrl = searchParams.get("callbackUrl") || "/panou";

		const result = await signIn("credentials", {
			email: email.trim().toLowerCase(),
			password,
			redirect: false,
		});

		setLoading(false);

		if (result?.error) {
			setError(
				result.error === "CredentialsSignin"
					? "CREDENTIALE INVALIDE"
					: "EROARE SERVER",
			);
			return;
		}

		push(callbackUrl);
	}

	return (
		<form onSubmit={onSubmit} className="mt-5 space-y-3.5">
			<div>
				<label htmlFor="email" className="mb-1 block text-[9px] font-bold tracking-[2px] text-[var(--t3)]">
					EMAIL
				</label>
				<input
					id="email"
					value={email}
					onChange={(e) => setEmail(e.target.value)}
					type="email"
					required
					autoComplete="username"
					className="w-full border border-[var(--b1)] bg-[var(--s1)] px-3 py-2 font-mono text-[11px] text-[var(--t2)] outline-none focus:border-[var(--amber)] focus:text-[var(--t)]"
				/>
			</div>
			<div>
				<label htmlFor="password" className="mb-1 block text-[9px] font-bold tracking-[2px] text-[var(--t3)]">
					PAROLA
				</label>
				<input
					id="password"
					value={password}
					onChange={(e) => setPassword(e.target.value)}
					type="password"
					required
					autoComplete="current-password"
					className="w-full border border-[var(--b1)] bg-[var(--s1)] px-3 py-2 font-mono text-[11px] text-[var(--t3)] outline-none focus:border-[var(--amber)] focus:text-[var(--t)]"
				/>
			</div>
			{error ? (
				<p className="text-[9px] font-bold tracking-[1.5px] text-[var(--red)]">
					{error}
				</p>
			) : null}
			<Button type="submit" className="w-full" disabled={loading}>
				{loading ? "CONECTARE..." : "CONECTARE  →"}
			</Button>
			<div className="h-px bg-[var(--b1)]" />
			<div className="flex items-center justify-between">
				<span className="text-[9px] tracking-[1px] text-[var(--t3)]">
					AM UITAT PAROLA
				</span>
				<span className="flex items-center gap-1 text-[9px] tracking-[1px] text-[var(--t3)]">
					<span className="inline-block size-[5px] rounded-full bg-[var(--green)]" />
					SISTEM OPERAȚIONAL
				</span>
			</div>
		</form>
	);
}

export function LoginForm() {
	return (
		<Suspense
			fallback={
				<div className="mt-5 h-[200px] bg-[var(--s2)]" />
			}
		>
			<LoginFormInner />
		</Suspense>
	);
}
