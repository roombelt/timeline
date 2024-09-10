import React, { useState } from "react";
import { Button, Popconfirm, Tooltip } from "antd";
import { useActive } from "active-store";
import styled from "styled-components";

import { DeleteOutlined, LoadingOutlined, LockOutlined, ReloadOutlined } from "@ant-design/icons";
import type { ResourceLabelContentArg } from "@fullcalendar/resource";
import { useStore } from "@/src/store";

export default function RowLabel({ resource }: { resource: ResourceLabelContentArg["resource"] }) {
  const store = useStore();

  const isLoading = useActive(() => store.planner.visibleEvents.isLoading.get(resource.id));
  const calendar = useActive(() => store.planner.calendars.get(resource.id));

  const [isConfirmOpen, setConfirmOpen] = useState(false);
  return (
    <RowLabelWrapper>
      <span className="resource-label">
        {calendar?.readonly && (
          <Tooltip placement="topRight" title="This calendar is read-only">
            <LockOutlined style={{ color: "#aa0000", marginRight: 5 }} />
          </Tooltip>
        )}
        {resource.title}
      </span>
      <div className="resource-label-actions">
        <Popconfirm
          title="Delete the calendar"
          description="Are you sure to delete this calendar from the list?"
          onConfirm={() => store.planner.visibleCalendars.remove(resource.id)}
          onOpenChange={(state) => setConfirmOpen(state)}
          okText="Yes"
          cancelText="No"
          placement="bottom"
        >
          <Button size="small" type="text" className={isConfirmOpen ? "force-visible" : ""}>
            <DeleteOutlined />
          </Button>
        </Popconfirm>
        <Button
          size="small"
          type="text"
          className={isConfirmOpen || isLoading ? "force-visible" : ""}
          onClick={() => !isLoading && store.planner.visibleEvents.refreshEvents(resource.id)}
        >
          {isLoading ? <LoadingOutlined /> : <ReloadOutlined />}
        </Button>
      </div>
    </RowLabelWrapper>
  );
}

const RowLabelWrapper = styled.div`
  display: grid;
  height: 25px;
  align-items: center;
  grid-template-columns: 1fr auto;

  .resource-label {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .resource-label-actions {
    display: flex;
    white-space: nowrap;
  }

  button {
    display: none;
  }

  &:hover button {
    display: block;
  }

  .force-visible {
    display: block;
  }
`;
