import type { Prisma } from "@prisma/client";
import { headers } from "next/headers";
import { prisma } from "@/src/lib/prisma";

const SENSITIVE_FIELDS = [
	"password",
	"passwordHash",
	"secret",
	"token",
	"key",
	"apiKey",
];

export type RequestCapture = {
	ipAddress: string | null;
	userAgent: string | null;
};

export async function captureRequestContext(): Promise<RequestCapture> {
	try {
		const hdrs = await headers();
		const forwarded = hdrs.get("x-forwarded-for");
		const ipAddress = forwarded
			? forwarded.split(",")[0].trim()
			: (hdrs.get("x-real-ip") ?? null);
		const userAgent = hdrs.get("user-agent");
		return { ipAddress, userAgent };
	} catch {
		return { ipAddress: null, userAgent: null };
	}
}

function redactRecursive(obj: unknown): unknown {
	if (!obj || typeof obj !== "object") return obj;
	if (Array.isArray(obj)) return obj.map(redactRecursive);

	const redacted: Record<string, unknown> = {};
	for (const [key, value] of Object.entries(obj)) {
		if (
			SENSITIVE_FIELDS.some((field) =>
				key.toLowerCase().includes(field.toLowerCase()),
			)
		) {
			redacted[key] = "[REDACTED]";
		} else if (typeof value === "object") {
			redacted[key] = redactRecursive(value);
		} else {
			redacted[key] = value;
		}
	}
	return redacted;
}

export async function logActivity(args: {
	userId?: string | null;
	entityType: string;
	entityId: string;
	action: string;
	diff?: Prisma.JsonValue;
	ipAddress?: string | null;
	userAgent?: string | null;
}) {
	const diff = args.diff ? redactRecursive(args.diff) : null;
	const context =
		args.ipAddress === undefined && args.userAgent === undefined
			? await captureRequestContext()
			: {
					ipAddress: args.ipAddress ?? null,
					userAgent: args.userAgent ?? null,
				};

	await prisma.activityLog.create({
		data: {
			userId: args.userId || null,
			entityType: args.entityType,
			entityId: args.entityId,
			action: args.action,
			diff: diff as Prisma.InputJsonValue,
			ipAddress: context.ipAddress,
			userAgent: context.userAgent,
		},
	});
}
