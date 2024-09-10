import { activeComputed, ActiveState } from "active-store";
import { activeLocalStorage } from "../utils";
import { ActiveApiQueries } from "../trpc";

export default function activeWelcomeDialog(
  api: ActiveApiQueries,
  selectedCalendars: { get: () => string[]; set: (value: string[]) => void }
) {
  const userSawWelcomeDialog = activeLocalStorage(
    activeComputed(() => `${api.user.get()?.id}.user-saw-welcome-dialog`),
    false
  );

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
