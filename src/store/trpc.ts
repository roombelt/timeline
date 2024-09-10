import { activeComputed, activeQuery } from "active-store";
import { trpc } from "@/pages/api/trpc/_client";
import ms from "ms";
import { attachRefetchOnTabVisible } from "./utils";
import { getSession } from "next-auth/react";

export function activeApiQueries() {
  type User = { id: string; name: string; email: string; image: string; provider: "google" | "azure-ad" };
  const user = activeQuery<() => Promise<User | null>>(() => getSession().then((data) => (data?.user as any) ?? null));

  const userCalendars = activeQuery(trpc.calendars.query);
  const calendarEvents = activeQuery(trpc.events.query);
  const singleEvent = activeQuery(trpc.getEvent.query);
  const isAuthorized = activeQuery(
    () =>
      trpc.calendars.query().then(
        () => true,
        () => false
      ),
    { retryDelay: () => false }
  );

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
    user,
    isAuthorized,
    userCalendars,
    calendarEvents,
    singleEvent,
    refreshEvents,
    removeEvent,
  };
}

export type ActiveApiQueries = ReturnType<typeof activeApiQueries>;
