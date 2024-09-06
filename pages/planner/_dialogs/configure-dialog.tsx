import { Form, Button, Select, Modal } from "antd";
import { useActive } from "active-store";
import React from "react";

import store from "@/pages/_store";

export default function ConfigureDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const userCalendars = useActive(store.userCalendars.get);
  const visibleCalendarsIds = useActive(store.planner.visibleCalendars.getIds);

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
            onChange={store.planner.visibleCalendars.setIds}
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
