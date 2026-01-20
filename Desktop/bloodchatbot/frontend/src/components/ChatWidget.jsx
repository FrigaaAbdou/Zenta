import { useEffect, useMemo, useRef, useState } from "react";
import {
  Droplet,
  Hand,
  SendHorizontal,
  UserRound,
} from "lucide-react";
import { sendChatMessage } from "../lib/chatClient.js";

const quickReplies = [
  "Qui peut donner ?",
  "Délais entre deux dons ?",
  "Est-ce douloureux ?",
  "Quels sont les risques ?",
];

const timeFormatter = new Intl.DateTimeFormat("fr-FR", {
  hour: "2-digit",
  minute: "2-digit",
});

function createMessage(sender, text, meta = {}) {
  return {
    id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
    sender,
    text,
    time: new Date().toISOString(),
    ...meta,
  };
}

function formatTime(value) {
  return timeFormatter.format(new Date(value));
}

export function ChatWidget({ onClose }) {
  const [language, setLanguage] = useState("FR");
  const [messages, setMessages] = useState(() => [
    createMessage(
      "bot",
      "Bonjour ! Je suis Dona, l’assistante fictive de ce prototype pour le don du sang. Comment puis-je t’aider à explorer le concept aujourd’hui ?",
      { variant: "intro" },
    ),
  ]);
  const [input, setInput] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState("");

  const sessionId = useMemo(() => {
    if (typeof crypto !== "undefined" && crypto.randomUUID) {
      return `web-${crypto.randomUUID()}`;
    }
    return `web-${Date.now()}-${Math.random().toString(16).slice(2)}`;
  }, []);

  const scrollContainerRef = useRef(null);

  const scrollToBottom = () => {
    requestAnimationFrame(() => {
      if (scrollContainerRef.current) {
        scrollContainerRef.current.scrollTop =
          scrollContainerRef.current.scrollHeight;
      }
    });
  };

  const handleSend = async (text) => {
    const trimmed = text.trim();
    if (!trimmed || isSending) {
      return;
    }

    setError("");
    const userMessage = createMessage("user", trimmed);
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsSending(true);

    try {
      const response = await sendChatMessage({
        message: trimmed,
        userId: sessionId,
      });

      if (response?.lang) {
        setLanguage(response.lang.toUpperCase() === "AR" ? "AR" : "FR");
      }

      const botReply = response?.reply
        ? response.reply
        : "Je n’ai pas réussi à obtenir une réponse pour le moment.";

      const botMessage = createMessage("bot", botReply, {
        sensitive: Boolean(response?.sensitive),
      });
      setMessages((prev) => [...prev, botMessage]);
    } catch (err) {
      console.error("chat send error:", err);
      setError(
        "Impossible de contacter Dona pour le moment. Réessaie dans un instant.",
      );
      const failureMessage = createMessage(
        "bot",
        "Oups, je rencontre un problème technique. Réessaye un peu plus tard.",
      );
      setMessages((prev) => [...prev, failureMessage]);
    } finally {
      setIsSending(false);
    }
  };

  const handleQuickReply = (reply) => {
    if (isSending) return;
    handleSend(reply);
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    handleSend(input);
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isSending]);

  return (
    <div className="fixed bottom-24 right-6 flex w-[22rem] max-h-[85vh] max-w-[92vw] flex-col overflow-hidden rounded-[28px] border border-rose-100 bg-white shadow-[0_32px_80px_rgba(225,29,72,0.28)] sm:right-8 sm:w-[24rem] md:bottom-28 md:w-[26rem]">
      <header className="flex items-center justify-between bg-gradient-to-r from-rose-600 via-rose-500 to-rose-400 px-5 py-4 text-white">
        <div className="flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-3xl bg-white/15 shadow-inner shadow-rose-500/50">
            <Droplet className="h-6 w-6 text-white" strokeWidth={1.8} />
          </span>
          <div>
            <p className="text-xs uppercase tracking-[0.24em] text-rose-100">
              SangBot
            </p>
            <h2 className="text-[15px] font-semibold leading-tight">Dona</h2>
            <p className="text-[11px] text-white/85">
              Assistante virtuelle (prototype)
            </p>
            <p className="mt-1 flex items-center gap-2 text-[10px] text-rose-50">
              <span className="inline-flex h-2 w-2 rounded-full bg-emerald-300 shadow-[0_0_0_4px_rgba(16,185,129,0.35)]" />
              En ligne — {language} / {language === "FR" ? "AR" : "FR"} disponibles
            </p>
          </div>
        </div>
        <div className="flex flex-col items-end gap-2">
          <div className="flex rounded-full bg-white/15 p-1 text-[11px] font-semibold shadow-inner shadow-rose-500/50">
            {["FR", "AR"].map((code) => (
              <span
                key={code}
                className={`rounded-full px-3 py-1.5 ${
                  language === code
                    ? "bg-white text-rose-500 shadow-sm shadow-rose-300/70"
                    : "text-white/70"
                }`}
              >
                {code}
              </span>
            ))}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-white/15 text-sm text-white/85 transition hover:bg-white/25 hover:text-white"
            aria-label="Fermer le chat"
          >
            x
          </button>
        </div>
      </header>

      <div
        ref={scrollContainerRef}
        className="flex flex-1 flex-col gap-4 overflow-y-auto bg-gradient-to-b from-white via-rose-50/70 to-white px-5 py-6"
      >
        {messages.map((message) => {
          const isUser = message.sender === "user";
          return (
            <div
              key={message.id}
              className={`flex items-start gap-3 ${isUser ? "flex-row-reverse" : ""}`}
            >
              <span
                className={`flex h-10 w-10 items-center justify-center rounded-3xl shadow-inner ${
                  isUser
                    ? "bg-slate-900 shadow-slate-700"
                    : "bg-rose-100 shadow-rose-200"
                }`}
              >
                {isUser ? (
                  <UserRound className="h-5 w-5 text-white" strokeWidth={1.8} />
                ) : (
                  <Droplet className="h-5 w-5 text-rose-500" strokeWidth={1.8} />
                )}
              </span>
              <div
                className={`max-w-[85%] rounded-3xl p-4 text-sm leading-6 shadow-[0_12px_35px_-18px_rgba(225,29,72,0.45)] ${
                  isUser
                    ? "rounded-tr-md bg-gradient-to-br from-rose-500 via-rose-500 to-rose-600 text-rose-50"
                    : "rounded-tl-md bg-white text-slate-700 ring-1 ring-rose-100"
                }`}
              >
                <p className="flex items-start gap-2">
                  {!isUser && message.variant === "intro" ? (
                    <Hand className="mt-0.5 h-4 w-4 text-rose-500" strokeWidth={1.8} />
                  ) : null}
                  <span>{message.text}</span>
                </p>
                <span
                  className={`mt-3 block text-[10px] font-medium uppercase tracking-[0.2em] ${
                    isUser ? "text-rose-100" : "text-slate-400"
                  }`}
                >
                  {formatTime(message.time)}
                </span>
              </div>
            </div>
          );
        })}

        {isSending ? (
          <div className="flex items-start gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-3xl bg-rose-100 shadow-inner shadow-rose-200">
              <Droplet className="h-5 w-5 text-rose-500" strokeWidth={1.8} />
            </span>
            <div className="max-w-[85%] rounded-3xl rounded-tl-md bg-white px-4 py-3 text-sm text-slate-500 shadow-[0_10px_35px_-18px_rgba(225,29,72,0.45)] ring-1 ring-rose-100">
              <span className="inline-flex items-center gap-2">
                <span className="flex h-2 w-2 animate-pulse rounded-full bg-rose-300" />
                <span className="flex h-2 w-2 animate-pulse rounded-full bg-rose-300 [animation-delay:120ms]" />
                <span className="flex h-2 w-2 animate-pulse rounded-full bg-rose-300 [animation-delay:220ms]" />
                <span>En train d’écrire…</span>
              </span>
            </div>
          </div>
        ) : null}
      </div>

      <div className="space-y-4 border-t border-rose-100 bg-white px-5 py-5">
        <div className="flex flex-wrap gap-3">
          {quickReplies.map((reply) => (
            <button
              key={reply}
              type="button"
              onClick={() => handleQuickReply(reply)}
              disabled={isSending}
              className="rounded-full bg-rose-50 px-4 py-2 text-xs font-semibold text-rose-500 shadow-[0_8px_22px_-16px_rgba(225,29,72,0.7)] transition hover:-translate-y-0.5 hover:bg-rose-100 disabled:translate-y-0 disabled:opacity-50"
            >
              {reply}
            </button>
          ))}
        </div>
        <form
          onSubmit={handleSubmit}
          className="flex flex-col gap-2"
        >
          <div className="flex items-center gap-3 rounded-full border border-slate-200 bg-gradient-to-r from-white via-slate-50 to-white px-4 py-3 text-sm text-slate-500 shadow-[0_12px_30px_-18px_rgba(15,23,42,0.25)]">
            <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600 shadow-inner shadow-slate-200">
              Aa
            </span>
            <input
              type="text"
              placeholder="Écris ta question ici..."
              className="flex-1 bg-transparent text-sm text-slate-600 placeholder:text-slate-400 focus:outline-none"
              value={input}
              onChange={(event) => setInput(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter" && !event.shiftKey) {
                  event.preventDefault();
                  handleSend(input);
                }
              }}
              disabled={isSending}
            />
            <button
              type="submit"
              className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-rose-500 to-rose-600 text-sm font-semibold text-white shadow-lg shadow-rose-300/40 disabled:opacity-50"
              aria-label="Envoyer le message"
              disabled={isSending || input.trim().length === 0}
            >
              <SendHorizontal className="h-4 w-4 text-white" strokeWidth={1.8} />
            </button>
          </div>
          {error ? (
            <p className="text-xs font-medium text-rose-500">{error}</p>
          ) : null}
        </form>
      </div>
    </div>
  );
}
