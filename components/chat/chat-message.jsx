"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

import {
  User, Bot, ThumbsUp, ThumbsDown, Copy, Check,
  Zap, Info, AlertTriangle, Lightbulb, Star, Heart,
  Calendar, Clock, MapPin, Link, FileText, Image,
  Video, Music, Mic, DollarSign, TrendingUp, TrendingDown,
  BarChart, PieChart, Activity, Users, Mail, Phone,
  Smartphone, Wifi, WifiOff, RefreshCw, Download, Upload,
  ExternalLink, BookOpen, GraduationCap, Award, Target,
  Rocket, Settings, Sliders, Filter, Search, ZoomIn, ZoomOut,
  Play, Pause, Stop, SkipForward, SkipBack, Volume2, VolumeX,
  RadioReceiver, SatelliteDish, Telescope, Microscope, Beaker,
  TestTube, Pill, HeartPulse, Stethoscope, Bandage, Medicine,
  Hospital, Ambulance, UserPlus, UserMinus, UserX, Group,
  Contacts, AddressBook, Bookmark, BookmarkPlus, StarOff,
  Flag, MapPinned, Navigation, Compass, Crosshair, Route,
  GitBranch, GitCommit, GitPullRequest, Bitbucket, Docker,
  Kubernetes, Terminal, Command, Code, Code2, FileCode, Bug,
  CpuChip, Radio, Broadcast, Podcast, Airplay, Cast, Chromecast,
  AppleTv, Television, Monitor, SmartphoneCharging, Battery,
  BatteryCharging, BatteryLow, BatteryFull, Power, PowerOff,
  Sleep, Wake, BellRing, BellDot, Volume1, Headphones, Headset
} from "lucide-react";


import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import rehypeHighlight from "rehype-highlight";
import rehypeKatex from "rehype-katex";

import "highlight.js/styles/github-dark.css"; // dark
import "katex/dist/katex.min.css";

export default function ChatMessage({ role, text, raw, isStreaming  }) {
  const isUser = role === "user";
  const [feedback, setFeedback] = useState(null);
  const [copied, setCopied] = useState(false);

  const showLoader = role === 'assistant' && isStreaming;


  const copyText = async () => {
    try {
      await navigator.clipboard.writeText(text);
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
                  const [copied, setCopied] = useState(false);

                  const code =
                    typeof raw === "string"
                      ? raw.match(/```[\s\S]*?```/)?.[0]
                          ?.replace(/```[a-zA-Z]*\n?/, "")
                          ?.replace(/```$/, "")
                      : "";

                  const handleCopy = async () => {
                    try {
                      await navigator.clipboard.writeText(code);
                      setCopied(true);

                      setTimeout(() => {
                        setCopied(false);
                      }, 1800);
                    } catch (err) {
                      console.error("Copy failed", err);
                    }
                  };

                  return (
                    <div className="relative my-4">
                      <button
                        onClick={handleCopy}
                        className="
                          absolute right-2 top-2 rounded px-2 py-1 text-xs
                          flex items-center gap-1
                          bg-muted text-foreground
                          dark:bg-black/70 dark:text-white
                          hover:opacity-80 transition
                          m-2
                        "
                      >
                        {copied ? (
                          <>
                            <Check className="h-3.5 w-3.5 text-green-500 text-white" />
                            <p className="text-white">Copied</p>
                          </>
                        ) : (
                          <>
                            <Copy className="h-3.5 w-3.5 text-white" />
                            <p className="text-white">Copy</p>
                          </>
                        )}
                      </button>

                      <pre
                        className="
                          rounded-lg p-4 overflow-x-auto text-sm
                          bg-muted text-foreground
                          dark:bg-black/90 dark:text-gray-100
                        "
                      >
                        {children}
                      </pre>
                    </div>
                  );
                },

                hr: ({ children }) => (
                  <div className="flex items-center gap-4 my-6">
                    <div className="h-px bg-slate-300 dark:bg-slate-700 flex-1" />
                    <Star className="w-5 h-5 text-yellow-500" />
                    <div className="h-px bg-slate-300 dark:bg-slate-700 flex-1" />
                  </div>
                ),
                h1: ({ children }) => (
                  <div className="flex items-center gap-3 mb-4">
                    <Rocket className="w-7 h-7 text-indigo-500" />
                    <h1 className="text-3xl font-extrabold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                      {children}
                    </h1>
                  </div>
                ),
                h2: ({ children }) => (
                  <div className="flex items-center gap-2 mt-4 mb-2">
                    <Zap className="text-yellow-500 w-5 h-5" />
                    <h2 className="text-lg font-semibold">{children}</h2>
                  </div>
                ),
                h3: ({ children }) => (
                  <div className="flex items-center gap-2 mt-5 mb-2">
                    <Lightbulb className="w-5 h-5 text-amber-500" />
                    <h3 className="text-xl font-semibold text-slate-700 dark:text-slate-200">{children}</h3>
                  </div>
                ),
                ul: ({ children }) => <ul className="list-none space-y-2 ml-4">{children}</ul>,
                li: ({ children }) => (
                  <li className="flex items-start gap-2">
                    <span className="mt-1 text-indigo-500">
                      <Check className="w-4 h-4" />
                    </span>
                    <span className="flex-1">{children}</span>
                  </li>
                ),
                blockquote: ({ children }) => (
                  <div className="border-l-4 border-purple-500 bg-purple-50 dark:bg-purple-900/20 p-4 my-4 rounded-r-lg shadow-sm">
                    <div className="flex items-center gap-2 mb-2">
                      <Info className="w-5 h-5 text-purple-600" />
                      <span className="text-sm font-semibold text-purple-700 dark:text-purple-300">Note</span>
                    </div>
                    <div className="text-slate-700 dark:text-slate-300">{children}</div>
                  </div>
                ),

                strong: ({ children }) => (
                  <span className="font-bold text-indigo-600 dark:text-indigo-400">{children}</span>
                ),

                em: ({ children }) => (
                  <span className="italic text-pink-600 dark:text-pink-400">{children}</span>
                ),

                a: ({ children, href }) => (
                  <a
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-indigo-600 dark:text-indigo-400 hover:underline"
                  >
                    {children}
                    <ExternalLink className="w-4 h-4" />
                  </a>
                ),
                // Paragraphs
                p: ({ children }) => <p className="text-sm md:text-base leading-relaxed my-2">{children}</p>,
                // Lists
                ul: ({ children }) => <ul className="list-disc pl-6 space-y-1">{children}</ul>,
                ol: ({ children }) => <ol className="list-decimal pl-6 space-y-1">{children}</ol>,
                li: ({ children }) => <li className="my-1">{children}</li>,
                // Tables
                table: ({ children }) => (
                  <div className="overflow-x-auto my-2">
                    <table className="table-auto border-collapse border border-gray-300 dark:border-gray-600 w-full text-sm">
                      {children}
                    </table>
                  </div>
                ),
                th: ({ children }) => (
                  <th className="border border-gray-300 dark:border-gray-600 px-2 py-1 bg-gray-200 dark:bg-gray-700 font-semibold text-left">
                    {children}
                  </th>
                ),
                td: ({ children }) => (
                  <td className="border border-gray-300 dark:border-gray-600 px-2 py-1">{children}</td>
                ),
                // Task lists
                input: ({ type, checked }) =>
                  type === "checkbox" ? (
                    <input type="checkbox" checked={checked} readOnly className="mr-2" />
                  ) : null,
              }}
            >
              {text}
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
