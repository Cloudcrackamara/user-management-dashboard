import { act, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import HomePage from "@/app/page";
import { AUTH_TOKEN_KEY, logout } from "@/lib/auth";
import { AuthGuard } from "./auth-guard";
import { GuestGuard } from "./guest-guard";

const router = vi.hoisted(() => ({ replace: vi.fn() }));

vi.mock("next/navigation", () => ({
  useRouter: () => router,
}));

function signIn() {
  window.localStorage.setItem(AUTH_TOKEN_KEY, "mock-token-test");
}

beforeEach(() => {
  router.replace.mockReset();
});

afterEach(() => {
  window.localStorage.clear();
});

describe("AuthGuard", () => {
  it("renders children for a signed-in visitor", () => {
    signIn();
    render(<AuthGuard>Private content</AuthGuard>);

    expect(screen.getByText("Private content")).toBeVisible();
    expect(router.replace).not.toHaveBeenCalled();
  });

  it("redirects a signed-out visitor to /login without rendering children", () => {
    render(<AuthGuard>Private content</AuthGuard>);

    expect(screen.queryByText("Private content")).not.toBeInTheDocument();
    expect(screen.getByRole("status")).toBeInTheDocument();
    expect(router.replace).toHaveBeenCalledWith("/login");
  });

  it("redirects when the visitor signs out", () => {
    signIn();
    render(<AuthGuard>Private content</AuthGuard>);

    act(() => logout());

    expect(screen.queryByText("Private content")).not.toBeInTheDocument();
    expect(router.replace).toHaveBeenCalledWith("/login");
  });
});

describe("GuestGuard", () => {
  it("renders children for a signed-out visitor", () => {
    render(<GuestGuard>Login form</GuestGuard>);

    expect(screen.getByText("Login form")).toBeVisible();
    expect(router.replace).not.toHaveBeenCalled();
  });

  it("redirects a signed-in visitor to /dashboard", () => {
    signIn();
    render(<GuestGuard>Login form</GuestGuard>);

    expect(screen.queryByText("Login form")).not.toBeInTheDocument();
    expect(router.replace).toHaveBeenCalledWith("/dashboard");
  });
});

describe("HomePage", () => {
  it("redirects a signed-out visitor to /login", () => {
    render(<HomePage />);

    expect(router.replace).toHaveBeenCalledWith("/login");
  });

  it("redirects a signed-in visitor to /dashboard", () => {
    signIn();
    render(<HomePage />);

    expect(router.replace).toHaveBeenCalledWith("/dashboard");
  });
});
