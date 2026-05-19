"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import { Suspense, useState } from "react";
import { Button } from "@/src/components/ui/button";

function LoginFormInner() {
	const [email, setEmail] = useState("");
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
		<form onSubmit={onSubmit} className="mt-8 space-y-6">
			<div>
				<label htmlFor="email">Email</label>
				<input
					id="email"
					value={email}
					onChange={(e) => setEmail(e.target.value)}
					type="email"
					required
					autoComplete="username"
					className="mt-1 h-10 w-full border-b border-[var(--border-visible)] bg-transparent px-1 pb-1 pt-2 font-mono text-sm text-[var(--text-primary)] outline-none transition-colors focus:border-b-[var(--text-display)]"
				/>
			</div>
			<div>
				<label htmlFor="password">Parola</label>
				<input
					id="password"
					value={password}
					onChange={(e) => setPassword(e.target.value)}
					type="password"
					required
					autoComplete="current-password"
					className="mt-1 h-10 w-full border-b border-[var(--border-visible)] bg-transparent px-1 pb-1 pt-2 font-mono text-sm text-[var(--text-primary)] outline-none transition-colors focus:border-b-[var(--text-display)]"
				/>
			</div>
			{error ? (
				<p className="font-mono text-[11px] uppercase tracking-[0.06em] text-[var(--accent)]">
					[ {error} ]
				</p>
			) : null}
			<Button type="submit" className="w-full" disabled={loading}>
				{loading ? "[AUTENTIFICARE...]" : "Autentificare"}
			</Button>
			<p className="text-center font-mono text-[11px] uppercase tracking-[0.06em] text-[var(--text-secondary)]">
				Suport tehnic: administrator ELTGRUP
			</p>
		</form>
	);
}

export function LoginForm() {
	return (
		<Suspense
			fallback={
				<div className="mt-8 h-[200px] rounded-[var(--radius-sm)] bg-[var(--surface-raised)]" />
			}
		>
			<LoginFormInner />
		</Suspense>
	);
}
