import React from "react";
import { Form, Select, DatePicker, Button, notification, Modal } from "antd";
import dayjs from "dayjs";
import { useActive } from "active-store";
import { useStore } from "@/src/store";
import { columnsAvailableForExport } from "@/src/store/export";

const { RangePicker } = DatePicker;

export default function ExportDialog() {
  const store = useStore();
  const isVisible = useActive(store.export.isVisible);
  const exportStatus = useActive(store.export.status);
  const config = useActive(store.export.config);
  const userCalendars = useActive(store.userCalendars);

  async function exportData() {
    await store.export.exportAsExcel();
    notification.success({ message: "Successfully exported events." });
  }
  return (
    <Modal
      title="Export events data to Excel"
      closable={false}
      open={isVisible}
      footer={
        <>
          <Button children="Close" onClick={store.export.hide} />
          <Button
            type="primary"
            children="Export"
            onClick={exportData}
            disabled={
              !config.calendars.length ||
              !config.columns.length ||
              !config.startTime ||
              !config.endTime ||
              exportStatus === "loading"
            }
            loading={exportStatus === "loading"}
          />
        </>
      }
    >
      <Form layout="vertical" style={{ maxHeight: "calc(100vh - 300px)", overflowY: "auto" }}>
        <Form.Item label="Calendars">
          <Select
            mode="multiple"
            allowClear
            placeholder="Please select"
            value={config.calendars}
            onChange={store.export.setCalendars}
            options={userCalendars.map((item) => ({
              value: item.id,
              label: item.name,
            }))}
            optionFilterProp="label"
          />
        </Form.Item>

        <Form.Item label="Columns">
          <Select
            mode="multiple"
            allowClear
            style={{ width: "100%" }}
            placeholder="Please select"
            value={config.columns}
            onChange={store.export.setColumns}
            options={Object.keys(columnsAvailableForExport).map((item) => ({
              value: item,
              label: item,
            }))}
            optionFilterProp="label"
          />
        </Form.Item>

        <Form.Item label="Time range">
          <RangePicker
            value={[dayjs(config.startTime), dayjs(config.endTime)]}
            onChange={(range) => {
              if (range?.[0]) store.export.setStartTime(range[0].valueOf());
              if (range?.[1]) store.export.setEndTime(range[1].valueOf());
            }}
          />
        </Form.Item>
      </Form>
    </Modal>
  );
}
