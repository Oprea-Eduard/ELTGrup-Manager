/* eslint-disable @typescript-eslint/no-explicit-any */
import { Prisma, PrismaClient } from "@prisma/client";

const basePrisma = new PrismaClient({
	log:
		process.env.NODE_ENV === "development"
			? ["error", "warn"]
			: process.env.PRISMA_QUERY_LOG === "true"
				? ["error", "warn", "info", "query"]
				: ["error"],
});

function hasModelField(model: string, field: string): boolean {
	const scalarFields = (
		Prisma as unknown as Record<string, Record<string, string>>
	)[`${model}ScalarFieldEnum`];
	return scalarFields && field in scalarFields;
}

function softDeleteQueryInterceptor(
	{
		model,
		args,
		query,
	}: {
		model: string;
		args: Record<string, unknown>;
		query: (args: Record<string, unknown>) => unknown;
	},
	field = "deletedAt",
) {
	if (!hasModelField(model, field)) {
		return query(args);
	}
	const where = args.where as Record<string, unknown> | undefined;
	if (where !== undefined && where[field] !== undefined) {
		return query(args);
	}
	const finalArgs: Record<string, unknown> = { ...args };
	finalArgs.where = { ...(where ?? {}), [field]: null };
	return query(finalArgs);
}

const prismaClientSingleton = () => {
	return basePrisma.$extends({
		query: {
			$allModels: {
				async findMany({ model, args, query }) {
					return softDeleteQueryInterceptor({ model, args, query });
				},
				async findFirst({ model, args, query }) {
					return softDeleteQueryInterceptor({ model, args, query });
				},
				async findUnique({ args, query }) {
					return query(args);
				},
				async count({ model, args, query }) {
					return softDeleteQueryInterceptor({ model, args, query });
				},
				async findFirstOrThrow({ model, args, query }) {
					return softDeleteQueryInterceptor({ model, args, query });
				},
			},
		},
		model: {
			$allModels: {
				async softDelete<T, Args>(this: T, id: string): Promise<Args> {
					const context = Prisma.getExtensionContext(this) as unknown as {
						update: (args: {
							where: { id: string };
							data: { deletedAt: Date };
						}) => Promise<Args>;
						findMany: (args: Record<string, unknown>) => Promise<Args[]>;
					};
					return context.update({
						where: { id },
						data: { deletedAt: new Date() },
					});
				},
				async findAllWithDeleted<T, Args>(
					this: T,
					args?: Args,
				): Promise<Args[]> {
					const context = Prisma.getExtensionContext(this) as unknown as {
						findMany: (args: Record<string, unknown>) => Promise<Args[]>;
					};
					return context.findMany({
						...(args || {}),
						where: {
							...((args as Record<string, unknown> | undefined)?.where ?? {}),
							deletedAt: undefined,
						},
					});
				},
			},
		},
	});
};

type PrismaClientType = ReturnType<typeof prismaClientSingleton>;

declare global {
	var __prisma: PrismaClientType | undefined;
}

export const prisma = globalThis.__prisma ?? prismaClientSingleton();
export { basePrisma };

export async function healthCheck(): Promise<boolean> {
	try {
		await basePrisma.$queryRaw`SELECT 1`;
		return true;
	} catch {
		return false;
	}
}

if (process.env.NODE_ENV !== "production") global.__prisma = prisma;
