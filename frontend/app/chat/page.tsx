"use client";

import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { FormEvent, Suspense, useEffect, useState } from "react";
import { useApp } from "@/context/AppContext";

export default function ChatPage() {
  return (
    <Suspense fallback={null}>
      <ChatPageInner />
    </Suspense>
  );
}

function ChatPageInner() {
  const { currentUser, threadsForCurrentUser, messagesForThread, sendMessage } = useApp();
  const router = useRouter();
  const searchParams = useSearchParams();
  const threads = threadsForCurrentUser();
  const [activeThreadId, setActiveThreadId] = useState<string | null>(null);
  const [draft, setDraft] = useState("");

  useEffect(() => {
    const fromUrl = searchParams.get("thread");
    if (fromUrl) {
      setActiveThreadId(fromUrl);
    } else if (threads.length > 0 && !activeThreadId) {
      setActiveThreadId(threads[0].id);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams, threads.length]);

  if (!currentUser) {
    return (
      <div className="mx-auto max-w-md px-5 py-16 text-center">
        <span className="text-3xl">💬</span>
        <h1 className="mt-3 font-display text-2xl font-semibold text-ink">Log in to chat</h1>
        <p className="mt-2 text-sm text-ink-soft">Conversations open once you message someone about a listing.</p>
        <Link href="/login" className="mt-6 inline-block rounded-tag bg-ink px-4 py-2 text-sm font-medium text-paper">
          Log in
        </Link>
      </div>
    );
  }

  const activeThread = threads.find((t) => t.id === activeThreadId) || null;
  const messages = activeThread ? messagesForThread(activeThread.id) : [];

  function handleSend(e: FormEvent) {
    e.preventDefault();
    if (!activeThread || !draft.trim()) return;
    sendMessage(activeThread.id, draft);
    setDraft("");
  }

  return (
    <div className="mx-auto max-w-5xl px-5 py-12">
      <p className="font-tag text-xs uppercase tracking-[0.2em] text-ink-soft">Direct messages</p>
      <h1 className="mt-1 font-display text-3xl font-semibold text-ink">Chat</h1>

      {threads.length === 0 ? (
        <div className="claim-tag mt-8 flex flex-col items-center gap-2 px-6 py-14 text-center">
          <span className="text-3xl">📭</span>
          <p className="text-sm text-ink-soft">No conversations yet. Message someone from a listing page to start one.</p>
          <Link href="/lost-items" className="mt-2 rounded-tag bg-ink px-4 py-2 text-sm font-medium text-paper">
            Browse listings
          </Link>
        </div>
      ) : (
        <div className="mt-6 grid grid-cols-1 overflow-hidden rounded-tag border border-line md:grid-cols-[280px_1fr]">
          <div className="divide-y divide-line border-b border-line bg-white/40 md:border-b-0 md:border-r">
            {threads.map((t) => {
              const other = t.participantNames.find((n) => n !== currentUser.name) || t.participantNames[0];
              return (
                <button
                  key={t.id}
                  onClick={() => {
                    setActiveThreadId(t.id);
                    router.replace(`/chat?thread=${t.id}`);
                  }}
                  className={`flex w-full flex-col gap-0.5 px-4 py-3 text-left transition-colors ${
                    activeThreadId === t.id ? "bg-line/60" : "hover:bg-line/30"
                  }`}
                >
                  <span className="text-sm font-semibold text-ink">{other}</span>
                  <span className="truncate font-tag text-[11px] text-ink-soft">re: {t.itemTitle}</span>
                </button>
              );
            })}
          </div>

          <div className="flex h-[520px] flex-col bg-paper">
            {activeThread ? (
              <>
                <div className="border-b border-line px-5 py-3">
                  <p className="text-sm font-semibold text-ink">
                    {activeThread.participantNames.find((n) => n !== currentUser.name)}
                  </p>
                  <Link href={`/item/${activeThread.itemId}`} className="font-tag text-[11px] text-ink-soft underline">
                    re: {activeThread.itemTitle}
                  </Link>
                </div>
                <div className="flex-1 space-y-3 overflow-y-auto px-5 py-4">
                  {messages.map((m) => {
                    const mine = m.senderId === currentUser.id;
                    return (
                      <div key={m.id} className={`flex ${mine ? "justify-end" : "justify-start"}`}>
                        <div
                          className={`max-w-[75%] rounded-tag px-3 py-2 text-sm ${
                            mine ? "bg-ink text-paper" : "border border-line bg-white/60 text-ink"
                          }`}
                        >
                          <p>{m.text}</p>
                          <p className={`mt-1 font-tag text-[10px] ${mine ? "text-paper/70" : "text-ink-soft"}`}>
                            {new Date(m.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
                <form onSubmit={handleSend} className="flex gap-2 border-t border-line p-3">
                  <input
                    value={draft}
                    onChange={(e) => setDraft(e.target.value)}
                    placeholder="Write a message…"
                    className="flex-1 rounded-tag border border-line bg-white/70 px-3 py-2 text-sm outline-none focus:border-ink"
                  />
                  <button type="submit" className="rounded-tag bg-ink px-4 py-2 text-sm font-medium text-paper hover:bg-ink/90">
                    Send
                  </button>
                </form>
              </>
            ) : (
              <div className="flex flex-1 items-center justify-center text-sm text-ink-soft">Select a conversation</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
