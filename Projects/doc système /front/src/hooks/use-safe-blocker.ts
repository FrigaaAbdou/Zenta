import { useBlocker } from "react-router-dom";

type SafeBlockerState = {
  state: "blocked" | "unblocked";
  proceed: () => void;
  reset: () => void;
};

const fallbackBlocker: SafeBlockerState = {
  state: "unblocked",
  proceed: () => undefined,
  reset: () => undefined,
};

export function useSafeBlocker(shouldBlock: boolean): SafeBlockerState {
  try {
    return useBlocker(shouldBlock) as SafeBlockerState;
  } catch {
    return fallbackBlocker;
  }
}
