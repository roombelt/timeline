import { Form, Select, DatePicker, Button, notification } from "antd";

import dayjs from "dayjs";
import localizedFormat from "dayjs/plugin/localizedFormat";

import { useSelector } from "active-store";
import exportState, { availableColumns } from "./state";
import { useLocalStorage } from "react-use";

dayjs.extend(localizedFormat);

const { RangePicker } = DatePicker;

export default function Export() {
  const userCalendars = useSelector(exportState.getCalendars);
  const exportStatus = useSelector(exportState.getExportStatus);

  const [calendars, setCalendars] = useLocalStorage(
    "export-selected-calendars",
    []
  );

  const [columns, setColumns] = useLocalStorage("export-selected-columns", [
    "Summary",
    "Start time",
    "End time",
  ]);

  const [startTimestamp, setStartTimestamp] = useLocalStorage(
    "export-start-time",
    dayjs().startOf("month").valueOf()
  );

  const [endTimestamp, setEndTimestamp] = useLocalStorage(
    "export-end-time",
    dayjs().endOf("month").valueOf()
  );

  async function exportData() {
    await exportState.exportAsExcel(
      calendars ?? [],
      dayjs(startTimestamp).valueOf(),
      dayjs(endTimestamp).valueOf(),
      columns ?? []
    );
    notification.success({ message: "Successfully exported events." });
  }

  return (
    <>
      <Form labelCol={{ span: 4 }} wrapperCol={{ span: 14 }}>
        <Form.Item label="Calendars">
          <Select
            mode="multiple"
            allowClear
            placeholder="Please select"
            value={calendars}
            onChange={setCalendars}
            options={userCalendars.data?.map((item) => ({
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
            value={columns}
            onChange={setColumns}
            options={Object.keys(availableColumns).map((item) => ({
              value: item,
              label: item,
            }))}
            optionFilterProp="label"
          />
        </Form.Item>

        <Form.Item label="Time range">
          <RangePicker
            value={[dayjs(startTimestamp), dayjs(endTimestamp)]}
            onChange={(range) => {
              if (range?.[0]) setStartTimestamp(range[0].valueOf());
              if (range?.[1]) setEndTimestamp(range[1].valueOf());
            }}
          />
        </Form.Item>

        <Form.Item wrapperCol={{ offset: 4, span: 14 }}>
          <Button
            disabled={
              !startTimestamp ||
              !endTimestamp ||
              !calendars?.length ||
              !columns?.length ||
              exportStatus === "loading"
            }
            loading={exportStatus === "loading"}
            type="primary"
            onClick={exportData}
          >
            Export
          </Button>
        </Form.Item>
      </Form>
    </>
  );
}
