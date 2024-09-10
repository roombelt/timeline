import NextAuth, { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      provider?: "google" | "azure-ad" | "none";
      id?: string;
    } & DefaultSession["user"];
  }
}
