import { Spinner } from "./spinner";

type PageLoaderProps = {
  label?: string;
};

/** Full-height loading state for whole-page transitions. */
export function PageLoader({ label = "Loading" }: PageLoaderProps) {
  return (
    <div
      role="status"
      className="flex flex-1 items-center justify-center p-6 text-zinc-500 dark:text-zinc-400"
    >
      <Spinner className="size-6" />
      <span className="sr-only">{label}</span>
    </div>
  );
}
