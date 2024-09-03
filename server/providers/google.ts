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
    const getPage = (pageToken?: string) =>
      this.calendarClient.events.list({
        calendarId,
        pageToken,
        timeMin: new Date(timeMin).toISOString(),
        timeMax: new Date(timeMax).toISOString(),
        singleEvents: true,
        orderBy: "startTime",
      });

    const items = [];

    for (let result = await getPage(undefined); ; ) {
      if (result.status !== 200) {
        throw new Error("Error while getting list of events");
      }

      if (result.data.items?.length) {
        items.push(...result.data.items);
      }

      if (!result.data.nextPageToken) {
        break;
      }

      result = await getPage(result.data.nextPageToken);
    }

    const mapToDate = (time: string) => ({
      year: getYear(time),
      month: getMonth(time),
      day: getDate(time),
    });

    return items.map((event) => ({
      calendarId,
      id: event.id!,
      summary: event.summary ?? "(No meeting summary)",
      description: event.description ?? "",
      organizer:
        event.organizer?.displayName ?? event.organizer?.email ?? "Unknown",
      participants:
        (event.attendees
          ?.map((attendee) => attendee?.displayName ?? attendee?.email)
          .filter(Boolean) as string[]) ?? [],

      isAllDay: !!event.start?.date && !!event.end?.date,
      start: event.start?.date
        ? mapToDate(event.start.date)
        : getTime(event.start?.dateTime!),
      end: event.end?.date
        ? mapToDate(event.end.date)
        : getTime(event.end?.dateTime!),
    }));
  }
}
