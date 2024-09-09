import { Button, Select, Modal } from "antd";
import { useActive } from "active-store";
import React from "react";
import { useStore } from "@/pages/_store";

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
        style={{ width: "100%" }}
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
    </Modal>
  );
}
