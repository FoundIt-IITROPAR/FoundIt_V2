"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { useApp } from "@/context/AppContext";

const links = [
  { href: "/lost-items", label: "Lost" },
  { href: "/found-items", label: "Found" },
  { href: "/report", label: "Report" },
  { href: "/karma", label: "Karma" },
  { href: "/chat", label: "Chat" },
];

export default function Navbar() {
  const { currentUser, logout } = useApp();
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-line bg-paper/95 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4">
        <Link href="/" className="flex items-center gap-2 font-display text-xl font-semibold tracking-tight text-ink">
          <span className="flex h-8 w-8 items-center justify-center rounded-tag border-2 border-ink text-sm font-tag rotate-[-6deg]">
            FI
          </span>
          FoundIt
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className={`rounded-tag px-3 py-2 font-body text-sm font-medium transition-colors ${
                pathname === l.href ? "bg-ink text-paper" : "text-ink-soft hover:bg-line/60 hover:text-ink"
              }`}
            >
              {l.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          {currentUser ? (
            <>
              <Link href="/dashboard" className="font-tag text-xs text-ink-soft hover:text-ink">
                Hi, {currentUser.name.split(" ")[0]} · {currentUser.karma} pts
              </Link>
              <button
                onClick={() => {
                  logout();
                  router.push("/");
                }}
                className="rounded-tag border border-ink px-3 py-1.5 text-sm font-medium text-ink transition-colors hover:bg-ink hover:text-paper"
              >
                Log out
              </button>
            </>
          ) : (
            <>
              <Link href="/login" className="rounded-tag px-3 py-1.5 text-sm font-medium text-ink-soft hover:text-ink">
                Log in
              </Link>
              <Link
                href="/signup"
                className="rounded-tag bg-amber px-3 py-1.5 text-sm font-semibold text-ink transition-colors hover:bg-amber-dark"
              >
                Sign up
              </Link>
            </>
          )}
        </div>

        <button
          className="flex h-9 w-9 items-center justify-center rounded-tag border border-line md:hidden"
          onClick={() => setOpen((o) => !o)}
          aria-label="Toggle menu"
        >
          <span className="font-tag text-lg">{open ? "×" : "≡"}</span>
        </button>
      </div>

      {open && (
        <div className="border-t border-line px-5 pb-4 md:hidden">
          <nav className="flex flex-col gap-1 pt-3">
            {links.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                onClick={() => setOpen(false)}
                className={`rounded-tag px-3 py-2 text-sm font-medium ${
                  pathname === l.href ? "bg-ink text-paper" : "text-ink-soft"
                }`}
              >
                {l.label}
              </Link>
            ))}
            <div className="mt-2 flex gap-2 border-t border-line pt-3">
              {currentUser ? (
                <>
                  <Link href="/dashboard" className="flex-1 rounded-tag border border-line px-3 py-2 text-center text-sm">
                    {currentUser.name.split(" ")[0]} · {currentUser.karma} pts
                  </Link>
                  <button
                    onClick={() => {
                      logout();
                      router.push("/");
                      setOpen(false);
                    }}
                    className="flex-1 rounded-tag border border-ink px-3 py-2 text-sm"
                  >
                    Log out
                  </button>
                </>
              ) : (
                <>
                  <Link href="/login" onClick={() => setOpen(false)} className="flex-1 rounded-tag border border-line px-3 py-2 text-center text-sm">
                    Log in
                  </Link>
                  <Link href="/signup" onClick={() => setOpen(false)} className="flex-1 rounded-tag bg-amber px-3 py-2 text-center text-sm font-semibold">
                    Sign up
                  </Link>
                </>
              )}
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
