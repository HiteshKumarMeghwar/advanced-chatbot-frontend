"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

import {
  User, Bot, ThumbsUp, ThumbsDown, Copy, Check, Pencil, Volume2, RotateCcw, StopCircle,
  Zap, Info, Share, AlertTriangle, Lightbulb, Star, Heart,
  Calendar, Clock, MapPin, Link, FileText, Image,
  Video, Music, Mic, DollarSign, TrendingUp, TrendingDown,
  BarChart, PieChart, Activity, Users, Mail, Phone,
  Smartphone, Wifi, WifiOff, RefreshCw, Download, Upload,
  ExternalLink, BookOpen, GraduationCap, Award, Target,
  Rocket, Settings, Sliders, Filter, Search, ZoomIn, ZoomOut,
  Play, Pause, Stop, SkipForward, SkipBack, VolumeX,
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
  Sleep, Wake, BellRing, BellDot, Volume1, Headphones, Headset, X
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { motion } from "framer-motion";


import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import rehypeHighlight from "rehype-highlight";
import rehypeKatex from "rehype-katex";

import "highlight.js/styles/github-dark.css"; // dark
import "katex/dist/katex.min.css";
import { sendFeedback } from "@/api/feedback";
import { toast } from "sonner";
import AdvancedMarkdownRenderer from "./react-markdown";

export default function ChatMessage({
  message_id,
  role,
  text,
  raw,
  image_url,
  isStreaming,
  stale,
  onEditSend,
  onRetry,
  onReadAloud,
  isSpeaking,
}) {
  const isUser = role === "user";
  const [copied, setCopied] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [feedbackOpen, setFeedbackOpen] = useState(false);
  const [feedbackType, setFeedbackType] = useState("up"); // up | down
  const [feedbackText, setFeedbackText] = useState("");
  const [saving, setSaving] = useState(false);
  const [submittedFeedback, setSubmittedFeedback] = useState(null);
  const [copiedLink, setCopiedLink] = useState(false);
  const [editing, setEditing] = useState(false);
  const [editValue, setEditValue] = useState("");

  const showLoader = role === 'assistant' && isStreaming;

  const handleThumb = (type) => {
    setFeedbackType(type);
    setFeedbackText("");
    setFeedbackOpen(true);
  };

  const submitFeedback = async () => {
    if (saving) return;
    setSaving(true);
    try {
      await sendFeedback(
        Number(message_id),
        feedbackType,
        feedbackText,
        "gpt-4",
        raw?.tool ?? null,
        raw?.latency ?? null
      );

      // Success: mark as submitted and show green
      setSubmittedFeedback(feedbackType);
      toast.success("Thanks for your feedback!");
      setFeedbackOpen(false);

      // Auto-reset green highlight after 5 seconds
      setTimeout(() => {
        setSubmittedFeedback(null);
      }, 5000);

    } catch {
      toast.error("Could not save feedback");
    } finally {
      setSaving(false);
    }
  };

  const copyLink = () => {
    setCopiedLink(true);
    const url = `${window.location.origin}/chat/${message_id}`; // deep-link later
    navigator.clipboard.writeText(url);
    toast.success("Link copied");

    // Auto-reset green highlight after 5 seconds
    setTimeout(() => {
      setCopiedLink(false);
    }, 5000);
  };

  const copyText = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch (err) {
      console.error("Copy failed", err);
    }
  };

  const handleSaveEdit = () => {
    if (!editValue){
      setEditing(false);
      toast.error("Prompt was empty");
    }else{
      onEditSend?.(editValue, message_id);
      setEditing(false);
    }
  };


  const handleRetry = () => {
    onRetry?.(message_id);
  };



  return (
    <div className={cn("flex gap-4 mb-4", isUser && "flex-row-reverse")}>
      {/* Avatar */}
      <div
        className={cn(
          "grid h-9 w-9 place-items-center rounded-full shrink-0",
          isUser
            ? "bg-gradient-to-br from-indigo-500/20 to-purple-500/20 ring-1 ring-border"
            : "bg-gradient-to-br from-indigo-500/20 to-purple-500/20 ring-1 ring-border"
        )}
      >
        {isUser ? <User className="h-5 w-5" /> : <Bot className="h-5 w-5" />}
      </div>

      {/* Message */}
      <div className="flex-1 max-w-3xl">
        {/* ----------  MESSAGE BUBBLE COLOURS  ---------- */}
        <div
          className={cn(
            "relative rounded-2xl px-5 py-4 shadow-sm",
            isUser
              ? "bg-muted/60 from-indigo-500 to-purple-600" // user
              : "bg-muted/60 from-indigo-500 to-purple-600", // assistant
            stale && "opacity-50 grayscale pointer-events-none"
          )}
        >
          {showLoader && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              {/* 3 growing bars */}
              <div className="flex items-end gap-1 h-5">
                {[0, 1, 2].map((i) => (
                  <span
                    key={i}
                    className="w-1.5 bg-gradient-to-t from-purple-500 to-indigo-500 rounded-full animate-pulse"
                    style={{
                      height: "100%",
                      animation: "think 1.4s ease-in-out infinite",
                      animationDelay: `${i * 0.2}s`,
                    }}
                  />
                ))}
              </div>
              <span className="animate-pulse">Crafting response…</span>

              {/* keyframes once per component */}
              <style jsx>{`
                @keyframes think {
                  0%, 100% { transform: scaleY(0.3); }
                  50% { transform: scaleY(1); }
                }
              `}</style>
            </div>
          )}
          <div className="prose prose-sm sm:prose-base dark:prose-invert max-w-none">
            {editing ? (
              <div className="space-y-2">
                <Textarea
                  value={editValue}
                  onChange={(e) => setEditValue(e.target.value)}
                  className="w-full resize-none"
                  rows={3}
                />
                <div className="flex gap-2">
                  <motion.div
                    whileHover={{ scale: 1.25 }}
                    transition={{ type: "spring", stiffness: 300, damping: 10 }}
                  >
                    <Button size="xs" onClick={handleSaveEdit}>
                      Save & Re-run
                    </Button>
                  </motion.div>
                  <motion.div
                    whileHover={{ scale: 1.25 }}
                    transition={{ type: "spring", stiffness: 300, damping: 10 }}
                  >
                    <Button size="xs" variant="ghost" onClick={() => setEditing(false)}>
                      Cancel
                    </Button>
                  </motion.div>
                </div>
              </div>
            ) : (
              <>
                {/* ----------  IMAGE THUMBNAIL  ---------- */}
                {image_url && (
                  <>
                    <div className="mb-3">
                      <img
                        src={image_url}
                        alt="uploaded"
                        onClick={() => setPreviewOpen(true)}
                        className="
                          max-w-xs sm:max-w-sm
                          rounded-xl
                          border-2
                          shadow-md
                          cursor-pointer
                          transition
                          hover:scale-[1.02]
                          hover:opacity-90
                          dark:border-gray-700
                        "
                      />
                    </div>
                    {/* full-screen modal */}
                    {previewOpen && (
                      <div
                        className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm"
                        onClick={() => setPreviewOpen(false)}  // click backdrop → close
                      >
                        <div className="relative">
                          <img
                            src={image_url}
                            alt="full size"
                            className="max-w-[90vw] max-h-[90vh] object-contain rounded-2xl shadow-2xl"
                            onClick={(e) => e.stopPropagation()} // keep image clickable
                          />
                          <button
                            onClick={() => setPreviewOpen(false)} // × button → close
                            className="absolute -top-3 -right-3 grid h-9 w-9 place-items-center rounded-full bg-white/90 hover:bg-white text-gray-800 shadow-lg"
                          >
                            <X className="h-5 w-5" />
                          </button>
                        </div>
                      </div>
                    )}
                  </>
                )}
                <AdvancedMarkdownRenderer text={text} raw={raw} />
              </>
            )}
          </div>
        </div>

        {!isUser ? (
          <div className="mt-2 flex items-center gap-1 text-muted-foreground">
            {/* Thumb Up */}
            <Button
              variant="ghost"
              data-tooltip="Good"
              size="xs"
              onClick={() => handleThumb("up")}
              className={cn(
                submittedFeedback === "up" && "text-green-600 hover:text-green-700"
              )}
            >
              <ThumbsUp className={cn("h-4 w-4", submittedFeedback === "up" && "fill-green-600")} />
            </Button>

            {/* Thumb Down */}
            <Button
              variant="ghost"
              data-tooltip="Bad"
              size="xs"
              onClick={() => handleThumb("down")}
              className={cn(
                submittedFeedback === "down" && "text-green-600 hover:text-green-700"
              )}
            >
              <ThumbsDown className={cn("h-4 w-4", submittedFeedback === "down" && "fill-green-600")} />
            </Button>

            {/* Try again */}
            <Button data-tooltip="Retry" variant="ghost" size="xs" onClick={handleRetry}>
              <RotateCcw className="h-4 w-4" />
            </Button>

            {/* Read aloud */}
            <Button 
              variant="ghost" 
              data-tooltip="Read aloud"
              size="xs" 
              onClick={() => onReadAloud(message_id, text)}
              className={cn(
                "p-2 rounded-md transition",
                isSpeaking
                  ? "bg-indigo-500/20 text-indigo-600"
                  : "hover:bg-muted"
              )}
            >
              {isSpeaking ? (
                <StopCircle className="h-4 w-4" />
              ) : (
                <Volume2 className="h-4 w-4" />
              )}
            </Button>

            {/* Share */}
            <Button variant="ghost" data-tooltip="Share" size="xs" onClick={copyLink}>
              {copiedLink ? <Share className="h-4 w-4 fill-green-600" /> : <Share className="h-4 w-4" />}
            </Button>

            {/* Copy */}
            <Button variant="ghost" data-tooltip="Copy" size="xs" onClick={copyText}>
              {copied ? <Check className="h-4 w-4 text-green-600" /> : <Copy className="h-4 w-4" />}
            </Button>
          </div>
        ): (
          <div className="flex-row-reverse mt-2 flex items-center gap-1 text-muted-foreground">
            <Button variant="ghost" data-tooltip="Copy" size="xs" onClick={copyText}>
              {copied ? <Check className="h-4 w-4 text-green-600" /> : <Copy className="h-4 w-4" />}
            </Button>
            <Button variant="ghost" data-tooltip="Edit" size="xs" onClick={() => {setEditing(true), setEditValue(text)}}>
              <Pencil className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>
      {/* feedback popup – same UI kit you already use */}
      <Dialog open={feedbackOpen} onOpenChange={setFeedbackOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {feedbackType === "up" ? "👍 What did you like?" : "👎 How can we improve?"}
            </DialogTitle>
            <DialogDescription>
              Your feedback helps us make MeghX better.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-2 m-3">
            <Textarea
              placeholder="Optional details…"
              value={feedbackText}
              onChange={(e) => setFeedbackText(e.target.value)}
              rows={3}
            />
          </div>

          <DialogFooter className="gap-2">
            <motion.div
              whileHover={{ scale: 1.25 }}
              transition={{ type: "spring", stiffness: 300, damping: 10 }}
            >
              <Button variant="ghost" onClick={() => setFeedbackOpen(false)}>Cancel</Button>
            </motion.div>
            <motion.div
              whileHover={{ scale: 1.25 }}
              transition={{ type: "spring", stiffness: 300, damping: 10 }}
            >
              <Button onClick={submitFeedback} disabled={saving}>
                {saving ? "Saving…" : "Send"}
              </Button>
            </motion.div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
