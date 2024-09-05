import Tool from "@/components/tool";
import { Form, Button, Select, Modal, Input, TimePicker, App } from "antd";
import { useActive } from "active-store";
import React, { useState } from "react";
import dayjs from "dayjs";

import FullCalendar from "@fullcalendar/react";
import resourceTimelinePlugin from "@fullcalendar/resource-timeline";
import interactionPlugin from "@fullcalendar/interaction";

import bookState from "./_state";

const toTimestamp = (time: number | { year: number; month: number; day: number }) =>
  typeof time === "number" ? time : `${time.year}-${time.day}-${time.month}`;

export default function BookHelper() {
  const [isConfigOpen, setConfigOpen] = useState(false);

  const calendars = useActive(bookState.visibleCalendars.get);
  const events = useActive(bookState.visibleEvents.get);

  return (
    <Tool>
      <EditVisibleResourcesDialog open={isConfigOpen} onClose={() => setConfigOpen(false)} />
      <CreateMeetingDialog />
      <FullCalendar
        plugins={[interactionPlugin, resourceTimelinePlugin]}
        initialView="resourceTimelineDay"
        events={events.map((item) => ({
          title: item.summary,
          id: item.id,
          resourceId: item.calendarId,
          start: toTimestamp(item.start),
          end: toTimestamp(item.end),
        }))}
        nowIndicator
        scrollTime={`${Math.max(dayjs().hour() - 2, 0)}:00:00`}
        scrollTimeReset={false}
        datesSet={(data) => bookState.setTimeRange(data.start.valueOf(), data.end.valueOf())}
        height={400}
        resources={calendars.map((item) => ({
          id: item.id,
          title: item.name,
        }))}
        resourceLabelContent={(data) => (
          <>
            {data.resource.title} <button onClick={() => bookState.visibleCalendars.remove(data.resource.id)}>-</button>
          </>
        )}
        resourceAreaHeaderContent={(data) => (
          <>
            Calendars <button onClick={() => setConfigOpen(true)}>+</button>
          </>
        )}
        selectable
        selectOverlap={false}
        slotDuration="00:15:00"
        eventClick={console.log}
        dateClick={console.log}
        select={function (info) {
          bookState.newMeeting.data.set({
            calendarId: info.resource!.id,
            startTimestamp: info.start.valueOf(),
            endTimestamp: info.end.valueOf(),
            summary: "New meeting",
          });
        }}
      />
    </Tool>
  );
}

function EditVisibleResourcesDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const userCalendars = useActive(bookState.userCalendars.get);
  const visibleCalendarsIds = useActive(bookState.visibleCalendars.getIds);

  return (
    <Modal
      title="Edit visible calendars"
      open={open}
      onCancel={onClose}
      footer={<Button type="primary" onClick={onClose} children="OK" />}
    >
      <Form labelCol={{ span: 4 }} wrapperCol={{ span: 14 }}>
        <Form.Item label="Calendars">
          <Select
            mode="multiple"
            allowClear
            placeholder="Please select"
            value={visibleCalendarsIds}
            onChange={bookState.visibleCalendars.setIds}
            options={userCalendars.map((item) => ({
              value: item.id,
              label: item.name,
            }))}
            optionFilterProp="label"
          />
        </Form.Item>
      </Form>
    </Modal>
  );
}

function CreateMeetingDialog() {
  const [isCreating, setCreating] = useState(false);
  const data = useActive(bookState.newMeeting.data.get);
  const calendars = useActive(() => bookState.visibleCalendars.get());
  const app = App.useApp();

  async function create() {
    try {
      setCreating(true);
      await bookState.newMeeting.save();
      setCreating(false);
      app.notification.success({ message: "Meeting created" });
    } catch (error) {
      setCreating(false);
      app.notification.error({ message: "Error while creating meeting" });
    }
  }

  return (
    <Modal
      title="Create meeting"
      open={!!data}
      okButtonProps={{ loading: isCreating }}
      onOk={create}
      onCancel={() => bookState.newMeeting.data.set(null)}
    >
      <Form.Item label="Calendar">
        <Select
          options={calendars.map((item) => ({ value: item.id, label: item.name }))}
          value={data?.calendarId}
          onChange={bookState.newMeeting.setCalendar}
        />
      </Form.Item>
      <Form labelCol={{ span: 4 }} wrapperCol={{ span: 14 }}>
        <Form.Item label="Start time">
          <TimePicker disabled value={dayjs(data?.startTimestamp)} />
        </Form.Item>
        <Form.Item label="End time">
          <TimePicker disabled value={dayjs(data?.endTimestamp)} />
        </Form.Item>
        <Form.Item label="Summary">
          <Input value={data?.summary} onChange={(event) => bookState.newMeeting.setSummary(event.target.value)} />
        </Form.Item>
      </Form>
    </Modal>
  );
}
