import "@testing-library/jest-dom/vitest";
import { cleanup } from "@testing-library/react";
import { afterEach } from "vitest";

afterEach(() => {
  cleanup();
});

/**
 * jsdom does not implement modal dialogs. This covers what the app relies
 * on: the `open` attribute, initial focus, and the `close` event. The real
 * focus trap and inert background are browser behaviour and not simulated.
 */
if (typeof HTMLDialogElement.prototype.showModal !== "function") {
  HTMLDialogElement.prototype.showModal = function showModal(
    this: HTMLDialogElement,
  ) {
    this.setAttribute("open", "");
    this.querySelector<HTMLElement>("button, [href], input")?.focus();
  };

  HTMLDialogElement.prototype.close = function close(this: HTMLDialogElement) {
    if (!this.hasAttribute("open")) {
      return;
    }

    this.removeAttribute("open");
    this.dispatchEvent(new Event("close"));
  };
}
