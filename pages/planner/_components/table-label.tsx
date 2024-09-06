import React, { useState, useCallback } from "react";
import { Button, DatePicker } from "antd";
import { useActive } from "active-store";
import { useResizeDetector } from "react-resize-detector";
import dayjs from "dayjs";
import styled from "styled-components";
import type { CalendarApi } from "@fullcalendar/core";

import {
  CaretLeftOutlined,
  CaretRightOutlined,
  LoadingOutlined,
  PlusOutlined,
  ReloadOutlined,
} from "@ant-design/icons";
import type { ColHeaderContentArg } from "@fullcalendar/resource";

import store from "@/pages/_store";

type TableLabelProps = {
  openConfig: () => void;
  view: ColHeaderContentArg["view"];
  getCalendarApi: () => CalendarApi;
};

export default function TableLabel({ openConfig, getCalendarApi }: TableLabelProps) {
  const [isLoading, setLoading] = useState(false);
  const time = useActive(store.planner.timeRange.get);

  const { ref } = useResizeDetector({
    handleHeight: false,
    refreshMode: "debounce",
    onResize: saveResourceAreaWidth,
  });

  async function refreshAllCalendars() {
    if (isLoading) {
      return;
    }

    setLoading(true);
    await store.planner.visibleEvents.refreshEvents().catch(() => null);
    setLoading(false);
  }

  return (
    <TableLabelWrapper ref={ref}>
      <div style={{ display: "flex", alignItems: "center" }}>
        <Button size="small" type="text" onClick={() => getCalendarApi().prev()}>
          <CaretLeftOutlined />
        </Button>
        <DatePicker
          value={dayjs(time.start)}
          allowClear={false}
          suffixIcon={null}
          onChange={(value) => getCalendarApi().gotoDate(value.valueOf())}
        />
        <Button size="small" type="text" onClick={() => getCalendarApi().next()}>
          <CaretRightOutlined />
        </Button>
      </div>
      <div>
        <Button size="small" type="text" onClick={openConfig}>
          <PlusOutlined />
        </Button>
        <Button size="small" type="text" onClick={refreshAllCalendars}>
          {isLoading ? <LoadingOutlined /> : <ReloadOutlined />}
        </Button>
      </div>
    </TableLabelWrapper>
  );
}

export const TABLE_LABEL_ELEMENT_CLASS = "planner-resources-header";

function saveResourceAreaWidth() {
  const el = document.querySelector(`.${TABLE_LABEL_ELEMENT_CLASS}`);
  if (el) {
    // +1 due to a border on a parent element
    store.planner.resourceAreaWidth.set(el.clientWidth + 1);
  }
}

const TableLabelWrapper = styled.div`
  width: 100%;
  display: grid;
  align-items: center;
  text-align: left;
  grid-template-columns: 1fr auto;
`;
