import { ActiveComputed, activeComputed, activeState } from "active-store";
import type { ActiveApiQueries } from "../trpc";
import type { CalendarEvent } from "@/server/providers/types";

export default function activeViewMeetingDialog(
  api: ActiveApiQueries,
  visibleEvents: ActiveComputed<() => CalendarEvent[]>
) {
  const visibleEvent = activeState<null | CalendarEvent>(null);
  const removeState = activeState({ isRemoving: false, error: null as any });
  const state = activeComputed(() => {
    const event = visibleEvent.get();
    return {
      event,
      calendar: api.userCalendars.get().find((item) => item.id === event?.calendarId),
      isRemoving: removeState.get().isRemoving,
    };
  });

  return {
    get: state.get,
    async open(calendarId: string, eventId: string) {
      removeState.set({ isRemoving: false, error: null });
      const event = visibleEvents.state().data?.find((item) => item.calendarId === calendarId && item.id === eventId);
      visibleEvent.set(event ?? null);
    },
    async close() {
      removeState.set({ isRemoving: false, error: null });
      visibleEvent.set(null);
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
