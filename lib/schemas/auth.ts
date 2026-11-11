import { z } from "zod";

export const PASSWORD_MIN_LENGTH = 6;

export const loginSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, "Email is required.")
    .pipe(z.email("Enter a valid email address.")),
  password: z
    .string()
    .min(1, "Password is required.")
    .min(
      PASSWORD_MIN_LENGTH,
      `Password must be at least ${PASSWORD_MIN_LENGTH} characters.`,
    ),
});

export type LoginCredentials = z.infer<typeof loginSchema>;

export type LoginFieldErrors = Partial<Record<keyof LoginCredentials, string>>;

/** Reduces a Zod error to the first message for each field. */
export function getLoginFieldErrors(
  error: z.ZodError<LoginCredentials>,
): LoginFieldErrors {
  const { fieldErrors } = z.flattenError(error);

  return {
    email: fieldErrors.email?.[0],
    password: fieldErrors.password?.[0],
  };
}
