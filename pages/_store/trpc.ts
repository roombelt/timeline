import { activeQuery, ActiveQuery } from "active-store";
import { trpc } from "@/pages/api/trpc/_client";
import ms from "ms";
import { attachRefetchOnTabVisible } from "./utils";

export function activeApiQueries() {
  const userCalendars = activeQuery(trpc.calendars.query);
  const calendarEvents = activeQuery(trpc.events.query);
  const singleEvent = activeQuery(trpc.getEvent.query);

  attachRefetchOnTabVisible(calendarEvents, ms("5s"));

  async function refreshEvents(calendarId?: string) {
    await Promise.allSettled([
      calendarEvents.invalidate((input) => !calendarId || input.calendarId === calendarId),
      singleEvent.invalidate((input) => !calendarId || input.calendarId === calendarId),
    ]);
  }

  async function removeEvent(calendarId: string, eventId: string) {
    await trpc.deleteEvent.mutate({ calendarId, eventId });
    await refreshEvents(calendarId);
  }

  return {
    userCalendars,
    calendarEvents,
    singleEvent,
    refreshEvents,
    removeEvent,
  };
}

export type ActiveApiQueries = ReturnType<typeof activeApiQueries>;
