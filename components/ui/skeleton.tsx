import { cn } from "@/lib/cn";

type SkeletonProps = {
  /** Sets the size and shape, e.g. "h-4 w-24". */
  className?: string;
};

/** Decorative loading block. Announce the loading state on a parent. */
export function Skeleton({ className }: SkeletonProps) {
  return (
    <div
      aria-hidden="true"
      className={cn(
        "animate-pulse rounded-md bg-zinc-200 motion-reduce:animate-none dark:bg-zinc-800",
        className,
      )}
    />
  );
}
