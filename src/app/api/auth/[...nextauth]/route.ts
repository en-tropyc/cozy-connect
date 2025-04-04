import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import type { NextAuthOptions } from "next-auth";

console.log('NextAuth Configuration Loading...');
console.log('NEXTAUTH_URL:', process.env.NEXTAUTH_URL);

const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      httpOptions: {
        timeout: 10000, // Increase timeout to 10 seconds
      },
    }),
  ],
  debug: true,
  pages: {
    signIn: '/auth/signin',
    error: '/auth/error',
  },
  callbacks: {
    async session({ session, token }) {
      // Add user ID to session
      if (session.user) {
        session.user.id = token.sub;
      }
      return session;
    },
    async redirect({ url, baseUrl }) {
      // Allows relative callback URLs
      if (url.startsWith("/")) return `${baseUrl}${url}`;
      // Allows callback URLs on the same origin
      else if (new URL(url).origin === baseUrl) return url;
      return baseUrl;
    },
  },
  logger: {
    error(code, ...message) {
      console.error('NextAuth Error:', code, message);
    },
    warn(code, ...message) {
      console.warn('NextAuth Warning:', code, message);
    },
    debug(code, ...message) {
      console.debug('NextAuth Debug:', code, message);
    },
  }
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST }; 
