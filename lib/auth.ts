import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

export const authOptions: NextAuthOptions = {
  secret: process.env.NEXTAUTH_SECRET,
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/login",
  },
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Пароль", type: "password" },
      },
      async authorize(credentials) {
        const ownerEmail = process.env.OWNER_EMAIL;
        const ownerPassword = process.env.OWNER_PASSWORD;
        const employeeEmail = process.env.EMPLOYEE_EMAIL;
        const employeePassword = process.env.EMPLOYEE_PASSWORD;

        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        if (
          credentials.email === ownerEmail &&
          credentials.password === ownerPassword
        ) {
          return {
            id: "owner",
            email: ownerEmail,
            name: "Owner",
            role: "owner",
          };
        }

        if (
          employeeEmail &&
          employeePassword &&
          credentials.email === employeeEmail &&
          credentials.password === employeePassword
        ) {
          return {
            id: "employee",
            email: employeeEmail,
            name: "Employee",
            role: "employee",
          };
        }

        return null;
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = (user as any).role;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).role = token.role;
      }
      return session;
    },
  },
};
