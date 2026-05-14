"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import PageHeader from "../../components/PageHeader";

export default function BoardLoginPage() {
  const search = useSearchParams();
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const notConfigured = search.get("notconfigured") === "1";
  const next = search.get("next") || "/board";

  useEffect(() => {
    if (notConfigured) {
      setError(
        "Board Hub isn't configured yet. Ask Erik to set the BOARD_PASSWORD env var on Vercel.",
      );
    }
  }, [notConfigured]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const res = await fetch("/api/board/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password, next }),
      });
      const data = (await res.json()) as {
        ok?: boolean;
        error?: string;
        next?: string;
      };
      if (!res.ok || !data.ok) {
        setError(data.error || "Login failed.");
        setSubmitting(false);
        return;
      }
      router.push(data.next || "/board");
      router.refresh();
    } catch {
      setError("Network error — please try again.");
      setSubmitting(false);
    }
  }

  return (
    <>
      <PageHeader kicker="Board Only" title="Board Hub" />
      <section className="slotab-section">
        <div
          className="slotab-container"
          style={{ maxWidth: "32rem", margin: "0 auto" }}
        >
          <p style={{ marginBottom: "1.25rem" }}>
            Private hub for the SLOTAB Board. Enter the shared board
            password to continue. If you don&apos;t have it, ask the
            current Board President.
          </p>
          <form onSubmit={onSubmit}>
            <label
              htmlFor="board-password"
              style={{
                display: "block",
                fontWeight: 600,
                marginBottom: "0.4rem",
              }}
            >
              Board password
            </label>
            <input
              id="board-password"
              type="password"
              autoFocus
              required
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={submitting || notConfigured}
              style={{
                width: "100%",
                padding: "0.75rem 0.9rem",
                fontSize: "1rem",
                border: "2px solid var(--slotab-black)",
                borderRadius: 4,
                background: "#fff",
                marginBottom: "1rem",
              }}
            />
            {error && (
              <div
                role="alert"
                style={{
                  background: "#fff0f0",
                  border: "2px solid #c0392b",
                  color: "#9b2818",
                  padding: "0.75rem 1rem",
                  borderRadius: 4,
                  marginBottom: "1rem",
                  fontSize: "0.95rem",
                }}
              >
                {error}
              </div>
            )}
            <button
              type="submit"
              className="slotab-btn"
              disabled={submitting || notConfigured || !password}
              style={{ width: "100%" }}
            >
              {submitting ? "Checking…" : "Enter Board Hub"}
            </button>
          </form>
        </div>
      </section>
    </>
  );
}

export const dynamic = "force-dynamic";
