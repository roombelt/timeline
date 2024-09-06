export interface CalendarProvider {
  getCalendars: () => Promise<Calendar[]>;
  getEvents: (calendarId: string, timeMin: number, timeMax: number) => Promise<CalendarEvent[]>;
  createEvent: (
    calendarId: string,
    summary: string,
    description: string,
    startTimestamp: number,
    endTimestamp: number
  ) => Promise<CalendarEvent>;
  deleteEvent: (calendarId: string, eventId: string) => Promise<void>;
}

export interface Calendar {
  id: string;
  name: string;
  color: string;
}

export interface CalendarEvent {
  calendarId: string;
  id: string;
  summary: string;
  organizer: string;
  participants: string[];
  description: string;
  start: number | { year: number; month: number; day: number };
  end: number | { year: number; month: number; day: number };
  isAllDay: boolean;
}
