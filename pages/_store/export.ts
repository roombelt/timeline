import * as XLSX from "xlsx";
import { activeState } from "active-store";
import { ActiveApiQueries } from "./trpc";
import { trpc } from "../api/trpc/_client";
import type { Calendar, CalendarEvent } from "@/server/providers/types";
import dayjs from "dayjs";

export default function activeExportState(userCalendars: ActiveApiQueries["userCalendars"]) {
  const exportStatus = activeState<"success" | "error" | "loading">("success");
  let lastCounter = 0;

  async function exportAsExcel(
    calendarIds: string[],
    startTimestamp: number,
    endTimestamp: number,
    columns: (keyof typeof columnsAvailableForExport)[]
  ) {
    exportStatus.set("loading");

    lastCounter += 1;
    const currentCounter = lastCounter;
    const promises = calendarIds.map((calendarId) => trpc.events.query({ calendarId, startTimestamp, endTimestamp }));

    const result = await Promise.all(promises).then((items) => items.flat());

    if (currentCounter !== lastCounter) {
      return;
    }

    const data = result.map((e) => {
      const row: Record<string, string | number> = {};
      const calendar = userCalendars.get().find((calendar) => (calendar.id = e.calendarId));

      for (const column of columns) {
        row[column] = columnsAvailableForExport[column](e, calendar!);
      }
      return row;
    });

    const ws = XLSX.utils.json_to_sheet(data);
    XLSX.utils.sheet_add_aoa(ws, [columns]);

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "All events");
    XLSX.writeFile(wb, "events.xlsx");

    exportStatus.set("success");
  }

  return {
    status: exportStatus,
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
