// scripts/create-admin.ts
import "dotenv/config";
import { prisma } from "../lib/prisma";
import bcrypt from "bcryptjs";

async function createAdmin() {
  try {
    // Crear rol ADMIN
    const adminRole = await prisma.rol.upsert({
      where: { rol: "ADMIN" },
      update: {},
      create: {
        rol: "ADMIN",
        descripcion: "Administrador del sistema"
      }
    });

    // Crear usuario administrador
    const hashedPassword = await bcrypt.hash("admincuatri2026", 10);

    const admin = await prisma.usuario.upsert({
      where: { email: "cuatricenteria@gmail.com" },
      update: {
        password: hashedPassword,
        nombres: "Administrador",
        apellidos: "Sistema",
        cedula: "V-00000000",
        rolId: adminRole.id,
        activo: true
      },
      create: {
        email: "cuatricenteria@gmail.com",
        password: hashedPassword,
        nombres: "Administrador",
        apellidos: "Sistema",
        cedula: "V-00000000",
        rolId: adminRole.id,
        activo: true
      }
    });

    console.log("✅ Usuario administrador creado:");
    console.log("   Email:", admin.email);
    console.log("   Contraseña: admincuatri2026");

  } catch (error) {
    console.error("❌ Error:", error);
  } finally {
    await prisma.$disconnect();
  }
}

createAdmin();