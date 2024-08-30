import { trpc } from "@/utils/trpc";
import { useState } from "react";
import { Select, DatePicker, Button, Space } from "antd";

import type { Calendar } from "@/server/providers/types";
import type { SelectProps } from "antd";

const { RangePicker } = DatePicker;

type RangePickerValue = Parameters<typeof RangePicker>[0]["value"];

export default function Export() {
  const userCalendars = trpc.calendars.useQuery();

  const [calendars, setCalendars] = useState([]);
  const [dates, setDates] = useState<RangePickerValue>([null, null]);

  function exportData() {
    console.log("Exporting", calendars, dates);
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
      </main>
    </>
  );
}

function CalendarItem({ calendar }: { calendar: Calendar }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <li key={calendar.id}>
      {calendar.name}{" "}
      <Button onClick={() => setExpanded(!expanded)}>
        {expanded ? "-" : "+"}
      </Button>
      {expanded && <CalendarEvents id={calendar.id} />}
    </li>
  );
}

function CalendarEvents({ id }: { id: string }) {
  const events = useEvents(id);
  if (events.isLoading || events.isReloading) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      {events.data?.length === 0 && (
        <>
          <div>No events planned</div>
          <button onClick={events.reload}>Refresh</button>
        </>
      )}
      {events.data?.map((event) => (
        <div key={event.id}>{event.summary}</div>
      ))}
    </div>
  );
}

function useEvents(calendarId: string) {
  const events = trpc.events.useQuery(calendarId);

  const [isReloading, setReloading] = useState(false);
  function reload() {
    setReloading(true);
    events.refetch().finally(() => setReloading(false));
  }

  return { ...events, isReloading, reload };
}

const options: SelectProps["options"] = [];

for (let i = 10; i < 36; i++) {
  options.push({
    label: i.toString(36) + i,
    value: i.toString(36) + i,
  });
}
