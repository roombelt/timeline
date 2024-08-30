import { httpBatchLink } from "@trpc/client";
import { createTRPCNext } from "@trpc/next";
import type { AppRouter } from "@/server";

export const trpc = createTRPCNext<AppRouter>({
  config: () => ({
    links: [httpBatchLink({ url: `/api/trpc` })],
  }),
});
