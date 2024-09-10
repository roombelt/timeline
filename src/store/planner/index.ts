import dayjs from "dayjs";
import { activeComputed, activeState } from "active-store";
import { ActiveApiQueries } from "../trpc";
import { activeLocalStorage } from "../utils";
import type { CalendarEvent } from "@/server/providers/types";
import activeWelcomeDialog from "./welcome-dialog";
import activeCreateMeetingDialog from "./create-meeting-dialog";
import activeViewMeetingDialog from "./view-meeting-dialog";

const sampleData = {
  calendars: [{ id: "1", name: "First calendar", color: "green" }],
};

export default function activePlannerState(api: ActiveApiQueries) {
  const resourceAreaWidth = activeLocalStorage(
    activeComputed(() => `${api.user.get()?.id}.resource-area-width`),
    300
  );

  const timeRange = activeState({
    start: dayjs().startOf("day").valueOf(),
    end: dayjs().endOf("day").valueOf(),
  });

  const visibleCalendarsIds = activeLocalStorage<string[]>(
    activeComputed(() => `${api.user.get()?.id}.visible-calendars`),
    []
  );
  const visibleCalendars = activeComputed(() => {
    return visibleCalendarsIds.get().map((id) => {
      const calendar = api.userCalendars.get().find((item) => item.id === id);
      return calendar ?? { id, name: id, color: "blue" };
    });
  });

  const visibleEvents = activeComputed(() => {
    const data: CalendarEvent[] = [];
    for (const calendarId of visibleCalendarsIds.get()) {
      const state = api.calendarEvents.state({
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
    const state = api.calendarEvents.state({
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
        api.refreshEvents();
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
    visibleEvents: { ...visibleEvents, refreshEvents: api.refreshEvents, removeEvent: api.removeEvent, isLoading },
    resourceAreaWidth,
    createMeetingDialog: activeCreateMeetingDialog(api.refreshEvents),
    welcomeDialog: activeWelcomeDialog(api, visibleCalendarsIds),
    viewMeetingDialog: activeViewMeetingDialog(api, visibleEvents),
  };
}
