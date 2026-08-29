import { currentUser } from "@clerk/nextjs/server";
import prisma from "./prisma";
import { AuditAction } from "@prisma/client";

export const logAudit = async (
  action: AuditAction,
  model: string,
  recordId: string | number,
  changes?: Record<string, unknown>
) => {
  try {
    const user = await currentUser();
    if (!user) return;

    const role = (user.publicMetadata?.role as string) || "unknown";
    const name =
      [user.firstName, user.lastName].filter(Boolean).join(" ") ||
      user.username ||
      user.id;

    await prisma.auditLog.create({
      data: {
        action,
        model,
        recordId: String(recordId),
        performedById: user.id,
        performedByName: name,
        performedByRole: role,
        changes: changes ? JSON.parse(JSON.stringify(changes)) : undefined,
      },
    });
  } catch (err) {
    console.log("Failed to write audit log:", err);
  }
};
