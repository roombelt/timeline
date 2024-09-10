import { activeState } from "active-store";
import { trpc } from "@/pages/api/trpc/_client";

export default function activeFeedbackState() {
  const content = activeState("");
  const status = activeState<"idle" | "sending" | "error" | "success">("idle");

  return {
    status: { get: status.get },
    content,
    ackSuccess() {
      status.set("idle");
      content.set("");
    },
    ackError() {
      status.set("idle");
    },
    async send() {
      try {
        status.set("sending");
        await Promise.all([
          await trpc.sendFeedback.mutate({ message: content.get() }),
          new Promise((resolve) => setTimeout(resolve, 2000)),
        ]);
        status.set("success");
        content.set("");
      } catch (error) {
        console.error(error);
        status.set("error");
      }
    },
  };
}
