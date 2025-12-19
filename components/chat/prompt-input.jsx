"use client";

import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Send,
  Plus,
  Sparkles,
  Globe,
  Calculator,
  Check,
  Search,
  FileText,
  List,
  Edit,
  Trash,
  DollarSign,
  HelpCircle,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { sendChatSSE } from "@/api/send_chat";
import { fetchTools, updateToolStatus } from "@/api/status_update";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

/* map backend name -> nice icon */
const iconMap = {
  duckduckgo_search: Search,
  get_stock_price: DollarSign,
  rag_tool: FileText,
  add_expense: Calculator,
  list_expenses: List,
  summarize: HelpCircle,
  edit_expense: Edit,
  delete_expense: Trash,
  add_credit_expense: DollarSign,
  add: Calculator,
  random_number: Globe,
};



export default function PromptInput({ 
  addUserMessage, 
  appendAssistantMessage, 
  threadId, 
  waitingForBackend 
}) {

  /* ----------  state  ---------- */
  const [value, setValue] = useState("");
  const [tools, setTools] = useState([]);
  const [popoverOpen, setPopoverOpen] = useState(false);
  const [showPlaceholder, setShowPlaceholder] = useState(true);
  const textareaRef = useRef(null);

  useEffect(() => {
    if (!textareaRef.current) return;

    textareaRef.current.style.height = "auto";
    textareaRef.current.style.height =
      Math.min(textareaRef.current.scrollHeight, 160) + "px";
  }, [value]);

  /* ----------  fetch real tools once  ---------- */
  useEffect(() => {
    fetchTools()
      // fetchTools ALREADY returns the parsed JSON
      .then((data) => {
        const list = data.tools || [];
        const normalized = list.map((t) => ({
          id: t.id,
          name: t.name,
          label: t.name.replace(/_/g, " "),
          description: t.description,
          icon: iconMap[t.name] || Sparkles,
          globalStatus: t.status,
          userStatus: t.user_tool_status,
        }));
        setTools(normalized);
      })
      .catch((err) => {
        console.error("fetchTools failed", err);
        setTools([]);
      });
  }, []);


  /* ----------  optimistic toggle (user status only)  ---------- */
  const toggleUserStatus = async (name) => {
    const tool = tools.find((t) => t.name === name);
    if (!tool) return;
    const newUserStatus = tool.userStatus === "allowed" ? "denied" : "allowed";
    const snapshot = [...tools];

    /* 1. instantly flip UI */
    setTools((prev) =>
      prev.map((t) =>
        t.name === name ? { ...t, userStatus: newUserStatus } : t
      )
    );

    /* 2. sync backend */
    try {
      await updateToolStatus(newUserStatus, tool.id);
    } catch {
      /* 3. rollback on error */
      setTools(snapshot);
    }
  };


  /* ----------  send message  ---------- */
  const onSend = async () => {
    setShowPlaceholder(true)
    if (!value.trim() || !threadId) return;

    const prompt = value.trim();
    setValue("");
    addUserMessage(prompt);

    const assistant = appendAssistantMessage();

    let textBuffer = "";

    try {
      await sendChatSSE({
        threadId,
        query: prompt,
        onToken: (token) => {
          textBuffer += token;
          assistant.updateText(textBuffer);
        },
        onDone: () => {
          assistant.finish();
        },
      });
    } catch (e) {
      assistant.updateText("⚠️ Something went wrong.");
      assistant.finish();
    }
  };

  /* ----------  skeleton while loading  ---------- */
  if (!tools.length)
    return (
      <div className="mx-auto w-full max-w-4xl px-2 sm:px-1">
        <div className="flex items-center gap-2 rounded-2xl border px-4 py-3 text-sm text-muted-foreground">
          <Sparkles className="h-4 w-4 animate-pulse" />
          Loading tools…
        </div>
      </div>
    );


  /* ----------  UI  ---------- */
  return (
    <div className="relative mx-auto w-full max-w-4xl px-2 sm:px-1">
      {/* ==========  TOOLS POPOVER  ========== */}
      <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            title="Active/Inactive - Tools"
            className="absolute left-3 top-1/2 -translate-y-1/2 z-10"
          >
            <motion.div
              whileHover={{ scale: 1.25 }}
              animate={{ rotate: popoverOpen ? 45 : 0 }}
              transition={{
                scale: { type: "spring", stiffness: 300, damping: 10 }, // hover spring
                rotate: { duration: 0.2 },                             // plus→X speed
              }}
            >
              <Plus className="h-5 w-5" />
            </motion.div>
          </Button>
        </PopoverTrigger>

        <PopoverContent side="top" align="start" className="w-72 p-2">
          <div className="text-sm font-medium mb-2">Tools</div>
          <div className="space-y-1 max-h-[60vh] overflow-auto">
            {tools.map((t) => {
              const Icon = t.icon;
              return (
                <div key={t.id}>
                  <div className="flex items-center gap-2 rounded px-2 py-1.5 text-sm">
                    <Icon className="h-4 w-4 shrink-0" />
                    <div className="flex-1">
                      <div className="font-medium">{t.label}</div>
                      <div className="text-xs text-muted-foreground line-clamp-2">
                        {t.description}
                      </div>
                      {/* badges row */}
                      <div className="mt-1 flex items-center gap-2">
                        {/* global status (read-only) */}
                        {/* <motion.div
                          whileHover={{ scale: 1.25 }}
                          transition={{
                            scale: { type: "spring", stiffness: 300, damping: 10 }
                          }}
                        >   */}
                          <Badge
                            variant={t.globalStatus === "active" ? "default" : "secondary"}
                            className="text-[10px] px-2 py-0"
                          >
                            {t.globalStatus}
                          </Badge>
                        {/* </motion.div> */}
    
                        {/* user status (clickable) */}
                        <motion.div
                          whileHover={{ scale: 1.25 }}
                          transition={{
                            scale: { type: "spring", stiffness: 300, damping: 10 }
                          }}
                        >  
                          <Badge
                            variant={t.userStatus === "allowed" ? "default" : "destructive"}
                            className="cursor-pointer text-[10px] px-2 py-0"
                            onClick={() => toggleUserStatus(t.name)}
                          >
                            {t.userStatus}
                          </Badge>
                        </motion.div>
                      </div>
                    </div>
                  </div>
                  <Separator />
                </div>
              );
            })}
          </div>
        </PopoverContent>
      </Popover>

      {/* ==========  TEXTAREA WITH ICONS INSIDE  ========== */}
      <div className="relative flex items-center">
        <Textarea
          ref={textareaRef}
          value={value}
          rows={1}
          placeholder=""
          onChange={(e) => {
            setValue(e.target.value);
            setShowPlaceholder(e.target.value.length === 0);
            /* -------- auto-height -------- */
            const lines = e.target.value.split("\n").length;
            e.target.rows = Math.min(Math.max(lines, 1), 20);
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              onSend();
            }
          }}
          className="
            resize-none
            rounded-2xl
            px-11
            text-sm
            leading-6
            overflow-y-auto      /* scroll after 10 lines */
            placeholder:text-transparent
            min-h-[3rem]         /* single-line height (48 px) */
            max-h-[15rem]        /* 10 lines x 24 px = 240 px */
          "
        />
        {showPlaceholder && (
        <svg
          className="pointer-events-none absolute left-11 top-1/2 -translate-y-1/2 h-6 text-purple-500"
          viewBox="0 0 180 24"
          fill="none"
        >
          <text
            x="10"
            y="18"
            fontSize="15"
            fontFamily="Kalam, cursive"
            fill="url(#grad)"
          >
            Say MeghX…
          </text>
          <defs>
            <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#ec4899" />
              <stop offset="100%" stopColor="#8b5cf6" />
            </linearGradient>
          </defs>
        </svg>
        )}

        {/* send button inside right edge */}
        <Button
          size="icon"
          onClick={onSend}
          disabled={!value.trim() || waitingForBackend}   // ← disable + hide when busy
          className="absolute right-2 top-1/2 -translate-y-1/2"
        >
          <motion.div
            whileHover={{ scale: 1.25 }}
            transition={{
              scale: { type: "spring", stiffness: 300, damping: 10 },
              rotate: { duration: 0.2 },
            }}
          >
            {waitingForBackend ? (
              /* -------  tiny loader  ------- */
              <div className="flex h-5 w-5 items-center justify-center">
                <span className="sr-only">Loading</span>
                <span className="h-2 w-2 rounded-full bg-purple-500 animate-ping absolute" />
                <span className="h-2 w-2 rounded-full bg-purple-600" />
              </div>
            ) : (
              <Send className="h-5 w-5" />
            )}
          </motion.div>
        </Button>
      </div>
    </div>
  );
}