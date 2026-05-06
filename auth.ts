import NextAuth from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        // This is a simple dummy authentication for testing
        // Any email/password combination will work
        if (credentials?.email && credentials?.password) {
          return {
            id: "1",
            name: "Test User",
            email: credentials.email as string,
          }
        }
        return null
      }
    })
  ],
  pages: {
    signIn: "/auth-js-test", // We will create this test page
  },
  callbacks: {
    async session({ session, token }) {
      if (token?.sub) {
        session.user.id = token.sub;
      }
      return session;
    },
    async jwt({ token, user }) {
      if (user) {
        token.sub = user.id;
      }
      return token;
    }
  },
  secret: process.env.AUTH_SECRET,
})
