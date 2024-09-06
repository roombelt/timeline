import dayjs from "dayjs";
import { activeComputed, activeState } from "active-store";
import { ActiveApiQueries } from "./trpc";
import { activeLocalStorage } from "./utils";
import type { CalendarEvent } from "@/server/providers/types";
import { trpc } from "../api/trpc/_client";

export default function activePlannerState({ userCalendars, calendarEvents, refreshEvents }: ActiveApiQueries) {
  const resourceAreaWidth = activeLocalStorage("resource-area-width", 200);
  const timeRange = activeState({
    start: dayjs().startOf("day").valueOf(),
    end: dayjs().endOf("day").valueOf(),
  });

  const visibleCalendarsIds = activeLocalStorage("visible-calendars", []);
  const visibleCalendars = activeComputed(() => {
    return visibleCalendarsIds
      .get()
      .map((id) => userCalendars.get().find((item) => item.id === id))
      .filter(Boolean as any as <T>(x: T | undefined) => x is T);
  });

  const visibleEvents = activeComputed(() => {
    const data: CalendarEvent[] = [];
    for (const calendarId of visibleCalendarsIds.get()) {
      const state = calendarEvents.state({
        calendarId,
        startTimestamp: timeRange.get().start,
        endTimestamp: timeRange.get().end,
      });
      if (state.isSuccess) {
        data.push(...state.data!);
      }
    }
    return data;
  });

  const isLoading = activeComputed((calendarId: string) => {
    const state = calendarEvents.state({
      calendarId,
      startTimestamp: timeRange.get().start,
      endTimestamp: timeRange.get().end,
    });
    return state.isFetching;
  });

  return {
    timeRange: {
      get: timeRange.get,
      set(start: number, end: number) {
        timeRange.set({ start, end });
        refreshEvents();
      },
    },
    visibleCalendars: {
      ...visibleCalendars,
      getIds: visibleCalendarsIds.get,
      setIds: visibleCalendarsIds.set,
      remove: (calendarId: string) => {
        const value = visibleCalendarsIds.get().filter((item) => item !== calendarId);
        visibleCalendarsIds.set(value);
      },
    },
    visibleEvents: {
      ...visibleEvents,
      refreshEvents,
      isLoading,
    },
    resourceAreaWidth,
    newMeeting: activeNewMeeting(refreshEvents),
    removeMeeting: async (calendarId: string, eventId: string) => {
      await trpc.deleteEvent.mutate({ calendarId, eventId });
      await refreshEvents(calendarId);
    },
  };
}

function activeNewMeeting(refresh: (calendarId: string) => Promise<any>) {
  const isSaving = activeState(false);
  const data = activeState<{
    calendarId: string;
    startTimestamp: number;
    endTimestamp: number;
    summary: string;
    description: string;
  } | null>(null);

  return {
    open(calendarId: string, start: Date, end: Date, summary: string) {
      data.set({
        calendarId: calendarId,
        startTimestamp: dayjs(start).valueOf(),
        endTimestamp: dayjs(end).valueOf(),
        summary: summary,
        description: "",
      });
    },
    close: () => data.set(null),
    data: { get: data.get },
    isSaving,
    setSummary: (summary: string) => data.set({ ...data.get()!, summary }),
    setDescription: (description: string) => data.set({ ...data.get()!, description }),
    async save() {
      const value = data.get();
      if (!value) {
        return;
      }
      await trpc.createEvent.mutate(value);
      await refresh(value.calendarId);
      data.set(null);
    },
  };
}
