import { z } from "zod";
import ms from "ms";
import { procedure, router } from "./setup";

export const appRouter = router({
  test: procedure.query(() => ({ res: "Hello world!" })),

  calendars: procedure.query((opts) => opts.ctx.calendar.getCalendars()),
  events: procedure
    .input(z.string())
    .query((opts) =>
      opts.ctx.calendar.getEvents(
        opts.input,
        Date.now() - ms("1day"),
        Date.now() + ms("1 day")
      )
    ),
});

export type AppRouter = typeof appRouter;
