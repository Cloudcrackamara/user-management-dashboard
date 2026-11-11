import { z } from "zod";

const geoSchema = z.object({
  lat: z.string(),
  lng: z.string(),
});

const addressSchema = z.object({
  street: z.string(),
  suite: z.string(),
  city: z.string(),
  zipcode: z.string(),
  geo: geoSchema,
});

const companySchema = z.object({
  name: z.string(),
  catchPhrase: z.string(),
  bs: z.string(),
});

/** Shape of a user as returned by JSONPlaceholder. */
export const apiUserSchema = z.object({
  id: z.number().int().positive(),
  name: z.string().min(1),
  username: z.string().min(1),
  email: z.email(),
  phone: z.string(),
  website: z.string(),
  address: addressSchema,
  company: companySchema,
});

export const apiUsersSchema = z.array(apiUserSchema);

export type ApiUser = z.infer<typeof apiUserSchema>;

export const USER_STATUSES = ["Active", "Inactive"] as const;

export type UserStatus = (typeof USER_STATUSES)[number];

/** User as consumed by the app: the API user plus a mock status. */
export type User = ApiUser & {
  status: UserStatus;
};

/**
 * JSONPlaceholder has no status field, so one is derived from the id.
 * Every third user is inactive, which keeps the result stable across requests.
 */
export function deriveUserStatus(id: number): UserStatus {
  return id % 3 === 0 ? "Inactive" : "Active";
}

export function toUser(apiUser: ApiUser): User {
  return { ...apiUser, status: deriveUserStatus(apiUser.id) };
}
