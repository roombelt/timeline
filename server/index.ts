import { z } from "zod";
import ms from "ms";
import { procedure, router } from "./setup";

export const appRouter = router({
  test: procedure.query(() => ({ res: "Hello world!" })),

  calendars: procedure.query((opts) => opts.ctx.calendar.getCalendars()),
  events: procedure
    .input(
      z.object({
        calendarId: z.string(),
        startTimestamp: z.number(),
        endTimestamp: z.number(),
      })
    )
    .query((opts) =>
      opts.ctx.calendar.getEvents(
        opts.input.calendarId,
        opts.input.startTimestamp,
        opts.input.endTimestamp
      )
    ),
});

export type AppRouter = typeof appRouter;
