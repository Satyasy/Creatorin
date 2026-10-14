import { sendGAEvent } from "@next/third-parties/google";

export const GA_TRACKING_ID = process.env.NEXT_PUBLIC_GA_ID || "G-5XX1BLZGDX";
export const IS_GA_ENABLED = process.env.NODE_ENV === "production";

/**
 * Utility function to send custom events to Google Analytics 4.
 *
 * Example:
 * ```ts
 * trackEvent("button_click", { button_name: "cta_register", page: "/landing" });
 * ```
 */
export function trackEvent(action: string, params?: Record<string, unknown>) {
  if (typeof window === "undefined" || !IS_GA_ENABLED) {
    return;
  }

  try {
    sendGAEvent("event", action, params || {});
  } catch (error) {
    console.debug("Failed to send GA event:", error);
  }
}
