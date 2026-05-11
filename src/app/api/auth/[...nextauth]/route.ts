// app/api/auth/[...nextauth]/route.ts
import NextAuth, { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        try {
          if (!credentials?.email || !credentials?.password) {
            return null;
          }

          // ✅ Usar "Usuario" con mayúscula (como está en schema.prisma)
          const user = await prisma.usuario.findUnique({
            where: {
              email: credentials.email.toLowerCase()
            },
            include: {
              rol: true  // ✅ "rol" en minúscula es la relación, no el modelo
            }
          });

          if (!user || !user.activo) {
            return null;
          }

          const isPasswordValid = await bcrypt.compare(
            credentials.password,
            user.password
          );

          if (!isPasswordValid) {
            return null;
          }

          return {
            id: user.id.toString(),
            email: user.email,
            name: `${user.nombres} ${user.apellidos}`,
            cedula: user.cedula,
            nombres: user.nombres,
            apellidos: user.apellidos,
            role: user.rol.rol,  // ✅ Acceder al rol a través de la relación
            rolId: user.rolId,
          };
        } catch (error) {
          console.error("Error en authorize:", error);
          return null;
        }
      }
    })
  ],
  session: {
    strategy: "jwt",
    maxAge: 24 * 60 * 60, // 1 día
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.cedula = user.cedula;
        token.nombres = user.nombres;
        token.apellidos = user.apellidos;
        token.role = user.role;
        token.rolId = user.rolId;
      }
      return token;
    },
    async session({ session, token }) {
      if (session?.user) {
        session.user.id = token.id as string;
        session.user.cedula = token.cedula as string;
        session.user.nombres = token.nombres as string;
        session.user.apellidos = token.apellidos as string;
        session.user.role = token.role as string;
        session.user.rolId = token.rolId as number;
      }
      return session;
    }
  },
  pages: {
    signIn: "/login",
    error: "/login",
  },
  secret: process.env.NEXTAUTH_SECRET,
  debug: process.env.NODE_ENV === "development",
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };