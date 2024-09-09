import { activeState } from "active-store";
import dayjs from "dayjs";
import { trpc } from "../../api/trpc/_client";

export default function activeCreateMeetingDialog(refresh: (calendarId: string) => Promise<any>) {
  const isSaving = activeState(false);
  const state = activeState<{
    calendarId: string;
    startTimestamp: number;
    endTimestamp: number;
    summary: string;
    description: string;
  } | null>(null);

  return {
    open(calendarId: string, start: Date, end: Date, summary: string) {
      state.set({
        calendarId: calendarId,
        startTimestamp: dayjs(start).valueOf(),
        endTimestamp: dayjs(end).valueOf(),
        summary: summary,
        description: "",
      });
    },
    close: () => state.set(null),
    data: { get: state.get },
    isSaving,
    setSummary: (summary: string) => state.set({ ...state.get()!, summary }),
    setDescription: (description: string) => state.set({ ...state.get()!, description }),
    async save() {
      const value = state.get();
      if (!value) {
        return;
      }
      await trpc.createEvent.mutate(value);
      await refresh(value.calendarId);
      state.set(null);
    },
  };
}
