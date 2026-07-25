"use client";

import { useRouter } from "next/navigation";
import { ChangeEvent, FormEvent, useState } from "react";
import { useApp } from "@/context/AppContext";
import { CATEGORIES } from "@/lib/mockData";
import { ItemKind } from "@/lib/types";

interface FormState {
  title: string;
  category: string;
  description: string;
  location: string;
  date: string;
  photoEmoji: string;
  photoUrl: string | null;
}

const emptyForm: FormState = {
  title: "",
  category: CATEGORIES[0],
  description: "",
  location: "",
  date: new Date().toISOString().slice(0, 10),
  photoEmoji: "📦",
  photoUrl: null,
};

const EMOJI_OPTIONS = ["📦", "👛", "🔑", "🎧", "🪪", "📔", "💍", "🧥", "🐾", "💻"];

export default function ReportPage() {
  const { currentUser, addItem } = useApp();
  const router = useRouter();

  return (
    <div className="mx-auto max-w-6xl px-5 py-12">
      <p className="font-tag text-xs uppercase tracking-[0.2em] text-ink-soft">The claim desk</p>
      <h1 className="mt-1 font-display text-3xl font-semibold text-ink">Report an item</h1>
      <p className="mt-2 max-w-2xl text-sm text-ink-soft">
        Fill in the column that matches your situation. Every report earns karma points, and found-item reports earn extra for
        the community's sake.
      </p>

      {!currentUser && (
        <p className="mt-6 rounded-tag border border-amber bg-amber-light px-4 py-3 text-sm text-amber-dark">
          You'll need to log in before submitting a report — your existing details are kept below while you do.
        </p>
      )}

      <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-2">
        <ReportColumn
          kind="lost"
          accent="rust"
          heading="Report a lost item"
          sub="Something missing? Give as much detail as you can so it's easy to spot."
          onSubmit={(form) => {
            if (!currentUser) return;
            addItem({ kind: "lost", ...form });
            router.push("/lost-items");
          }}
          disabled={!currentUser}
        />
        <ReportColumn
          kind="found"
          accent="pine"
          heading="Report a found item"
          sub="Picked something up? Log it here so its owner can find it faster."
          onSubmit={(form) => {
            if (!currentUser) return;
            addItem({ kind: "found", ...form });
            router.push("/found-items");
          }}
          disabled={!currentUser}
        />
      </div>
    </div>
  );
}

function ReportColumn({
  kind,
  accent,
  heading,
  sub,
  onSubmit,
  disabled,
}: {
  kind: ItemKind;
  accent: "rust" | "pine";
  heading: string;
  sub: string;
  onSubmit: (form: FormState) => void;
  disabled: boolean;
}) {
  const [form, setForm] = useState<FormState>(emptyForm);
  const [submitted, setSubmitted] = useState(false);
  const accentText = accent === "rust" ? "text-rust" : "text-pine";
  const accentBorder = accent === "rust" ? "border-rust/40" : "border-pine/40";
  const accentBg = accent === "rust" ? "bg-rust hover:bg-rust-dark" : "bg-pine hover:bg-pine-dark";

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    onSubmit(form);
    setForm({ ...emptyForm, date: new Date().toISOString().slice(0, 10) });
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 3000);
  }

  function handleImageUpload(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        update("photoUrl", reader.result);
        update("photoEmoji", "📷");
      }
    };
    reader.readAsDataURL(file);
  }

  function handleImageUrlChange(value: string) {
    const nextValue = value.trim();
    update("photoUrl", nextValue ? nextValue : null);
    if (nextValue) update("photoEmoji", "📷");
  }

  function clearImage() {
    update("photoUrl", null);
    update("photoEmoji", "📦");
  }

  return (
    <form onSubmit={handleSubmit} className={`claim-tag flex flex-col gap-4 border-l-4 p-6 ${accentBorder}`}>
      <div>
        <p className={`font-tag text-xs uppercase tracking-wide ${accentText}`}>{kind === "lost" ? "Lost report" : "Found report"}</p>
        <h2 className="mt-1 font-display text-xl font-semibold text-ink">{heading}</h2>
        <p className="mt-1 text-sm text-ink-soft">{sub}</p>
      </div>

      {submitted && (
        <p className="rounded-tag bg-pine-light px-3 py-2 text-sm text-pine-dark">
          Report submitted — thanks for helping the community!
        </p>
      )}

      <label className="flex flex-col gap-1 text-sm font-medium text-ink">
        Item title
        <input
          required
          value={form.title}
          onChange={(e) => update("title", e.target.value)}
          placeholder={kind === "lost" ? "e.g. Black leather wallet" : "e.g. Set of silver keys"}
          className="rounded-tag border border-line bg-paper px-3 py-2 text-sm outline-none focus:border-ink"
        />
      </label>

      <div className="grid grid-cols-2 gap-3">
        <label className="flex flex-col gap-1 text-sm font-medium text-ink">
          Category
          <select
            value={form.category}
            onChange={(e) => update("category", e.target.value)}
            className="rounded-tag border border-line bg-paper px-3 py-2 text-sm outline-none focus:border-ink"
          >
            {CATEGORIES.map((c) => (
              <option key={c}>{c}</option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-1 text-sm font-medium text-ink">
          Date {kind === "lost" ? "lost" : "found"}
          <input
            type="date"
            value={form.date}
            onChange={(e) => update("date", e.target.value)}
            className="rounded-tag border border-line bg-paper px-3 py-2 text-sm outline-none focus:border-ink"
          />
        </label>
      </div>

      <label className="flex flex-col gap-1 text-sm font-medium text-ink">
        Location
        <input
          required
          value={form.location}
          onChange={(e) => update("location", e.target.value)}
          placeholder="e.g. Central Library, Gate 2"
          className="rounded-tag border border-line bg-paper px-3 py-2 text-sm outline-none focus:border-ink"
        />
      </label>

      <label className="flex flex-col gap-1 text-sm font-medium text-ink">
        Description
        <textarea
          required
          rows={3}
          value={form.description}
          onChange={(e) => update("description", e.target.value)}
          placeholder="Color, brand, distinguishing marks, contents…"
          className="rounded-tag border border-line bg-paper px-3 py-2 text-sm outline-none focus:border-ink"
        />
      </label>

      <div className="flex flex-col gap-2 text-sm font-medium text-ink">
        Add a photo
        <div className="grid gap-3 sm:grid-cols-[1fr_auto]">
          <label className="flex cursor-pointer flex-col items-center justify-center rounded-tag border border-dashed border-line bg-paper px-3 py-3 text-center text-sm text-ink-soft hover:border-ink">
            <span className="font-medium text-ink">Upload from device</span>
            <span className="text-xs">PNG, JPG, or GIF</span>
            <input type="file" accept="image/*" onChange={handleImageUpload} className="sr-only" />
          </label>
          <button
            type="button"
            onClick={clearImage}
            className="rounded-tag border border-line bg-paper px-3 py-2 text-sm font-medium text-ink hover:border-ink"
          >
            Clear photo
          </button>
        </div>

        <input
          value={form.photoUrl ?? ""}
          onChange={(e) => handleImageUrlChange(e.target.value)}
          placeholder="Or paste an image URL"
          className="rounded-tag border border-line bg-paper px-3 py-2 text-sm outline-none focus:border-ink"
        />

        {form.photoUrl ? (
          <div className="overflow-hidden rounded-tag border border-line bg-paper p-2">
            <img src={form.photoUrl} alt="Preview" className="h-32 w-full rounded-tag object-cover" />
          </div>
        ) : (
          <p className="text-xs text-ink-soft">You can upload a photo or keep a quick icon for the listing.</p>
        )}
      </div>

      <div className="flex flex-col gap-1 text-sm font-medium text-ink">
        Or choose an icon for your listing
        <div className="flex flex-wrap gap-2">
          {EMOJI_OPTIONS.map((emoji) => (
            <button
              type="button"
              key={emoji}
              onClick={() => {
                update("photoEmoji", emoji);
                update("photoUrl", null);
              }}
              className={`flex h-9 w-9 items-center justify-center rounded-tag border text-lg ${
                form.photoEmoji === emoji ? "border-ink bg-line" : "border-line bg-paper"
              }`}
            >
              {emoji}
            </button>
          ))}
        </div>
      </div>

      <button
        type="submit"
        disabled={disabled}
        className={`mt-2 rounded-tag px-4 py-2.5 font-medium text-paper transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${accentBg}`}
      >
        {disabled ? "Log in to submit" : `Submit ${kind} report`}
      </button>
    </form>
  );
}
