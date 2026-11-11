import { useId, type ComponentProps } from "react";
import { cn } from "@/lib/cn";

export type SelectOption = {
  value: string;
  label: string;
};

type SelectFieldProps = Omit<ComponentProps<"select">, "id" | "children"> & {
  label: string;
  options: readonly SelectOption[];
};

export function SelectField({
  label,
  options,
  className,
  ...selectProps
}: SelectFieldProps) {
  const id = useId();

  return (
    <div className="flex flex-col gap-1.5">
      <label
        htmlFor={id}
        className="text-sm font-medium text-zinc-900 dark:text-zinc-100"
      >
        {label}
      </label>
      <select
        id={id}
        className={cn(
          "h-10 rounded-lg border border-zinc-300 bg-white px-3 text-sm text-zinc-900",
          "focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-indigo-600",
          "disabled:cursor-not-allowed disabled:opacity-60",
          "dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100",
          className,
        )}
        {...selectProps}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
}
