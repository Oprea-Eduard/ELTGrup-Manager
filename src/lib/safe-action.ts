import { z } from "zod";
import { PermissionAction, PermissionResource } from "@prisma/client";
import { requirePermission } from "./permissions";
import { ActionState, fromZodError } from "./action-state";
import { logActivity } from "./activity-log";
import { checkRateLimit } from "./rate-limit";

type SafeActionOptions<T extends z.ZodType, R = unknown> = {
  schema?: T;
  permission?: {
    resource: PermissionResource;
    action: PermissionAction;
  };
  activityLog?: {
    entityType: string;
    action: string;
    getEntityId: (result: R) => string;
    getDiff?: (data: z.infer<T>, result: R) => Record<string, unknown> | undefined;
    redactFields?: string[];
  };
};

function redactSensitiveData(data: unknown, fieldsToRedact: string[]) {
  if (!data || typeof data !== "object") return data;
  const redacted = { ...(data as Record<string, unknown>) };
  for (const field of fieldsToRedact) {
    if (field in redacted) {
      redacted[field] = "[REDACTED]";
    }
  }
  return redacted;
}

export function createSafeAction<T extends z.ZodType, R>(
  options: SafeActionOptions<T, R>,
  handler: (data: z.infer<T>, user: unknown) => Promise<R>
) {
  return async (arg1: unknown, arg2?: unknown): Promise<ActionState> => {
    // Determine if it's (state, formData) or just (formData)
    const isStateful = arg2 !== undefined;
    const formData = isStateful ? (arg2 as FormData) : (arg1 as FormData);

    try {
      // 0. Rate limit
      const rateLimitKey = `safe-action:${options.permission?.resource ?? "unknown"}:${options.permission?.action ?? "unknown"}`;
      checkRateLimit(rateLimitKey, { maxRequests: 60, windowMs: 60 * 1000 });

      // 1. Auth & Permission Check
      let user = null;
      if (options.permission) {
        user = await requirePermission(options.permission.resource, options.permission.action);
      }

      // 2. Data Validation
      let parsedData: z.infer<T> = {} as z.infer<T>;
      if (options.schema) {
        const rawData: Record<string, unknown> = {};
        for (const key of Array.from(formData.keys())) {
          const values = formData.getAll(key);
          if (values.length > 1) {
            rawData[key] = values;
          } else {
            rawData[key] = values[0];
          }
        }

        const result = options.schema.safeParse(rawData);
        if (!result.success) {
          return fromZodError(result.error);
        }
        parsedData = result.data;
      }

      // 3. Execute Handler
      const result = await handler(parsedData, user);

      // 4. Activity Logging
      if (options.activityLog && user) {
        let diff: Record<string, unknown> | undefined = options.activityLog.getDiff ? options.activityLog.getDiff(parsedData, result) as Record<string, unknown> | undefined : undefined;
        
        if (diff && options.activityLog.redactFields) {
          diff = redactSensitiveData(diff, options.activityLog.redactFields) as Record<string, unknown>;
        }

        await logActivity({
          userId: user.id,
          entityType: options.activityLog.entityType,
          entityId: options.activityLog.getEntityId(result),
          action: options.activityLog.action,
          diff: diff as import("@prisma/client").Prisma.JsonValue | undefined,
        });
      }

      return { ok: true, message: "Acțiune finalizată cu succes." };
    } catch (error: unknown) {
      console.error("SafeAction Error:", error);
      return {
        ok: false,
        message: error instanceof Error ? error.message : "A apărut o eroare neașteptată.",
      };
    }
  };
}
