"use client";

import Link from "next/link";
import { useCallback, useEffect, useState, type ReactNode } from "react";

import { SubmitButton } from "@/components/submit-button";

const STORAGE_KEY = "charitably-sidebar-collapsed";

const iconDashboard = (
  <svg className="h-5 w-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={1.5}
      d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
    />
  </svg>
);

const iconNeighbors = (
  <svg className="h-5 w-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={1.5}
      d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
    />
  </svg>
);

const iconVisits = (
  <svg className="h-5 w-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={1.5}
      d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
    />
  </svg>
);

const iconCalls = (
  <svg className="h-5 w-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={1.5}
      d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
    />
  </svg>
);

const iconAssistance = (
  <svg className="h-5 w-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={1.5}
      d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
    />
  </svg>
);

const iconDonations = (
  <svg className="h-5 w-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={1.5}
      d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7"
    />
  </svg>
);

const iconExpenses = (
  <svg className="h-5 w-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={1.5}
      d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
    />
  </svg>
);

const iconTasks = (
  <svg className="h-5 w-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={1.5}
      d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"
    />
  </svg>
);

const iconSettings = (
  <svg className="h-5 w-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={1.5}
      d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
    />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
);

const iconAdminOnly = (
  <svg className="h-5 w-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={1.5}
      d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
    />
  </svg>
);

type NavItem = { href: string; label: string; icon: ReactNode };

function NavLink({ item, sidebarCollapsed }: { item: NavItem; sidebarCollapsed: boolean }) {
  return (
    <Link
      href={item.href}
      title={item.label}
      className={`flex items-center gap-3 rounded-md py-2 text-sm text-stone-300 transition hover:bg-stone-700 hover:text-white ${
        sidebarCollapsed ? "justify-center px-2" : "px-3"
      }`}
    >
      {item.icon}
      <span className={sidebarCollapsed ? "sr-only" : ""}>{item.label}</span>
    </Link>
  );
}

function CollapsibleGroup({
  label,
  icon,
  open,
  onToggle,
  sidebarCollapsed,
  children,
}: {
  label: string;
  icon: ReactNode;
  open: boolean;
  onToggle: () => void;
  sidebarCollapsed: boolean;
  children: React.ReactNode;
}) {
  if (sidebarCollapsed) {
    return <>{children}</>;
  }

  return (
    <div className="flex flex-col gap-0.5">
      <button
        type="button"
        onClick={onToggle}
        className="flex w-full items-center gap-2 rounded-md py-2 pl-3 pr-2 text-left text-sm font-medium text-stone-200 transition hover:bg-stone-700"
        aria-expanded={open}
      >
        <span className="shrink-0">{icon}</span>
        <span className="min-w-0 flex-1 truncate">{label}</span>
        <svg
          className={`h-4 w-4 shrink-0 text-stone-400 transition-transform ${open ? "rotate-90" : ""}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          aria-hidden
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5l7 7-7 7" />
        </svg>
      </button>
      {open ? (
        <div className="ml-1 border-l border-stone-600/60 pl-3 flex flex-col gap-0.5">{children}</div>
      ) : null}
    </div>
  );
}

export function AppSidebar({
  conferenceName,
  userEmail,
  isAdmin,
}: {
  conferenceName: string;
  userEmail: string | null;
  isAdmin: boolean;
}) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [neighborsOpen, setNeighborsOpen] = useState(false);
  const [adminOpen, setAdminOpen] = useState(false);

  useEffect(() => {
    try {
      if (localStorage.getItem(STORAGE_KEY) === "1") setSidebarCollapsed(true);
    } catch {
      /* ignore */
    }
  }, []);

  const toggleSidebar = useCallback(() => {
    setSidebarCollapsed((c) => {
      const next = !c;
      try {
        localStorage.setItem(STORAGE_KEY, next ? "1" : "0");
      } catch {
        /* ignore */
      }
      return next;
    });
  }, []);

  const homeItem: NavItem = { href: "/dashboard", label: "Home", icon: iconDashboard };

  const neighborChildItems: NavItem[] = [
    { href: "/neighbors", label: "All Neighbors", icon: iconNeighbors },
    { href: "/visits", label: "Visits", icon: iconVisits },
    { href: "/calls", label: "Calls", icon: iconCalls },
    { href: "/assistance", label: "Assistance", icon: iconAssistance },
  ];

  const taskItem: NavItem = { href: "/tasks", label: "Tasks", icon: iconTasks };

  const adminChildItems: NavItem[] = [
    { href: "/finances", label: "Financial Summary", icon: iconDashboard },
    { href: "/donations", label: "Donations", icon: iconDonations },
    { href: "/expenses", label: "Expenses", icon: iconExpenses },
  ];

  const settingsItem: NavItem = { href: "/settings", label: "Settings", icon: iconSettings };

  return (
    <aside
      className={`flex shrink-0 flex-col border-r border-stone-200 bg-sidebar text-sidebar-foreground transition-[width] duration-200 ease-out ${
        sidebarCollapsed ? "w-[3.25rem]" : "w-56"
      }`}
    >
      <div
        className={`flex items-start border-b border-stone-600 ${sidebarCollapsed ? "flex-col gap-1 px-1 py-3" : "justify-between gap-2 px-3 py-4"}`}
      >
        {!sidebarCollapsed ? (
          <div className="min-w-0 flex-1">
            <p className="text-xs font-medium uppercase tracking-wider text-stone-400">Conference</p>
            <p className="mt-1 truncate font-semibold text-stone-50">{conferenceName}</p>
            <p className="mt-2 text-xs text-stone-400">St. Vincent de Paul</p>
          </div>
        ) : (
          <div className="flex w-full justify-center" title={conferenceName}>
            <span className="flex h-8 w-8 items-center justify-center rounded-md bg-stone-700 text-xs font-bold text-stone-200">
              {conferenceName.trim().slice(0, 1).toUpperCase() || "C"}
            </span>
          </div>
        )}
        <button
          type="button"
          onClick={toggleSidebar}
          className={`shrink-0 rounded-md p-1.5 text-stone-400 transition hover:bg-stone-700 hover:text-white ${
            sidebarCollapsed ? "mx-auto" : ""
          }`}
          aria-expanded={!sidebarCollapsed}
          aria-label={sidebarCollapsed ? "Expand navigation" : "Collapse navigation"}
        >
          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
            {sidebarCollapsed ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
            )}
          </svg>
        </button>
      </div>

      <nav className="flex flex-1 flex-col gap-0.5 overflow-y-auto p-2">
        <NavLink item={homeItem} sidebarCollapsed={sidebarCollapsed} />

        <CollapsibleGroup
          label="Neighbors"
          icon={iconNeighbors}
          open={neighborsOpen}
          onToggle={() => setNeighborsOpen((o) => !o)}
          sidebarCollapsed={sidebarCollapsed}
        >
          {neighborChildItems.map((item) => (
            <NavLink key={item.href} item={item} sidebarCollapsed={sidebarCollapsed} />
          ))}
        </CollapsibleGroup>

        <NavLink item={taskItem} sidebarCollapsed={sidebarCollapsed} />

        {isAdmin ? (
          <CollapsibleGroup
            label="Admin Only"
            icon={iconAdminOnly}
            open={adminOpen}
            onToggle={() => setAdminOpen((o) => !o)}
            sidebarCollapsed={sidebarCollapsed}
          >
            {adminChildItems.map((item) => (
              <NavLink key={item.href} item={item} sidebarCollapsed={sidebarCollapsed} />
            ))}
          </CollapsibleGroup>
        ) : null}

        <NavLink item={settingsItem} sidebarCollapsed={sidebarCollapsed} />
      </nav>

      <div className={`border-t border-stone-600 p-2 ${sidebarCollapsed ? "flex flex-col items-center" : ""}`}>
        {userEmail ? (
          sidebarCollapsed ? (
            <div
              className="mb-2 flex justify-center"
              title={`Signed in as ${userEmail}`}
            >
              <span
                className="flex h-8 w-8 items-center justify-center rounded-md bg-stone-700 text-stone-300"
                aria-label={`Signed in as ${userEmail}`}
              >
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                  />
                </svg>
              </span>
            </div>
          ) : (
            <div className="mb-3 px-3">
              <p className="text-xs text-stone-500">Signed in as</p>
              <p className="mt-0.5 truncate text-sm font-medium text-stone-200" title={userEmail}>
                {userEmail}
              </p>
            </div>
          )
        ) : null}
        <form
          action="/auth/sign-out"
          method="post"
          className={sidebarCollapsed ? "flex justify-center" : "w-full"}
        >
          <SubmitButton
            title="Sign out"
            pendingLabel={sidebarCollapsed ? "" : "Signing out…"}
            className={`rounded-md text-sm text-stone-400 transition hover:bg-stone-700 hover:text-white disabled:opacity-70 ${
              sidebarCollapsed ? "p-2" : "w-full px-3 py-2 text-left"
            }`}
          >
            {sidebarCollapsed ? (
              <>
                <span className="flex justify-center" aria-hidden>
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                    />
                  </svg>
                </span>
                <span className="sr-only">Sign out</span>
              </>
            ) : (
              "Sign out"
            )}
          </SubmitButton>
        </form>
      </div>
    </aside>
  );
}
