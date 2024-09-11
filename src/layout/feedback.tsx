import styled from "styled-components";
import { useStore } from "../store";
import { useActive } from "active-store";
import { Popover, Input, Button } from "antd";
import { useEffect, useRef } from "react";
import type { InputRef } from "antd";

export default function Feedback() {
  return (
    <Popover destroyTooltipOnHide content={<FeedbackForm />} trigger={"click"}>
      <HeaderButton>Feedback</HeaderButton>
    </Popover>
  );
}

function FeedbackForm() {
  const store = useStore();
  const user = useActive(store.user.get);
  const status = useActive(store.feedback.status.get);
  const content = useActive(store.feedback.content.get);
  const inputRef = useRef<InputRef>(null);

  useEffect(() => {
    inputRef.current?.focus({ cursor: "end" });
  }, []);

  if (status === "success") {
    return (
      <FeedbackPopup>
        <FeedbackResult>We have received your feedback and will contact you shortly. Thank you!</FeedbackResult>
        <Button type="primary" onClick={store.feedback.ackSuccess}>
          OK
        </Button>
      </FeedbackPopup>
    );
  } else if (status === "error") {
    return (
      <FeedbackPopup>
        <FeedbackResult>There was an error while sending your feedback. Please try again.</FeedbackResult>
        <Button type="primary" danger onClick={store.feedback.ackError}>
          OK
        </Button>
      </FeedbackPopup>
    );
  } else {
    return (
      <FeedbackPopup>
        <Input.TextArea
          ref={inputRef}
          disabled={status === "sending"}
          placeholder="Please provide your feedback here"
          value={content}
          onChange={(e) => store.feedback.content.set(e.target.value)}
        />
        <Input readOnly value={user?.email} />
        <Button type="primary" disabled={!content?.trim()} onClick={store.feedback.send} loading={status === "sending"}>
          Send
        </Button>
      </FeedbackPopup>
    );
  }
}

export const HeaderButton = styled.button`
  background: rgba(255, 255, 255, 0.05);

  color: white;
  padding: 7px 15px;
  margin: 0;
  border-radius: 5px;
  border: 1px solid #666;
  cursor: pointer;
  transition: background-color 0.3s;

  &:hover {
    background: rgba(255, 255, 255, 0.2);
  }
`;

const FeedbackPopup = styled.div`
  width: 300px;
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

const FeedbackResult = styled.div`
  font-size: 14px;
  margin: 10px 0 0 0;
  text-align: center;
`;
