import { Button, Select, Modal, Typography } from "antd";
import { useActive } from "active-store";
import React, { useEffect, useRef, useState } from "react";
import { useStore } from "@/pages/_store";

export default function WelcomeDialog() {
  const store = useStore();
  const firstInputRef = useRef<any>(null);
  const isVisible = useActive(store.planner.welcomeDialog.getVisible);
  const [calendarsIds, setCalendarsIds] = useState([]);
  const userCalendars = useActive(store.userCalendars.get);

  useEffect(() => {
    if (isVisible) firstInputRef.current?.focus();
  }, [isVisible]);

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
        style={{ width: "100%", marginBottom: 5 }}
        mode="multiple"
        allowClear
        ref={firstInputRef}
        placeholder="Click to pick calendars"
        value={calendarsIds}
        onChange={setCalendarsIds}
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
