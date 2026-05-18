"use server";

import { type ChecklistCategory, type Prisma, RoleKey } from "@prisma/client";
import { auth } from "@/src/lib/auth";
import { defaultChecklistTemplates } from "@/src/lib/checklist-templates";
import { prisma } from "@/src/lib/prisma";

async function requireAuth() {
	const session = await auth();
	if (!session?.user?.id) {
		throw new Error("Sesiune invalida.");
	}
	return session;
}

async function requireAdmin() {
	const session = await requireAuth();
	const roleKeys = (session?.user?.roleKeys || []) as RoleKey[];
	if (
		!roleKeys.includes(RoleKey.SUPER_ADMIN) &&
		!roleKeys.includes(RoleKey.ADMINISTRATOR)
	) {
		throw new Error("Nu aveti permisiunea de a accesa aceasta resursa.");
	}
	return session;
}

async function ensureChecklistTemplates() {
	const existing = await prisma.checklistTemplate.count();
	if (existing > 0) return existing;

	const data: Prisma.ChecklistTemplateCreateManyInput[] =
		defaultChecklistTemplates.map((template, index) => ({
			name: template.name,
			category: template.category,
			items: template.items,
			projectType: template.projectType,
			sortOrder: index,
		}));

	const result = await prisma.checklistTemplate.createMany({
		data,
		skipDuplicates: true,
	});
	return result.count;
}

export async function seedChecklistTemplates() {
	try {
		await requireAdmin();

		const existing = await prisma.checklistTemplate.count();
		if (existing > 0)
			return {
				count: existing,
				seeded: false,
				message: "Template-urile exista deja.",
			};

		const count = await ensureChecklistTemplates();

		if (count === 0) {
			return {
				count: 0,
				seeded: false,
				message: "Toate template-urile existau deja (skipDuplicates).",
			};
		}

		return { count, seeded: true };
	} catch (error) {
		console.error("[seedChecklistTemplates] Eroare:", error);
		throw error instanceof Error
			? error
			: new Error("Eroare la crearea template-urilor implicite.");
	}
}

export async function getChecklistTemplates(category?: ChecklistCategory) {
	try {
		await requireAuth();

		await ensureChecklistTemplates();

		return prisma.checklistTemplate.findMany({
			where: category ? { category } : undefined,
			orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
			select: { id: true, name: true, category: true, items: true },
		});
	} catch (error) {
		console.error("[getChecklistTemplates] Eroare:", error);
		throw error instanceof Error
			? error
			: new Error("Eroare la obtinerea template-urilor.");
	}
}
