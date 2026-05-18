"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import { Suspense, useState } from "react";
import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";

function LoginFormInner() {
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [error, setError] = useState("");
	const [loading, setLoading] = useState(false);
	const { push, refresh } = useRouter();
	const { get } = useSearchParams();

	async function onSubmit(event: React.FormEvent) {
		event.preventDefault();
		setLoading(true);
		setError("");

		const result = await signIn("credentials", {
			email: email.trim().toLowerCase(),
			password,
			redirect: false,
		});

		setLoading(false);

		if (result?.error) {
			setError(
				result.error === "CredentialsSignin"
					? "Credentiale invalide. Verifica adresa de email si parola."
					: "Autentificarea a esuat din cauza unei erori de server. Reincearca in cateva secunde.",
			);
			return;
		}

		push(get("callbackUrl") || "/panou");
		refresh();
	}

	return (
		<form onSubmit={onSubmit} className="mt-6 space-y-4">
			<div>
				<label className="mb-1 block text-sm font-medium text-[var(--foreground)]">
					Email
				</label>
				<Input
					value={email}
					onChange={(e) => setEmail(e.target.value)}
					type="email"
					required
					autoComplete="username"
				/>
			</div>
			<div>
				<label className="mb-1 block text-sm font-medium text-[var(--foreground)]">
					Parola
				</label>
				<Input
					value={password}
					onChange={(e) => setPassword(e.target.value)}
					type="password"
					required
					autoComplete="current-password"
				/>
			</div>
			{error ? <p className="text-sm text-[var(--danger)]">{error}</p> : null}
			<Button type="submit" className="w-full" disabled={loading}>
				{loading ? "Se autentifica..." : "Autentificare"}
			</Button>
			<p className="text-center text-xs text-[var(--muted)]">
				Suport tehnic: administrator ELTGRUP
			</p>
		</form>
	);
}

export function LoginForm() {
	return (
		<Suspense
			fallback={
				<div className="mt-6 h-[200px] animate-pulse rounded-lg bg-[var(--surface-2)]" />
			}
		>
			<LoginFormInner />
		</Suspense>
	);
}
