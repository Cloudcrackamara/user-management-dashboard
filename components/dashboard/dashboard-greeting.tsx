"use client";

import { useState } from "react";
import { useAuthEmail } from "@/hooks/useAuthEmail";
import { getDisplayName, getGreeting } from "@/lib/greeting";

const dateFormatter = new Intl.DateTimeFormat(undefined, {
  weekday: "long",
  day: "numeric",
  month: "long",
  year: "numeric",
});

type DashboardGreetingProps = {
  /** Id for the heading, so a section can be labelled by it. */
  headingId: string;
};

/** Time-of-day greeting for the signed-in user, with today's date. */
export function DashboardGreeting({ headingId }: DashboardGreetingProps) {
  const name = getDisplayName(useAuthEmail());
  // Read once on mount: the clock is not a render input.
  const [now] = useState(() => new Date());

  return (
    <div className="flex flex-col gap-0.5">
      <h2
        id={headingId}
        className="text-xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50"
      >
        {getGreeting(now)}
        {name ? `, ${name}` : null}
      </h2>
      <p className="text-sm text-zinc-600 dark:text-zinc-400">
        <time dateTime={now.toISOString().slice(0, 10)}>
          {dateFormatter.format(now)}
        </time>
      </p>
    </div>
  );
}
