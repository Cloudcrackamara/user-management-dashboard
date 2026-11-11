export function Brand() {
  return (
    <div className="flex items-center gap-2.5">
      <span
        aria-hidden="true"
        className="flex size-8 items-center justify-center rounded-lg bg-indigo-600 text-sm font-semibold text-white"
      >
        U
      </span>
      <span className="text-sm font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
        User Dashboard
      </span>
    </div>
  );
}
