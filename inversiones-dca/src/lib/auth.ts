import { NextAuthOptions } from 'next-auth';
import EmailProvider from 'next-auth/providers/email';
import { PrismaAdapter } from '@auth/prisma-adapter';
import prisma from './prisma';

/**
 * Configuración de NextAuth.
 *
 * Utiliza el adaptador de Prisma para persistir usuarios y sesiones. Por defecto se habilita
 * el proveedor de email (enlace mágico). Puedes añadir proveedores OAuth según tu necesidad.
 */
export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  session: {
    strategy: 'jwt'
  },
  providers: [
    EmailProvider({
      server: {
        host: process.env.EMAIL_SERVER,
        port: Number(process.env.EMAIL_PORT || 587),
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASSWORD
        }
      },
      from: process.env.EMAIL_FROM
    })
    // Puedes añadir proveedores OAuth aquí, por ejemplo Google, GitHub, etc.
  ],
  pages: {
    signIn: '/auth/signin'
  },
  callbacks: {
    async session({ session, token, user }) {
      // Incluye la ID de usuario en el token de sesión
      if (session?.user) {
        session.user.id = user?.id || token.sub || '';
        session.user.locale = (user as any)?.locale;
        session.user.currency = (user as any)?.currency;
      }
      return session;
    }
  }
};