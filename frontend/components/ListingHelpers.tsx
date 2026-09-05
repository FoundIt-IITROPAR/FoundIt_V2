import { CATEGORIES } from "@/lib/constants";

export function Filters({
  query,
  setQuery,
  category,
  setCategory,
  showResolved,
  setShowResolved,
}: {
  query: string;
  setQuery: (v: string) => void;
  category: string;
  setCategory: (v: string) => void;
  showResolved: boolean;
  setShowResolved: (v: boolean) => void;
}) {
  return (
    <div className="mt-6 flex flex-wrap items-center gap-3 rounded-tag border border-line bg-white/40 p-4">
      <input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search by title, description, or location…"
        className="min-w-[220px] flex-1 rounded-tag border border-line bg-paper px-3 py-2 text-sm outline-none focus:border-ink"
      />
      <select
        value={category}
        onChange={(e) => setCategory(e.target.value)}
        className="rounded-tag border border-line bg-paper px-3 py-2 text-sm outline-none focus:border-ink"
      >
        <option>All</option>
        {CATEGORIES.map((c) => (
          <option key={c}>{c}</option>
        ))}
      </select>
      <label className="flex items-center gap-2 text-sm text-ink-soft">
        <input type="checkbox" checked={showResolved} onChange={(e) => setShowResolved(e.target.checked)} />
        Show resolved
      </label>
    </div>
  );
}

export function EmptyState({ message }: { message: string }) {
  return (
    <div className="claim-tag flex flex-col items-center gap-2 px-6 py-14 text-center">
      <span className="text-3xl">🗂️</span>
      <p className="text-sm text-ink-soft">{message}</p>
    </div>
  );
}
