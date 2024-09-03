import { trpc } from "@/utils/trpc";
import { useState } from "react";
import { Select, DatePicker, Button } from "antd";

import type { Event } from "@/server/providers/types";
import { format, parse } from "date-fns";

const { RangePicker } = DatePicker;

type RangePickerValue = Parameters<typeof RangePicker>[0]["value"];

export default function Export() {
  const userCalendars = trpc.calendars.useQuery();
  const utils = trpc.useUtils();
  const [events, setEvents] = useState<Event[]>([]);

  const [calendars, setCalendars] = useState([]);
  const [dates, setDates] = useState<RangePickerValue>([null, null]);

  async function exportData() {
    const start = dates?.[0];
    const end = dates?.[1];

    if (!start || !end) {
      return;
    }

    const result = await utils.events.fetch({
      calendarId: calendars[0],
      startTimestamp: start.valueOf(),
      endTimestamp: end.valueOf(),
    });

    setEvents(result);
  }
  return (
    <>
      <main>
        <div>Select calendars to export:</div>
        <Select
          mode="multiple"
          allowClear
          style={{ width: "100%" }}
          placeholder="Please select"
          value={calendars}
          onChange={setCalendars}
          options={userCalendars.data?.map((item) => ({
            value: item.id,
            label: item.name,
          }))}
        />

        <div>Select time range</div>
        <RangePicker value={dates} onChange={setDates} />

        <Button type="primary" onClick={exportData}>
          Export
        </Button>

        <div>
          {events.map((event) => (
            <CalendarEvent key={event.id} event={event} />
          ))}
        </div>
      </main>
    </>
  );
}

function CalendarEvent({ event }: { event: Event }) {
  return (
    <div>
      {event.time.isAllDay ? (
        <>
          <EventTime time={event.time.startDate} /> -{" "}
          <EventTime time={event.time.startDate} />
        </>
      ) : (
        <>
          <EventTime time={event.time.startTimestamp} /> -{" "}
          <EventTime time={event.time.endTimestamp} />
        </>
      )}
      <span> {event.summary}</span>
    </div>
  );
}

export function EventTime({
  time,
}: {
  time: number | { day: number; month: number; year: number };
}) {
  if (typeof time === "number") {
    return <span>{format(time, "yyyy-MM-dd HH:mm")}</span>;
  } else {
    const date = parse(
      `${time.year}-${time.day}-${time.month}`,
      "yy-dd-MM",
      new Date()
    );
    return <span>{format(date, "yyyy-MM-dd ")}</span>;
  }
}
