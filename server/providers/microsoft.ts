import { Client, ResponseType } from "@microsoft/microsoft-graph-client";
import { AuthorizationCode } from "simple-oauth2";
import dayjs from "dayjs";
import { Calendar, CalendarEvent, CalendarProvider } from "./types";

import { convertToText, getDisplayName } from "./utils";

export default class MicrosoftProvider implements CalendarProvider {
  oauth2: AuthorizationCode;
  client: Client;

  constructor(private accessToken: string, private refreshToken: string) {
    this.oauth2 = new AuthorizationCode({
      client: {
        id: process.env.MICROSOFT_CLIENT_ID!,
        secret: process.env.MICROSOFT_CLIENT_SECRET!,
      },
      auth: {
        tokenHost: "https://login.microsoftonline.com",
        authorizePath: `${process.env.MICROSOFT_TENANT_ID}/oauth2/v2.0/authorize`,
        tokenPath: `${process.env.MICROSOFT_TENANT_ID}/oauth2/v2.0/token`,
      },
    });

    this.client = Client.init({ authProvider: this.getAuthToken });
  }

  async getCalendars(): Promise<Calendar[]> {
    const response = await this.client.api(`/me/calendars?top=100`).get();
    return response.value.map((item: any) => ({
      id: item.id,
      name: item.name,
      color: item.hexColor || autoColor(item.id),
    }));
  }

  async getEvents(calendarId: string, timeMin: number, timeMax: number) {
    const response = await this.client
      .api(`${this.getCalendarPath(calendarId)}/calendarView`)
      .query({
        StartDateTime: new Date(timeMin).toISOString(),
        EndDateTime: new Date(timeMax).toISOString(),
      })
      .header("Prefer", `outlook.timezone="UTC"`)
      .top(100)
      .get();

    return response.value.map((event: any) => mapEvent(calendarId, event));
  }

  async getEvent(calendarId: string, eventId: string): Promise<CalendarEvent> {
    throw new Error("Not implemented");
  }

  async createEvent(
    calendarId: string,
    summary: string,
    description: string,
    startTimestamp: number,
    endTimestamp: number
  ) {
    const response = await this.client.api(`${this.getCalendarPath(calendarId)}/events`).post({
      subject: summary,
      body: {
        contentType: "text",
        content: description,
      },
      start: { timezone: "UTC", dateTime: dayjs(startTimestamp).toISOString() },
      end: { timezone: "UTC", dateTime: dayjs(endTimestamp).toISOString() },
    });

    return mapEvent(calendarId, response);
  }

  async deleteEvent(calendarId: string, eventId: string) {
    await this.client
      .api(`${this.getCalendarPath(calendarId)}/events/${encodeURIComponent(eventId)}`)
      .responseType(ResponseType.RAW)
      .delete();
  }

  getCalendarPath(calendarId: string) {
    return `/me/calendars/${encodeURIComponent(calendarId)}`;
  }

  getAuthToken = async (cb: (error: any, data: string | null) => void) => {
    if (!this.refreshToken) {
      return cb(new Error("Missing refresh token"), null);
    }

    try {
      const authToken = await this.oauth2.createToken({ refresh_token: this.refreshToken }).refresh();
      cb(null, authToken.token.access_token as string);
    } catch (error) {
      cb(error, null);
    }
  };
}

function mapEvent(calendarId: string, event: any): CalendarEvent {
  const mapToDate = (time: string) => ({
    year: dayjs(time).year(),
    month: dayjs(time).month(),
    day: dayjs(time).date(),
  });

  return {
    calendarId,
    id: event.id!,
    summary: event.subject ?? "(No meeting summary)",
    description: convertToText(event.body?.content ?? "") ?? "",
    organizer: event.organizer?.emailAddress ? getDisplayName(event.organizer.emailAddress.name) : "Unknown",
    participants: event.attendees.map(
      (attendee: any) => attendee?.emailAddress && getDisplayName(attendee.emailAddress.name)
    ),
    isAllDay: event.isAllDay,
    start: event.isAllDay ? mapToDate(event.start.dateTime) : dayjs(event.start.dateTime).valueOf(),
    end: event.isAllDay ? mapToDate(event.end.dateTime) : dayjs(event.end.dateTime).valueOf(),
  };
}

const autoColor = (str: string) => {
  let hash = 0;
  str.split("").forEach((char) => {
    hash = char.charCodeAt(0) + ((hash << 5) - hash);
  });
  let colour = "#";
  for (let i = 0; i < 3; i++) {
    const value = (hash >> (i * 8)) & 0xff;
    colour += value.toString(16).padStart(2, "0");
  }
  return colour;
};
