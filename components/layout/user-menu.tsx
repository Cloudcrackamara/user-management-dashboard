"use client";

import { useEffect, useId, useRef, useState } from "react";
import { SignOutButton } from "@/components/auth/sign-out-button";
import { ChevronDownIcon } from "@/components/ui/icons";
import { cn } from "@/lib/cn";

/** Mock auth stores no profile, so the menu shows a fixed demo account. */
const DEMO_USER = {
  name: "Demo Admin",
  role: "Administrator",
  initials: "DA",
} as const;

/**
 * Disclosure-style account menu: a toggle button plus a panel. Closes on
 * Escape, on an outside click, and when focus moves out of it.
 */
export function UserMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const panelId = useId();

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const isOutside = (target: EventTarget | null) =>
      target instanceof Node && !containerRef.current?.contains(target);

    const onPointerDown = (event: PointerEvent) => {
      if (isOutside(event.target)) {
        setIsOpen(false);
      }
    };

    const onFocusIn = (event: FocusEvent) => {
      if (isOutside(event.target)) {
        setIsOpen(false);
      }
    };

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsOpen(false);
        buttonRef.current?.focus();
      }
    };

    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("focusin", onFocusIn);
    document.addEventListener("keydown", onKeyDown);

    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("focusin", onFocusIn);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [isOpen]);

  return (
    <div ref={containerRef} className="relative">
      <button
        ref={buttonRef}
        type="button"
        aria-expanded={isOpen}
        aria-controls={panelId}
        aria-label="Account menu"
        onClick={() => setIsOpen((current) => !current)}
        className={cn(
          "flex items-center gap-1.5 rounded-full p-1 pr-2 text-zinc-600 transition-colors",
          "hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-900",
          "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600",
        )}
      >
        <span
          aria-hidden="true"
          className="flex size-8 items-center justify-center rounded-full bg-zinc-900 text-xs font-semibold text-white dark:bg-zinc-100 dark:text-zinc-900"
        >
          {DEMO_USER.initials}
        </span>
        <ChevronDownIcon
          className={cn("size-4 transition-transform", isOpen && "rotate-180")}
        />
      </button>

      <div
        id={panelId}
        hidden={!isOpen}
        className="absolute top-full right-0 z-20 mt-2 w-56 rounded-xl border border-zinc-200 bg-white p-2 shadow-lg dark:border-zinc-800 dark:bg-zinc-950"
      >
        <div className="px-2 py-1.5">
          <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
            {DEMO_USER.name}
          </p>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            {DEMO_USER.role}
          </p>
        </div>
        <div className="mt-1 border-t border-zinc-200 pt-2 dark:border-zinc-800">
          <SignOutButton className="w-full" />
        </div>
      </div>
    </div>
  );
}
