const { PrismaClient, RoleKey } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  const passwordHash = await bcrypt.hash('admin123', 10);
  
  const superAdminRole = await prisma.role.findFirst({
    where: { key: "SUPER_ADMIN" }
  });
  
  if (!superAdminRole) {
    console.log("No SUPER_ADMIN role found");
    return;
  }
  
  let user = await prisma.user.findFirst({
    where: { email: 'admin@eltgrup.local' }
  });
  
  if (!user) {
    user = await prisma.user.create({
      data: {
        email: 'admin@eltgrup.local',
        firstName: 'E2E',
        lastName: 'Admin',
        passwordHash,
        isActive: true
      }
    });
    
    await prisma.userRole.create({
      data: {
        userId: user.id,
        roleId: superAdminRole.id
      }
    });
    console.log("User admin@eltgrup.local created");
  } else {
    await prisma.user.update({
      where: { id: user.id },
      data: { passwordHash }
    });
    console.log("User admin@eltgrup.local updated with password admin123");
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
