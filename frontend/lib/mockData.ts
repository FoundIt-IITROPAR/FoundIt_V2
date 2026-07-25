import { ChatMessage, ChatThread, FoundItItem, FoundItUser, KarmaEvent } from "./types";

export const CATEGORIES = [
  "Electronics",
  "Bags & Wallets",
  "Keys",
  "ID & Documents",
  "Jewelry",
  "Clothing",
  "Pets",
  "Books",
  "Other",
];

export const seedUsers: FoundItUser[] = [
  {
    id: "u-priya",
    name: "Priya Sharma",
    email: "priya@example.com",
    password: "password123",
    karma: 140,
    joined: "2026-01-14",
  },
  {
    id: "u-arjun",
    name: "Arjun Mehta",
    email: "arjun@example.com",
    password: "password123",
    karma: 95,
    joined: "2026-02-02",
  },
];

export const seedItems: FoundItItem[] = [
  {
    id: "i-1001",
    kind: "lost",
    title: "Black leather wallet",
    category: "Bags & Wallets",
    description:
      "Slim black wallet with a metro card and a small photo inside. Last seen near the campus library entrance.",
    location: "Central Library, Gate 2",
    date: "2026-06-28",
    reporterId: "u-priya",
    reporterName: "Priya Sharma",
    status: "open",
    photoEmoji: "👛",
    createdAt: "2026-06-28T10:12:00.000Z",
  },
  {
    id: "i-1002",
    kind: "found",
    title: "Silver house keys with a red keychain",
    category: "Keys",
    description:
      "Found a set of three keys with a small red rubber keychain shaped like a star, near the bus stop.",
    location: "Sector 12 Bus Stop",
    date: "2026-06-29",
    reporterId: "u-arjun",
    reporterName: "Arjun Mehta",
    status: "open",
    photoEmoji: "🔑",
    createdAt: "2026-06-29T08:40:00.000Z",
  },
  {
    id: "i-1003",
    kind: "lost",
    title: "Blue hardcover notebook",
    category: "Books",
    description:
      "A blue notebook with handwritten class notes and a university logo sticker on the cover.",
    location: "Room 204, Academic Block B",
    date: "2026-06-30",
    reporterId: "u-arjun",
    reporterName: "Arjun Mehta",
    status: "open",
    photoEmoji: "📔",
    createdAt: "2026-06-30T14:05:00.000Z",
  },
  {
    id: "i-1004",
    kind: "found",
    title: "Wired earphones, white",
    category: "Electronics",
    description: "Found tangled white earphones on a bench outside the cafeteria.",
    location: "Cafeteria Courtyard",
    date: "2026-07-01",
    reporterId: "u-priya",
    reporterName: "Priya Sharma",
    status: "open",
    photoEmoji: "🎧",
    createdAt: "2026-07-01T09:20:00.000Z",
  },
  {
    id: "i-1005",
    kind: "found",
    title: "College ID card — name starts with 'R'",
    category: "ID & Documents",
    description: "Found near the parking lot. Handed to the security desk is not an option right now, holding onto it.",
    location: "North Parking Lot",
    date: "2026-07-02",
    reporterId: "u-arjun",
    reporterName: "Arjun Mehta",
    status: "open",
    photoEmoji: "🪪",
    createdAt: "2026-07-02T11:00:00.000Z",
  },
];

export const seedThreads: ChatThread[] = [
  {
    id: "t-1",
    itemId: "i-1002",
    itemTitle: "Silver house keys with a red keychain",
    participantIds: ["u-priya", "u-arjun"],
    participantNames: ["Priya Sharma", "Arjun Mehta"],
  },
];

export const seedMessages: ChatMessage[] = [
  {
    id: "m-1",
    threadId: "t-1",
    senderId: "u-priya",
    senderName: "Priya Sharma",
    text: "Hi! I think those might be my keys — the star keychain was a gift. Where can I collect them?",
    createdAt: "2026-06-29T09:00:00.000Z",
  },
  {
    id: "m-2",
    threadId: "t-1",
    senderId: "u-arjun",
    senderName: "Arjun Mehta",
    text: "I'm holding onto them at the Sector 12 security office. Can you describe the third key?",
    createdAt: "2026-06-29T09:12:00.000Z",
  },
];

export const seedKarma: KarmaEvent[] = [
  { id: "k-1", userId: "u-priya", amount: 50, reason: "Returned a found phone to its owner", createdAt: "2026-05-02T00:00:00.000Z" },
  { id: "k-2", userId: "u-priya", amount: 20, reason: "Reported a found item promptly", createdAt: "2026-06-01T00:00:00.000Z" },
  { id: "k-3", userId: "u-priya", amount: 70, reason: "5 reports verified by the community", createdAt: "2026-06-20T00:00:00.000Z" },
  { id: "k-4", userId: "u-arjun", amount: 30, reason: "Reported a found item promptly", createdAt: "2026-06-05T00:00:00.000Z" },
  { id: "k-5", userId: "u-arjun", amount: 65, reason: "Returned lost keys to their owner", createdAt: "2026-06-25T00:00:00.000Z" },
];
