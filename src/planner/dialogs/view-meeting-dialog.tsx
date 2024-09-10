import { Form, Typography, Modal, Descriptions, Space, Button, Popconfirm, App } from "antd";
import { useActive } from "active-store";
import React from "react";
import dayjs from "dayjs";

import { DeleteOutlined } from "@ant-design/icons";
import { useStore } from "@/src/store";

export default function ViewMeetingDialog() {
  const app = App.useApp();
  const store = useStore();
  const { event, calendar, isRemoving } = useActive(store.planner.viewMeetingDialog.get);

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
        open={isRemoving || undefined}
        onConfirm={() => store.planner.viewMeetingDialog.remove().then(() => app.message.success("Meeting removed"))}
        okText="Yes"
        okButtonProps={{ disabled: isRemoving, loading: isRemoving }}
        cancelButtonProps={{ disabled: isRemoving }}
        cancelText="No"
        placement="bottom"
      >
        <Button danger disabled={isRemoving}>
          <DeleteOutlined />
        </Button>
      </Popconfirm>
      <Button onClick={() => store.planner.viewMeetingDialog.close()} disabled={isRemoving} type="primary">
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

        {event?.organizer && (
          <div style={{ marginTop: 5 }}>
            <Typography.Text type="secondary">Organizer: </Typography.Text>
            <Typography.Text> {event?.organizer}</Typography.Text>
          </div>
        )}

        {!!event?.participants.length && (
          <div style={{ marginTop: 5 }}>
            <Typography.Text type="secondary">Participants: </Typography.Text>
            <Typography.Text> {event?.participants.join(", ")}</Typography.Text>
          </div>
        )}
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
