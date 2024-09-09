import { activeState } from "active-store";
import dayjs from "dayjs";
import { trpc } from "../../api/trpc/_client";

export default function activeCreateMeetingDialog(refresh: (calendarId: string) => Promise<any>) {
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
