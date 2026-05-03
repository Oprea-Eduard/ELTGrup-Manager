import { PermissionAction, PermissionResource } from "@prisma/client";
import { auth } from "@/src/lib/auth";
import { hasPermission, normalizeRoleKeys } from "@/src/lib/rbac";
import { checkRateLimit } from "@/src/lib/rate-limit";

export type RequestContext = {
  ipAddress?: string;
  userAgent?: string;
};

export async function requirePermission(
  resource: PermissionResource,
  action: PermissionAction,
  requestContext?: RequestContext,
) {
  const rateLimitKey = `permission:${resource}:${action}`;
  try {
    checkRateLimit(rateLimitKey, { maxRequests: 120, windowMs: 60 * 1000 });
  } catch {
    throw new Error("Prea multe cereri. Incearca din nou mai tarziu.");
  }

  const session = await auth();

  if (!session?.user) {
    if (requestContext?.ipAddress) {
      console.warn(`[AUDIT] Permission denied - no session - IP: ${requestContext.ipAddress} - UA: ${requestContext.userAgent ?? "N/A"}`);
    }
    throw new Error("Sesiune invalida. Reautentificare necesara.");
  }

  const roleKeys = normalizeRoleKeys(session.user.roleKeys || []);
  if (roleKeys.length === 0) {
    throw new Error("Nu ai roluri valide asignate pentru aceasta actiune.");
  }

  const allowed = hasPermission(roleKeys, resource, action, session.user.email);
  if (!allowed) {
    if (requestContext?.ipAddress) {
      console.warn(
        `[AUDIT] Permission denied - user: ${session.user.email} - resource: ${resource} - action: ${action} - IP: ${requestContext.ipAddress}`,
      );
    }
    throw new Error("Nu ai permisiunea necesara pentru aceasta actiune.");
  }

  return session.user;
}
