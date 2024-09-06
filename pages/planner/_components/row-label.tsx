import React, { useState } from "react";
import { Button, Popconfirm } from "antd";
import { useActive } from "active-store";
import styled from "styled-components";

import { DeleteOutlined, LoadingOutlined, ReloadOutlined } from "@ant-design/icons";
import type { ResourceLabelContentArg } from "@fullcalendar/resource";

import store from "@/pages/_store";

export default function RowLabel({ resource }: { resource: ResourceLabelContentArg["resource"] }) {
  const isLoading = useActive(() => store.planner.visibleEvents.isLoading.get(resource.id));
  const [isConfirmOpen, setConfirmOpen] = useState(false);
  return (
    <RowLabelWrapper>
      <span className="resource-label">{resource.title}</span>
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
