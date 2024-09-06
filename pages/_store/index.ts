import { activeApiQueries } from "./trpc";
import activeExportState from "./export";
import activePlannerState from "./planner";

function createAppStore() {
  const api = activeApiQueries();

  return {
    planner: activePlannerState(api),
    export: activeExportState(api.userCalendars),

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
