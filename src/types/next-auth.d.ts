// types/next-auth.d.ts
import { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface User {
    id: string;
    cedula: string;
    nombres: string;
    apellidos: string;
    role: string;
    rolId: number;
  }

  interface Session {
    user: {
      id: string;
      cedula: string;
      nombres: string;
      apellidos: string;
      role: string;
      rolId: number;
    } & DefaultSession["user"]
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    cedula: string;
    nombres: string;
    apellidos: string;
    role: string;
    rolId: number;
  }
}