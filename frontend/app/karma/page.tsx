"use client";

import Link from "next/link";
import { useApp } from "@/context/AppContext";

const BADGES = [
  { threshold: 0, label: "Newcomer", emoji: "🌱" },
  { threshold: 50, label: "Helper", emoji: "🤝" },
  { threshold: 100, label: "Reuniter", emoji: "🎗️" },
  { threshold: 200, label: "Community Pillar", emoji: "🏛️" },
];

function badgeFor(karma: number) {
  return [...BADGES].reverse().find((b) => karma >= b.threshold) ?? BADGES[0];
}

export default function KarmaPage() {
  const { currentUser, karmaEvents, users } = useApp();

  const leaderboard = [...users].sort((a, b) => b.karma - a.karma).slice(0, 10);
  const myEvents = currentUser ? karmaEvents.filter((e) => e.userId === currentUser.id) : [];

  return (
    <div className="mx-auto max-w-5xl px-5 py-12">
      <p className="font-tag text-xs uppercase tracking-[0.2em] text-amber-dark">Karma desk</p>
      <h1 className="mt-1 font-display text-3xl font-semibold text-ink">Your karma points</h1>
      <p className="mt-2 max-w-2xl text-sm text-ink-soft">
        Karma is earned every time you help the community — reporting items quickly, and especially reuniting a lost item
        with its owner.
      </p>

      {!currentUser ? (
        <div className="claim-tag mt-8 flex flex-col items-center gap-3 px-6 py-14 text-center">
          <span className="text-3xl">🔒</span>
          <p className="text-sm text-ink-soft">Log in to see your karma balance and history.</p>
          <Link href="/login" className="rounded-tag bg-ink px-4 py-2 text-sm font-medium text-paper">
            Log in
          </Link>
        </div>
      ) : (
        <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-[1fr_1.3fr]">
          <div className="claim-tag relative flex flex-col items-center justify-center gap-2 overflow-hidden px-6 py-10">
            <div className="perf-edge absolute left-0 right-0 top-0" />
            <span className="stamp inline-flex h-24 w-24 items-center justify-center font-display text-4xl font-semibold text-amber-dark">
              {currentUser.karma}
            </span>
            <p className="mt-2 font-tag text-xs uppercase tracking-wide text-ink-soft">Total karma points</p>
            <p className="mt-3 flex items-center gap-2 rounded-tag bg-amber-light px-3 py-1.5 text-sm font-medium text-amber-dark">
              {badgeFor(currentUser.karma).emoji} {badgeFor(currentUser.karma).label}
            </p>
            <div className="perf-edge absolute bottom-0 left-0 right-0" />
          </div>

          <div className="claim-tag p-6">
            <h2 className="font-display text-lg font-semibold text-ink">Points history</h2>
            <ul className="mt-4 flex flex-col gap-3">
              {myEvents.length === 0 && <p className="text-sm text-ink-soft">No karma events yet — report or resolve an item to get started.</p>}
              {myEvents.map((e) => (
                <li key={e.id} className="flex items-center justify-between gap-3 border-b border-line pb-3 last:border-0 last:pb-0">
                  <div>
                    <p className="text-sm text-ink">{e.reason}</p>
                    <p className="font-tag text-[11px] text-ink-soft">{new Date(e.createdAt).toLocaleDateString()}</p>
                  </div>
                  <span className="font-tag text-sm font-semibold text-pine">+{e.amount}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      <div className="mt-10">
        <h2 className="font-display text-xl font-semibold text-ink">Community leaderboard</h2>
        <div className="claim-tag mt-4 divide-y divide-line">
          {leaderboard.map((u, idx) => (
            <div key={u.id} className="flex items-center justify-between px-5 py-3">
              <div className="flex items-center gap-3">
                <span className="font-tag w-6 text-sm text-ink-soft">{idx + 1}</span>
                <span className="text-sm font-medium text-ink">
                  {u.name} {currentUser?.id === u.id && <span className="text-ink-soft">(you)</span>}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span>{badgeFor(u.karma).emoji}</span>
                <span className="font-tag text-sm font-semibold text-ink">{u.karma} pts</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
