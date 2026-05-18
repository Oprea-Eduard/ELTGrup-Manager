import {
	assertProjectAccess,
	assertWorkOrderAccess,
} from "@/src/lib/access-scope";
import { prisma } from "@/src/lib/prisma";

export async function assertActiveProjectAccess(
	user: { id: string; email?: string | null; roleKeys: string[] },
	projectId: string,
) {
	await assertProjectAccess(user, projectId);

	const project = await prisma.project.findUnique({
		where: { id: projectId },
		select: { deletedAt: true },
	});

	if (!project || project.deletedAt) {
		throw new Error("Proiect inexistent sau deja arhivat.");
	}
}

export async function loadActiveWorkOrder(
	user: { id: string; email?: string | null; roleKeys: string[] },
	workOrderId: string,
	options?: { projectId?: string },
) {
	await assertWorkOrderAccess(user, workOrderId, options);

	const workOrder = await prisma.workOrder.findUnique({
		where: { id: workOrderId },
		select: { deletedAt: true, projectId: true },
	});

	if (!workOrder || workOrder.deletedAt) {
		throw new Error("Lucrare inexistenta sau deja arhivata.");
	}

	if (options?.projectId && workOrder.projectId !== options.projectId) {
		throw new Error("Lucrarea selectata nu apartine proiectului selectat.");
	}

	const project = await prisma.project.findUnique({
		where: { id: workOrder.projectId },
		select: { deletedAt: true },
	});

	if (!project || project.deletedAt) {
		throw new Error("Proiect inexistent sau deja arhivat.");
	}

	return workOrder;
}
