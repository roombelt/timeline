import NextAuth, { AuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import AzureADProvider from "next-auth/providers/azure-ad";

export const authOptions: AuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      authorization: {
        params: {
          prompt: "consent",
          scope: "https://www.googleapis.com/auth/calendar openid email profile ",
          access_type: "offline",
        },
      },
    }),
    AzureADProvider({
      clientId: `${process.env.MICROSOFT_CLIENT_ID}`,
      clientSecret: `${process.env.MICROSOFT_CLIENT_SECRET}`,
      tenantId: `${process.env.MICROSOFT_TENANT_ID}`,
      authorization: {
        params: { scope: "Calendars.ReadWrite.Shared User.Read openid profile email offline_access" },
      },
      httpOptions: { timeout: 10000 },
    }),
  ],
  callbacks: {
    async jwt({ token, account }) {
      if (account) {
        token.accessToken = account.access_token;
        token.refreshToken = account.refresh_token;
        token.provider = account.provider;
        token.userId = account.providerAccountId;
      }
      return token;
    },
    async session({ session, token }) {
      session.user.provider = token.provider as any;
      session.user.id = token.userId as string;
      return session;
    },
  },
};

export default NextAuth(authOptions);
