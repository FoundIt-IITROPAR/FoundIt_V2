"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useApp } from "@/context/AppContext";
import ItemCard from "@/components/ItemCard";
import { Filters, EmptyState } from "@/components/ListingHelpers";

export default function FoundItemsPage() {
  const { itemsByKind } = useApp();
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("All");
  const [showResolved, setShowResolved] = useState(false);

  const items = itemsByKind("found");

  const filtered = useMemo(() => {
    return items.filter((i) => {
      if (!showResolved && i.status === "resolved") return false;
      if (category !== "All" && i.category !== category) return false;
      if (query && !`${i.title} ${i.description} ${i.location}`.toLowerCase().includes(query.toLowerCase())) return false;
      return true;
    });
  }, [items, query, category, showResolved]);

  return (
    <div className="mx-auto max-w-6xl px-5 py-12">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="font-tag text-xs uppercase tracking-[0.2em] text-pine">Found column</p>
          <h1 className="mt-1 font-display text-3xl font-semibold text-ink">Items reported found</h1>
        </div>
        <Link href="/report" className="rounded-tag bg-ink px-4 py-2 text-sm font-medium text-paper hover:bg-ink/90">
          Report a found item
        </Link>
      </div>

      <Filters query={query} setQuery={setQuery} category={category} setCategory={setCategory} showResolved={showResolved} setShowResolved={setShowResolved} />

      <div className="mt-6 flex flex-col gap-3">
        {filtered.length === 0 ? (
          <EmptyState message="No found-item reports match those filters yet. Try widening your search, or check back soon." />
        ) : (
          filtered.map((item) => <ItemCard key={item.id} item={item} />)
        )}
      </div>
    </div>
  );
}
