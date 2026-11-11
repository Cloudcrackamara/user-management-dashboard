import { QueryClientProvider } from "@tanstack/react-query";
import { render, type RenderResult } from "@testing-library/react";
import type { ReactElement } from "react";
import { createQueryClient } from "@/lib/query-client";

/** Renders with a fresh QueryClient so tests never share a cache. */
export function renderWithQuery(ui: ReactElement): RenderResult {
  return render(
    <QueryClientProvider client={createQueryClient()}>
      {ui}
    </QueryClientProvider>,
  );
}
