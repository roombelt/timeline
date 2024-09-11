import { Button, Modal } from "antd";
import { useActive } from "active-store";
import Image from "next/image";
import { useStore } from "@/src/store";
import welcome from "./welcome.svg";

export default function WelcomeDialog() {
  const store = useStore();
  const isVisible = useActive(store.planner.welcomeDialog.isVisible);

  const aspectRatio = 640.72612 / 896.2676;
  const width = 200;
  return (
    <Modal
      title="Great to see you!"
      closable={false}
      open={isVisible}
      footer={<Button type="primary" children="OK" onClick={store.planner.welcomeDialog.hide} />}
    >
      <Image
        width={width}
        height={width * aspectRatio}
        src={welcome}
        alt="Welcome banner"
        style={{ margin: "20px auto", display: "block" }}
      />
      <p>This free tool that gives you an overview of your calendars and meeting rooms on a beautiful timeline view.</p>
      <p>
        Please use the <em>Feedback</em> button in the upper right to contact the author of the app.
      </p>
    </Modal>
  );
}
