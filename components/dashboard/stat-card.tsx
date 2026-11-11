import type { ComponentType } from "react";
import { Card } from "@/components/ui/card";
import type { IconProps } from "@/components/ui/icons";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/cn";

export type StatCardTone = "indigo" | "emerald" | "amber" | "sky";

type StatCardProps = {
  label: string;
  value: number;
  /** Short muted line under the value, e.g. "70% of total". */
  description?: string;
  icon: ComponentType<IconProps>;
  tone?: StatCardTone;
};

const TONE_CLASSES: Record<StatCardTone, string> = {
  indigo:
    "bg-indigo-50 text-indigo-600 dark:bg-indigo-950 dark:text-indigo-300",
  emerald:
    "bg-emerald-50 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-300",
  amber: "bg-amber-50 text-amber-600 dark:bg-amber-950 dark:text-amber-300",
  sky: "bg-sky-50 text-sky-600 dark:bg-sky-950 dark:text-sky-300",
};

const numberFormatter = new Intl.NumberFormat();

/**
 * One labelled figure. Renders a term/description group, so place it
 * inside a <dl>.
 */
export function StatCard({
  label,
  value,
  description,
  icon: Icon,
  tone = "indigo",
}: StatCardProps) {
  return (
    <Card
      className={cn(
        "flex items-start justify-between gap-4 transition duration-200 ease-out",
        "hover:-translate-y-0.5 hover:shadow-md",
        "motion-reduce:transition-none motion-reduce:hover:translate-y-0",
      )}
    >
      <div className="flex min-w-0 flex-col gap-1">
        <dt className="truncate text-sm font-medium text-zinc-600 dark:text-zinc-400">
          {label}
        </dt>
        <dd className="text-3xl font-semibold tracking-tight text-zinc-900 tabular-nums dark:text-zinc-50">
          {numberFormatter.format(value)}
        </dd>
        {description ? (
          <dd className="truncate text-xs text-zinc-500 dark:text-zinc-400">
            {description}
          </dd>
        ) : null}
      </div>
      <span
        className={cn(
          "flex size-11 shrink-0 items-center justify-center rounded-xl",
          TONE_CLASSES[tone],
        )}
      >
        <Icon className="size-5.5" />
      </span>
    </Card>
  );
}

/** Placeholder with the same footprint as StatCard, to avoid layout shift. */
export function StatCardSkeleton() {
  return (
    <Card className="flex items-start justify-between gap-4">
      <div className="flex flex-col gap-1">
        <Skeleton className="my-0.5 h-4 w-24" />
        <Skeleton className="my-1 h-7 w-12" />
        <Skeleton className="my-0.5 h-3 w-20" />
      </div>
      <Skeleton className="size-11 rounded-xl" />
    </Card>
  );
}
