export interface CalendarProvider {
  getCalendars: () => Promise<Calendar[]>;
  getEvents: (
    calendarId: string,
    timeMin: number,
    timeMax: number
  ) => Promise<Event[]>;
}

export interface Calendar {
  id: string;
  name: string;
}

export interface Event {
  id: string;
  summary: string;
  time:
    | {
        isAllDay: true;
        startDate: { year: number; month: number; day: number };
        endDate: { year: number; month: number; day: number };
      }
    | {
        isAllDay: false;
        startTimestamp: number;
        endTimestamp: number;
      };
}
