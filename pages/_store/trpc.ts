import { activeQuery } from "active-store";
import { trpc } from "@/pages/api/trpc/_client";

export function activeApiQueries() {
  const userCalendars = activeQuery(trpc.calendars.query);
  const calendarEvents = activeQuery(trpc.events.query);
  return {
    userCalendars,
    calendarEvents,
    refreshEvents(calendarId?: string) {
      return calendarEvents.invalidate((input) => !calendarId || input.calendarId === calendarId);
    },
  };
}

export type ActiveApiQueries = ReturnType<typeof activeApiQueries>;
