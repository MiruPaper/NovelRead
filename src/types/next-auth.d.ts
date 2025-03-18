import 'next-auth';
import { Role } from "@prisma/client";

declare module 'next-auth' {
  interface User {
    role: 'USER' | 'ADMIN';
  }

  interface Session {
    user: {
      id: string;
      email: string;
      name: string;
      role: 'USER' | 'ADMIN';
    }
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role: Role;
  }
} 