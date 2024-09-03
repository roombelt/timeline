import { useState } from "react";
import { Select, DatePicker, Button } from "antd";

import { useSelector } from "active-store";
import exportState, { availableColumns } from "./state";
import { useLocalStorage } from "react-use";

const { RangePicker } = DatePicker;

type RangePickerValue = Parameters<typeof RangePicker>[0]["value"];

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

  const [dates, setDates] = useState<RangePickerValue>([null, null]);

  const startTime = dates?.[0];
  const endTime = dates?.[1];

  function exportData() {
    exportState.exportAsExcel(
      calendars ?? [],
      startTime!.valueOf(),
      endTime!.valueOf(),
      columns ?? []
    );
  }

  return (
    <>
      <main>
        <div>Select calendars to export:</div>
        <Select
          mode="multiple"
          allowClear
          style={{ width: "100%" }}
          placeholder="Please select"
          value={calendars}
          onChange={setCalendars}
          options={userCalendars.data?.map((item) => ({
            value: item.id,
            label: item.name,
          }))}
          optionFilterProp="label"
        />

        <div>Select time range</div>
        <RangePicker value={dates} onChange={setDates} />

        <div>Select columns to export:</div>
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

        <Button
          disabled={
            !startTime ||
            !endTime ||
            !calendars?.length ||
            !columns?.length ||
            exportStatus === "loading"
          }
          type="primary"
          onClick={exportData}
        >
          Export
        </Button>

        {exportStatus === "loading" && <div>Loading data...</div>}
        {exportStatus === "error" && <div>Error while loading data</div>}
        {exportStatus === "success" && <div>Successfully fetched events</div>}
      </main>
    </>
  );
}
