import type { ComponentProps } from "react";
import { cn } from "@/lib/cn";

type IconButtonProps = Omit<ComponentProps<"button">, "aria-label"> & {
  /** Required: icon-only buttons have no visible text. */
  "aria-label": string;
};

export function IconButton({
  type = "button",
  className,
  children,
  ...buttonProps
}: IconButtonProps) {
  return (
    <button
      type={type}
      className={cn(
        "inline-flex size-10 shrink-0 items-center justify-center rounded-lg text-zinc-600 transition-colors",
        "hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-900 dark:hover:text-zinc-100",
        "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600",
        className,
      )}
      {...buttonProps}
    >
      {children}
    </button>
  );
}
