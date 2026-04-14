"use client";

import Link from "next/link";
import { LogoWordmark } from "./Logo";

const navItems = [
  { href: "#features", label: "Features" },
  { href: "#how", label: "How it works" },
];

export function LandingHeader() {
  return (
    <header className="sticky top-0 z-50 border-b border-border/60 bg-background/80 backdrop-blur">
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-6">
        <Link href="/" className="group inline-flex items-center gap-2" aria-label="Charitably home">
          <LogoWordmark className="transition-opacity group-hover:opacity-90" />
        </Link>

        <nav className="hidden items-center gap-8 text-sm text-muted md:flex" aria-label="Primary">
          {navItems.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="transition-colors hover:text-foreground"
            >
              {item.label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <Link
            href="/login"
            className="inline-flex items-center rounded-md px-3 py-2 text-sm font-medium text-foreground/80 transition-colors hover:text-foreground"
          >
            Log In
          </Link>
          <a
            href="#contact"
            className="inline-flex items-center justify-center rounded-md bg-accent px-3.5 py-2 text-sm font-semibold text-accent-foreground shadow-sm shadow-amber-900/10 transition hover:brightness-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-background"
          >
            Request Access
          </a>
        </div>
      </div>
    </header>
  );
}

