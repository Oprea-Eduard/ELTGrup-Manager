import { PrismaClient, RoleKey } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const testAccounts = [
	{
		email: "admin@eltgrup.ro",
		pass: "admin123",
		role: RoleKey.ADMINISTRATOR,
		firstName: "Eduard",
		lastName: "Admin",
	},
	{
		email: "manager@eltgrup.ro",
		pass: "manager123",
		role: RoleKey.PROJECT_MANAGER,
		firstName: "Mihai",
		lastName: "Radu",
	},
	{
		email: "sefsantier@eltgrup.ro",
		pass: "santier123",
		role: RoleKey.SITE_MANAGER,
		firstName: "Andrei",
		lastName: "Stoica",
	},
	{
		email: "muncitor@eltgrup.ro",
		pass: "muncitor123",
		role: RoleKey.WORKER,
		firstName: "Razvan",
		lastName: "Nistor",
	},
	{
		email: "magazioner@eltgrup.ro",
		pass: "magazie123",
		role: RoleKey.MAGAZIONER,
		firstName: "Doru",
		lastName: "Popa",
	},
	{
		email: "backoffice@eltgrup.ro",
		pass: "birou123",
		role: RoleKey.BACKOFFICE,
		firstName: "Irina",
		lastName: "Dumitrescu",
	},
	{
		email: "contabil@eltgrup.ro",
		pass: "contabil123",
		role: RoleKey.ACCOUNTANT,
		firstName: "Elena",
		lastName: "Serban",
	},
	{
		email: "subcontractor@eltgrup.ro",
		pass: "sub123",
		role: RoleKey.SUBCONTRACTOR,
		firstName: "Gheorghe",
		lastName: "Munteanu",
	},
	{
		email: "client@eltgrup.ro",
		pass: "client123",
		role: RoleKey.CLIENT_VIEWER,
		firstName: "Maria",
		lastName: "Popescu",
	},
];

async function main() {
	const roles = await prisma.role.findMany();
	const roleMap = new Map(roles.map((r) => [r.key, r.id]));

	for (const acc of testAccounts) {
		const roleId = roleMap.get(acc.role);
		if (!roleId) {
			console.log(`  ✗ Rol ${acc.role} negasit. Ruleaza intai seed safe.`);
			continue;
		}

		const passwordHash = await bcrypt.hash(acc.pass, 10);
		const user = await prisma.user.upsert({
			where: { email: acc.email },
			update: {
				passwordHash,
				isActive: true,
				deletedAt: null,
				firstName: acc.firstName,
				lastName: acc.lastName,
			},
			create: {
				email: acc.email,
				passwordHash,
				firstName: acc.firstName,
				lastName: acc.lastName,
			},
		});

		await prisma.userRole.deleteMany({ where: { userId: user.id } });
		await prisma.userRole.create({ data: { userId: user.id, roleId } });

		console.log(
			`  ✓ ${acc.email.padEnd(30)} ${acc.role.padEnd(18)} ${acc.pass}`,
		);
	}
}

main()
	.catch((e) => {
		console.error(e);
		process.exit(1);
	})
	.finally(() => prisma.$disconnect());
