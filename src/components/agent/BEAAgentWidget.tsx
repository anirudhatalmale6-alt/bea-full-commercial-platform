"use client";

import Script from "next/script";

declare global {
  interface Window {
    BEAAgent?: {
      init: (config: {
        apiBaseUrl: string;
        manifestUrl: string;
        defaultCourseId: string;
        enableDynamicTts: boolean;
      }) => void;
      event: (name: string, payload?: Record<string, unknown>) => void;
    };
  }
}

const agentConfig = {
  apiBaseUrl: "/api",
  manifestUrl: "/bea-agent/audio-manifest.json",
  defaultCourseId: "bea-b1-independent",
  enableDynamicTts: true,
};

function initialiseAgent() {
  if (!window.BEAAgent || document.querySelector(".bea-agent")) return;
  window.BEAAgent.init(agentConfig);
}

export default function BEAAgentWidget() {
  return (
    <>
      <link rel="stylesheet" href="/bea-agent/bea-agent.css" />
      <Script src="/bea-agent/bea-agent.js" strategy="afterInteractive" onLoad={initialiseAgent} />
    </>
  );
}
