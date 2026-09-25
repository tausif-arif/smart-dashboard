import { useState, useRef, useEffect } from "react";
import { useMutation } from "@tanstack/react-query";
import { post } from "@/lib/api";
import type { AIResponse } from "@/types/api.types";
import { Send, Sparkles, ArrowUpRight, CheckCircle2, TrendingUp, TrendingDown, HelpCircle, Lightbulb, AlertCircle } from "lucide-react";
import { Topbar } from "@/app/Topbar";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: AIResponse | string;
  timestamp: string;
}

const SUGGESTED_QUESTIONS = [
  "Why did revenue change this year?",
  "Which product categories are growing fastest?",
  "Which countries or states have the highest sales?",
  "What is the customer distribution by city and country?",
  "Which customers are buying the most?",
  "Are there any unusual sales patterns or anomalies?",
];

export function AskPage() {
  const [question, setQuestion] = useState("");
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const bottomRef = useRef<HTMLDivElement>(null);

  const askMutation = useMutation({
    mutationFn: (q: string) =>
      post<AIResponse>("/api/ask", { question: q, conversation_id: conversationId }),
    onSuccess: (data) => {
      setConversationId(data.conversation_id);
      setMessages((prev) => [
        ...prev,
        {
          id: `assistant-${Date.now()}`,
          role: "assistant",
          content: data,
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        },
      ]);
    },
    onError: (err: Error) => {
      setMessages((prev) => [
        ...prev,
        {
          id: `assistant-err-${Date.now()}`,
          role: "assistant",
          content: `Analytics Service Error: ${err.message || "Connection timeout. Please verify backend server."}`,
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        },
      ]);
    },
  });

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, askMutation.isPending]);

  function handleSubmit(q: string) {
    const trimmed = q.trim();
    if (!trimmed || askMutation.isPending) return;

    const userMsg: Message = {
      id: `user-${Date.now()}`,
      role: "user",
      content: trimmed,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setQuestion("");
    askMutation.mutate(trimmed);
  }

  return (
    <div className="flex-1 flex flex-col h-[100dvh] md:h-auto bg-canvas">
      <Topbar title="Ask Anything" subtitle="Instant business intelligence powered by AI analytics" />

      <div className="flex-1 flex flex-col p-4 md:p-6 lg:p-8 gap-6 overflow-y-auto">
        
        {/* Suggested Prompts Grid */}
        {messages.length === 0 && !askMutation.isPending && (
          <div className="max-w-3xl w-full mx-auto mt-6">
            <div className="flex items-center gap-2 mb-4 text-ink">
              <div className="p-1.5 rounded-sm bg-hairline-soft">
                <Sparkles size={16} />
              </div>
              <p className="text-label-sm m-0">Suggested Prompts</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {SUGGESTED_QUESTIONS.map((q) => (
                <button
                  key={q}
                  onClick={() => handleSubmit(q)}
                  className="text-left p-4 rounded-md border border-hairline bg-canvas-elevated hover:bg-hairline-soft transition-colors flex items-center justify-between group"
                >
                  <span className="text-body-md text-ink pr-2">{q}</span>
                  <ArrowUpRight size={14} className="text-mute group-hover:text-ink shrink-0" />
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Conversation Thread */}
        <div className="flex flex-col gap-6 max-w-3xl w-full mx-auto pb-4">
          {messages.map((msg) => (
            <div key={msg.id} className="flex flex-col gap-1.5">
              {msg.role === "user" ? (
                <UserBubble content={msg.content as string} timestamp={msg.timestamp} />
              ) : (
                <AssistantCard
                  response={msg.content as AIResponse | string}
                  timestamp={msg.timestamp}
                  onSelectQuestion={(q) => handleSubmit(q)}
                />
              )}
            </div>
          ))}

          {/* Loading Indicator */}
          {askMutation.isPending && (
            <div className="flex flex-col gap-3 p-5 rounded-md bg-canvas-elevated border border-hairline shadow-whisper">
              <div className="flex items-center gap-2.5">
                <Sparkles size={16} className="text-ink animate-pulse" />
                <span className="text-label-sm">Analyzing database & running metrics...</span>
              </div>
              <div className="flex gap-2 flex-wrap">
                {["Querying repository", "Calculating metrics"].map((step) => (
                  <span key={step} className="text-body-sm bg-hairline-soft px-3 py-1 rounded-full text-mute">
                    {step}
                  </span>
                ))}
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>
      </div>

      {/* Input Dock */}
      <div className="border-t border-hairline bg-canvas-elevated p-4 md:px-8 pb-safe">
        <div className="max-w-3xl mx-auto flex gap-3 items-center">
          <input
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSubmit(question)}
            placeholder="Ask a question..."
            disabled={askMutation.isPending}
            className="flex-1 border border-hairline rounded-sm px-4 py-3 text-body-md text-ink bg-canvas-elevated focus:outline-none focus:border-ink transition-colors"
          />
          <button
            onClick={() => handleSubmit(question)}
            disabled={!question.trim() || askMutation.isPending}
            className="btn-primary"
          >
            <Send size={15} className="mr-1" />
            <span className="hidden sm:inline">Ask</span>
          </button>
        </div>
      </div>
    </div>
  );
}

function UserBubble({ content, timestamp }: { content: string; timestamp: string }) {
  return (
    <div className="flex flex-col items-end gap-1 w-full">
      <div className="bg-ink text-on-primary rounded-2xl rounded-tr-sm px-4 py-3 text-body-md max-w-[90%] md:max-w-[80%] shadow-whisper break-words">
        {content}
      </div>
      <span className="text-body-sm text-mute pr-1">{timestamp}</span>
    </div>
  );
}

function AssistantCard({
  response,
  timestamp,
  onSelectQuestion,
}: {
  response: AIResponse | string;
  timestamp: string;
  onSelectQuestion: (q: string) => void;
}) {
  if (typeof response === "string") {
    const isError = response.includes("Error");
    return (
      <div className={`p-4 rounded-md border text-body-md flex items-center gap-2.5 ${isError ? 'bg-error-soft text-error-deep border-error' : 'bg-canvas-elevated border-hairline text-ink'}`}>
        {isError && <AlertCircle size={16} className="shrink-0" />}
        <span>{response}</span>
      </div>
    );
  }

  const r = response;

  return (
    <div className="flex flex-col gap-5 bg-canvas-elevated border border-hairline rounded-md p-5 md:p-6 shadow-whisper w-full">
      {/* Header Summary */}
      <div className="flex gap-3 items-start">
        <div className="w-8 h-8 rounded-full bg-hairline-soft flex items-center justify-center shrink-0">
          <Sparkles size={16} className="text-ink" />
        </div>
        <div className="flex-1">
          <p className="text-heading-md mb-1">{r.summary}</p>
          <span className="text-body-sm text-mute">{timestamp}</span>
        </div>
      </div>

      {/* Findings */}
      {r.findings && r.findings.length > 0 && (
        <div className="flex flex-col gap-3 mt-1">
          {r.findings.map((f, i) => (
            <div key={i} className="bg-canvas border-l-2 border-ink p-3.5 rounded-r-sm">
              <p className="text-label-sm mb-1">{f.title}</p>
              <p className="text-body-md text-body mb-0">{f.detail}</p>
              {f.evidence && (
                <div className="mt-2 inline-flex items-center gap-1.5 bg-canvas-elevated px-2.5 py-1 rounded-sm border border-hairline">
                  <CheckCircle2 size={12} className="text-ink" />
                  <span className="text-body-sm">{f.evidence}</span>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Key Growth Drivers */}
      {r.drivers && r.drivers.length > 0 && (
        <div className="border-t border-hairline pt-4">
          <p className="text-mono-eyebrow mb-3">Key Growth Drivers</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {r.drivers.map((d, i) => (
              <div key={i} className="flex justify-between items-center bg-canvas border border-hairline rounded-sm p-3">
                <span className="text-body-md font-medium text-ink">{d.label}</span>
                <div className={`flex items-center gap-1 font-medium text-body-md ${d.direction === "up" ? "text-ink" : "text-error"}`}>
                  {d.direction === "up" ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                  <span>{d.impact}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recommended Action Items */}
      {r.recommended_actions && r.recommended_actions.length > 0 && (
        <div className="border-t border-hairline pt-4">
          <div className="flex items-center gap-1.5 mb-3">
            <Lightbulb size={14} className="text-ink" />
            <p className="text-mono-eyebrow m-0">Recommended Actions</p>
          </div>
          <div className="flex flex-col gap-2">
            {r.recommended_actions.map((action, i) => (
              <button
                key={i}
                onClick={() => onSelectQuestion(`Analyze action item: ${action}`)}
                className="text-left bg-canvas border border-hairline hover:bg-hairline-soft rounded-sm p-3 text-body-md text-ink flex items-center justify-between transition-colors group"
              >
                <span>{action}</span>
                <ArrowUpRight size={14} className="shrink-0 text-mute group-hover:text-ink" />
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Follow-up Questions */}
      {r.follow_up_questions && r.follow_up_questions.length > 0 && (
        <div className="border-t border-hairline pt-4 flex flex-col gap-3">
          <div className="flex items-center gap-1.5">
            <HelpCircle size={14} className="text-ink" />
            <span className="text-mono-eyebrow">Continue Exploring</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {r.follow_up_questions.map((q, i) => (
              <button
                key={i}
                onClick={() => onSelectQuestion(q)}
                className="btn-ghost-sm h-auto py-1.5 px-3 rounded-full"
              >
                <span>{q}</span>
                <ArrowUpRight size={12} className="ml-1 opacity-70" />
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
