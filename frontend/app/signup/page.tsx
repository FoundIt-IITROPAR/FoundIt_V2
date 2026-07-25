"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useApp } from "@/context/AppContext";

export default function SignupPage() {
  const { signup } = useApp();
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (password.length < 6) {
      setError("Password should be at least 6 characters.");
      return;
    }
    const result = signup(name, email, password);
    if (!result.ok) {
      setError(result.error || "Something went wrong.");
      return;
    }
    router.push("/dashboard");
  }

  return (
    <div className="mx-auto flex max-w-md flex-col px-5 py-16">
      <p className="font-tag text-xs uppercase tracking-[0.2em] text-ink-soft">Join the desk</p>
      <h1 className="mt-2 font-display text-3xl font-semibold text-ink">Create your account</h1>
      <p className="mt-2 text-sm text-ink-soft">Get 10 welcome karma points the moment you sign up.</p>

      <form onSubmit={handleSubmit} className="claim-tag mt-8 flex flex-col gap-4 p-6">
        {error && (
          <p className="rounded-tag bg-rust-light px-3 py-2 text-sm text-rust-dark">{error}</p>
        )}
        <label className="flex flex-col gap-1 text-sm font-medium text-ink">
          Full name
          <input
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="rounded-tag border border-line bg-paper px-3 py-2 text-sm text-ink outline-none focus:border-ink"
            placeholder="Jordan Lee"
          />
        </label>
        <label className="flex flex-col gap-1 text-sm font-medium text-ink">
          Email
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="rounded-tag border border-line bg-paper px-3 py-2 text-sm text-ink outline-none focus:border-ink"
            placeholder="you@example.com"
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
            placeholder="At least 6 characters"
          />
        </label>
        <button type="submit" className="mt-2 rounded-tag bg-amber px-4 py-2.5 font-semibold text-ink transition-colors hover:bg-amber-dark">
          Create account
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-ink-soft">
        Already have an account?{" "}
        <Link href="/login" className="font-medium text-ink underline">
          Log in
        </Link>
      </p>
    </div>
  );
}
