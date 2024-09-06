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
  };
}

const store = createAppStore();
export default store;
