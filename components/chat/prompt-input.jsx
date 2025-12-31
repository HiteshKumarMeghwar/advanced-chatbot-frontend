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
  Mic,
  Image,
  Server,
  UserCircle,
  Wrench,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import { sendChatSSE } from "@/api/send_chat";
import { fetchTools, updateToolStatus } from "@/api/status_update";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { MCPModal } from "./add_mcp_server";
import { transcribeVoice } from "@/api/voice";
import { parseImage } from "@/api/image";
import LoadingModal from "@/components/chat/prompt-loading-modal";
import { fetchMcpServers, createMcpServer, deleteMcpServer, refreshTools } from "@/api/mcp_server";
import { toast } from "sonner";

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
  waitingForBackend,
  // onInterrupt,
  // interrupt
}) {

  /* ----------  state  ---------- */
  const [value, setValue] = useState("");
  const [tools, setTools] = useState([]);
  const [popoverOpen, setPopoverOpen] = useState(false);
  const [showPlaceholder, setShowPlaceholder] = useState(true);
  const [mcpOpen, setMcpOpen] = useState(false);
  const [savingMcp, setSavingMcp] = useState(false);
  const [deletingMcp, setDeletingMcp] = useState(false);
  const [mcpServers, setMcpServers] = useState([]);
  const [recording, setRecording] = useState(false);
  const [sttLoading, setSttLoading] = useState(false);
  const [imageLoading, setImageLoading] = useState(false);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const textareaRef = useRef(null);
  const abortControllerRef = useRef(null);
  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const silenceStartRef = useRef(null);
  const vadIntervalRef = useRef(null);
  const fileInputRef = useRef(null);

  const SILENCE_THRESHOLD = 0.01; // energy floor
  const SILENCE_DURATION = 4500;  // ms before auto-stop
  const VAD_INTERVAL = 200;       // ms sampling


  useEffect(() => {
    // Cleanup on unmount
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current(); // Close active EventSource
        abortControllerRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (!textareaRef.current) return;

    textareaRef.current.style.height = "auto";
    textareaRef.current.style.height =
      Math.min(textareaRef.current.scrollHeight, 160) + "px";
  }, [value]);

  // useEffect(() => {
  //   const handler = (e) => {
  //     setValue(e.detail);
  //     onSend();
  //   };
  //   document.addEventListener("send-interrupt-reply", handler);
  //   return () => document.removeEventListener("send-interrupt-reply", handler);
  // }, []);

  /* ----------  fetch real tools once  ---------- */
  useEffect(() => {
    loadTools();
  }, []);


  /* ----------  optimistic toggle (user status only)  ---------- */ // ..............................
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


  /* ----------  send message  ---------- */ // ..............................................................
  const onSend = async (overrideText) => {
    const prompt = (typeof overrideText === 'string' ? overrideText : value).trim();
    setShowPlaceholder(true)
    setSttLoading(false)
    setImageLoading(false)

    if (!prompt || !threadId) return;
    
    setValue("");
    addUserMessage(prompt);

    const assistant = appendAssistantMessage();

    let textBuffer = "";

    // Abort any previous stream first
    if (abortControllerRef.current) {
      abortControllerRef.current();
    }

    try {
      const cleanup = sendChatSSE({
        threadId,
        query: prompt,

        onToken: (token) => {
          textBuffer += token;
          assistant.updateText(textBuffer);
        },

        onInterrupt: (interruptData) => {
          textBuffer = interruptData.message || "Awaiting your input...";
          assistant.updateText(textBuffer);
          // onInterrupt?.(interruptData);
        },

        onError: (errorMessage) => {
          const msg = errorMessage || "⚠️ Something went wrong. Please try again.";
          assistant.updateText(msg);
          assistant.finish("error");
        },

        onDone: () => {
          if (textBuffer.trim()) {
            assistant.updateText(textBuffer.trim());
          }
          assistant.finish();
        },

      });

      // Store cleanup for next send or unmount
      abortControllerRef.current = cleanup;
    } catch (e) {
      assistant.updateText("⚠️ Connection failed. Check your network and try again.");
      assistant.finish("error");
    }
  };

  // ---------- Fetch servers on mount ----------............................................
  useEffect(() => {
    const loadServers = async () => {
      try {
        const servers = await fetchMcpServers();
        const list = Object.entries(servers).map(([name, config]) => ({ name, ...config }));
        setMcpServers(list);
      } catch (err) {
        toast.error("Failed to load MCP servers");
      }
    };
    loadServers();
  }, [mcpOpen]);

  // ---------- Save & Reload ----------..............................................
  const onSaveReload = async (payload) => {
    try {
      setSavingMcp(true);
      await createMcpServer(payload);
      await refreshTools();
      await loadTools();
      toast.success(`Server "${payload.name}" added`);

      // reload server list
      const servers = await fetchMcpServers();
      const list = Object.entries(servers).map(([name, config]) => ({ name, ...config }));
      setMcpServers(list);

      // setMcpOpen(false);
    } catch (err) {
      toast.error(err.message || "Failed to save MCP server");
    } finally {
      setSavingMcp(false);
    }
  };

  // ---------- Delete ----------..........................................
  const handleDelete = async (name) => {
    try {
      setDeletingMcp(true);
      const res = await deleteMcpServer(name);
      
      // Create toast content
      const {
        message,
        deleted_tools_count = 0,
        deleted_tools = [],
      } = res;

      const toastContent = (
        <div>
          <strong>{message}</strong>

          <div style={{ marginTop: "4px", fontSize: "13px", opacity: 0.9 }}>
            {deleted_tools_count > 0
              ? `${deleted_tools_count} tool${deleted_tools_count > 1 ? "s" : ""} revoked for this user`
              : "No user tools were linked to this server"}
          </div>

          {deleted_tools_count > 0 && (
            <ul style={{ marginTop: "6px", paddingLeft: "18px" }}>
              {deleted_tools.map((tool) => (
                <li key={tool}>{tool}</li>
              ))}
            </ul>
          )}
        </div>
      );

      await loadTools();
      toast.success(toastContent, { duration: 5000 });

      // reload server list
      const servers = await fetchMcpServers();
      const list = Object.entries(servers).map(([name, config]) => ({ name, ...config }));
      setMcpServers(list);
    } catch (err) {
      toast.error(err.message || "Failed to delete MCP server");
    } finally {
      setDeletingMcp(false);
    }
  };

  // TOOLS LOADING .......................................................
  const loadTools = async () => {
    try {
      const data = await fetchTools();
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
    } catch (err) {
      setTools([]);
    }
  };

  // VIOCE INPUT RECODING ......................................
  const startRecording = async () => {
    if (recording) return;

    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

    const mediaRecorder = new MediaRecorder(stream);
    mediaRecorderRef.current = mediaRecorder;
    audioChunksRef.current = [];

    // --- AudioContext for VAD ---
    const audioContext = new AudioContext();
    const source = audioContext.createMediaStreamSource(stream);
    const analyser = audioContext.createAnalyser();
    analyser.fftSize = 2048;

    source.connect(analyser);

    audioContextRef.current = audioContext;
    analyserRef.current = analyser;
    silenceStartRef.current = null;

    mediaRecorder.ondataavailable = (e) => {
      if (e.data.size > 0) audioChunksRef.current.push(e.data);
    };

    mediaRecorder.onstop = async () => {
      setSttLoading(true)
      cleanupVAD();

      try {
        const blob = new Blob(audioChunksRef.current, { type: "audio/webm" });
        const data = await transcribeVoice(blob);

        setValue(data.text);
        await onSend(data.text);
      } catch {
        setSttLoading(false)
        toast.error("Voice transcription failed");
      }
    };

    mediaRecorder.start();
    setRecording(true);

    startVAD();
  };

  const startVAD = () => {
    vadIntervalRef.current = window.setInterval(() => {
      if (!analyserRef.current) return;

      const buffer = new Float32Array(analyserRef.current.fftSize);
      analyserRef.current.getFloatTimeDomainData(buffer);

      const energy =
        buffer.reduce((sum, x) => sum + x * x, 0) / buffer.length;

      const now = Date.now();

      if (energy < SILENCE_THRESHOLD) {
        if (!silenceStartRef.current) {
          silenceStartRef.current = now;
        } else if (now - silenceStartRef.current > SILENCE_DURATION) {
          stopRecording(); // 🔑 AUTO-STOP
        }
      } else {
        silenceStartRef.current = null;
      }
    }, VAD_INTERVAL);
  };

  const cleanupVAD = () => {
    if (vadIntervalRef.current) {
      clearInterval(vadIntervalRef.current);
      vadIntervalRef.current = null;
    }

    analyserRef.current?.disconnect();
    audioContextRef.current?.close();

    analyserRef.current = null;
    audioContextRef.current = null;
    silenceStartRef.current = null;
  };


  const stopRecording = () => {
    if (!mediaRecorderRef.current) return;

    mediaRecorderRef.current.stop();
    mediaRecorderRef.current.stream.getTracks().forEach(t => t.stop());
    setRecording(false);
  };

  const onImagePicked = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImageLoading(true); // re-use the same modal
    setPopoverOpen(false)
    try {
      const { text } = await parseImage(file);
      // --- wrap the raw OCR text with a friendly prompt ---
      const prompt = `I've converted an image to text - the text originated from an OCR'd image and not need to call rag_tool ok. Please explain/refine the following from you own knowledge:\n\n${text}`;

      setValue(prompt);
      await onSend(prompt);
    } catch (err) {
      toast.error("Image reading failed");
    } finally {
      setImageLoading(false);
      e.target.value = ""; // allow same file again
    }
  };


  /* ----------  skeleton while loading  ---------- */
  // if (!tools.length)
  //   return (
  //     <div className="mx-auto w-full max-w-4xl px-2 sm:px-1">
  //       <div className="flex items-center gap-2 rounded-2xl border px-4 py-3 text-sm text-muted-foreground">
  //         <Sparkles className="h-4 w-4 animate-pulse" />
  //         Loading tools…
  //       </div>
  //     </div>
  //   );


  /* ----------  UI  ---------- */
  return (
    <div className="relative mx-auto w-full max-w-4xl px-2 sm:px-1">
    
      {/* MCP Modal */}
      <MCPModal
        open={mcpOpen}
        onClose={() => setMcpOpen(false)}
        onSaveReload={onSaveReload}
        servers={mcpServers}
        loading={savingMcp}
        onDelete={handleDelete}
        delLoading={deletingMcp}
      />

      {/* ==========  TOOLS POPOVER  ========== */}
      <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            title="Agents"
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

        <PopoverContent side="top" align="start" className="w-14 p-2 space-y-2">
          {/* TOOLS ICON (hover opens existing tools popover) */}
          <HoverCard>
            <HoverCardTrigger asChild>
              <Button variant="ghost" size="icon" title="Active/Inactive - Tools">
                <motion.div
                  whileHover={{ scale: 1.25 }}
                  transition={{
                    scale: { type: "spring", stiffness: 300, damping: 10 },
                    rotate: { duration: 0.2 },
                  }}
                >
                  <Wrench className="h-5 w-5" />
                </motion.div>
              </Button>
            </HoverCardTrigger>
            <HoverCardContent side="right" className="w-72 p-2">
              <div className="text-sm font-medium mb-2">Tools</div>
              {/* ----------  empty or list  ---------- */}
              {tools.length === 0 ? (
                <div className="rounded-lg border border-dashed p-4 text-center">
                  <Sparkles className="mx-auto h-6 w-6 text-muted-foreground mb-2" />
                  <p className="text-xs text-muted-foreground">No tools available</p>
                  <p className="text-[10px] text-muted-foreground mt-1">
                    Admin will enable them soon
                  </p>
                </div>
              ) : (
                <div className="space-y-1 mb-2 max-h-[60vh] overflow-auto">
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
              )}
            </HoverCardContent>
          </HoverCard>

          {/* ACCOUNTS ICON */}
          <HoverCard>
            <HoverCardTrigger asChild>
              <Button variant="ghost" size="icon" title="Accounts">
                <motion.div
                  whileHover={{ scale: 1.25 }}
                  transition={{
                    scale: { type: "spring", stiffness: 300, damping: 10 },
                    rotate: { duration: 0.2 },
                  }}
                >
                  <UserCircle className="h-5 w-5" />
                </motion.div>
              </Button>
            </HoverCardTrigger>
            <HoverCardContent side="right" className="w-56 p-2">
              <div className="text-sm font-medium mb-2">Accounts</div>
              {["Facebook", "Gmail", "GitHub", "Twitter"].map((item) => (
                <div
                  key={item}
                  className="rounded px-2 py-1 text-sm hover:bg-muted cursor-pointer"
                >
                  {item}
                </div>
              ))}
            </HoverCardContent>
          </HoverCard>

          {/* IMAGE UPLOAD */}
          <label>
            <input
              ref={fileInputRef}
              type="file"
              hidden
              accept="image/*"
              onChange={onImagePicked}
            />
            <Button
              variant="ghost"
              size="icon"
              title="Upload Image"
              onClick={() => fileInputRef.current?.click()}
            >
              <motion.div
                whileHover={{ scale: 1.25 }}
                transition={{
                  scale: { type: "spring", stiffness: 300, damping: 10 },
                  rotate: { duration: 0.2 },
                }}
              >
                <Image className="h-5 w-5" />
              </motion.div>
            </Button>
          </label>

          {/* MCP REMOTE SERVERS */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setMcpOpen(true)}
            title="Add MCP Sever"
          >
            <motion.div
              whileHover={{ scale: 1.25 }}
              transition={{
                scale: { type: "spring", stiffness: 300, damping: 10 },
                rotate: { duration: 0.2 },
              }}
            >
              <Server className="h-5 w-5" />
            </motion.div>
          </Button>

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
            if (waitingForBackend) return;  
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

        {/* voice button inside right edge */}
        <Button
          size="icon"
          variant="ghost"
          title="Voice input"
          className="absolute right-12 top-1/2 -translate-y-1/2"
          onClick={() => {
            if (waitingForBackend) return;
            recording ? stopRecording() : startRecording();
          }}
          disabled={value.trim() || waitingForBackend}
        >
          <div className="relative h-5 w-5 flex items-center justify-center">
            {waitingForBackend ? (
              /* -------  modern loader  ------- */
              <div className="flex h-5 w-5 items-center justify-center">
                <span className="sr-only">Loading</span>
                <div
                  className="h-4 w-4 rounded-full border-2 border-transparent"
                  style={{
                    background: `conic-gradient(from 0deg, #ec4899 0%, #8b5cf6 100%)`,
                    mask: `radial-gradient(circle 6px at center, transparent 78%, black 80%)`,
                    WebkitMask: `radial-gradient(circle 6px at center, transparent 78%, black 80%)`,
                    animation: `spin 1s linear infinite`,
                  }}
                />
                <style jsx>{`
                  @keyframes spin {
                    to { transform: rotate(360deg); }
                  }
                `}</style>
              </div>
            ) : recording ? (
              /* 3-bar sound-wave animation */
              <>
                <span className="sr-only">Recording…</span>
                <div className="flex items-center justify-center gap-0.5 h-4">
                  {[0, 1, 2].map((i) => (
                    <span
                      key={i}
                      className="w-0.5 rounded-full bg-red-500"
                      style={{
                        height: '100%',
                        animation: `wave 1.2s ease-in-out infinite`,
                        animationDelay: `${i * 0.15}s`,
                      }}
                    />
                  ))}
                </div>
                <style jsx>{`
                  @keyframes wave {
                    0%, 100% { transform: scaleY(0.3); }
                    50% { transform: scaleY(1); }
                  }
                `}</style>
              </>
            ) : (
              <Mic className="h-5 w-5" />
            )}
          </div>
        </Button>

        {/* send button inside right edge */}
        <Button
          size="icon"
          onClick={waitingForBackend ? undefined : onSend}
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
              /* -------  modern loader  ------- */
              <div className="flex h-5 w-5 items-center justify-center">
                <span className="sr-only">Loading</span>
                <div
                  className="h-4 w-4 rounded-full border-2 border-transparent"
                  style={{
                    background: `conic-gradient(from 0deg, #ec4899 0%, #8b5cf6 100%)`,
                    mask: `radial-gradient(circle 6px at center, transparent 78%, black 80%)`,
                    WebkitMask: `radial-gradient(circle 6px at center, transparent 78%, black 80%)`,
                    animation: `spin 1s linear infinite`,
                  }}
                />
                <style jsx>{`
                  @keyframes spin {
                    to { transform: rotate(360deg); }
                  }
                `}</style>
              </div>
            ) : (
              <Send className="h-5 w-5" />
            )}
          </motion.div>
        </Button>
      </div>

      {/* ==========  STT and Image loading modal  ========== */}
      {sttLoading && <LoadingModal message="Recognising your voice…" />}
      {imageLoading && <LoadingModal message="Reading image…" />}
    </div>
  );
}