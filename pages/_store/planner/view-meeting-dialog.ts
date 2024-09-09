import { activeComputed, activeState } from "active-store";
import type { ActiveApiQueries } from "../trpc";
import type { CalendarEvent } from "@/server/providers/types";

export default function activeViewMeetingDialog(api: ActiveApiQueries) {
  const visibleEvent = activeState<null | CalendarEvent>(null);
  const removeState = activeState({ isRemoving: false, error: null as any });
  const eventWithCalendar = activeComputed(() => {
    const event = visibleEvent.get();
    return {
      event,
      calendar: api.userCalendars.get().find((item) => item.id === event?.calendarId),
      isRemoving: removeState.get().isRemoving,
    };
  });

  return {
    get: eventWithCalendar.get,
    show(event: CalendarEvent | null) {
      removeState.set({ isRemoving: false, error: null });
      visibleEvent.set(event);
    },
    async remove() {
      const event = visibleEvent.get();
      if (!event) return;

      try {
        removeState.set({ isRemoving: true, error: null });
        await api.removeEvent(event.calendarId, event.id);

        if (event.id !== visibleEvent.get()?.id) return;

        removeState.set({ isRemoving: false, error: null });

        // let the popconfirm to close before removing it's parent
        await Promise.resolve(null);
        visibleEvent.set(null);
      } catch (error) {
        if (event.id !== visibleEvent.get()?.id) return;

        removeState.set({ isRemoving: false, error });
      }
    },
  };
}
