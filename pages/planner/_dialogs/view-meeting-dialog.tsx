import { Form, Typography, Modal, Descriptions, Space, Button, Popconfirm, App } from "antd";
import { useActive } from "active-store";
import React, { useEffect, useState } from "react";
import dayjs from "dayjs";

import store from "@/pages/_store";
import type { CalendarEvent } from "@/server/providers/types";
import { DeleteOutlined } from "@ant-design/icons";
import { useMutation } from "@/pages/_store/utils";

export default function ViewMeetingDialog({ event, onClose }: { event: CalendarEvent | null; onClose: () => void }) {
  const app = App.useApp();
  const calendars = useActive(store.planner.visibleCalendars.state);
  const calendar = calendars.data?.find((item) => item.id === event?.calendarId);

  const removeMeeting = useMutation(store.planner.visibleEvents.removeEvent, {
    onSuccess: () => {
      onClose();
      app.notification.success({ message: "Meeting removed" });
    },
  });

  const footer = (
    <Space>
      <Popconfirm
        title="Delete this meeting"
        description={
          <>
            Are you sure you want to delete this meeting? <br />
            This operation cannot be reverted.
          </>
        }
        onConfirm={() => removeMeeting.mutate(event!.calendarId, event!.id)}
        okText="Yes"
        okButtonProps={{ disabled: removeMeeting.isPending, loading: removeMeeting.isPending }}
        cancelButtonProps={{ disabled: removeMeeting.isPending }}
        cancelText="No"
        placement="bottom"
      >
        <Button danger disabled={removeMeeting.isPending}>
          <DeleteOutlined />
        </Button>
      </Popconfirm>
      <Button onClick={onClose} disabled={removeMeeting.isPending} type="primary">
        Close
      </Button>
    </Space>
  );

  return (
    <Modal title={event?.summary} open={!!event} closable={false} maskClosable={false} footer={footer}>
      <Form layout="vertical">
        {event?.description && <p style={{ marginBottom: 10, marginTop: 10 }}>{event.description}</p>}
        <div style={{ marginBottom: 5 }}>
          <Typography.Text type="secondary">Calendar: </Typography.Text>
          <Typography.Text> {calendar?.name ?? "Unknown"}</Typography.Text>
        </div>
        <Descriptions>
          <Descriptions.Item label="Day">{toDayJS(event?.start)?.format("L")} </Descriptions.Item>
          <Descriptions.Item label="Start">{toDayJS(event?.start)?.format("LT")}</Descriptions.Item>
          <Descriptions.Item label="End">{toDayJS(event?.end)?.format("LT")}</Descriptions.Item>
        </Descriptions>
      </Form>
    </Modal>
  );
}

const toDayJS = (time: number | { year: number; month: number; day: number } | undefined) =>
  time == null ? null : dayjs(typeof time === "number" ? time : `${time.year}-${time.day}-${time.month}`);

// app.modal.confirm({
//   content: `Are you sure you want to remove meeting "${info.event.title}"?`,
//   async onOk() {
//     const eventId = info.event.id.split("~~~")[1];
//     await Promise.all(
//       info.event
//         .getResources()
//         .map((resource) => store.planner.visibleEvents.removeEvent(resource.id, eventId))
//     );
//     app.notification.success({ message: "Meeting removed" });
//   },
// });
