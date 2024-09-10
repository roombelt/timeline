import { Button, Select, Modal, Typography } from "antd";
import { useActive } from "active-store";
import React from "react";
import { useStore } from "@/src/store";

export default function ConfigureDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const store = useStore();
  const userCalendars = useActive(store.userCalendars.get);
  const visibleCalendarsIds = useActive(store.planner.visibleCalendars.getIds);

  return (
    <Modal
      title="Edit visible calendars"
      open={open}
      onCancel={onClose}
      footer={<Button type="primary" onClick={onClose} children="OK" />}
    >
      <p> Please select calendars you'd like to see on the timeline:</p>
      <Select
        style={{ width: "100%", marginBottom: 5 }}
        mode="multiple"
        allowClear
        placeholder="Please select"
        value={visibleCalendarsIds}
        onChange={store.planner.visibleCalendars.setIds}
        options={userCalendars.map((item) => ({
          value: item.id,
          label: item.name,
        }))}
        optionFilterProp="label"
      />
      <Typography.Text type="secondary">
        Hint: If your calendar is missing on the list visit{" "}
        <a href="https://go.roombelt.com/scMpEB" target="_blank" rel="noopener noreferer">
          this documentation page
        </a>
        .
      </Typography.Text>
    </Modal>
  );
}
