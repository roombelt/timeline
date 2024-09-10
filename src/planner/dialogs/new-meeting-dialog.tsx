import { Form, Typography, Modal, Input, TimePicker, App, Descriptions, InputRef } from "antd";
import { useActive } from "active-store";
import React, { useEffect, useRef, useState } from "react";
import dayjs from "dayjs";
import { useStore } from "@/src/store";

export default function NewMeetingDialog() {
  const [isCreating, setCreating] = useState(false);
  const store = useStore();
  const data = useActive(store.planner.createMeetingDialog.data.get);
  const calendars = useActive(() => store.planner.visibleCalendars.get());
  const app = App.useApp();
  const firstFieldRef = useRef<InputRef>(null);

  const isOpen = !!data;
  useEffect(() => void (isOpen && setTimeout(() => firstFieldRef.current?.select(), 10)), [isOpen]);

  async function create() {
    try {
      setCreating(true);
      await store.planner.createMeetingDialog.save();
      setCreating(false);
      app.message.success("Meeting created");
    } catch (error) {
      setCreating(false);
      app.message.error("Error while creating meeting");
    }
  }

  const isFormValid = !!data?.summary?.trim();

  return (
    <Modal
      title={
        <Input
          ref={firstFieldRef}
          variant="filled"
          placeholder="Meeting title (required)"
          value={data?.summary}
          onChange={(e) => store.planner.createMeetingDialog.setSummary(e.target.value)}
        />
      }
      open={isOpen}
      closable={false}
      maskClosable={false}
      okButtonProps={{ loading: isCreating, disabled: !isFormValid }}
      onOk={create}
      onCancel={store.planner.createMeetingDialog.close}
    >
      <Form layout="vertical">
        <div style={{ marginBottom: 10, marginTop: 10 }}>
          <Input.TextArea
            variant="filled"
            placeholder="Optionally, provide meeting description here"
            autoSize={{ minRows: 2, maxRows: 6 }}
            value={data?.description}
            onChange={(e) => store.planner.createMeetingDialog.setDescription(e.target.value)}
          />
        </div>
        <div style={{ marginBottom: 5 }}>
          <Typography.Text type="secondary">Calendar: </Typography.Text>
          <Typography.Text>{calendars.find((item) => item.id == data?.calendarId)?.name}</Typography.Text>
        </div>
        <Descriptions>
          <Descriptions.Item label="Day">{dayjs(data?.startTimestamp).format("L")} </Descriptions.Item>
          <Descriptions.Item label="Start">{dayjs(data?.startTimestamp).format("LT")}</Descriptions.Item>
          <Descriptions.Item label="End">{dayjs(data?.endTimestamp).format("LT")}</Descriptions.Item>
        </Descriptions>
      </Form>
    </Modal>
  );
}