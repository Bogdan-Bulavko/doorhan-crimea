import type { AuthOptions, User, Session } from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import bcrypt from 'bcrypt';
import { db } from './db';
import type { JWT } from 'next-auth/jwt';

type Role = 'customer' | 'admin' | 'manager';

export const authOptions: AuthOptions = {
  providers: [
    Credentials({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;
        const user = await db.user.findUnique({ where: { email: credentials.email } });
        if (!user || !user.isActive) return null;
        const ok = await bcrypt.compare(credentials.password, user.passwordHash);
        if (!ok) return null;
        const result = { id: String(user.id), email: user.email, name: `${user.firstName} ${user.lastName}` };
        (result as typeof result & { role?: Role }).role = user.role as Role;
        return result;
      },
    }),
  ],
  session: { strategy: 'jwt' },
  pages: { signIn: '/signin' },
  callbacks: {
    async jwt({ token, user }: { token: JWT & { role?: Role }; user?: (User & { role?: Role }) | undefined }) {
      if (user && user.role) token.role = user.role;
      return token;
    },
    async session({ session, token }: { session: Session & { role?: Role }; token: JWT & { role?: Role } }) {
      session.role = token.role;
      return session;
    },
  },
};


