import NextAuth, { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      provider: "google" | "none";
      accessToken?: string;
      refreshToken?: string;
    } & DefaultSession["user"];
  }
}
