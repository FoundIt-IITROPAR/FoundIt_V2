"use client";

import Link from "next/link";
import { useApp } from "@/context/AppContext";
import ItemCard from "@/components/ItemCard";

export default function DashboardPage() {
  const { currentUser, items } = useApp();

  if (!currentUser) {
    return (
      <div className="mx-auto max-w-md px-5 py-16 text-center">
        <span className="text-3xl">🪪</span>
        <h1 className="mt-3 font-display text-2xl font-semibold text-ink">Log in to view your dashboard</h1>
        <Link href="/login" className="mt-6 inline-block rounded-tag bg-ink px-4 py-2 text-sm font-medium text-paper">
          Log in
        </Link>
      </div>
    );
  }

  const myItems = items.filter((i) => i.reporterId === currentUser.id);
  const openCount = myItems.filter((i) => i.status === "open").length;
  const resolvedCount = myItems.filter((i) => i.status === "resolved").length;

  return (
    <div className="mx-auto max-w-5xl px-5 py-12">
      <p className="font-tag text-xs uppercase tracking-[0.2em] text-ink-soft">Your desk</p>
      <h1 className="mt-1 font-display text-3xl font-semibold text-ink">Hi, {currentUser.name.split(" ")[0]}</h1>
      <p className="mt-2 text-sm text-ink-soft">Member since {new Date(currentUser.joined).toLocaleDateString()}</p>

      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <SummaryCard label="Karma points" value={currentUser.karma} href="/karma" />
        <SummaryCard label="Open reports" value={openCount} href="/lost-items" />
        <SummaryCard label="Items resolved" value={resolvedCount} href="/found-items" />
      </div>

      <div className="mt-10 flex items-center justify-between">
        <h2 className="font-display text-xl font-semibold text-ink">Your reports</h2>
        <Link href="/report" className="rounded-tag border border-ink px-3 py-1.5 text-sm font-medium text-ink hover:bg-line/50">
          + New report
        </Link>
      </div>

      <div className="mt-4 flex flex-col gap-3">
        {myItems.length === 0 ? (
          <div className="claim-tag px-6 py-10 text-center text-sm text-ink-soft">
            You haven't filed any reports yet.
          </div>
        ) : (
          myItems.map((item) => <ItemCard key={item.id} item={item} />)
        )}
      </div>
    </div>
  );
}

function SummaryCard({ label, value, href }: { label: string; value: number; href: string }) {
  return (
    <Link href={href} className="claim-tag flex items-center justify-between px-6 py-5 transition-shadow hover:shadow-md">
      <span className="text-sm text-ink-soft">{label}</span>
      <span className="font-display text-2xl font-semibold text-ink">{value}</span>
    </Link>
  );
}
