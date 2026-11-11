"use client";

import { useQuery } from "@tanstack/react-query";
import { fetchUsers } from "@/lib/api/users";

export const USERS_QUERY_KEY = ["users"] as const;

/** Users query. Every caller shares one cached request. */
export function useUsers() {
  return useQuery({
    queryKey: USERS_QUERY_KEY,
    queryFn: ({ signal }) => fetchUsers({ signal }),
  });
}
