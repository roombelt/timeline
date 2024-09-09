import { activeApiQueries } from "./trpc";
import activeExportState from "./export";
import activePlannerState from "./planner";
import { activeQuery } from "active-store";
import { trpc } from "../api/trpc/_client";

function createAppStore() {
  const api = activeApiQueries();
  const hasAccessToCalendars = activeQuery(
    () =>
      trpc.calendars.query().then(
        () => true,
        () => false
      ),
    { retryDelay: () => false }
  );

  return {
    planner: activePlannerState(api),
    export: activeExportState(api.userCalendars),
    hasAccessToCalendars,

    userCalendars: {
      ...api.userCalendars,
      getById: (id?: string) => api.userCalendars.get().find((item) => item.id === id),
    },

    showApp(delay = 0) {
      setTimeout(() => document.body.classList.add("app-loaded"), delay);
    },
  };
}

const store = createAppStore();
export default store;
