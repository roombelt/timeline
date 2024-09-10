import { initTRPC, TRPCError } from "@trpc/server";

import type { CreateNextContextOptions } from "@trpc/server/adapters/next";
import { getServerSession } from "next-auth/next";
import { getToken } from "next-auth/jwt";
import { authOptions } from "@/pages/api/auth/[...nextauth]";
import GoogleProvider from "./providers/google";
import { CalendarProvider } from "./providers/types";
import MicrosoftProvider from "./providers/microsoft";

export default async function createContext(opts: CreateNextContextOptions) {
  const token = (await getToken({ req: opts.req })) as {
    accessToken: string;
    refreshToken: string;
    provider: "google" | "azure-ad";
  };

  const session = await getServerSession(opts.req, opts.res, authOptions);
  return {
    session,
    get calendar(): CalendarProvider {
      if (!token?.accessToken || !token?.refreshToken) {
        throw new TRPCError({ code: "UNAUTHORIZED" });
      }

      switch (token.provider) {
        case "google":
          return new GoogleProvider(token.accessToken, token.refreshToken);
        case "azure-ad":
          return new MicrosoftProvider(token.accessToken, token.refreshToken);
        default:
          throw new Error("Unknown calendar provider: " + token.provider);
      }
    },
  };
}

export type Context = Awaited<ReturnType<typeof createContext>>;

const t = initTRPC.context<Context>().create();
export const router = t.router;
export const procedure = t.procedure;
