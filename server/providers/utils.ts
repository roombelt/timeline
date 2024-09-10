import { htmlToText } from "html-to-text";

// @ts-ignore
import emailToName from "email-to-name";

export function convertToText(html: string) {
  try {
    return htmlToText(html)?.trim();
  } catch (e) {
    console.error("Unable to convert HTML to text");
    return null;
  }
}

export function getDisplayName(emailOrName: string) {
  try {
    return emailToName.process(emailOrName || "");
  } catch {
    console.log("[INFO] Failed attempt to get display name from email: " + emailOrName);
    return emailOrName || "";
  }
}
