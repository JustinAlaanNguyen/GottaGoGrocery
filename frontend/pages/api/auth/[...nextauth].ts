import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcrypt";
import mysql from "mysql2/promise";
import { compare } from "bcrypt";

export default NextAuth({
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
  if (!credentials) return null;

  const { email, password } = credentials;
  if (!email || !password) return null;

  const connection = await mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME,
  });

  const [rows]: any = await connection.execute(
    "SELECT * FROM users WHERE email = ?",
    [email]
  );

  await connection.end();

  if (!rows.length) {
    console.log("No user found with email:", email);
    return null;
  }

  const user = rows[0];
  console.log("User found:", user);

  const isMatch = await bcrypt.compare(password, user.passwordHash); // or user.password
  if (!isMatch) {
    console.log("Password mismatch");
    return null;
  }

  return {
    id: user.id,
    name: user.username ?? "",
    email: user.email ?? "",
  };
}
,
    }),
  ],
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.name = user.name ?? "";
        token.email = user.email ?? "";
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id;
        session.user.name = token.name ?? "";
        session.user.email = token.email ?? "";
      }
      return session;
    },
  },
  pages: {
    signIn: "/account/signin",
  },
  secret: process.env.NEXTAUTH_SECRET,
});
