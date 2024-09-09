import { activeComputed, ActiveState } from "active-store";
import { activeLocalStorage } from "../utils";

export default function activeWelcomeDialog(selectedCalendars: ActiveState<string[]>) {
  const userSawWelcomeDialog = activeLocalStorage("user-saw-welcome-dialog", false);

  const isVisible = activeComputed(() => {
    return selectedCalendars.get().length === 0 && !userSawWelcomeDialog.get();
  });

  return {
    getVisible: isVisible.get,
    submit(calendarIds: string[]) {
      if (!calendarIds.length) {
        return;
      }

      userSawWelcomeDialog.set(true);
      selectedCalendars.set(calendarIds);
    },
  };
}
