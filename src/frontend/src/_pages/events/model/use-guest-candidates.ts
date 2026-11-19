"use client";

import { useEffect, useEffectEvent, useState, useTransition } from "react";

import type { EventId } from "@/entities/event";
import type { Guest } from "@/entities/guest";
import { SEARCH_DELAY_MS } from "@/shared/config";

import { findGuestCandidatesAction } from "../api/find-guest-candidates-action";

type Candidates = { guests: Guest[]; total: number; page: number };

const EMPTY: Candidates = { guests: [], total: 0, page: 0 };

// Pages of guests not on the event's list: a new search starts again, "show more" appends.
export function useGuestCandidates(eventId: EventId, search: string) {
  const [candidates, setCandidates] = useState<Candidates>(EMPTY);
  const [error, setError] = useState<string | null>(null);
  const [loading, startLoading] = useTransition();

  function load(page: number, append: boolean) {
    startLoading(async () => {
      const result = await findGuestCandidatesAction(eventId, search, page);
      if ("error" in result) {
        setError(result.error);
        return;
      }
      setError(null);
      setCandidates((current) => ({
        guests: append ? [...current.guests, ...result.page.items] : result.page.items,
        total: result.page.total,
        page: result.page.page,
      }));
    });
  }

  const loadFirstPage = useEffectEvent(() => load(1, false));

  // A new search replaces the list, after a pause in typing.
  useEffect(() => {
    const timeout = setTimeout(loadFirstPage, SEARCH_DELAY_MS);
    return () => clearTimeout(timeout);
  }, [search, eventId]);

  return {
    ...candidates,
    loading,
    error,
    hasMore: candidates.guests.length < candidates.total,
    loadMore: () => load(candidates.page + 1, true),
  };
}
