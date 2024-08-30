import { google, calendar_v3 } from "googleapis";
import { CalendarProvider } from "./types";
import { getDate, getMonth, getTime, getYear } from "date-fns";

const OAuth2 = google.auth.OAuth2;

export default class GoogleProvider implements CalendarProvider {
  calendarClient: calendar_v3.Calendar;

  constructor(accessToken: string) {
    const auth = new OAuth2(
      process.env.GOOGLE_CLIENT_ID!,
      process.env.GOOGLE_CLIENT_SECRET!
    );
    auth.setCredentials({ access_token: accessToken });
    this.calendarClient = google.calendar({
      version: "v3",
      auth,
    });
  }

  async getCalendars() {
    const result = await this.calendarClient.calendarList.list({
      maxResults: 250,
    });

    if (!result.data.items?.length) {
      throw new Error("Error while getting list of calendars");
    }

    return result.data.items.map((item) => ({
      id: item.id!,
      name: item.summary!,
    }));
  }

  async getEvents(calendarId: string, timeMin: number, timeMax: number) {
    const result = await this.calendarClient.events.list({
      calendarId,
      timeMin: new Date(timeMin).toISOString(),
      timeMax: new Date(timeMax).toISOString(),
      singleEvents: true,
      orderBy: "startTime",
    });

    if (result.status !== 200) {
      throw new Error("Error while getting list of events");
    }

    if (!result.data.items?.length) {
      return [];
    }

    const mapToDate = (time: string) => ({
      year: getYear(time),
      month: getMonth(time),
      day: getDate(time),
    });

    return result.data.items.map((event) => ({
      id: event.id!,
      summary: event.summary!,
      time:
        event.start?.date && event.end?.date
          ? {
              isAllDay: true as const,
              startDate: mapToDate(event.start.date),
              endDate: mapToDate(event.end.date),
            }
          : {
              isAllDay: false as const,
              startTimestamp: getTime(event.start?.dateTime!),
              endTimestamp: getTime(event.end?.dateTime!),
            },
    }));
  }
}
