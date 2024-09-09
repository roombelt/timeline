import { Button, Select, Modal, App } from "antd";
import { useActive } from "active-store";
import React, { useState } from "react";

import store from "@/pages/_store";

export default function WelcomeDialog() {
  const isVisible = useActive(store.planner.welcomeDialog.getVisible);
  const [calendarsIds, setCalendarsIds] = useState([]);
  const userCalendars = useActive(store.userCalendars.get);

  function onSubmit() {
    store.planner.welcomeDialog.submit(calendarsIds);
  }

  return (
    <Modal
      title="Great to see you!"
      closable={false}
      open={isVisible}
      footer={<Button disabled={calendarsIds.length === 0} type="primary" children="OK" onClick={onSubmit} />}
    >
      <p>To get started please select calendars you'd like to see on the timeline:</p>
      <Select
        style={{ width: "100%" }}
        mode="multiple"
        allowClear
        placeholder="Pick calendars here"
        value={calendarsIds}
        onChange={setCalendarsIds}
        options={userCalendars.map((item) => ({
          value: item.id,
          label: item.name,
        }))}
        optionFilterProp="label"
      />
    </Modal>
  );
}
