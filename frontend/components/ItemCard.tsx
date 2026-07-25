import Link from "next/link";
import { FoundItItem } from "@/lib/types";
import { KindBadge, StatusPill } from "./StatusBadge";

export default function ItemCard({ item }: { item: FoundItItem }) {
  return (
    <Link
      href={`/item/${item.id}`}
      className="claim-tag group flex gap-4 p-4 pl-6 transition-shadow hover:shadow-md"
    >
      <div className="flex h-14 w-14 flex-shrink-0 items-center justify-center overflow-hidden rounded-tag bg-paper text-2xl">
        {item.photoUrl ? (
          <img src={item.photoUrl} alt={item.title} className="h-full w-full object-cover" />
        ) : (
          item.photoEmoji
        )}
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <KindBadge kind={item.kind} />
          <StatusPill status={item.status} />
          <span className="font-tag text-[11px] text-ink-soft">#{item.id.slice(-4)}</span>
        </div>
        <h3 className="mt-1 truncate font-display text-lg font-semibold text-ink group-hover:underline">
          {item.title}
        </h3>
        <p className="mt-0.5 line-clamp-2 text-sm text-ink-soft">{item.description}</p>
        <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 font-tag text-[11px] text-ink-soft">
          <span>📍 {item.location}</span>
          <span>📅 {item.date}</span>
          <span>🏷️ {item.category}</span>
        </div>
      </div>
    </Link>
  );
}
