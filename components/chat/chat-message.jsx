"use client";

import { useEffect, useState } from "react";
import { User, Bot, ThumbsUp, ThumbsDown, Copy, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import rehypeHighlight from "rehype-highlight";
import rehypeKatex from "rehype-katex";

import "highlight.js/styles/github-dark.css";
import "katex/dist/katex.min.css";

export default function ChatMessage({ role, text, isStreaming, waitingForBackend  }) {
  const isUser = role === "user";
  const [feedback, setFeedback] = useState(null);
  const [copied, setCopied] = useState(false);

  /** Streaming effect */
  const [visibleText, setVisibleText] = useState(isUser ? text : "");

  const showLoader = role === 'assistant' && waitingForBackend;

  useEffect(() => {
    if (!isStreaming || isUser) {
      setVisibleText(text);
      return;
    }

    let i = 0;
    const interval = setInterval(() => {
      setVisibleText(text.slice(0, i));
      i++;
      if (i > text.length) clearInterval(interval);
    }, 12); // smooth typing

    return () => clearInterval(interval);
  }, [text, isStreaming, isUser]);


  const copyText = async () => {
    try {
      await navigator.clipboard.writeText(String(text));
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch (err) {
      console.error("Copy failed", err);
    }
  };


  return (
    <div className={cn("flex gap-4 mb-4", isUser && "flex-row-reverse")}>
      {/* Avatar */}
      <div
        className={cn(
          "grid h-9 w-9 place-items-center rounded-full shrink-0",
          isUser
            ? "bg-primary text-primary-foreground"
            : "bg-gradient-to-br from-indigo-500/20 to-purple-500/20 ring-1 ring-border"
        )}
      >
        {isUser ? <User className="h-5 w-5" /> : <Bot className="h-5 w-5" />}
      </div>

      {/* Message */}
      <div className="flex-1 max-w-3xl">
        <div
          className={cn(
            "relative rounded-2xl px-5 py-4 shadow-sm",
            isUser
              ? "bg-primary text-primary-foreground ml-auto"
              : "bg-muted/60 border backdrop-blur"
          )}
        >
          {showLoader && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-purple-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-purple-500" />
              </span>
              Thinking…
            </div>
          )}
          <div className="prose prose-sm sm:prose-base dark:prose-invert max-w-none">
            <ReactMarkdown
              remarkPlugins={[remarkGfm, remarkMath]}
              rehypePlugins={[rehypeHighlight, rehypeKatex]}
              components={{
                /* Code blocks with copy */
                pre: ({ children }) => {
                  const code = children?.props?.children || "";

                  return (
                    <div className="relative my-4">
                      <button
                        onClick={() => navigator.clipboard.writeText(code)}
                        className="absolute right-2 top-2 rounded bg-black/70 px-2 py-1 text-xs text-white hover:bg-black"
                      >
                        Copy
                      </button>
                      <pre className="bg-black/90 rounded-lg p-4 overflow-x-auto text-sm">
                        {children}
                      </pre>
                    </div>
                  );
                },

                table: ({ children }) => (
                  <div className="overflow-x-auto my-4 rounded-lg border">
                    <table className="w-full border-collapse">
                      {children}
                    </table>
                  </div>
                ),
                th: ({ children }) => (
                  <th className="bg-muted px-3 py-2 border text-xs uppercase">
                    {children}
                  </th>
                ),
                td: ({ children }) => (
                  <td className="px-3 py-2 border text-sm">
                    {children}
                  </td>
                ),
              }}
            >
              {isUser ? text : visibleText}
            </ReactMarkdown>
          </div>
        </div>

        {!isUser && (
          <div className="mt-2 flex items-center gap-1 text-muted-foreground">
            <Button variant="ghost" size="xs" onClick={() => setFeedback("up")}>
              <ThumbsUp className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="xs" onClick={() => setFeedback("down")}>
              <ThumbsDown className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="xs" onClick={copyText}>
              {copied ? <Check className="h-4 w-4 text-green-600" /> : <Copy className="h-4 w-4" />}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
