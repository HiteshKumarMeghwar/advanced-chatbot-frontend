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
  Plug,
  Loader2,
} from "lucide-react";
import { Switch } from "@/components/ui/switch";
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
import { parseImage, uploadImage } from "@/api/image";
import LoadingModal from "@/components/chat/prompt-loading-modal";
import { fetchMcpServers, createMcpServer, deleteMcpServer, refreshTools } from "@/api/mcp_server";
import { toast } from "sonner";
import { forwardRef, useImperativeHandle } from "react";
import { disconnectAccount, fetchAccounts, toggleAccount } from "@/api/integration_acconts";

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



const PromptInput = forwardRef(function PromptInputFn(
  { addUserMessage, appendAssistantMessage, threadId, waitingForBackend },
  ref
) {
  /* ----------  expose onSend to parent  ---------- */
  useImperativeHandle(ref, () => ({
    send: (text, messageId) => onSend(text, messageId),
  }));

  /* ----------  state  ---------- */
  const [value, setValue] = useState("");
  const [tools, setTools] = useState([]);
  const [accounts, setAccounts] = useState([]);
  const [connecting, setConnecting] = useState(false);
  const [providerState, setProviderState] = useState("");
  const [deleting, setDeleting] = useState(false);
  const [popoverOpen, setPopoverOpen] = useState(false);
  const [showPlaceholder, setShowPlaceholder] = useState(true);
  const [mcpOpen, setMcpOpen] = useState(false);
  const [savingMcp, setSavingMcp] = useState(false);
  const [deletingMcp, setDeletingMcp] = useState(false);
  const [mcpServers, setMcpServers] = useState([]);
  const [recording, setRecording] = useState(false);
  const [sttLoading, setSttLoading] = useState(false);
  const [imageLoading, setImageLoading] = useState(false);
  const [ocrText, setOcrText] = useState("");        // extracted text
  const [imageFile, setImageFile] = useState(null);  // raw File
  const [imageUrl, setImageUrl] = useState("");      // local preview blob:
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

  useEffect(() => {
    loadAccounts();
  }, []);

  const loadAccounts = async () => {
    try {
      const data = await fetchAccounts();
      setAccounts(data);
    } catch {
      setAccounts([]);
    }
  };

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
      toast.success("Updated tool status");
    } catch {
      /* 3. rollback on error */
      toast.error("Failed - update tool status");
      setTools(snapshot);
    }
  };


  /* ----------  send message  ---------- */ // ..............................................................
  const onSend = async (overrideText, edit_message_id) => {
    const prompt = (typeof overrideText === 'string' ? overrideText : value).trim();
    // const finalPrompt = ocrText ? `${prompt}\n\n[OCR text from image below]:\n\n ${ocrText}]` : prompt;
    const finalPrompt = prompt;
    const ocrPayload = ocrText || null;
    let uploadedImageUrl = null;
    setShowPlaceholder(true)
    setSttLoading(false)
    setImageLoading(false)

    if (!finalPrompt || !threadId) return;
    setValue("");
    setOcrText("");

    if (imageFile) {
      const res = await uploadImage(imageFile);
      uploadedImageUrl = res.url;
    }

    if (imageUrl) {
      URL.revokeObjectURL(imageUrl);
      setImageUrl("");
      setImageFile(null);
    }

    if (edit_message_id){
      addUserMessage(finalPrompt, uploadedImageUrl, edit_message_id);
    }else{
      addUserMessage(finalPrompt, uploadedImageUrl);
    }
    
    const assistant = appendAssistantMessage(edit_message_id+1);

    let textBuffer = "";

    // Abort any previous stream first
    if (abortControllerRef.current) {
      abortControllerRef.current();
    }
  
    try {
      const cleanup = sendChatSSE({
        threadId,
        query: finalPrompt,
        image_url: uploadedImageUrl,
        ocr_text: ocrPayload,
        edit_message_id: edit_message_id,

        onToken: (token) => {
          textBuffer += token;
          assistant.updateText(textBuffer);
        },

        onMessageCreated: (messageId) => {  // NEW: Update ID immediately
          assistant.updateId(messageId);
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
        setMcpServers(servers);
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
      const res = await createMcpServer(payload);
      const servers = await fetchMcpServers();
      setMcpServers(servers);
      await loadTools();

      toast.success(
        `MCP "${res.mcp}" created · ${res.tools_count} tools installed`,
        { duration: 5000 }
      );
      // setMcpOpen(false);
    } catch (err) {
      toast.error(err.message || "Failed to save MCP server");
    } finally {
      setSavingMcp(false);
    }
  };

  // ---------- Delete ----------..........................................
  const handleDelete = async (mcpId) => {
    try {
      setDeletingMcp(true);
      const res = await deleteMcpServer(mcpId);
      // reload server list and user tools
      const servers = await fetchMcpServers();
      setMcpServers(servers);
      await loadTools();

      toast.success(
        `MCP "${res.mcp}" deleted.`,
        { duration: 5000 }
      );
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
      const { text } = await parseImage(file); // OCR
      const url = URL.createObjectURL(file); // local preview blob

      setImageFile(file); // save File for DB upload 
      setOcrText(text); // keep for later
      setImageUrl(url);
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
    <>
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

      {/* IMAGE PREVIEW */}
      {imageUrl && (
        <div className="mb-2 flex items-center gap-2">
          <img
            src={imageUrl}
            alt="preview"
            className="h-14 w-14 rounded-lg object-cover border"
          />
          <Button
            size="xs"
            variant="ghost"
            onClick={() => {
              URL.revokeObjectURL(imageUrl);
              setImageUrl("");
              setImageFile(null);
              setOcrText("");
            }}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      )}

      {/* ==========  TEXTAREA WITH ICONS INSIDE  ========== */}
      <div className="relative frost-panel">
        {/* textarea grows freely */}
        <Textarea
          ref={textareaRef}
          value={value}
          rows={1}
          placeholder=""
          onChange={(e) => {
            setValue(e.target.value);
            setShowPlaceholder(e.target.value.length === 0);
            // e.target.rows = Math.min(e.target.value.split("\n").length, 20);
          }}
          onKeyDown={(e) => {
            if (waitingForBackend) return;
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              onSend();
            }
          }}
          className="invisible-scroll rounded-2xl border-0 px-4 pt-3 pb-8 text-sm leading-6 focus-visible:ring-0 focus-visible:ring-offset-0 shadow-none"
        />

        {/* placeholder SVG – absolute top-left */}
        {showPlaceholder && (
          <svg
            className="pointer-events-none absolute left-4 top-3 h-6 text-purple-500"
            viewBox="0 0 180 24"
            fill="none"
          >
            <text x="10" y="21" fontSize="15" fontFamily="Kalam, cursive" fill="url(#grad)">
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

        {/* ==========  ICON BAR – always below textarea  ========== */}
        <div className="absolute bottom-0 left-0 right-0 flex items-center justify-between px-3 pb-2 pt-1">
          {/* LEFT – tools + image + mcp */}
          <div className="flex items-center gap-1">
            {/* Tools popover – same as before */}
            <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
              <PopoverTrigger asChild>
                <Button variant="ghost" size="icon-sm" data-tooltip="Agents">
                  <motion.div
                    whileHover={{ scale: 1.25 }}
                    animate={{ rotate: popoverOpen ? 45 : 0 }}
                    transition={{ type: "spring", stiffness: 300, damping: 10 }}
                    className="h-9 w-9 rounded-full border border-border bg-background/70 backdrop-blur-sm \
                    hover:bg-muted hover:shadow-md transition-all duration-200 \
                    flex items-center justify-center">
                    <Plus className="h-5 w-5" />
                  </motion.div>
                </Button>
              </PopoverTrigger>
              <PopoverContent side="top" align="start" className="w-14 p-2 space-y-2">
                {/* --- wrench / accounts / image / mcp --- */}
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="ghost" size="icon-sm" data-tooltip="Active/Inactive - Tools">
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
                  </PopoverTrigger>
                  <PopoverContent side="right" className="w-72 p-2">
                    {/* tools list – identical to your code */}
                    <div className="text-sm font-medium mb-2">Tools</div>
                    {tools.length === 0 ? (
                      <div className="rounded-lg border border-dashed p-4 text-center">
                        <Sparkles className="mx-auto h-6 w-6 text-muted-foreground mb-2" />
                        <p className="text-xs text-muted-foreground">No tools available</p>
                      </div>
                    ) : (
                      <div className="space-y-1 max-h-[60vh] overflow-auto">
                        {tools.map((t) => {
                          const Icon = t.icon;
                          return (
                            <div key={t.id}>
                              <div className="flex items-center gap-2 rounded px-2 py-1.5 text-sm">
                                <Icon className="h-4 w-4 shrink-0" />
                                <div className="flex-1">
                                  <div className="font-medium">{t.label}</div>
                                  <div className="text-xs text-muted-foreground line-clamp-2">{t.description}</div>
                                  <div className="mt-1 flex items-center gap-2">
                                    <Badge variant={t.globalStatus === "active" ? "default" : "secondary"} className="text-[10px] px-2 py-0">{t.globalStatus}</Badge>
                                    <motion.div
                                      whileHover={{ scale: 1.25 }}
                                      transition={{
                                        scale: { type: "spring", stiffness: 300, damping: 10 },
                                        rotate: { duration: 0.2 },
                                      }}
                                    >  
                                      <Switch
                                        checked={t.userStatus === "allowed"}
                                        onCheckedChange={(checked) => toggleUserStatus(t.name)} // still sends allowed/denied
                                        className="data-[state=checked]:bg-emerald-500 data-[state=unchecked]:bg-rose-500"
                                      />
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
                  </PopoverContent>
                </Popover>

                {/* Accounts */}
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="ghost" size="icon-sm" data-tooltip="Accounts">
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
                  </PopoverTrigger>
                  <PopoverContent side="right" className="w-56 p-2">
                    <div className="text-sm font-medium mb-2">Accounts</div>
                    <div className="space-y-1 max-h-[60vh] overflow-auto">
                      {["facebook", "google", "github", "twitter"].map((provider) => {
                        const acc = accounts.find(a => a.provider === provider);
                        return (
                          <div
                            key={provider}
                            className="flex items-center gap-2 rounded px-2 py-1.5 text-sm hover:bg-muted"
                          >
                            <UserCircle className="h-4 w-4" />
                            <span className="flex-1 capitalize">{provider}</span>

                            {/* CONNECT */}
                            {!acc && (
                              <Button 
                                size="xs" 
                                disabled={connecting}
                                className="mr-3"
                                onClick={() => {
                                  window.location.href = `${process.env.NEXT_PUBLIC_API_URL}/accounts/${provider}/login`;
                                  setConnecting(true);
                                  setProviderState(provider)
                                }}
                              >
                                {connecting && providerState === provider ? (
                                  <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Connecting...
                                  </>
                                ) : (
                                  "Connect"
                                )}
                              </Button>
                            )}

                            {/* CONNECTED */}
                            {acc && (
                              <div className="flex items-center gap-2">
                                {/* <Plug className="h-4 w-4 text-green-500" /> */}

                                <Switch
                                  checked={acc.is_active}
                                  data-tooltip={acc.is_active ? `Disable ${provider}` : `Enable ${provider}`}
                                  onCheckedChange={async (checked) => {
                                    await toggleAccount(acc.id, checked);
                                    loadAccounts();
                                    if(acc.is_active){
                                      toast.success(`Disabled ${provider}`)
                                    }else{
                                      toast.success(`Enabled ${provider}`)
                                    }
                                  }}
                                />

                                <Button
                                  size="icon"
                                  variant="ghost"
                                  disabled={deleting}
                                  data-tooltip={`Disconnect ${provider}`}
                                  onClick={async () => {
                                    setDeleting(true)
                                    setProviderState(provider)
                                    await disconnectAccount(acc.id);
                                    loadAccounts();
                                    setDeleting(false)
                                    setProviderState("")
                                    toast.success(`Disconnected ${provider}`)
                                  }}
                                >
                                  {deleting && providerState === provider ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                  ) : (
                                    "✕"
                                  )}
                                </Button>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </PopoverContent>
                </Popover>

                {/* Image upload */}
                <label>
                  <input ref={fileInputRef} type="file" hidden accept="image/*" onChange={onImagePicked} />
                  <Button variant="ghost" size="icon-sm" data-tooltip="Upload Image" onClick={() => fileInputRef.current?.click()}>
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

                {/* MCP servers */}
                <Button variant="ghost" size="icon-sm" onClick={() => setMcpOpen(true)} data-tooltip="Add MCP Server">
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
          </div>

          {/* RIGHT – voice / send */}
          <div className="flex items-center gap-1">
            {/* voice */}
            <Button
              variant="ghost"
              size="icon-sm"
              data-tooltip="Voice input"
              onClick={() => (recording ? stopRecording() : startRecording())}
              disabled={value.trim() || waitingForBackend}
            >
              {waitingForBackend ? (
                <div className="h-4 w-4 rounded-full border-2 border-transparent"
                    style={{ background: `conic-gradient(from 0deg, #ec4899 0%, #8b5cf6 100%)`, mask: `radial-gradient(circle 6px at center, transparent 78%, black 80%)`, animation: `spin 1s linear infinite` }} />
              ) : recording ? (
                <div className="flex gap-0.5 h-4">
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
                </div>
              ) : <motion.div
                    whileHover={{ scale: 1.25 }}
                    transition={{
                      scale: { type: "spring", stiffness: 300, damping: 10 },
                      rotate: { duration: 0.2 },
                    }}
                    className="h-9 w-9 rounded-full border border-border bg-background/70 backdrop-blur-sm \
                    hover:bg-muted hover:shadow-md transition-all duration-200 \
                    flex items-center justify-center"
                  >
                    <Mic className="h-5 w-5" />
                  </motion.div>
              }
            </Button>

            {/* send */}
            <Button
              variant="ghost"
              size="icon-sm"
              data-tooltip="Send chat"
              onClick={waitingForBackend ? undefined : onSend}
              disabled={!value.trim() || waitingForBackend}
            >
              {waitingForBackend ? (
                <div className="h-4 w-4 rounded-full border-2 border-transparent"
                    style={{ background: `conic-gradient(from 0deg, #ec4899 0%, #8b5cf6 100%)`, mask: `radial-gradient(circle 6px at center, transparent 78%, black 80%)`, animation: `spin 1s linear infinite` }} />
              ) : <motion.div
                    whileHover={{ scale: 1.25 }}
                    transition={{
                      scale: { type: "spring", stiffness: 300, damping: 10 },
                      rotate: { duration: 0.2 },
                    }}
                    className="h-9 w-9 rounded-full border border-border bg-background/70 backdrop-blur-sm \
                    hover:bg-muted hover:shadow-md transition-all duration-200 \
                    flex items-center justify-center"
                  >
                    <Send className="h-5 w-5" />
                  </motion.div>
              }
            </Button>
          </div>
        </div>
      </div>

      {/* modals */}
      {sttLoading && <LoadingModal message="Recognising your voice…" />}
      {imageLoading && <LoadingModal message="Reading image…" />}

      <p className="mt-1 text-center text-xs text-muted-foreground">
        MeghX can generate inaccurate responses. Always verify critical information.
      </p>
    </>
  );
});
PromptInput.displayName = "PromptInput";
export default PromptInput;