"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import {
  seedItems,
  seedKarma,
  seedMessages,
  seedThreads,
  seedUsers,
} from "@/lib/mockData";
import {
  ChatMessage,
  ChatThread,
  FoundItItem,
  FoundItUser,
  ItemKind,
  KarmaEvent,
} from "@/lib/types";
import bcrypt from "bcryptjs";

const STORAGE_KEY = "foundit-state-v1";
const API_URL = "http://localhost:8000";

interface PersistedState {
  users: FoundItUser[];
  items: FoundItItem[];
  threads: ChatThread[];
  messages: ChatMessage[];
  karmaEvents: KarmaEvent[];
  currentUserId: string | null;
}

interface AppContextValue extends PersistedState {
  currentUser: FoundItUser | null;
  login: (collegeid: string, password: string) => Promise<{ ok: boolean; error?: string }>;
  signup: (name: string, email: string, password: string) => { ok: boolean; error?: string };
  logout: () => void;
  addItem: (item: Omit<FoundItItem, "id" | "createdAt" | "reporterId" | "reporterName" | "status">) => void;
  resolveItem: (itemId: string, karmaAwardTo?: string) => void;
  itemsByKind: (kind: ItemKind) => FoundItItem[];
  awardKarma: (userId: string, amount: number, reason: string) => void;
  karmaForUser: (userId: string) => number;
  startOrGetThread: (itemId: string, itemTitle: string, otherUserId: string, otherUserName: string) => string;
  sendMessage: (threadId: string, text: string) => void;
  threadsForCurrentUser: () => ChatThread[];
  messagesForThread: (threadId: string) => ChatMessage[];
}

const defaultState: PersistedState = {
  users: seedUsers,
  items: seedItems,
  threads: seedThreads,
  messages: seedMessages,
  karmaEvents: seedKarma,
  currentUserId: null,
};

const AppContext = createContext<AppContextValue | null>(null);

function uid(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
}

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<PersistedState>(defaultState);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) {
        setState(JSON.parse(raw));
      }
    } catch {
      // ignore corrupt storage, fall back to defaults
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state, hydrated]);

  const currentUser = state.users.find((u) => u.id === state.currentUserId) || null;

  async function login(collegeid: string, password: string) {
    const passwordHash = await bcrypt.hash(password, 12);
    const response = await fetch(`${API_URL}/login`,{
      method: "GET",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ collegeid, passwordHash })
  });

    const data = await response.json();

    if (data["status"]) {
      setState((s) => ({...s, currentUserId: data["_id"] }));
      return {ok: true};
    }
    else if (!data["status"]) {
      return {ok : false, error: data["message"]};
    }}

  function signup(name: string, email: string, password: string) {
    if (state.users.some((u) => u.email.toLowerCase() === email.toLowerCase())) {
      return { ok: false, error: "An account with that email already exists." };
    }
    const newUser: FoundItUser = {
      id: uid("u"),
      name,
      email,
      password,
      karma: 10,
      joined: new Date().toISOString().slice(0, 10),
    };
    setState((s) => ({
      ...s,
      users: [...s.users, newUser],
      currentUserId: newUser.id,
      karmaEvents: [
        ...s.karmaEvents,
        { id: uid("k"), userId: newUser.id, amount: 10, reason: "Welcome bonus for joining FoundIt", createdAt: new Date().toISOString() },
      ],
    }));
    return { ok: true };
  }

  function logout() {
    setState((s) => ({ ...s, currentUserId: null }));
  }

  function addItem(item: Omit<FoundItItem, "id" | "createdAt" | "reporterId" | "reporterName" | "status">) {
    if (!currentUser) return;
    const newItem: FoundItItem = {
      ...item,
      id: uid("i"),
      createdAt: new Date().toISOString(),
      reporterId: currentUser.id,
      reporterName: currentUser.name,
      status: "open",
    };
    setState((s) => ({ ...s, items: [newItem, ...s.items] }));
    awardKarma(currentUser.id, item.kind === "found" ? 15 : 5, item.kind === "found" ? "Reported a found item promptly" : "Reported a lost item");
  }

  function resolveItem(itemId: string, karmaAwardTo?: string) {
    setState((s) => ({
      ...s,
      items: s.items.map((it) => (it.id === itemId ? { ...it, status: "resolved" } : it)),
    }));
    if (karmaAwardTo) {
      awardKarma(karmaAwardTo, 50, "Helped reunite an item with its owner");
    }
  }

  function itemsByKind(kind: ItemKind) {
    return state.items.filter((i) => i.kind === kind).sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
  }

  function awardKarma(userId: string, amount: number, reason: string) {
    setState((s) => ({
      ...s,
      users: s.users.map((u) => (u.id === userId ? { ...u, karma: u.karma + amount } : u)),
      karmaEvents: [
        { id: uid("k"), userId, amount, reason, createdAt: new Date().toISOString() },
        ...s.karmaEvents,
      ],
    }));
  }

  function karmaForUser(userId: string) {
    const user = state.users.find((u) => u.id === userId);
    return user ? user.karma : 0;
  }

  function startOrGetThread(itemId: string, itemTitle: string, otherUserId: string, otherUserName: string) {
    if (!currentUser) return "";
    const existing = state.threads.find(
      (t) => t.itemId === itemId && t.participantIds.includes(currentUser.id) && t.participantIds.includes(otherUserId)
    );
    if (existing) return existing.id;
    const newThread: ChatThread = {
      id: uid("t"),
      itemId,
      itemTitle,
      participantIds: [currentUser.id, otherUserId],
      participantNames: [currentUser.name, otherUserName],
    };
    setState((s) => ({ ...s, threads: [...s.threads, newThread] }));
    return newThread.id;
  }

  function sendMessage(threadId: string, text: string) {
    if (!currentUser || !text.trim()) return;
    const message: ChatMessage = {
      id: uid("m"),
      threadId,
      senderId: currentUser.id,
      senderName: currentUser.name,
      text: text.trim(),
      createdAt: new Date().toISOString(),
    };
    setState((s) => ({ ...s, messages: [...s.messages, message] }));
  }

  function threadsForCurrentUser() {
    if (!currentUser) return [];
    return state.threads.filter((t) => t.participantIds.includes(currentUser.id));
  }

  function messagesForThread(threadId: string) {
    return state.messages
      .filter((m) => m.threadId === threadId)
      .sort((a, b) => (a.createdAt > b.createdAt ? 1 : -1));
  }

  const value: AppContextValue = {
    ...state,
    currentUser,
    login,
    signup,
    logout,
    addItem,
    resolveItem,
    itemsByKind,
    awardKarma,
    karmaForUser,
    startOrGetThread,
    sendMessage,
    threadsForCurrentUser,
    messagesForThread,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
}
