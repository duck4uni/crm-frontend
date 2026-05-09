"use client";

import { useSyncExternalStore } from "react";
import { getFinanceStore } from "@/services/finance/store";
import type { FinanceState } from "@/services/finance/types";

export function useFinanceState(): FinanceState {
  const store = getFinanceStore();
  return useSyncExternalStore(
    (l) => store.subscribe(l),
    () => store.getSnapshot(),
    () => store.getSnapshot(),
  );
}

export function useFinanceStore() {
  return getFinanceStore();
}
