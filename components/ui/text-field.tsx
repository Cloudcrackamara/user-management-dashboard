import { useId, type ComponentProps } from "react";
import { cn } from "@/lib/cn";

type TextFieldProps = Omit<ComponentProps<"input">, "id"> & {
  label: string;
  /** Inline validation message. Marks the input invalid when set. */
  error?: string;
};

export function TextField({
  label,
  error,
  className,
  ...inputProps
}: TextFieldProps) {
  const id = useId();
  const errorId = `${id}-error`;

  return (
    <div className="flex flex-col gap-1.5">
      <label
        htmlFor={id}
        className="text-sm font-medium text-zinc-900 dark:text-zinc-100"
      >
        {label}
      </label>
      <input
        id={id}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? errorId : undefined}
        className={cn(
          "h-10 rounded-lg border bg-white px-3 text-sm text-zinc-900 placeholder:text-zinc-400",
          "focus-visible:outline-2 focus-visible:outline-offset-1",
          "disabled:cursor-not-allowed disabled:opacity-60",
          "dark:bg-zinc-900 dark:text-zinc-100 dark:placeholder:text-zinc-500",
          error
            ? "border-red-500 focus-visible:outline-red-500"
            : "border-zinc-300 focus-visible:outline-indigo-600 dark:border-zinc-700",
          className,
        )}
        {...inputProps}
      />
      {error ? (
        <p id={errorId} className="text-sm text-red-600 dark:text-red-400">
          {error}
        </p>
      ) : null}
    </div>
  );
}
