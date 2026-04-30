"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Script from "next/script";

const CALENDLY_SCRIPT_SRC = "https://assets.calendly.com/assets/external/widget.js";

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
