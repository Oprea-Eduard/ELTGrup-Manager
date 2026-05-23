const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

async function createAdmin(email, password, firstName = "Super", lastName = "Admin") {
	if (!email || !password) {
		console.error("Email and password are required.");
		process.exit(1);
	}

	try {
		const passwordHash = await bcrypt.hash(password, 10);

		// Find the SUPER_ADMIN role
		const superAdminRole = await prisma.role.findFirst({
			where: { key: "SUPER_ADMIN" },
		});

		if (!superAdminRole) {
			console.error("No SUPER_ADMIN role found in the database. Please ensure DB is migrated and seeded.");
			process.exit(1);
		}

		// Check if user already exists
		let user = await prisma.user.findFirst({
			where: { email },
		});

		if (!user) {
			user = await prisma.user.create({
				data: {
					email,
					firstName,
					lastName,
					passwordHash,
					isActive: true,
				},
			});
			console.log(`\n✅ User ${email} created successfully.`);
		} else {
			user = await prisma.user.update({
				where: { id: user.id },
				data: {
					passwordHash,
					isActive: true,
				},
			});
			console.log(`\n✅ User ${email} already existed. Password updated successfully.`);
		}

		// Ensure the user has the SUPER_ADMIN role
		const existingUserRole = await prisma.userRole.findFirst({
			where: {
				userId: user.id,
				roleId: superAdminRole.id,
			},
		});

		if (!existingUserRole) {
			await prisma.userRole.create({
				data: {
					userId: user.id,
					roleId: superAdminRole.id,
				},
			});
			console.log(`✅ Role SUPER_ADMIN assigned to ${email}.\n`);
		} else {
			console.log(`✅ User ${email} already has the SUPER_ADMIN role.\n`);
		}

	} catch (error) {
		console.error("Error creating/upgrading admin user:", error);
	} finally {
		await prisma.$disconnect();
	}
}

// Get arguments from command line
const args = process.argv.slice(2);
const email = args[0];
const password = args[1];
const firstName = args[2] || "Super";
const lastName = args[3] || "Admin";

if (!email || !password) {
	console.log("\nUsage: node create_admin.js <email> <password> [firstName] [lastName]\n");
	process.exit(1);
}

createAdmin(email, password, firstName, lastName);
