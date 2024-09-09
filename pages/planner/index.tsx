import { App } from "antd";
import { useActive } from "active-store";
import React, { useEffect, useRef, useState } from "react";
import styled from "styled-components";

import dayjs from "dayjs";

import FullCalendar from "@fullcalendar/react";
import resourceTimelinePlugin from "@fullcalendar/resource-timeline";
import interactionPlugin from "@fullcalendar/interaction";

import NewMeetingDialog from "./_dialogs/new-meeting-dialog";
import ConfigureDialog from "./_dialogs/configure-dialog";
import TableLabel, { TABLE_LABEL_ELEMENT_CLASS } from "./_components/table-label";
import RowLabel from "./_components/row-label";
import WelcomeDialog from "./_dialogs/welcome-dialog";
import ViewMeetingDialog from "./_dialogs/view-meeting-dialog";
import { useStore } from "../_store";

const toTimestamp = (time: number | { year: number; month: number; day: number }) =>
  typeof time === "number" ? time : `${time.year}-${time.day}-${time.month}`;

export default function BookHelper() {
  const store = useStore();
  const [isConfigOpen, setConfigOpen] = useState(false);
  const fullCalendar = useRef<FullCalendar | null>(null);

  const calendars = useActive(store.planner.visibleCalendars.get);
  const events = useActive(store.planner.visibleEvents.get);
  const resourceAreaWidth = useActive(store.planner.resourceAreaWidth.get);

  useEffect(() => store.showApp(100), []);

  const getCalendar = (calendarId: string) => calendars.find((c) => c.id === calendarId);
  const getCalendarApi = () => fullCalendar.current!.getApi();

  return (
    <PlannerViewWrapper>
      <ConfigureDialog open={isConfigOpen} onClose={() => setConfigOpen(false)} />
      <ViewMeetingDialog />
      <NewMeetingDialog />
      <WelcomeDialog />
      <FullCalendar
        ref={fullCalendar}
        plugins={[interactionPlugin, resourceTimelinePlugin]}
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
          const event = events.find((item) => item.calendarId === calendarId && item.id === eventId) ?? null;
          store.planner.viewMeetingDialog.show(event);
        }}
        select={(info) =>
          store.planner.createMeetingDialog.open(
            info.resource!.id,
            info.start,
            info.end,
            `Meeting in ${calendars.find((item) => item.id === info.resource!.id)?.name}`
          )
        }
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
