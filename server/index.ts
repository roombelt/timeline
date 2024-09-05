import { z } from "zod";
import { procedure, router } from "./setup";

export const appRouter = router({
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
      opts.ctx.calendar.getEvents(opts.input.calendarId, opts.input.startTimestamp, opts.input.endTimestamp)
    ),
  createEvent: procedure
    .input(
      z.object({ calendarId: z.string(), startTimestamp: z.number(), endTimestamp: z.number(), summary: z.string() })
    )
    .mutation((opts) => {
      return opts.ctx.calendar.createEvent(
        opts.input.calendarId,
        opts.input.summary,
        opts.input.startTimestamp,
        opts.input.endTimestamp
      );
    }),
});

export type AppRouter = typeof appRouter;
