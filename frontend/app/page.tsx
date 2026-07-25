"use client";

import Link from "next/link";
import { useApp } from "@/context/AppContext";

export default function HomePage() {
  const { items } = useApp();
  const openLost = items.filter((i) => i.kind === "lost" && i.status === "open").length;
  const openFound = items.filter((i) => i.kind === "found" && i.status === "open").length;
  const resolved = items.filter((i) => i.status === "resolved").length;

  return (
    <div>
      {/* Hero, styled as an oversized claim ticket */}
      <section className="mx-auto max-w-6xl px-5 pt-14 pb-10">
        <div className="claim-tag relative overflow-hidden px-6 py-10 md:px-14 md:py-16">
          <div className="perf-edge absolute left-0 right-0 top-0" />
          <p className="font-tag text-xs uppercase tracking-[0.2em] text-ink-soft">Claim Ticket No. 000-FOUNDIT</p>
          <h1 className="mt-4 max-w-2xl font-display text-4xl font-semibold leading-tight text-ink md:text-5xl">
            Lost something? <span className="italic text-rust">Found</span> something?
            <br /> Let's get it back where it belongs.
          </h1>
          <p className="mt-4 max-w-xl text-base text-ink-soft md:text-lg">
            FoundIt is the community claim desk for your campus or neighborhood — report what's missing,
            log what you've picked up, and chat directly to arrange the handoff.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/report" className="rounded-tag bg-ink px-5 py-3 font-medium text-paper transition-colors hover:bg-ink/90">
              Report an item
            </Link>
            <Link href="/lost-items" className="rounded-tag border border-ink px-5 py-3 font-medium text-ink transition-colors hover:bg-line/50">
              Browse listings
            </Link>
          </div>
          <div className="perf-edge absolute bottom-0 left-0 right-0" />
        </div>
      </section>

      {/* Live stats, torn-ticket stubs */}
      <section className="mx-auto max-w-6xl px-5 pb-14">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <StatStub label="Open lost reports" value={openLost} tone="rust" />
          <StatStub label="Open found reports" value={openFound} tone="pine" />
          <StatStub label="Items reunited" value={resolved} tone="amber" />
        </div>
      </section>

      {/* How it works */}
      <section className="mx-auto max-w-6xl px-5 pb-20">
        <h2 className="font-display text-2xl font-semibold text-ink">How the desk works</h2>
        <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-3">
          <Step
            eyebrow="Step one"
            title="File a report"
            body="Lost something or picked something up? Log it in a minute with a category, location, and description."
          />
          <Step
            eyebrow="Step two"
            title="Get matched"
            body="Browse the other column, or let the community spot the match for you across lost and found listings."
          />
          <Step
            eyebrow="Step three"
            title="Chat & collect"
            body="Message the reporter directly, arrange a handoff, and mark the item resolved to earn karma points."
          />
        </div>
      </section>
    </div>
  );
}

function StatStub({ label, value, tone }: { label: string; value: number; tone: "rust" | "pine" | "amber" }) {
  const toneClasses = {
    rust: "text-rust border-rust/40",
    pine: "text-pine border-pine/40",
    amber: "text-amber-dark border-amber/40",
  }[tone];
  return (
    <div className={`claim-tag flex items-center justify-between border-l-4 px-6 py-5 ${toneClasses}`}>
      <span className="font-body text-sm text-ink-soft">{label}</span>
      <span className="font-display text-3xl font-semibold">{value}</span>
    </div>
  );
}

function Step({ eyebrow, title, body }: { eyebrow: string; title: string; body: string }) {
  return (
    <div className="rounded-tag border border-line bg-white/40 p-5">
      <p className="font-tag text-xs uppercase tracking-wide text-amber-dark">{eyebrow}</p>
      <h3 className="mt-2 font-display text-lg font-semibold text-ink">{title}</h3>
      <p className="mt-2 text-sm text-ink-soft">{body}</p>
    </div>
  );
}
