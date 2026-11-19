"use client";

import { useRouter } from "next/navigation";

import type { Dismissal } from "./dismissal";

export function useDismiss(dismissal: Dismissal, listHref: string): () => void {
  const router = useRouter();
  return () => (dismissal === "back" ? router.back() : router.push(listHref));
}
