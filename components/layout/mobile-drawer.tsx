"use client";

import {
  useEffect,
  useRef,
  type KeyboardEvent,
  type MouseEvent,
  type ReactNode,
} from "react";
import { IconButton } from "@/components/ui/icon-button";
import { CloseIcon } from "@/components/ui/icons";
import { cn } from "@/lib/cn";

/** Matches Tailwind's `lg` breakpoint, where the desktop sidebar takes over. */
const DESKTOP_MEDIA_QUERY = "(min-width: 64rem)";

type MobileDrawerProps = {
  id: string;
  open: boolean;
  onClose: () => void;
  /** Accessible name for the dialog. */
  label: string;
  /** Rendered next to the close button, e.g. the brand. */
  header?: ReactNode;
  children: ReactNode;
};

/**
 * Slide-out drawer built on a modal <dialog>. The browser provides the focus
 * trap, makes the page behind it inert, and returns focus to the trigger on
 * close.
 */
export function MobileDrawer({
  id,
  open,
  onClose,
  label,
  header,
  children,
}: MobileDrawerProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = dialogRef.current;

    if (!dialog) {
      return;
    }

    if (open && !dialog.open) {
      dialog.showModal();
    } else if (!open && dialog.open) {
      dialog.close();
    }
  }, [open]);

  // The drawer is hidden on desktop. Close it when the viewport grows so a
  // hidden modal cannot leave the page inert.
  useEffect(() => {
    if (!open || typeof window.matchMedia !== "function") {
      return;
    }

    const desktopQuery = window.matchMedia(DESKTOP_MEDIA_QUERY);
    const onChange = (event: MediaQueryListEvent) => {
      if (event.matches) {
        onClose();
      }
    };

    desktopQuery.addEventListener("change", onChange);
    return () => desktopQuery.removeEventListener("change", onChange);
  }, [open, onClose]);

  function handleBackdropClick(event: MouseEvent<HTMLDialogElement>) {
    // The panel fills the dialog, so a click on the dialog itself can only
    // have landed on the backdrop.
    if (event.target === event.currentTarget) {
      onClose();
    }
  }

  function handleKeyDown(event: KeyboardEvent<HTMLDialogElement>) {
    if (event.key === "Escape") {
      onClose();
    }
  }

  return (
    <dialog
      ref={dialogRef}
      id={id}
      aria-label={label}
      onClose={onClose}
      onClick={handleBackdropClick}
      onKeyDown={handleKeyDown}
      className={cn(
        "fixed inset-y-0 right-auto left-0 m-0 h-dvh max-h-none w-72 max-w-[85vw] border-0 p-0",
        "bg-white text-zinc-900 shadow-xl dark:bg-zinc-950 dark:text-zinc-100",
        "-translate-x-full transition-[translate,display,overlay] transition-discrete duration-200 ease-out",
        "open:translate-x-0 motion-reduce:transition-none starting:open:-translate-x-full",
        "backdrop:bg-black/50 lg:hidden",
      )}
    >
      <div className="flex h-full flex-col">
        <div className="flex h-16 shrink-0 items-center justify-between border-b border-zinc-200 pr-3 pl-4 dark:border-zinc-800">
          {header}
          <IconButton aria-label="Close navigation menu" onClick={onClose}>
            <CloseIcon />
          </IconButton>
        </div>
        <div className="flex-1 overflow-y-auto p-3">{children}</div>
      </div>
    </dialog>
  );
}
