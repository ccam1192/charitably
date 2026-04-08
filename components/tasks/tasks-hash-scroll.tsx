"use client";

import { useEffect } from "react";

function scrollToTaskHash() {
  const hash = window.location.hash.replace(/^#/, "");
  if (!hash.startsWith("task-")) return;
  const el = document.getElementById(hash);
  if (el) {
    el.scrollIntoView({ behavior: "smooth", block: "center" });
  }
}

/** Scrolls to `#task-<id>` when present (e.g. linked from the dashboard). */
export function TasksHashScroll() {
  useEffect(() => {
    scrollToTaskHash();
    window.addEventListener("hashchange", scrollToTaskHash);
    return () => window.removeEventListener("hashchange", scrollToTaskHash);
  }, []);

  return null;
}
