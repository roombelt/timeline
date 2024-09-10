import { z } from "zod";
import { procedure, router } from "./utils";

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
      z.object({
        calendarId: z.string(),
        startTimestamp: z.number(),
        endTimestamp: z.number(),
        summary: z.string(),
        description: z.string(),
      })
    )
    .mutation(({ input, ctx }) =>
      ctx.calendar.createEvent(
        input.calendarId,
        input.summary,
        input.description,
        input.startTimestamp,
        input.endTimestamp
      )
    ),
  deleteEvent: procedure
    .input(z.object({ calendarId: z.string(), eventId: z.string() }))
    .mutation(({ input, ctx }) => ctx.calendar.deleteEvent(input.calendarId, input.eventId)),
  getEvent: procedure
    .input(z.object({ calendarId: z.string(), eventId: z.string() }))
    .query(({ input, ctx }) => ctx.calendar.getEvent(input.calendarId, input.eventId)),
  sendFeedback: procedure.input(z.object({ message: z.string() })).mutation(({ input, ctx }) => {
    console.log(`[FEEDBACK] [${ctx.session?.user.email}]: ${input.message}`);
  }),
});

export type AppRouter = typeof appRouter;
