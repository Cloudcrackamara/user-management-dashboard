import { screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { ComponentProps } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { AUTH_TOKEN_KEY } from "@/lib/auth";
import { renderWithQuery } from "@/lib/test/render-with-query";
import { DashboardShell } from "./dashboard-shell";
import { getPageTitle, isNavItemActive } from "./nav-items";

const navigation = vi.hoisted(() => ({
  pathname: "/dashboard",
  router: { replace: vi.fn() },
}));

vi.mock("next/navigation", () => ({
  usePathname: () => navigation.pathname,
  useRouter: () => navigation.router,
}));

// A plain anchor that does not navigate: jsdom cannot load another document.
vi.mock("next/link", () => ({
  default: ({ onClick, children, ...anchorProps }: ComponentProps<"a">) => (
    <a
      {...anchorProps}
      onClick={(event) => {
        event.preventDefault();
        onClick?.(event);
      }}
    >
      {children}
    </a>
  ),
}));

// The header's status indicator starts the users query; keep it pending.
vi.mock("@/lib/api/users", () => ({
  fetchUsers: () => new Promise(() => {}),
}));

function renderShell(pathname = "/dashboard") {
  navigation.pathname = pathname;
  renderWithQuery(<DashboardShell>Page content</DashboardShell>);
  return userEvent.setup();
}

async function openDrawer(user: ReturnType<typeof userEvent.setup>) {
  await user.click(
    screen.getByRole("button", { name: "Open navigation menu" }),
  );
  return screen.getByRole("dialog", { name: "Navigation menu" });
}

beforeEach(() => {
  navigation.router.replace.mockReset();
});

afterEach(() => {
  window.localStorage.clear();
});

describe("nav helpers", () => {
  it("matches the dashboard root exactly and other items by prefix", () => {
    expect(isNavItemActive("/dashboard", "/dashboard")).toBe(true);
    expect(isNavItemActive("/dashboard", "/dashboard/users")).toBe(false);
    expect(isNavItemActive("/dashboard/users", "/dashboard/users/7")).toBe(
      true,
    );
    expect(isNavItemActive("/dashboard/users", "/dashboard/users-x")).toBe(
      false,
    );
  });

  it("derives the page title from the pathname", () => {
    expect(getPageTitle("/dashboard")).toBe("Dashboard");
    expect(getPageTitle("/dashboard/users")).toBe("Users");
    expect(getPageTitle("/dashboard/settings")).toBe("Settings");
  });
});

describe("DashboardShell", () => {
  it("renders the page title, content, and all nav links", () => {
    renderShell("/dashboard/users");

    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent(
      "Users",
    );
    expect(screen.getByRole("main")).toHaveTextContent("Page content");

    const nav = screen.getByRole("navigation", { name: "Main" });
    expect(
      within(nav)
        .getAllByRole("link")
        .map((link) => [link.textContent, link.getAttribute("href")]),
    ).toEqual([
      ["Dashboard", "/dashboard"],
      ["Users", "/dashboard/users"],
      ["Settings", "/dashboard/settings"],
    ]);
  });

  it("marks only the active link as the current page", () => {
    renderShell("/dashboard/users");

    const nav = screen.getByRole("navigation", { name: "Main" });
    expect(within(nav).getByRole("link", { name: "Users" })).toHaveAttribute(
      "aria-current",
      "page",
    );
    expect(
      within(nav).getByRole("link", { name: "Dashboard" }),
    ).not.toHaveAttribute("aria-current");
  });

  it("opens the drawer from the menu button and moves focus into it", async () => {
    const user = renderShell();
    const menuButton = screen.getByRole("button", {
      name: "Open navigation menu",
    });

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(menuButton).toHaveAttribute("aria-expanded", "false");

    const drawer = await openDrawer(user);

    expect(menuButton).toHaveAttribute("aria-expanded", "true");
    expect(drawer).toContainElement(document.activeElement as HTMLElement);
    expect(within(drawer).getAllByRole("link")).toHaveLength(3);
  });

  it("closes the drawer on Escape", async () => {
    const user = renderShell();
    await openDrawer(user);

    await user.keyboard("{Escape}");

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("closes the drawer when a link is clicked", async () => {
    const user = renderShell();
    const drawer = await openDrawer(user);

    await user.click(within(drawer).getByRole("link", { name: "Users" }));

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("closes the drawer from its close button", async () => {
    const user = renderShell();
    const drawer = await openDrawer(user);

    await user.click(
      within(drawer).getByRole("button", { name: "Close navigation menu" }),
    );

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("toggles the account menu and closes it on Escape", async () => {
    const user = renderShell();
    const menuButton = screen.getByRole("button", { name: "Account menu" });

    expect(
      screen.queryByRole("button", { name: "Sign out" }),
    ).not.toBeInTheDocument();

    await user.click(menuButton);
    expect(menuButton).toHaveAttribute("aria-expanded", "true");
    expect(screen.getByRole("button", { name: "Sign out" })).toBeVisible();

    await user.keyboard("{Escape}");
    expect(menuButton).toHaveAttribute("aria-expanded", "false");
    expect(menuButton).toHaveFocus();
  });

  it("closes the account menu on an outside click", async () => {
    const user = renderShell();
    const menuButton = screen.getByRole("button", { name: "Account menu" });

    await user.click(menuButton);
    await user.click(screen.getByRole("main"));

    expect(menuButton).toHaveAttribute("aria-expanded", "false");
  });

  it("logs out from the account menu and redirects to /login", async () => {
    window.localStorage.setItem(AUTH_TOKEN_KEY, "mock-token-test");
    const user = renderShell();

    await user.click(screen.getByRole("button", { name: "Account menu" }));
    await user.click(screen.getByRole("button", { name: "Sign out" }));

    expect(window.localStorage.getItem(AUTH_TOKEN_KEY)).toBeNull();
    expect(navigation.router.replace).toHaveBeenCalledWith("/login");
  });
});
