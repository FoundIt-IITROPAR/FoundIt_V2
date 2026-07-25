export type ItemStatus = "open" | "resolved";
export type ItemKind = "lost" | "found";

export interface FoundItUser {
  id: string;
  name: string;
  email: string;
  password: string; // demo only — never store plaintext in a real backend
  karma: number;
  joined: string; // ISO date
}

export interface FoundItItem {
  id: string;
  kind: ItemKind;
  title: string;
  category: string;
  description: string;
  location: string;
  date: string; // ISO date the item was lost/found
  reporterId: string;
  reporterName: string;
  status: ItemStatus;
  photoEmoji: string; // fallback icon when no photo is uploaded
  photoUrl?: string | null;
  createdAt: string;
}

export interface ChatMessage {
  id: string;
  threadId: string;
  senderId: string;
  senderName: string;
  text: string;
  createdAt: string;
}

export interface ChatThread {
  id: string;
  itemId: string;
  itemTitle: string;
  participantIds: string[];
  participantNames: string[];
}

export interface KarmaEvent {
  id: string;
  userId: string;
  amount: number;
  reason: string;
  createdAt: string;
}
