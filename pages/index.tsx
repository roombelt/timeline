import Head from "next/head";
import LoginButton from "@/components/login";

import { trpc } from "../utils/trpc";
import type { Calendar } from "@/server/providers/types";
import { useState } from "react";

export default function Home() {
  const calendars = trpc.calendars.useQuery();
  return (
    <>
      <Head>
        <title>Roombelt calendar utils</title>
        <meta name="description" content="Various utilities for calendar" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main>
        <LoginButton />

        <div>Your calendars:</div>

        <ol>
          {calendars.data?.map((item) => (
            <CalendarItem key={item.id} calendar={item} />
          ))}
        </ol>
      </main>
    </>
  );
}

function CalendarItem({ calendar }: { calendar: Calendar }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <li key={calendar.id}>
      {calendar.name}{" "}
      <button onClick={() => setExpanded(!expanded)}>
        {expanded ? "-" : "+"}
      </button>
      {expanded && <CalendarEvents id={calendar.id} />}
    </li>
  );
}

function CalendarEvents({ id }: { id: string }) {
  const events = trpc.events.useQuery(id);

  if (events.isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      {events.data?.map((event) => (
        <div key={event.id}>{event.summary}</div>
      ))}
    </div>
  );
}
