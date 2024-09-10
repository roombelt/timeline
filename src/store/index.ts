import { activeApiQueries } from "./trpc";
import activePlannerState from "./planner";
import { createContext, useContext } from "react";
import activeFeedbackState from "./feedback";

function createAppStore() {
  const api = activeApiQueries();

  return {
    planner: activePlannerState(api),
    user: api.user,
    feedback: activeFeedbackState(),
    isAuthorized: api.isAuthorized,

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
const storeContext = createContext<AppStore>(store);

export type AppStore = ReturnType<typeof createAppStore>;

export function useStore() {
  return useContext(storeContext);
}
