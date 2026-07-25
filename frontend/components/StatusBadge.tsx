export function KindBadge({ kind }: { kind: "lost" | "found" }) {
  const isLost = kind === "lost";
  return (
    <span
      className={`inline-flex items-center rounded-tag px-2 py-0.5 font-tag text-[11px] uppercase tracking-wide ${
        isLost ? "bg-rust-light text-rust-dark" : "bg-pine-light text-pine-dark"
      }`}
    >
      {isLost ? "Lost" : "Found"}
    </span>
  );
}

export function StatusPill({ status }: { status: "open" | "resolved" }) {
  const resolved = status === "resolved";
  return (
    <span
      className={`inline-flex items-center rounded-tag px-2 py-0.5 font-tag text-[11px] uppercase tracking-wide ${
        resolved ? "bg-line text-ink-soft line-through" : "bg-amber-light text-amber-dark"
      }`}
    >
      {resolved ? "Resolved" : "Open"}
    </span>
  );
}
