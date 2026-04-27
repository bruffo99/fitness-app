"use client";

import Script from "next/script";

const CALENDLY_SCRIPT_SRC = "https://assets.calendly.com/assets/external/widget.js";

type CalendlyEmbedProps = {
  url: string;
};

export function CalendlyEmbed({ url }: CalendlyEmbedProps) {
  return (
    <>
      <div
        className="calendly-inline-widget"
        data-url={url}
        style={{ minWidth: "320px", height: "700px" }}
      />
      <Script src={CALENDLY_SCRIPT_SRC} strategy="afterInteractive" />
    </>
  );
}
