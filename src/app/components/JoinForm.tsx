"use client";

import { useState } from "react";

type FormState =
  | { kind: "idle" }
  | { kind: "submitting" }
  | { kind: "success"; message: string; stubbed?: boolean }
  | { kind: "error"; message: string };

export default function JoinForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [tier, setTier] = useState("Tiger Pride");
  const [phone, setPhone] = useState("");
  const [note, setNote] = useState("");
  const [state, setState] = useState<FormState>({ kind: "idle" });

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setState({ kind: "submitting" });
    try {
      const res = await fetch("/api/springly/member", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, tier, phone, note }),
      });
      const data = (await res.json()) as {
        ok: boolean;
        stubbed?: boolean;
        message?: string;
        error?: string;
      };
      if (!res.ok || !data.ok) {
        setState({
          kind: "error",
          message: data.error ?? "Something went wrong. Please try again.",
        });
        return;
      }
      setState({
        kind: "success",
        stubbed: data.stubbed,
        message:
          data.message ??
          "Thanks — your membership has been submitted. A board member will be in touch.",
      });
      setName("");
      setEmail("");
      setPhone("");
      setNote("");
    } catch {
      setState({
        kind: "error",
        message: "Network error. Please try again.",
      });
    }
  }

  return (
    <form id="join" className="slotab-join-form" onSubmit={onSubmit} noValidate>
      <div className="slotab-join-field">
        <label htmlFor="join-name">Full name *</label>
        <input
          id="join-name"
          type="text"
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          disabled={state.kind === "submitting"}
        />
      </div>
      <div className="slotab-join-field">
        <label htmlFor="join-email">Email *</label>
        <input
          id="join-email"
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={state.kind === "submitting"}
        />
      </div>
      <div className="slotab-join-field">
        <label htmlFor="join-phone">Phone (optional)</label>
        <input
          id="join-phone"
          type="tel"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          disabled={state.kind === "submitting"}
        />
      </div>
      <div className="slotab-join-field">
        <label htmlFor="join-tier">Membership tier *</label>
        <select
          id="join-tier"
          value={tier}
          onChange={(e) => setTier(e.target.value)}
          disabled={state.kind === "submitting"}
          required
        >
          <option>Tiger Pride</option>
          <option>Champion</option>
          <option>Coach</option>
          <option>Alumni</option>
        </select>
      </div>
      <div className="slotab-join-field wide">
        <label htmlFor="join-note">
          Anything we should know? (optional)
        </label>
        <textarea
          id="join-note"
          rows={3}
          value={note}
          onChange={(e) => setNote(e.target.value)}
          disabled={state.kind === "submitting"}
        />
      </div>
      <div className="slotab-join-field wide">
        <button
          type="submit"
          className="slotab-btn dark"
          disabled={state.kind === "submitting"}
        >
          {state.kind === "submitting" ? "Submitting..." : "Join SLOTAB"}
        </button>
        {state.kind === "success" && (
          <p
            role="status"
            style={{
              marginTop: "1rem",
              padding: "0.85rem 1rem",
              background: "#e7f5e6",
              border: "1px solid #6ea76b",
              color: "#2e6a2e",
              fontSize: "0.95rem",
            }}
          >
            ✓ {state.message}
            {state.stubbed && (
              <>
                <br />
                <small style={{ color: "#666" }}>
                  (stub response — Springly is not connected yet)
                </small>
              </>
            )}
          </p>
        )}
        {state.kind === "error" && (
          <p
            role="alert"
            style={{
              marginTop: "1rem",
              padding: "0.85rem 1rem",
              background: "#fdecec",
              border: "1px solid #c9302c",
              color: "#a0231f",
              fontSize: "0.95rem",
            }}
          >
            {state.message}
          </p>
        )}
      </div>
    </form>
  );
}
