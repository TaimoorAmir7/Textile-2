"use client";

import { FormEvent, KeyboardEvent, useEffect, useRef, useState } from "react";
import { readCatalog } from "@/lib/api";
import { USTAAD_OPEN_EVENT } from "@/lib/ustaad";

type ChatMessage = {
  role: "user" | "assistant";
  content: string;
};

const WELCOME_MESSAGE: ChatMessage = {
  role: "assistant",
  content:
    "Assalam-o-alaikum. I’m Ustaad, your mill knowledge assistant. Ask me about Woven or Knits / Hosiery production, quality checks, the six AI domains, or the alerts currently requiring attention.",
};

const SUGGESTIONS = [
  "Which critical alerts need attention?",
  "How should I inspect shade variation?",
  "Explain the six-stage production route",
];

function errorMessage(status: number, responseMessage?: string) {
  if (responseMessage) return responseMessage;
  if (status === 429) return "Ustaad is receiving too many requests. Please wait a moment and try again.";
  return "Ustaad could not respond just now. Please try again.";
}

function Words({ text }: { text: string }) {
  const words = text.split(/\s+/).filter(Boolean);
  return (
    <span
      className="flex w-full min-w-0 flex-wrap gap-x-[0.35em] gap-y-1"
      style={{ fontFamily: 'system-ui, "Segoe UI", Roboto, Helvetica, Arial, sans-serif' }}
    >
      {words.map((word, index) => (
        <span key={`${index}-${word}`} className="max-w-full [overflow-wrap:anywhere]">
          {word}
        </span>
      ))}
    </span>
  );
}

function ChatRichText({ content }: { content: string }) {
  const lines = content.replace(/\r/g, "").split(/\n+/).map((line) => line.trim()).filter(Boolean);

  return (
    <div className="space-y-2.5">
      {lines.map((line, index) => {
        const heading = line.match(/\*\*(.+?)\*\*/);
        if (!heading) {
          return (
            <p key={index}>
              <Words text={line} />
            </p>
          );
        }

        const title = heading[1].replace(/:$/, "").trim();
        const number = line.match(/^\s*(\d+)\.\s*/)?.[1];
        const rest = line.replace(heading[0], "").replace(/^\s*\d+\.\s*/, "").trim();

        return (
          <div key={index} className="space-y-1">
            <p className="font-headline text-sm font-semibold">
              <Words text={number ? `${number}. ${title}` : title} />
            </p>
            {rest ? (
              <p>
                <Words text={rest} />
              </p>
            ) : null}
          </div>
        );
      })}
    </div>
  );
}

export function UstaadChat() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([WELCOME_MESSAGE]);
  const [draft, setDraft] = useState("");
  const [sending, setSending] = useState(false);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleOpen = () => setOpen(true);
    window.addEventListener(USTAAD_OPEN_EVENT, handleOpen);
    return () => window.removeEventListener(USTAAD_OPEN_EVENT, handleOpen);
  }, []);

  useEffect(() => {
    if (!open) return;
    const focusTimer = window.setTimeout(() => inputRef.current?.focus(), 120);
    const handleKeyDown = (event: globalThis.KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.clearTimeout(focusTimer);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  useEffect(() => {
    if (open) endRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages, sending, open]);

  async function sendMessage(text: string) {
    const content = text.trim();
    if (!content || sending) return;

    const nextMessages: ChatMessage[] = [...messages, { role: "user", content }];
    setMessages(nextMessages);
    setDraft("");
    setSending(true);

    try {
      const alertStatuses = readCatalog<Array<{ id: string; status: string }>>("/api/alerts")
        .map((alert) => ({ id: alert.id, status: alert.status }));
      const response = await fetch("/api/ustaad", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: nextMessages.slice(-12), alertStatuses }),
      });
      const payload = (await response.json().catch(() => ({}))) as { message?: string; error?: string };
      if (!response.ok) throw new Error(errorMessage(response.status, payload.error));
      if (!payload.message) throw new Error("Ustaad returned an empty response. Please try again.");
      setMessages((current) => [...current, { role: "assistant", content: payload.message! }]);
    } catch (error) {
      setMessages((current) => [
        ...current,
        {
          role: "assistant",
          content: error instanceof Error ? error.message : "Ustaad could not respond just now. Please try again.",
        },
      ]);
    } finally {
      setSending(false);
    }
  }

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    void sendMessage(draft);
  }

  function handleInputKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      void sendMessage(draft);
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={`fixed right-4 bottom-4 z-[60] h-12 w-12 items-center justify-center rounded-full border border-secondary/30 bg-primary text-on-primary shadow-xl transition-transform hover:scale-105 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-secondary sm:right-5 sm:bottom-5 ${open ? "hidden" : "flex"}`}
        aria-label="Open Ustaad mill knowledge assistant"
        title="Ask Ustaad"
      >
        <span className="material-symbols-outlined text-[24px]">support_agent</span>
        <span className="absolute top-0 right-0 h-3 w-3 rounded-full border-2 border-background bg-secondary" />
      </button>

      <aside
        role="dialog"
        aria-modal="false"
        aria-labelledby="ustaad-title"
        className={`${open ? "flex" : "hidden"} fixed right-3 bottom-3 z-[60] h-[min(620px,calc(100vh-2rem))] w-[min(410px,calc(100vw-1.5rem))] min-w-0 flex-col overflow-hidden rounded-xl border border-outline-variant bg-surface-container-lowest font-body shadow-2xl sm:right-5 sm:bottom-5`}
      >
          <header className="flex items-center justify-between border-b border-outline-variant bg-primary px-4 py-3 text-on-primary">
            <div className="flex min-w-0 items-center gap-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-secondary text-on-secondary">
                <span className="material-symbols-outlined text-[22px]">support_agent</span>
              </span>
              <div className="min-w-0">
                <h2 id="ustaad-title" className="font-headline truncate text-base font-semibold">Ustaad</h2>
                <p className="truncate text-xs text-on-primary/70">Mill knowledge assistant</p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setMessages([WELCOME_MESSAGE])}
                className="rounded p-2 text-on-primary/75 hover:bg-white/10 hover:text-on-primary"
                aria-label="Clear conversation"
                title="Clear conversation"
              >
                <span className="material-symbols-outlined text-[20px]">refresh</span>
              </button>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="rounded p-2 text-on-primary/75 hover:bg-white/10 hover:text-on-primary"
                aria-label="Close Ustaad"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>
          </header>

          <div className="min-h-0 min-w-0 flex-1 space-y-4 overflow-y-auto bg-surface-container-low p-4" aria-live="polite">
            {messages.map((message, index) => (
              <div key={`${message.role}-${index}`} className={`flex w-full min-w-0 ${message.role === "user" ? "justify-end" : "justify-start"}`}>
                <div
                  className={`w-full max-w-[88%] min-w-0 rounded-xl px-3.5 py-3 font-body text-sm leading-relaxed ${
                    message.role === "user"
                      ? "rounded-br-sm bg-primary text-on-primary"
                      : "rounded-bl-sm border border-outline-variant bg-surface-container-lowest text-on-surface"
                  } ${index === messages.length - 1 && message.role === "assistant" ? "anim-fade-up" : ""}`}
                >
                  {message.role === "assistant" ? <ChatRichText content={message.content} /> : <Words text={message.content} />}
                </div>
              </div>
            ))}

            {messages.length === 1 ? (
              <div className="space-y-2 pt-1">
                <p className="font-label-caps text-on-surface-variant">Suggested questions</p>
                {SUGGESTIONS.map((suggestion) => (
                  <button
                    key={suggestion}
                    type="button"
                    onClick={() => void sendMessage(suggestion)}
                    className="block w-full rounded-lg border border-outline-variant bg-surface-container-lowest px-3 py-2.5 text-left text-xs text-on-surface-variant hover:border-secondary hover:text-primary"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            ) : null}

            {sending ? (
              <div className="flex justify-start">
                <div className="flex items-center gap-1 rounded-xl rounded-bl-sm border border-outline-variant bg-surface-container-lowest px-4 py-3" aria-label="Ustaad is thinking">
                  <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-secondary" />
                  <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-secondary [animation-delay:150ms]" />
                  <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-secondary [animation-delay:300ms]" />
                </div>
              </div>
            ) : null}
            <div ref={endRef} />
          </div>

          <form onSubmit={submit} className="border-t border-outline-variant bg-surface-container-lowest p-3">
            <div className="flex items-end gap-2 rounded-lg border border-outline-variant bg-surface-container-low px-3 py-2 focus-within:border-secondary">
              <textarea
                ref={inputRef}
                value={draft}
                onChange={(event) => setDraft(event.target.value)}
                onKeyDown={handleInputKeyDown}
                rows={1}
                maxLength={2000}
                placeholder="Ask about quality, stages or alerts…"
                aria-label="Message Ustaad"
                className="max-h-28 min-h-7 flex-1 resize-none border-0 bg-transparent p-0 text-sm text-on-surface outline-none placeholder:text-outline focus:ring-0"
              />
              <button
                type="submit"
                disabled={!draft.trim() || sending}
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-secondary text-on-secondary disabled:cursor-not-allowed disabled:opacity-40"
                aria-label="Send message"
              >
                <span className="material-symbols-outlined text-[19px]">arrow_upward</span>
              </button>
            </div>
            <p className="mt-2 text-center text-[10px] text-outline">Verify quality decisions against the approved production standard.</p>
          </form>
      </aside>
    </>
  );
}
