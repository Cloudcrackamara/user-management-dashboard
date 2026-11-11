import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { login } from "@/lib/auth";
import { LoginForm } from "./login-form";

const router = vi.hoisted(() => ({ replace: vi.fn() }));

vi.mock("next/navigation", () => ({
  useRouter: () => router,
}));

vi.mock("@/lib/auth", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@/lib/auth")>()),
  login: vi.fn(),
}));

const loginMock = vi.mocked(login);

async function fillAndSubmit(email: string, password: string) {
  const user = userEvent.setup();

  if (email) {
    await user.type(screen.getByLabelText("Email"), email);
  }
  if (password) {
    await user.type(screen.getByLabelText("Password"), password);
  }
  await user.click(screen.getByRole("button", { name: "Sign in" }));

  return user;
}

beforeEach(() => {
  router.replace.mockReset();
  loginMock.mockReset();
  loginMock.mockResolvedValue(undefined);
});

describe("LoginForm", () => {
  it("shows inline errors and focuses the first invalid field", async () => {
    render(<LoginForm />);

    await fillAndSubmit("", "");

    const email = screen.getByLabelText("Email");
    expect(email).toBeInvalid();
    expect(email).toHaveAccessibleDescription("Email is required.");
    expect(email).toHaveFocus();
    expect(screen.getByLabelText("Password")).toHaveAccessibleDescription(
      "Password is required.",
    );
    expect(loginMock).not.toHaveBeenCalled();
  });

  it("rejects an invalid email", async () => {
    render(<LoginForm />);

    await fillAndSubmit("not-an-email", "secret");

    expect(screen.getByLabelText("Email")).toHaveAccessibleDescription(
      "Enter a valid email address.",
    );
    expect(screen.getByLabelText("Password")).not.toHaveAttribute(
      "aria-invalid",
    );
    expect(loginMock).not.toHaveBeenCalled();
    expect(router.replace).not.toHaveBeenCalled();
  });

  it("rejects a password shorter than 6 characters", async () => {
    render(<LoginForm />);

    await fillAndSubmit("admin@example.com", "12345");

    const password = screen.getByLabelText("Password");
    expect(password).toHaveAccessibleDescription(
      "Password must be at least 6 characters.",
    );
    expect(password).toHaveFocus();
    expect(screen.getByLabelText("Email")).not.toHaveAttribute("aria-invalid");
    expect(loginMock).not.toHaveBeenCalled();
    expect(router.replace).not.toHaveBeenCalled();
  });

  it("clears a field error when the field is edited", async () => {
    render(<LoginForm />);

    const user = await fillAndSubmit("", "secret");
    await user.type(screen.getByLabelText("Email"), "a");

    expect(screen.queryByText("Email is required.")).not.toBeInTheDocument();
    expect(screen.getByLabelText("Email")).not.toHaveAttribute("aria-invalid");
  });

  it("logs in and redirects to the dashboard", async () => {
    render(<LoginForm />);

    await fillAndSubmit("admin@example.com", "secret");

    expect(loginMock).toHaveBeenCalledWith({
      email: "admin@example.com",
      password: "secret",
    });
    await waitFor(() =>
      expect(router.replace).toHaveBeenCalledWith("/dashboard"),
    );
  });

  it("disables the button and shows a loading label while signing in", async () => {
    loginMock.mockReturnValue(new Promise(() => {}));
    render(<LoginForm />);

    await fillAndSubmit("admin@example.com", "secret");

    const button = screen.getByRole("button", { name: "Signing in…" });
    expect(button).toBeDisabled();
    expect(button).toHaveAttribute("aria-busy", "true");
    expect(router.replace).not.toHaveBeenCalled();
  });

  it("shows an error and re-enables the form when login fails", async () => {
    loginMock.mockRejectedValue(new Error("storage unavailable"));
    render(<LoginForm />);

    await fillAndSubmit("admin@example.com", "secret");

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Could not sign you in. Please try again.",
    );
    expect(screen.getByRole("button", { name: "Sign in" })).toBeEnabled();
    expect(router.replace).not.toHaveBeenCalled();
  });
});
