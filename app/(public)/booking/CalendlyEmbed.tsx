"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Script from "next/script";
import { trackEvent } from "@/lib/analytics";

const CALENDLY_SCRIPT_SRC = "https://assets.calendly.com/assets/external/widget.js";
const CALENDLY_ORIGIN = "https://calendly.com";

type CalendlyEmbedProps = {
  url: string;
};

declare global {
  interface Window {
    Calendly?: {
      initInlineWidget: (options: {
        url: string;
        parentElement: HTMLElement;
      }) => void;
    };
  }
}

export function CalendlyEmbed({ url }: CalendlyEmbedProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const initializedRef = useRef(false);
  const [scriptReady, setScriptReady] = useState(false);
  const [loadState, setLoadState] = useState<"loading" | "ready" | "error">("loading");

  const initializeCalendly = useCallback(() => {
    const container = containerRef.current;
    if (!container || !window.Calendly) return;

    container.innerHTML = "";
    initializedRef.current = true;
    setLoadState("loading");

    window.Calendly.initInlineWidget({
      url,
      parentElement: container,
    });

    window.setTimeout(() => {
      if (container.querySelector("iframe")) {
        setLoadState("ready");
      } else {
        initializedRef.current = false;
        setLoadState("error");
      }
    }, 3000);
  }, [url]);

  useEffect(() => {
    if (!scriptReady || initializedRef.current) return;
    initializeCalendly();
  }, [initializeCalendly, scriptReady]);

  // Calendly runs inside an iframe, so a completed booking is invisible to
  // analytics unless we listen for the widget's postMessage events.
  useEffect(() => {
    function handleCalendlyMessage(event: MessageEvent) {
      if (event.origin !== CALENDLY_ORIGIN) return;
      const name = (event.data as { event?: unknown } | null)?.event;
      if (name === "calendly.date_and_time_selected") {
        trackEvent("booking_started");
      } else if (name === "calendly.event_scheduled") {
        trackEvent("booking_completed", { value: 150, currency: "USD" });
      }
    }

    window.addEventListener("message", handleCalendlyMessage);
    return () => window.removeEventListener("message", handleCalendlyMessage);
  }, []);

  return (
    <div className="calendly-embed">
      <div
        ref={containerRef}
        className="calendly-embed__widget"
        aria-busy={loadState === "loading"}
      />
      {loadState !== "ready" ? (
        <div className="calendly-embed__status">
          {loadState === "error" ? (
            <>
              <p>Calendar did not load. Try again or open scheduling directly.</p>
              <div className="inline-actions">
                <button type="button" className="button-secondary" onClick={initializeCalendly}>
                  Try again
                </button>
                <a className="button" href={url} target="_blank" rel="noreferrer">
                  Open calendar
                </a>
              </div>
            </>
          ) : (
            <p>Loading calendar...</p>
          )}
        </div>
      ) : null}
      <Script
        src={CALENDLY_SCRIPT_SRC}
        strategy="afterInteractive"
        onReady={() => {
          setScriptReady(true);
          initializeCalendly();
        }}
        onError={() => setLoadState("error")}
      />
    </div>
  );
}
