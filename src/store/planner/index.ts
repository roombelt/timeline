import dayjs from "dayjs";
import { activeComputed, activeState } from "active-store";
import { ActiveApiQueries } from "../trpc";
import { activeLocalStorage } from "../utils";
import type { CalendarEvent } from "@/server/providers/types";
import activeCreateMeetingDialog from "./create-meeting-dialog";
import activeViewMeetingDialog from "./view-meeting-dialog";

export default function activePlannerState(api: ActiveApiQueries) {
  const welcomeDialogVisible = activeLocalStorage(
    activeComputed(() => `${api.user.get()?.id}.welcome-dialog`),
    true
  );

  const resourceAreaWidth = activeLocalStorage(
    activeComputed(() => `${api.user.get()?.id}.resource-area-width`),
    300
  );

  const configDialogVisible = activeState(false);

  const timeRange = activeState({
    start: dayjs().startOf("day").valueOf(),
    end: dayjs().endOf("day").valueOf(),
  });

  const selectedCalendarsIds = activeLocalStorage<string[] | null>(
    activeComputed(() => `${api.user.get()?.id}.visible-calendars`),
    null
  );

  const selectedCalendars = activeComputed(() => {
    const calendars = api.userCalendars.get();
    const calendarsIds = selectedCalendarsIds.get();

    if (!calendarsIds) {
      return calendars.filter((_, index) => index < 10);
    }

    return calendarsIds.map((id) => {
      const calendar = calendars.find((item) => item.id === id);
      return calendar ?? { id, name: id, readonly: true, color: "blue" };
    });
  });

  const visibleEvents = activeComputed(() => {
    const data: CalendarEvent[] = [];
    for (const calendar of selectedCalendars.get()) {
      const state = api.calendarEvents.state({
        calendarId: calendar.id,
        startTimestamp: timeRange.get().start,
        endTimestamp: timeRange.get().end,
      });
      if (state.data) {
        data.push(...state.data!);
      }
    }
    return data;
  });

  const loadingStatus = activeComputed((calendarId: string) => {
    const state = api.calendarEvents.state({
      calendarId,
      startTimestamp: timeRange.get().start,
      endTimestamp: timeRange.get().end,
    });

    if (state.isFetching || state.status === "pending") return "fetching";
    else return state.status;
  });

  const calendars = activeComputed((calendarId: string) =>
    api.userCalendars.get().find((item) => item.id === calendarId)
  );

  return {
    welcomeDialog: {
      isVisible: welcomeDialogVisible.get,
      hide: () => welcomeDialogVisible.set(false),
    },
    configDialog: {
      isOpen: configDialogVisible.get,
      open: () => configDialogVisible.set(true),
      close: () => configDialogVisible.set(false),
    },
    timeRange: {
      get: timeRange.get,
      set(start: number, end: number) {
        timeRange.set({ start, end });
        api.refreshEvents();
      },
    },
    calendars,
    visibleCalendars: {
      ...selectedCalendars,
      setIds: selectedCalendarsIds.set,
      remove: (calendarId: string) => {
        const value = selectedCalendars
          .get()
          .map((item) => item.id)
          .filter((item) => item !== calendarId);
        selectedCalendarsIds.set(value);
      },
    },
    visibleEvents: {
      ...visibleEvents,
      refreshEvents: api.refreshEvents,
      removeEvent: api.removeEvent,
      loadingStatus,
    },
    resourceAreaWidth,
    createMeetingDialog: activeCreateMeetingDialog(api.refreshEvents),
    viewMeetingDialog: activeViewMeetingDialog(api, visibleEvents),
  };
}
