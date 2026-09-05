"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { ChatMessage, ChatThread, FoundItItem, FoundItUser, ItemKind, KarmaEvent } from "@/lib/types";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
const USER_KEY = "foundit-current-user";

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
  signup: (name: string, email: string, password: string) => Promise<{ ok: boolean; error?: string }>;
  logout: () => void;
  addItem: (item: Omit<FoundItItem, "id" | "createdAt" | "reporterId" | "reporterName" | "status">) => Promise<void>;
  resolveItem: (itemId: string, karmaAwardTo?: string) => Promise<void>;
  itemsByKind: (kind: ItemKind) => FoundItItem[];
  awardKarma: (userId: string, amount: number, reason: string) => void;
  karmaForUser: (userId: string) => number;
  startOrGetThread: (itemId: string, itemTitle: string, otherUserId: string, otherUserName: string) => string;
  sendMessage: (threadId: string, text: string) => Promise<void>;
  threadsForCurrentUser: () => ChatThread[];
  messagesForThread: (threadId: string) => ChatMessage[];
}

const emptyState: PersistedState = { users: [], items: [], threads: [], messages: [], karmaEvents: [], currentUserId: null };
const AppContext = createContext<AppContextValue | null>(null);

async function api<T>(path: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: { "Content-Type": "application/json", ...(options?.headers || {}) },
  });
  const data = await response.json();
  if (!response.ok || data.status === false) throw new Error(data.message || "Request failed");
  return data;
}

function normalizeUser(raw: any): FoundItUser {
  return {
    id: String(raw._id || raw.id || raw.collegeid || raw.email),
    name: raw.name || raw.email?.split("@")[0] || raw.collegeid,
    email: raw.email || "",
    karma: Number(raw.karma_points ?? raw.karma ?? 0),
    joined: raw.createdAt || raw.joined || new Date().toISOString(),
  };
}

function normalizeItem(raw: any): FoundItItem {
  return {
    id: String(raw._id || raw.id),
    kind: raw.type === "found" ? "found" : "lost",
    title: raw.item_name || raw.title || "Untitled item",
    category: raw.item_category || raw.category || "Other",
    description: raw.item_description || raw.description || "",
    location: raw.location || "",
    date: raw.date || new Date().toISOString(),
    reporterId: String(raw.userid || raw.reporterId || ""),
    reporterName: raw.reporterName || raw.usercollegeid || raw.usermail || "Unknown user",
    status: raw.status === "resolved" ? "resolved" : "open",
    photoEmoji: raw.photo_emoji || "📦",
    photoUrl: raw.image_url || null,
    createdAt: raw.createdAt || raw.date || new Date().toISOString(),
  };
}

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<PersistedState>(emptyState);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const [itemData, userData] = await Promise.all([
          api<{ items: any[] }>("/items"),
          api<{ users: any[] }>("/users"),
        ]);
        const currentUserId = window.localStorage.getItem(USER_KEY);
        const karmaData = currentUserId ? await api<{ karma: number; events: any[] }>(`/karma/${currentUserId}`) : { karma: 0, events: [] };
        const conversationData = currentUserId ? await api<{ conversations: any[] }>(`/conversations/${currentUserId}`) : { conversations: [] };
        const threads = conversationData.conversations.map((conversation) => ({
          id: `${conversation.item_id}:${conversation.other_user_id}`,
          itemId: conversation.item_id,
          itemTitle: conversation.item_title,
          participantIds: [currentUserId as string, conversation.other_user_id],
          participantNames: [userData.users.find((user) => String(user._id) === currentUserId)?.name || "You", conversation.other_user_name],
        }));
        const loadedMessages = (await Promise.all(conversationData.conversations.map(async (conversation) => {
          const data = await api<{ messages: any[] }>(`/messages/${currentUserId}/${conversation.other_user_id}?item_id=${conversation.item_id}`);
          return data.messages.map((message) => ({
            id: String(message._id),
            threadId: `${conversation.item_id}:${conversation.other_user_id}`,
            senderId: message.sender_id,
            senderName: message.sender_id === currentUserId ? "You" : conversation.other_user_name,
            text: message.text,
            createdAt: message.timestamp,
          }));
        }))).flat();
        setState({
          ...emptyState,
          items: itemData.items.map(normalizeItem),
          users: userData.users.map(normalizeUser),
          currentUserId,
          threads,
          messages: loadedMessages,
          karmaEvents: karmaData.events.map((event) => ({
            id: String(event._id), userId: currentUserId || "", amount: event.amount,
            reason: event.reason, createdAt: event.createdAt,
          })),
        });
        if (currentUserId) {
          setState((current) => ({ ...current, users: current.users.map((user) => user.id === currentUserId ? { ...user, karma: karmaData.karma } : user) }));
        }
      } finally {
        setReady(true);
      }
    }
    load().catch(() => setReady(true));
  }, []);

  const currentUser = state.users.find((user) => user.id === state.currentUserId) || null;

  async function login(collegeid: string, password: string) {
    try {
      const data = await api<{ user: any }>("/login", {
        method: "POST",
        body: JSON.stringify({ collegeid, password }),
      });
      const user = normalizeUser(data.user);
      setState((s) => ({ ...s, currentUserId: user.id, users: [...s.users.filter((u) => u.id !== user.id), user] }));
      window.localStorage.setItem(USER_KEY, user.id);
      return { ok: true };
    } catch (error) {
      return { ok: false, error: error instanceof Error ? error.message : "Unable to log in" };
    }
  }

  async function signup(name: string, email: string, password: string) {
    try {
      const data = await api<{ user: any }>("/signup/direct", {
        method: "POST",
        body: JSON.stringify({ name, email, password }),
      });
      const user = normalizeUser(data.user);
      setState((s) => ({ ...s, users: [...s.users, user], currentUserId: user.id }));
      window.localStorage.setItem(USER_KEY, user.id);
      return { ok: true };
    } catch (error) {
      return { ok: false, error: error instanceof Error ? error.message : "Unable to sign up" };
    }
  }

  function logout() {
    window.localStorage.removeItem(USER_KEY);
    setState((s) => ({ ...s, currentUserId: null }));
  }

  async function addItem(item: Omit<FoundItItem, "id" | "createdAt" | "reporterId" | "reporterName" | "status">) {
    if (!currentUser) return;
    const data = await api<{ item: any }>("/items", {
      method: "POST",
      body: JSON.stringify({
        name: item.title,
        description: item.description,
        category: item.category,
        type: item.kind,
        location: item.location,
        date: item.date,
        userid: currentUser.id,
        usercollegeid: currentUser.id,
        usermail: currentUser.email,
        image_url: item.photoUrl,
      }),
    });
    const created = normalizeItem({ ...data.item, reporterName: currentUser.name, photo_emoji: item.photoEmoji });
    setState((s) => ({
      ...s,
      items: [created, ...s.items],
      users: s.users.map((u) => u.id === currentUser.id ? { ...u, karma: u.karma + (item.kind === "found" ? 15 : 5) } : u),
    }));
  }

  async function resolveItem(itemId: string) {
    const form = new FormData();
    form.set("status", "resolved");
    const response = await fetch(`${API_URL}/items/${itemId}/resolve`, { method: "POST", body: form });
    if (!response.ok) throw new Error("Item could not be resolved");
    setState((s) => ({ ...s, items: s.items.map((item) => item.id === itemId ? { ...item, status: "resolved" } : item) }));
  }

  function itemsByKind(kind: ItemKind) {
    return state.items.filter((item) => item.kind === kind).sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }

  function awardKarma() {}
  function karmaForUser(userId: string) { return state.users.find((user) => user.id === userId)?.karma || 0; }

  function startOrGetThread(itemId: string, itemTitle: string, otherUserId: string, otherUserName: string) {
    if (!currentUser) return "";
    const existing = state.threads.find((thread) => thread.itemId === itemId && thread.participantIds.includes(otherUserId) && thread.participantIds.includes(currentUser.id));
    if (existing) return existing.id;
    const id = `${itemId}:${otherUserId}`;
    setState((s) => ({ ...s, threads: [...s.threads, { id, itemId, itemTitle, participantIds: [currentUser.id, otherUserId], participantNames: [currentUser.name, otherUserName] }] }));
    return id;
  }

  async function sendMessage(threadId: string, text: string) {
    const thread = state.threads.find((value) => value.id === threadId);
    if (!currentUser || !thread || !text.trim()) return;
    const receiverId = thread.participantIds.find((id) => id !== currentUser.id);
    if (!receiverId) return;
    const form = new FormData();
    form.set("sender_id", currentUser.id);
    form.set("receiver_id", receiverId);
    form.set("item_id", thread.itemId);
    form.set("text", text.trim());
    const response = await fetch(`${API_URL}/messages/send`, { method: "POST", body: form });
    if (!response.ok) throw new Error("Message could not be sent");
    setState((s) => ({ ...s, messages: [...s.messages, { id: `${Date.now()}`, threadId, senderId: currentUser.id, senderName: currentUser.name, text: text.trim(), createdAt: new Date().toISOString() }] }));
  }

  function threadsForCurrentUser() { return currentUser ? state.threads.filter((thread) => thread.participantIds.includes(currentUser.id)) : []; }
  function messagesForThread(threadId: string) { return state.messages.filter((message) => message.threadId === threadId).sort((a, b) => a.createdAt.localeCompare(b.createdAt)); }

  if (!ready) return null;
  return <AppContext.Provider value={{ ...state, currentUser, login, signup, logout, addItem, resolveItem, itemsByKind, awardKarma, karmaForUser, startOrGetThread, sendMessage, threadsForCurrentUser, messagesForThread }}>{children}</AppContext.Provider>;
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) throw new Error("useApp must be used within AppProvider");
  return context;
}
