"use client";

import { useCallback, useEffect, useState } from "react";
import { apiFetch } from "@/lib/auth-client";
import type { PlatformOverviewPayload } from "@/types/platform";

interface UsePlatformOverviewResult {
  data: PlatformOverviewPayload | null;
  loading: boolean;
  error: string;
  refresh: () => Promise<void>;
}

/**
 * Shared hook that fetches `/api/platform/overview` and shares the same
 * typed payload across every Platform Admin page.
 *
 * The request is authenticated against the caller's bearer token so only
 * SUPER_ADMIN sessions can actually read it; other roles are bounced by
 * the UI shell before this hook ever runs.
 */
export function usePlatformOverview(
  enabled: boolean = true
): UsePlatformOverviewResult {
  const [data, setData] = useState<PlatformOverviewPayload | null>(null);
  const [loading, setLoading] = useState<boolean>(enabled);
  const [error, setError] = useState("");

  const refresh = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await apiFetch("/api/platform/overview");
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body?.error || "Failed to load platform overview");
      }
      const payload = (await res.json()) as PlatformOverviewPayload;
      setData(payload);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!enabled) return;
    refresh();
  }, [enabled, refresh]);

  return { data, loading, error, refresh };
}
