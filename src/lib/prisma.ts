/* eslint-disable @typescript-eslint/no-explicit-any */
import { PrismaClient, Prisma } from "@prisma/client";

const basePrisma = new PrismaClient({
  log:
    process.env.NODE_ENV === "development"
      ? ["error", "warn"]
      : process.env.PRISMA_QUERY_LOG === "true"
        ? ["error", "warn", "info", "query"]
        : ["error"],
});

function hasModelField(model: string, field: string): boolean {
  const scalarFields = (Prisma as any)[`${model}ScalarFieldEnum`];
  return scalarFields && field in scalarFields;
}

function softDeleteQueryInterceptor({ model, args, query }: { model: string; args: any; query: any }, field = "deletedAt") {
  if (!hasModelField(model, field) || args?.where?.[field] !== undefined) {
    return query(args);
  }
  const finalArgs = args || {};
  finalArgs.where = { ...(finalArgs.where || {}), [field]: null };
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
          const context = Prisma.getExtensionContext(this);
          return (context as any).update({
            where: { id },
            data: { deletedAt: new Date() },
          });
        },
        async findAllWithDeleted<T, Args>(this: T, args?: Args): Promise<Args[]> {
          const context = Prisma.getExtensionContext(this);
          return (context as any).findMany({ ...(args || {}), where: { ...((args as any)?.where || {}), deletedAt: undefined } });
        },
      },
    },
  });
};

type PrismaClientType = ReturnType<typeof prismaClientSingleton>;

declare global {
  var prisma: PrismaClientType | undefined;
}

export const prisma = global.prisma || prismaClientSingleton();
export { basePrisma };

export async function healthCheck(): Promise<boolean> {
  try {
    await basePrisma.$queryRaw`SELECT 1`;
    return true;
  } catch {
    return false;
  }
}

if (process.env.NODE_ENV !== "production") global.prisma = prisma;
