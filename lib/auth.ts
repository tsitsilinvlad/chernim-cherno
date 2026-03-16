import type { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';

function users() {
  return [
    {
      id: 'owner',
      email: process.env.OWNER_EMAIL || 'owner@example.com',
      password: process.env.OWNER_PASSWORD || 'change-me',
      role: 'owner',
    },
    {
      id: 'employee',
      email: process.env.EMPLOYEE_EMAIL || 'employee@example.com',
      password: process.env.EMPLOYEE_PASSWORD || 'change-me',
      role: 'employee',
    },
  ];
}

export const authOptions: NextAuthOptions = {
  session: { strategy: 'jwt' },
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        const user = users().find(
          (item) => item.email === credentials?.email && item.password === credentials?.password,
        );
        if (!user) return null;
        return { id: user.id, email: user.email, role: user.role } as any;
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) token.role = (user as any).role;
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).role = token.role;
      }
      return session;
    },
  },
  pages: { signIn: '/login' },
};
