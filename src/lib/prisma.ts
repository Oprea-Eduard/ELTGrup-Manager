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
        async softDelete<T>(this: T, id: string) {
          const context = Prisma.getExtensionContext(this);
          return (context as any).update({
            where: { id },
            data: { deletedAt: new Date() },
          });
        },
      },
    },
    result: {},
  });
};

type PrismaClientType = ReturnType<typeof prismaClientSingleton>;

declare global {
  var prisma: PrismaClientType | undefined;
}

export const prisma = global.prisma || prismaClientSingleton();
export { basePrisma };

if (process.env.NODE_ENV !== "production") global.prisma = prisma;
