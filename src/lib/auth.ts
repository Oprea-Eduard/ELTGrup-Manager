import { PrismaAdapter } from "@next-auth/prisma-adapter";
import type { PrismaClient, RoleKey } from "@prisma/client";
import bcrypt from "bcryptjs";
import NextAuth, { getServerSession, type NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { cache } from "react";
import { z } from "zod";
import { basePrisma, prisma } from "@/src/lib/prisma";
import { checkRateLimit } from "@/src/lib/rate-limit";

const JWT_ROLE_SYNC_INTERVAL_MS = 5 * 60 * 1000;

const loginSchema = z.object({
	email: z.string().trim().toLowerCase().email("Email invalid"),
	password: z.string().min(1, "Parola este obligatorie"),
});

export const authOptions: NextAuthOptions = {
	adapter: PrismaAdapter(basePrisma as unknown as PrismaClient),
	session: { strategy: "jwt", maxAge: 24 * 60 * 60 },
	pages: {
		signIn: "/autentificare",
	},
	cookies: {
		sessionToken: {
			name:
				process.env.NODE_ENV === "production"
					? "__Secure-next-auth.session-token"
					: "next-auth.session-token",
			options: {
				httpOnly: true,
				sameSite: "lax",
				path: "/",
				secure: process.env.NODE_ENV === "production",
			},
		},
	},
	providers: [
		CredentialsProvider({
			name: "credentials",
			credentials: {
				email: { label: "Email", type: "email" },
				password: { label: "Parola", type: "password" },
			},
			async authorize(credentials, req) {
				const parsed = loginSchema.safeParse(credentials);
				if (!parsed.success) return null;

				const ip =
					(req?.headers?.["x-forwarded-for"] as string | undefined)
						?.split(",")[0]
						?.trim() || "unknown";
				const rateLimitKey = `login:${ip}:${parsed.data.email}`;
				try {
					checkRateLimit(rateLimitKey, {
						maxRequests: 5,
						windowMs: 15 * 60 * 1000,
					});
				} catch {
					throw new Error(
						"Prea multe incercari de autentificare. Incearca din nou peste 15 minute.",
					);
				}

				let user: {
					id: string;
					email: string;
					firstName: string;
					lastName: string;
					passwordHash: string;
					isActive: boolean;
					deletedAt: Date | null;
					roles: Array<{ role: { key: RoleKey } }>;
				} | null = null;
				try {
					user = await prisma.user.findFirst({
						where: {
							email: { equals: parsed.data.email, mode: "insensitive" },
						},
						include: { roles: { include: { role: true } } },
					});
				} catch {
					throw new Error(
						"Baza de date nu este disponibila momentan. Te rugam sa incerci din nou mai tarziu.",
					);
				}

				if (!user?.isActive || user.deletedAt) return null;

				let valid = false;
				try {
					valid = await bcrypt.compare(parsed.data.password, user.passwordHash);
				} catch {
					throw new Error(
						"Eroare interna la verificarea parolei. Te rugam sa incerci din nou.",
					);
				}
				if (!valid) return null;

				try {
					await prisma.user.update({
						where: { id: user.id },
						data: { lastLoginAt: new Date() },
					});
				} catch {
					// login can continue even if last login timestamp cannot be updated
				}

				const roleKeys = user.roles.map((r) => r.role.key) as RoleKey[];

				return {
					id: user.id,
					email: user.email,
					name: `${user.firstName} ${user.lastName}`,
					roleKeys,
				};
			},
		}),
	],
	callbacks: {
		async jwt({ token, user }) {
			if (user) {
				token.userId = user.id;
				const candidate = user as { roleKeys?: RoleKey[]; email?: string };
				token.roleKeys = candidate.roleKeys || [];
				token.email = candidate.email;
				token.roleSyncedAt = Date.now();
			}

			const lastSyncedAt = Number(token.roleSyncedAt || 0);
			const shouldRefreshRoles =
				!lastSyncedAt || Date.now() - lastSyncedAt >= JWT_ROLE_SYNC_INTERVAL_MS;

			if (token.userId && shouldRefreshRoles) {
				let dbUser: {
					email: string;
					isActive: boolean;
					deletedAt: Date | null;
					roles: Array<{ role: { key: RoleKey } }>;
				} | null = null;
				try {
					dbUser = await prisma.user.findUnique({
						where: { id: token.userId as string },
						select: {
							email: true,
							isActive: true,
							deletedAt: true,
							roles: { include: { role: { select: { key: true } } } },
						},
					});
				} catch {
					token.roleSyncedAt = Date.now();
					return token;
				}

				if (!dbUser?.isActive || dbUser.deletedAt) {
					const clearedToken = {
						...token,
						userId: "",
						roleKeys: [] as RoleKey[],
						email: undefined as string | undefined,
					};
					return clearedToken;
				}

				token.roleKeys = dbUser.roles.map((item) => item.role.key) as RoleKey[];
				token.email = dbUser.email;
				token.roleSyncedAt = Date.now();
			}

			return token;
		},
		async session({ session, token }) {
			if (!token.userId) {
				return session;
			}
			if (session.user) {
				session.user.id = token.userId as string;
				session.user.roleKeys = (token.roleKeys as RoleKey[]) || [];
				session.user.email =
					(token.email as string | undefined) || session.user.email;
			}
			return session;
		},
	},
};

export const authHandler = NextAuth(authOptions);
const cachedAuth = cache(() => getServerSession(authOptions));

export async function auth() {
	return cachedAuth();
}
