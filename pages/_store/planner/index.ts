import dayjs from "dayjs";
import { activeComputed, activeState } from "active-store";
import { ActiveApiQueries } from "../trpc";
import { activeLocalStorage } from "../utils";
import type { CalendarEvent } from "@/server/providers/types";
import activeWelcomeDialog from "./welcome-dialog";
import activeCreateMeetingDialog from "./create-meeting-dialog";

export default function activePlannerState({
  userCalendars,
  calendarEvents,
  refreshEvents,
  removeEvent,
}: ActiveApiQueries) {
  const resourceAreaWidth = activeLocalStorage("resource-area-width", 300);

  const timeRange = activeState({
    start: dayjs().startOf("day").valueOf(),
    end: dayjs().endOf("day").valueOf(),
  });

  const visibleCalendarsIds = activeLocalStorage<string[]>("visible-calendars", []);
  const visibleCalendars = activeComputed(() => {
    return visibleCalendarsIds.get().map((id) => {
      const calendar = userCalendars.get().find((item) => item.id === id);
      return calendar ?? { id, name: id, color: "blue" };
    });
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
    visibleEvents: { ...visibleEvents, refreshEvents, removeEvent, isLoading },
    resourceAreaWidth,
    createMeetingDialog: activeCreateMeetingDialog(refreshEvents),
    welcomeDialog: activeWelcomeDialog(visibleCalendarsIds),
  };
}
