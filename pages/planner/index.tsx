import { App, Button, DatePicker, Popconfirm } from "antd";
import { useActive } from "active-store";
import React, { useRef, useState } from "react";
import dayjs from "dayjs";

import {
  CaretLeftOutlined,
  CaretRightOutlined,
  DeleteOutlined,
  LoadingOutlined,
  PlusOutlined,
  ReloadOutlined,
} from "@ant-design/icons";
import FullCalendar from "@fullcalendar/react";
import resourceTimelinePlugin from "@fullcalendar/resource-timeline";
import interactionPlugin from "@fullcalendar/interaction";
import type { ColHeaderContentArg, ResourceLabelContentArg } from "@fullcalendar/resource";

import store from "@/pages/_store";
import NewMeetingDialog from "./_dialogs/new-meeting-dialog";
import ConfigureDialog from "./_dialogs/configure-dialog";
import styled from "styled-components";
import type { CalendarApi } from "@fullcalendar/core";

const toTimestamp = (time: number | { year: number; month: number; day: number }) =>
  typeof time === "number" ? time : `${time.year}-${time.day}-${time.month}`;

export default function BookHelper() {
  const [isConfigOpen, setConfigOpen] = useState(false);
  const fullCalendar = useRef<FullCalendar | null>(null);

  const calendars = useActive(store.planner.visibleCalendars.get);
  const events = useActive(store.planner.visibleEvents.get);
  const app = App.useApp();

  const getCalendarApi = () => fullCalendar.current!.getApi();

  return (
    <PlannerViewWrapper>
      <ConfigureDialog open={isConfigOpen} onClose={() => setConfigOpen(false)} />
      <NewMeetingDialog />
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
        resourceAreaHeaderClassNames={"planner-resources-header"}
        selectable
        selectOverlap={false}
        slotDuration="00:15:00"
        eventClick={(info) => {
          app.modal.confirm({
            content: `Are you sure you want to remove meeting "${info.event.title}"?`,
            async onOk() {
              const eventId = info.event.id.split("~~~")[1];
              await Promise.all(
                info.event.getResources().map((resource) => store.planner.removeMeeting(resource.id, eventId))
              );
              app.notification.success({ message: "Meeting removed" });
            },
          });
        }}
        dateClick={console.log}
        select={(info) =>
          store.planner.newMeeting.open(
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
  .planner-resources-header .fc-datagrid-cell-cushion {
    width: 100% !important;
  }
`;

type TableLabelProps = {
  openConfig: () => void;
  view: ColHeaderContentArg["view"];
  getCalendarApi: () => CalendarApi;
};

function TableLabel({ openConfig, getCalendarApi }: TableLabelProps) {
  const [isLoading, setLoading] = useState(false);
  const time = useActive(store.planner.timeRange.get);

  async function refreshAll() {
    if (isLoading) {
      return;
    }

    setLoading(true);
    await store.planner.visibleEvents.refreshEvents().catch(() => null);
    setLoading(false);
  }

  return (
    <TableLabelWrapper>
      <div style={{ display: "flex", alignItems: "center" }}>
        <Button size="small" type="text" onClick={() => getCalendarApi().prev()}>
          <CaretLeftOutlined />
        </Button>
        <DatePicker
          value={dayjs(time.start)}
          allowClear={false}
          suffixIcon={null}
          onChange={(value) => getCalendarApi().gotoDate(value.valueOf())}
        />
        <Button size="small" type="text" onClick={() => getCalendarApi().next()}>
          <CaretRightOutlined />
        </Button>
      </div>
      <div>
        <Button size="small" type="text" onClick={openConfig}>
          <PlusOutlined />
        </Button>
        <Button size="small" type="text" onClick={refreshAll}>
          {isLoading ? <LoadingOutlined /> : <ReloadOutlined />}
        </Button>
      </div>
    </TableLabelWrapper>
  );
}

const TableLabelWrapper = styled.div`
  width: 100%;
  display: grid;
  align-items: center;
  text-align: left;
  grid-template-columns: 1fr auto;
`;

function RowLabel({ resource }: { resource: ResourceLabelContentArg["resource"] }) {
  const status = useActive(() => store.planner.loadingStatus.get(resource.id));
  const [isConfirmOpen, setConfirmOpen] = useState(false);
  const isLoading = status === "pending";
  return (
    <RowLabelWrapper>
      <span className="resource-label">{resource.title}</span>
      <div className="resource-label-actions">
        <Popconfirm
          title="Delete the calendar"
          description="Are you sure to delete this calendar from the list?"
          onConfirm={() => store.planner.visibleCalendars.remove(resource.id)}
          onOpenChange={(state) => setConfirmOpen(state)}
          okText="Yes"
          cancelText="No"
          placement="bottom"
        >
          <Button size="small" type="text" className={isConfirmOpen ? "force-visible" : ""}>
            <DeleteOutlined />
          </Button>
        </Popconfirm>
        <Button
          size="small"
          type="text"
          className={isConfirmOpen || isLoading ? "force-visible" : ""}
          onClick={() => !isLoading && store.planner.visibleEvents.refreshEvents(resource.id)}
        >
          {isLoading ? <LoadingOutlined /> : <ReloadOutlined />}
        </Button>
      </div>
    </RowLabelWrapper>
  );
}

const RowLabelWrapper = styled.div`
  display: grid;
  height: 25px;
  align-items: center;
  grid-template-columns: 1fr auto;

  .resource-label {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .resource-label-actions {
    display: flex;
    white-space: nowrap;
  }

  button {
    display: none;
  }

  &:hover button {
    display: block;
  }

  .force-visible {
    display: block;
  }
`;
