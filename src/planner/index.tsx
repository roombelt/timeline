import { App } from "antd";
import { useActive } from "active-store";
import React, { useEffect, useRef, useState } from "react";
import styled from "styled-components";

import dayjs from "dayjs";

import FullCalendar from "@fullcalendar/react";
import resourceTimelinePlugin from "@fullcalendar/resource-timeline";
import interactionPlugin from "@fullcalendar/interaction";

import NewMeetingDialog from "./dialogs/new-meeting-dialog";
import ConfigureDialog from "./dialogs/configure-dialog";
import TableLabel, { TABLE_LABEL_ELEMENT_CLASS } from "./components/table-label";
import RowLabel from "./components/row-label";
import ViewMeetingDialog from "./dialogs/view-meeting-dialog";
import { useStore } from "../store";

const toTimestamp = (time: number | { year: number; month: number; day: number }) =>
  typeof time === "number" ? time : `${time.year}-${time.day}-${time.month}`;

export default function PlannerPage() {
  const app = App.useApp();
  const store = useStore();
  const [isConfigOpen, setConfigOpen] = useState(false);
  const fullCalendar = useRef<FullCalendar | null>(null);

  const calendars = useActive(store.planner.visibleCalendars);
  const events = useActive(store.planner.visibleEvents);
  const resourceAreaWidth = useActive(store.planner.resourceAreaWidth);

  useEffect(() => store.showApp(100), [store]);

  const getCalendar = (calendarId: string) => calendars.find((c) => c.id === calendarId);
  const getCalendarApi = () => fullCalendar.current!.getApi();

  return (
    <PlannerViewWrapper>
      <ConfigureDialog open={isConfigOpen} onClose={() => setConfigOpen(false)} />
      <ViewMeetingDialog />
      <NewMeetingDialog />
      <FullCalendar
        ref={fullCalendar}
        plugins={[interactionPlugin, resourceTimelinePlugin]}
        schedulerLicenseKey="GPL-My-Project-Is-Open-Source"
        initialView="resourceTimelineDay"
        events={events.map((item) => ({
          title: item.summary,
          id: `${item.calendarId}~~~${item.id}`,
          resourceId: item.calendarId,
          start: toTimestamp(item.start),
          end: toTimestamp(item.end),
          color: getCalendar(item.calendarId)?.color,
        }))}
        headerToolbar={false}
        nowIndicator
        scrollTime={`${Math.max(dayjs().hour() - 2, 0)}:00:00`}
        scrollTimeReset={false}
        datesSet={(data) => store.planner.timeRange.set(data.start.valueOf(), data.end.valueOf())}
        height={"100%"}
        resources={calendars.map((item) => ({
          id: item.id,
          title: item.name,
        }))}
        resourceLabelContent={({ resource }) => <RowLabel resource={resource} />}
        resourceAreaHeaderContent={({ view }) => (
          <TableLabel view={view} getCalendarApi={getCalendarApi} openConfig={() => setConfigOpen(true)} />
        )}
        resourceAreaWidth={resourceAreaWidth}
        resourceAreaHeaderClassNames={TABLE_LABEL_ELEMENT_CLASS}
        selectable
        selectOverlap={false}
        slotDuration="00:15:00"
        eventClick={(info) => {
          const [calendarId, eventId] = info.event.id.split("~~~");
          store.planner.viewMeetingDialog.open(calendarId, eventId);
        }}
        select={(info) => {
          if (getCalendar(info.resource!.id)?.readonly) {
            return app.message.error("You can't create meetings in this calendar because it's read-only.");
          }

          return store.planner.createMeetingDialog.open(
            info.resource!.id,
            info.start,
            info.end,
            `Meeting in ${calendars.find((item) => item.id === info.resource!.id)?.name}`
          );
        }}
      />
    </PlannerViewWrapper>
  );
}

const PlannerViewWrapper = styled.div`
  width: 100%;
  height: 100%;

  .${TABLE_LABEL_ELEMENT_CLASS} .fc-datagrid-cell-cushion {
    width: 100% !important;
  }
`;
