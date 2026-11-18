"use client";

import { useRouter } from "next/navigation";

import { routes } from "@/shared/routes";

import type { Dismissal } from "./dismissal";

export function useDismiss(dismissal: Dismissal): () => void {
  const router = useRouter();
  return () => (dismissal === "back" ? router.back() : router.push(routes.guests()));
}
