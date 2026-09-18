import { useState, useRef, useEffect } from "react";
import { useMutation } from "@tanstack/react-query";
import { post } from "@/lib/api";
import type { AIResponse } from "@/types/api.types";
import { Send, ChevronRight } from "lucide-react";
import { Topbar } from "@/app/Topbar";

interface Message {
  role: "user" | "assistant";
  content: AIResponse | string;
}

const SUGGESTED_QUESTIONS = [
  "Why did revenue change this year?",
  "Which product categories are growing fastest?",
  "Which countries are the top performers?",
  "What changed this month vs last month?",
  "Which customers are buying the most?",
  "Are there any unusual sales patterns?",
];

export function AskPage() {
  const [question, setQuestion] = useState("");
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const bottomRef = useRef<HTMLDivElement>(null);

  const askMutation = useMutation({
    mutationFn: (q: string) =>
      post<AIResponse>("/api/ask", { question: q, conversation_id: conversationId }),
    onSuccess: (data, q) => {
      setConversationId(data.conversation_id);
      setMessages((prev) => [
        ...prev,
        { role: "user", content: q },
        { role: "assistant", content: data },
      ]);
    },
    onError: (err: Error) => {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: `Error: ${err.message}` },
      ]);
    },
  });

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, askMutation.isPending]);

  function handleSubmit(q: string) {
    if (!q.trim() || askMutation.isPending) return;
    setQuestion("");
    askMutation.mutate(q.trim());
  }

  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
      <Topbar title="Ask Anything" subtitle="Ask natural language questions about your business" />

      <div style={{ flex: 1, display: "flex", flexDirection: "column", padding: "24px 32px", gap: 24, overflowY: "auto" }}>

        {/* Empty state with suggestions */}
        {messages.length === 0 && !askMutation.isPending && (
          <div style={{ maxWidth: 640, margin: "0 auto", width: "100%" }}>
            <p className="text-label" style={{ marginBottom: 16 }}>Suggested questions</p>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
              {SUGGESTED_QUESTIONS.map((q) => (
                <button
                  key={q}
                  className="btn btn-ghost"
                  style={{ textAlign: "left", height: "auto", padding: "10px 14px", justifyContent: "flex-start", fontSize: "0.8rem" }}
                  onClick={() => handleSubmit(q)}
                >
                  <ChevronRight size={12} style={{ flexShrink: 0 }} />
                  {q}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Messages */}
        <div style={{ display: "flex", flexDirection: "column", gap: 20, maxWidth: 760, width: "100%", margin: "0 auto" }}>
          {messages.map((msg, i) => (
            <div key={i}>
              {msg.role === "user" ? (
                <UserMessage content={msg.content as string} />
              ) : (
                <AssistantMessage response={msg.content as AIResponse | string} />
              )}
            </div>
          ))}

          {/* Loading state */}
          {askMutation.isPending && (
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              <span className="text-mono" style={{ color: "var(--mute)" }}>Analyzing your question…</span>
              <div style={{ display: "flex", gap: 4 }}>
                {["Checking metrics", "Comparing periods", "Finding contributors"].map((step, i) => (
                  <span key={step} style={{
                    fontSize: "0.7rem",
                    color: "var(--mute)",
                    padding: "2px 8px",
                    borderRadius: "var(--radius-full)",
                    border: "1px solid var(--hairline)",
                    animation: `skeleton-pulse 1.5s ease-in-out ${i * 0.3}s infinite`,
                  }}>
                    {step}
                  </span>
                ))}
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>
      </div>

      {/* Input */}
      <div style={{
        borderTop: "1px solid var(--hairline)",
        padding: "16px 32px",
        background: "var(--canvas-elevated)",
      }}>
        <div style={{ maxWidth: 760, margin: "0 auto", display: "flex", gap: 8 }}>
          <input
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSubmit(question)}
            placeholder="Ask anything about your business…"
            disabled={askMutation.isPending}
            style={{
              flex: 1,
              border: "1px solid var(--hairline)",
              borderRadius: "var(--radius-sm)",
              padding: "9px 14px",
              fontSize: "0.875rem",
              color: "var(--ink)",
              background: "var(--canvas-elevated)",
              outline: "none",
              fontFamily: "var(--font-sans)",
            }}
          />
          <button
            className="btn btn-primary"
            onClick={() => handleSubmit(question)}
            disabled={!question.trim() || askMutation.isPending}
          >
            <Send size={14} />
            Ask
          </button>
        </div>
      </div>
    </div>
  );
}

function UserMessage({ content }: { content: string }) {
  return (
    <div style={{ display: "flex", justifyContent: "flex-end" }}>
      <div style={{
        background: "var(--ink)",
        color: "#fff",
        borderRadius: "var(--radius-md) var(--radius-md) 4px var(--radius-md)",
        padding: "10px 14px",
        fontSize: "0.875rem",
        maxWidth: "70%",
      }}>
        {content}
      </div>
    </div>
  );
}

function AssistantMessage({ response }: { response: AIResponse | string }) {
  if (typeof response === "string") {
    return (
      <div className="card" style={{ fontSize: "0.875rem", color: "var(--body)" }}>{response}</div>
    );
  }

  const r = response;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      {/* Summary */}
      <div className="card">
        <p style={{ fontWeight: 700, color: "var(--ink)", fontSize: "0.9rem", marginBottom: 6 }}>
          {r.summary}
        </p>

        {/* Findings */}
        {r.findings.length > 0 && (
          <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 12 }}>
            {r.findings.map((f, i) => (
              <div key={i} style={{ borderLeft: "2px solid var(--hairline)", paddingLeft: 12 }}>
                <p style={{ fontWeight: 700, fontSize: "0.8rem", color: "var(--ink)" }}>{f.title}</p>
                <p style={{ fontSize: "0.8rem", color: "var(--body)", marginTop: 2 }}>{f.detail}</p>
                {f.evidence && (
                  <p style={{ fontSize: "0.75rem", color: "var(--mute)", marginTop: 2, fontStyle: "italic" }}>
                    Evidence: {f.evidence}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Drivers */}
        {r.drivers.length > 0 && (
          <div style={{ marginTop: 12 }}>
            <p className="text-mono" style={{ marginBottom: 8 }}>Main Drivers</p>
            {r.drivers.map((d, i) => (
              <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "4px 0", borderBottom: "1px solid var(--hairline)", fontSize: "0.8rem" }}>
                <span style={{ color: "var(--body)" }}>{d.label}</span>
                <span style={{ fontWeight: 700, color: d.direction === "up" ? "#16a34a" : "#dc2626" }}>
                  {d.impact}
                </span>
              </div>
            ))}
          </div>
        )}

        {/* Recommended Actions */}
        {r.recommended_actions.length > 0 && (
          <div style={{ marginTop: 12 }}>
            <p className="text-mono" style={{ marginBottom: 8 }}>What to investigate</p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
              {r.recommended_actions.map((action, i) => (
                <span key={i} className="btn btn-ghost" style={{ fontSize: "0.75rem", height: 26, padding: "0 10px", cursor: "default" }}>
                  {action}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Follow-up questions */}
      {r.follow_up_questions.length > 0 && (
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
          <span className="text-caption" style={{ width: "100%", marginBottom: 2 }}>Continue exploring:</span>
          {r.follow_up_questions.map((q, i) => (
            <button key={i} className="btn btn-ghost" style={{ fontSize: "0.75rem", height: "auto", padding: "4px 10px" }}>
              {q}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
