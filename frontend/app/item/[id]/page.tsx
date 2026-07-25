"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useApp } from "@/context/AppContext";
import { KindBadge, StatusPill } from "@/components/StatusBadge";

export default function ItemDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { items, currentUser, resolveItem, startOrGetThread } = useApp();
  const item = items.find((i) => i.id === id);

  if (!item) {
    return (
      <div className="mx-auto max-w-2xl px-5 py-16 text-center">
        <p className="text-3xl">🔍</p>
        <h1 className="mt-3 font-display text-2xl font-semibold text-ink">Report not found</h1>
        <p className="mt-2 text-sm text-ink-soft">This listing may have been removed.</p>
        <Link href="/lost-items" className="mt-6 inline-block rounded-tag bg-ink px-4 py-2 text-sm font-medium text-paper">
          Back to listings
        </Link>
      </div>
    );
  }

  const isOwner = currentUser?.id === item.reporterId;

  function handleMessage() {
    if (!currentUser) {
      router.push("/login");
      return;
    }
    const threadId = startOrGetThread(item!.id, item!.title, item!.reporterId, item!.reporterName);
    router.push(`/chat?thread=${threadId}`);
  }

  function handleResolve() {
    resolveItem(item!.id, item!.reporterId);
    router.refresh();
  }

  return (
    <div className="mx-auto max-w-3xl px-5 py-12">
      <Link href={item.kind === "lost" ? "/lost-items" : "/found-items"} className="text-sm text-ink-soft underline">
        ← Back to {item.kind === "lost" ? "lost" : "found"} listings
      </Link>

      <div className="claim-tag relative mt-4 overflow-hidden p-8">
        <div className="perf-edge absolute left-0 right-0 top-0" />
        <div className="flex flex-wrap items-center gap-2">
          <KindBadge kind={item.kind} />
          <StatusPill status={item.status} />
          <span className="font-tag text-xs text-ink-soft">Ticket #{item.id.slice(-4)}</span>
        </div>

        <div className="mt-4 flex items-start gap-5">
          <div className="flex h-20 w-20 flex-shrink-0 items-center justify-center overflow-hidden rounded-tag bg-paper text-4xl">
            {item.photoUrl ? (
              <img src={item.photoUrl} alt={item.title} className="h-full w-full object-cover" />
            ) : (
              item.photoEmoji
            )}
          </div>
          <div>
            <h1 className="font-display text-2xl font-semibold text-ink md:text-3xl">{item.title}</h1>
            <p className="mt-1 text-sm text-ink-soft">
              Reported by {item.reporterName} on {new Date(item.createdAt).toLocaleDateString()}
            </p>
          </div>
        </div>

        <p className="mt-6 text-base leading-relaxed text-ink">{item.description}</p>

        <dl className="mt-6 grid grid-cols-1 gap-4 border-t border-line pt-6 sm:grid-cols-3">
          <div>
            <dt className="font-tag text-xs uppercase text-ink-soft">Category</dt>
            <dd className="mt-1 text-sm text-ink">{item.category}</dd>
          </div>
          <div>
            <dt className="font-tag text-xs uppercase text-ink-soft">Location</dt>
            <dd className="mt-1 text-sm text-ink">{item.location}</dd>
          </div>
          <div>
            <dt className="font-tag text-xs uppercase text-ink-soft">Date {item.kind}</dt>
            <dd className="mt-1 text-sm text-ink">{item.date}</dd>
          </div>
        </dl>

        <div className="perf-edge absolute bottom-0 left-0 right-0" />
      </div>

      {item.status === "open" && (
        <div className="mt-6 flex flex-wrap gap-3">
          {!isOwner && (
            <button onClick={handleMessage} className="rounded-tag bg-ink px-5 py-2.5 font-medium text-paper hover:bg-ink/90">
              Message {item.reporterName.split(" ")[0]}
            </button>
          )}
          {isOwner && (
            <button onClick={handleResolve} className="rounded-tag bg-pine px-5 py-2.5 font-medium text-paper hover:bg-pine-dark">
              Mark as resolved (+50 karma)
            </button>
          )}
        </div>
      )}
    </div>
  );
}
