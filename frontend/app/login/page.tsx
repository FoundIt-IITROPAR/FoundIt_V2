"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useApp } from "@/context/AppContext";

export default function LoginPage() {
  const { login } = useApp();
  const router = useRouter();
  const [collegeid, setCollegeid] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const result = await login(collegeid, password);
    if (!result.ok) {
      setError(result.error || "Something went wrong.");
      return;
    }
    router.push("/dashboard");
  }

  return (
    <div className="mx-auto flex max-w-md flex-col px-5 py-16">
      <p className="font-tag text-xs uppercase tracking-[0.2em] text-ink-soft">Welcome back</p>
      <h1 className="mt-2 font-display text-3xl font-semibold text-ink">Log in to FoundIt</h1>
      <p className="mt-2 text-sm text-ink-soft">
        Try the demo account: <span className="font-tag">priya@example.com</span> / <span className="font-tag">password123</span>
      </p>

      <form onSubmit={handleSubmit} className="claim-tag mt-8 flex flex-col gap-4 p-6">
        {error && (
          <p className="rounded-tag bg-rust-light px-3 py-2 text-sm text-rust-dark">{error}</p>
        )}
        <label className="flex flex-col gap-1 text-sm font-medium text-ink">
          College ID
          <input
            type="collegeid"
            required
            value={collegeid}
            onChange={(e) => setCollegeid(e.target.value)}
            className="rounded-tag border border-line bg-paper px-3 py-2 text-sm text-ink outline-none focus:border-ink"
            placeholder=""
          />
        </label>
        <label className="flex flex-col gap-1 text-sm font-medium text-ink">
          Password
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="rounded-tag border border-line bg-paper px-3 py-2 text-sm text-ink outline-none focus:border-ink"
            placeholder=""
          />
        </label>
        <button type="submit" className="mt-2 rounded-tag bg-ink px-4 py-2.5 font-medium text-paper transition-colors hover:bg-ink/90">
          Log in
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-ink-soft">
        New to FoundIt?{" "}
        <Link href="/signup" className="font-medium text-ink underline">
          Create an account
        </Link>
      </p>
    </div>
  );
}
