import * as XLSX from "xlsx";
import { activeComputed, activeState } from "active-store";
import { ActiveApiQueries } from "./trpc";
import { trpc } from "../../pages/api/trpc/_client";
import type { Calendar, CalendarEvent } from "@/server/providers/types";
import dayjs from "dayjs";
import { activeLocalStorage } from "./utils";

export default function activeExportState(api: ActiveApiQueries) {
  const isVisible = activeState(false);

  const selectedCalendarIds = activeLocalStorage(
    activeComputed(() => `${api.user.get()?.id}.export-calendars`),
    []
  );

  const selectedColumns = activeLocalStorage(
    activeComputed(() => `${api.user.get()?.id}.export-columns`),
    ["Summary", "Start time", "End time"]
  );

  const timeRange = activeLocalStorage(
    activeComputed(() => `${api.user.get()?.id}.time-range`),
    { start: dayjs().startOf("month").valueOf(), end: dayjs().endOf("month").valueOf() }
  );

  const exportStatus = activeState<"success" | "error" | "loading">("success");
  let lastCounter = 0;

  async function exportAsExcel() {
    exportStatus.set("loading");

    lastCounter += 1;
    const currentCounter = lastCounter;
    const promises = selectedCalendarIds.get().map((calendarId) =>
      trpc.events.query({
        calendarId,
        startTimestamp: timeRange.get().start,
        endTimestamp: timeRange.get().end,
      })
    );

    const result = await Promise.all(promises).then((items) => items.flat());

    if (currentCounter !== lastCounter) {
      return;
    }

    const data = result.map((e) => {
      const row: Record<string, string | number> = {};
      const calendar = api.userCalendars.get().find((calendar) => (calendar.id = e.calendarId));

      for (const column of selectedColumns.get()) {
        row[column] = columnsAvailableForExport[column](e, calendar!);
      }
      return row;
    });

    const ws = XLSX.utils.json_to_sheet(data);
    XLSX.utils.sheet_add_aoa(ws, [selectedColumns.get()]);

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "All events");
    XLSX.writeFile(wb, "events.xlsx");

    exportStatus.set("success");
  }

  const config = activeComputed(() => ({
    calendars: selectedCalendarIds.get(),
    columns: selectedColumns.get(),
    startTime: timeRange.get().start,
    endTime: timeRange.get().end,
  }));

  return {
    isVisible,
    show: () => isVisible.set(true),
    hide: () => isVisible.set(false),
    status: exportStatus,
    config,
    setCalendars: selectedCalendarIds.set,
    setColumns: selectedColumns.set,
    setStartTime: (time: number) => timeRange.set({ ...timeRange.get(), start: time }),
    setEndTime: (time: number) => timeRange.set({ ...timeRange.get(), end: time }),
    exportAsExcel,
  };
}

export const columnsAvailableForExport: Record<string, (event: CalendarEvent, calendar: Calendar) => string | number> =
  {
    Summary: (event) => event.summary,
    Description: (event) => event.description,
    Organizer: (event) => event.organizer,
    "Start time": (event) => formatTime(event.start),
    "End time": (event) => formatTime(event.end),
    "Participants #": (event) => event.participants.length,
    "Participants List": (event) => event.participants.join(", "),
    Calendar: (event, calendar) => calendar.name,
  };

function formatTime(time: number | { year: number; day: number; month: number }) {
  if (typeof time === "number") {
    return dayjs(time).format("LL LT");
  } else {
    return dayjs(`${time.year}-${time.day}-${time.month}`, "YYYY-dd-MM").format("LL");
  }
}
