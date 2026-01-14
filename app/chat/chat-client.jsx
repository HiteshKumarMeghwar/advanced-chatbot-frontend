"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import PromptInput from "@/components/chat/prompt-input";
import ChatMessage from "@/components/chat/chat-message";
import Sidebar from "@/components/chat/sidebar";
import Header from "@/components/layout/header";
import Image from 'next/image'
import { motion } from "framer-motion";
import Snowflakes from "./snow-flakes"
import { v4 as uuidv4 } from "uuid";
import { ChevronDown, Eye, EyeOff, SnowflakeIcon } from "lucide-react";
import { ReadAloudLanguageModal } from "@/components/chat/read_aloud_modal";
import { speakText, stopSpeech } from "@/components/chat/speechEngine";
// import InterruptModal from "@/components/chat/interrupt-modal";


export default function ChatPage() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [messages, setMessages] = useState([]);
  const [activeThreadId, setActiveThreadId] = useState(null);
  const [streamingMessageId, setStreamingMessageId] = useState(null);
  const [waitingForBackend, setWaitingForBackend] = useState(false);
  const [inputVisible, setInputVisible] = useState(true);
  const [showSnow, setShowSnow] = useState(true); // default ON
  
  const [isNearBottom, setIsNearBottom] = useState(true);
  const [isEditOrRegenerate, setIsEditOrRegenerate] = useState(false);

  const [activeSpeechId, setActiveSpeechId] = useState(null); // message key
  const [speechLang, setSpeechLang] = useState(null);         // selected lang
  const [langModalOpen, setLangModalOpen] = useState(false);
  const [pendingSpeech, setPendingSpeech] = useState(null);  // text + msgId
  // const [interrupt, setInterrupt] = useState(null);

  const scrollRef  = useRef(null);
  const bottomRef  = useRef(null);
  const promptRef = useRef(null);

  useEffect(() => {
    const viewport = scrollRef.current?.querySelector(
      "[data-radix-scroll-area-viewport]"
    );
    if (!viewport) return;

    const handleScroll = () => {
      const threshold = 120; // ChatGPT-like tolerance
      const distance =
        viewport.scrollHeight - viewport.scrollTop - viewport.clientHeight;

      setIsNearBottom(distance < threshold);
    };

    viewport.addEventListener("scroll", handleScroll);
    handleScroll(); // sync on mount

    return () => viewport.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    if (!bottomRef.current) return;

    // Never auto-scroll during edit/regenerate
    if (isEditOrRegenerate) return;

    // Only follow if user is already near bottom
    if (!isNearBottom) return;

    bottomRef.current.scrollIntoView({
      behavior: streamingMessageId ? "auto" : "smooth",
    });
  }, [messages.length, streamingMessageId, isNearBottom, isEditOrRegenerate]);

  const scrollToBottom = () => {
    bottomRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  };

  const showJumpToBottom = messages.length > 1;

  // Handler for selecting a thread from Sidebar
  const handleThreadSelect = (threadData) => {
    if (!threadData) return;

    setActiveThreadId(threadData.id);

    // reset messages for selected thread
    if (threadData?.messages?.length) {
      setMessages(threadData.messages.map((m) => ({
        role: m.role,
        text: m.content,
        image_url: m.image_url ?? null,
        id: m.id,
        key: m.id,
        stale: false,
        parent_user_id: m.id
      })));
    } else {
      setMessages([]); // empty state if no messages
    }
  };


  /** Create OR reuse assistant message (edit-aware) */
  const appendAssistantMessage = (edit_message_id = null) => {
    setIsEditOrRegenerate(!!edit_message_id); // ← very important flag!
    setWaitingForBackend(true);
    // 🧠 EDIT MODE
    if (edit_message_id) {
      const prevMessages = messages; // 👈 current snapshot
      const target = prevMessages.find(
        m => m.role === "assistant" && m.key === edit_message_id
      );

      if (!target) {
        console.warn("No assistant found for edited message, falling back.");
        return appendAssistantMessage(null);
      }

      const targetKey = target.key;
      setStreamingMessageId(targetKey);

      // now update state
      setMessages(prev =>
        prev.map(m =>
          m.key === targetKey
            ? { ...m, text: "", streaming: true }
            : m
        )
      );

      return {
        tempId: targetKey,

        updateText: (nextText) => {
          setMessages(prev =>
            prev.map(m =>
              m.key === targetKey
                ? { ...m, text: nextText, streaming: true }
                : m
            )
          );
        },

        updateId: (newId) => {
          setMessages(prev =>
            prev.map(m =>
              m.key === targetKey ? { ...m, id: newId } : m
            )
          );
        },

        finish: (status) => {
          setMessages(prev =>
            prev.map(m =>
              m.key === targetKey
                ? { ...m, streaming: false, ...(status ? { status } : {}) }
                : m
            )
          );

          setStreamingMessageId(null);
          setWaitingForBackend(false);
          // setIsEditOrRegenerate(false);
        },
      };
    }

    // 🧠 CASE 2: Normal send — create new assistant
    const tempId = `assistant-${uuidv4()}`;

    setStreamingMessageId(tempId);
    setWaitingForBackend(true);

    setMessages(prev => [
      ...prev,
      {
        key: tempId,
        id: null,
        role: "assistant",
        text: "",
        streaming: true,
      },
    ]);

    return {
      tempId,

      updateText: (nextText) => {
        setMessages(prev =>
          prev.map(m =>
            m.key === tempId
              ? { ...m, text: nextText, streaming: true }
              : m
          )
        );
      },

      updateId: (newId) => {
        setMessages(prev =>
          prev.map(m =>
            m.key === tempId ? { ...m, id: newId } : m
          )
        );
      },

      finish: (status) => {
        setMessages(prev =>
          prev.map(m =>
            m.key === tempId
              ? { ...m, streaming: false, ...(status ? { status } : {}) }
              : m
          )
        );

        setStreamingMessageId(null);
        setWaitingForBackend(false);
        setIsEditOrRegenerate(false);
      },
    };
  };



  /** Insert or update user message */
  const addUserMessage = (text, imageUrl = null, messageId = null) => {
    if (messageId) {
      // UPDATE mode – replace text / image for existing id
      setMessages(prev =>
        prev.map(m =>
          m.id === messageId
            ? { ...m, text, image_url: imageUrl ?? m.image_url }
            : m
        )
      );
      return messageId;               // return same id
    }

    // NEW mode – append as before
    const tempId = `local-${uuidv4()}`;
    setMessages(prev => [
      ...prev,
      { key: tempId, id: null, role: "user", text, image_url: imageUrl, status: "sending" },
    ]);
    return tempId;
  };

  const retryFromAssistant = (assistantMessageId) => {
    const idx = messages.findIndex(m => m.id === assistantMessageId);
    if (idx <= 0) return;

    const prevUser = [...messages].reverse().find(m => m.role === "user" && messages.indexOf(m) < idx);
    if (!prevUser) return;

    promptRef.current?.send(prevUser.text, prevUser.id);
  };


  return (
    <div className="flex h-screen bg-transparent">
      {/* ------------  SIDEBAR  ------------ */}
      <Sidebar open={sidebarOpen} setOpen={setSidebarOpen} onThreadSelect={handleThreadSelect} activeThreadId={activeThreadId} />

      {/* ------------  CHAT AREA  ------------ */}
      <div className="flex flex-1 flex-col">
        {/* header */}
        <Header sidebar={true} sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} protectedRoute={true} />

        {/* messages */}
        <ScrollArea className="flex-1 py-4 bg-transparent" ref={scrollRef}>
          <div className="mx-auto w-full max-w-4xl px-2 sm:px-4">
            {showSnow && <Snowflakes />}
            {showSnow && <SnowFall />}
            {messages.length === 0 ? (
              // ---------- Empty state ----------
              <>
                <motion.div
                  initial={{ opacity: 0, y: 40 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, ease: "easeOut" }}
                  className="flex flex-col items-center justify-center h-[60vh] gap-4 text-center"
                >
                  {/* floating + breathing logo */}
                  <motion.div
                    animate={{
                      y: [0, -10, 0], // float up/down
                      scale: [1, 1.03, 1], // subtle breathe
                    }}
                    transition={{
                      repeat: Infinity,
                      duration: 4,
                      ease: "easeInOut",
                    }}
                    className="relative overflow-hidden rounded-2xl"
                  >
                    <Image
                      src="/MeghX.png"
                      alt="No chats yet"
                      width={500}
                      height={300}
                      className="object-cover opacity-20 dark:opacity-20"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />
                  </motion.div>

                  {/* title pops in */}
                  <motion.h2
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3, duration: 0.6 }}
                    className="text-xl font-semibold"
                  >
                    No conversations yet
                  </motion.h2>

                  {/* description fades last */}
                  <motion.p
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5, duration: 0.6 }}
                    className="text-sm text-muted-foreground max-w-xs"
                  >
                    Start a new chat or select a thread to begin your conversation. Your AI assistant is ready to help!
                  </motion.p>
                </motion.div>
              </>
            ) : (
              <div className="space-y-4">
                <motion.div
                  initial={{ opacity: 0, y: 40 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, ease: "easeOut" }}
                  className="flex flex-col items-center justify-center h-[60vh] gap-4 text-center"
                >
                  {/* floating + breathing logo */}
                  <motion.div
                    animate={{
                      y: [0, -10, 0], // float up/down
                      scale: [1, 1.03, 1], // subtle breathe
                    }}
                    transition={{
                      repeat: Infinity,
                      duration: 4,
                      ease: "easeInOut",
                    }}
                    className="relative overflow-hidden rounded-2xl"
                  >
                    {/* <Image
                      src="/MeghX.png"
                      alt="No chats yet"
                      width={500}
                      height={300}
                      className="object-cover opacity-20 dark:opacity-20"
                    /> */}
                    <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />
                  </motion.div>
                </motion.div>
          
                {messages.map((m) => (
                  <ChatMessage 
                    key={m.key}
                    message_id={m.id} 
                    role={m.role} 
                    text={m.text} 
                    raw={m.raw ?? m.text}
                    image_url={m.image_url ?? null}
                    isStreaming={m.key === streamingMessageId}
                    stale={m.stale}
                    onEditSend={(text, id) => {
                      promptRef.current?.send(text, id);
                    }}
                    onRetry={retryFromAssistant}
                    onReadAloud={(messageId, text) => {
                      if (activeSpeechId === messageId) {
                        stopSpeech();
                        setActiveSpeechId(null);
                        setSpeechLang(null);
                        return;
                      }

                      if (!speechLang) {
                        setPendingSpeech({ messageId, text });
                        setLangModalOpen(true);
                        return;
                      }

                      setActiveSpeechId(messageId);
                      speakText({
                        text,
                        voice: speechLang,
                        onEnd: () => {
                          setActiveSpeechId(null);
                          setSpeechLang(null);
                        },
                      });
                    }}
                    isSpeaking={activeSpeechId === m.id}
                  />
                ))}
              </div>
            )}
            <div ref={bottomRef} />
            {/* sticky bottom input – stays visible while messages scroll above */}
            <div className="sticky bottom-0 z-10 mt-6">
              {/* bottom-right button group */}
              <div className="fixed bottom-36 right-8 z-50 flex flex-col gap-2">
                {/* show/hide input */}
                <Button
                  variant="ghost"
                  size="icon"
                  data-tooltip={inputVisible ? "Hide input" : "Show input"}
                  onClick={() => setInputVisible(v => !v)}
                  className="h-9 w-9 rounded-full
                            bg-white/10 dark:bg-black/20 backdrop-blur
                            border border-white/20 shadow-md
                            hover:bg-white/20 dark:hover:bg-black/30
                            transition-all"
                >
                  <motion.div
                    key={inputVisible ? "hide" : "show"}
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.8, opacity: 0 }}
                    transition={{ type: "spring", stiffness: 300, damping: 10 }}
                  >
                    {inputVisible ? (
                      <EyeOff className="h-4 w-4 text-white/80" />
                    ) : (
                      <Eye className="h-4 w-4 text-white/80" />
                    )}
                  </motion.div>
                </Button>

                {/* snow toggle */}
                <Button
                  variant="ghost"
                  size="icon"
                  data-tooltip={showSnow ? "Hide snow" : "Show snow"}
                  onClick={() => setShowSnow((s) => !s)}
                  className="h-9 w-9 rounded-full
                            bg-white/10 dark:bg-black/20 backdrop-blur
                            border border-white/20 shadow-md
                            hover:bg-white/20 dark:hover:bg-black/30
                            transition-all"
                >
                  <motion.div
                    key={showSnow ? "snow-on" : "snow-off"}
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.8, opacity: 0 }}
                    transition={{ type: "spring", stiffness: 300, damping: 10 }}
                  >
                    {showSnow ? (
                      <SnowflakeIcon className="h-4 w-4 text-white/80" />
                    ) : (
                      <SnowflakeIcon className="h-4 w-4 text-white/40" />
                    )}
                  </motion.div>
                </Button>

                {/* jump to bottom */}
                {showJumpToBottom && (
                  <motion.button
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    onClick={scrollToBottom}
                    className="
                      flex items-center justify-center
                      h-9 w-9 rounded-full
                      bg-background/70 backdrop-blur
                      border border-white/20 shadow-sm
                      hover:bg-accent
                      before:bg-gradient-to-br before:from-purple-400 before:via-pink-400 before:to-indigo-400
                      before:opacity-30 before:-z-10
                    "
                    data-tooltip="Jump to latest"
                  >
                    <ChevronDown className="h-4 w-4 opacity-80" />
                  </motion.button>
                )}
              </div>
              {inputVisible && (
                <div className="px-4 py-3">
                  <PromptInput
                    ref={promptRef}
                    addUserMessage={addUserMessage}
                    appendAssistantMessage={appendAssistantMessage}
                    threadId={activeThreadId}
                    waitingForBackend={waitingForBackend}
                  />
                </div>
              )}
            </div>
          </div>
        </ScrollArea>

        {/* <Separator /> */}

        {/* input */}
        {/* <div className="sticky top-0 z-20 border-b bg-card/95 backdrop-blur px-4 py-3"> */}
          {/* <PromptInput
            addUserMessage={addUserMessage}
            appendAssistantMessage={appendAssistantMessage}
            threadId={activeThreadId}
            waitingForBackend={waitingForBackend}
            // onInterrupt={(data) => setInterrupt(data)}
            // interrupt={interrupt}
          /> */}
        {/* </div> */}
        {/* <Footer /> */}
      </div>
      {/* {interrupt && (
        <InterruptModal
          interrupt={interrupt}
          onSelect={(reply) => {
            setInterrupt(null);
            addUserMessage(reply);
            setTimeout(() => {
              // resend reply through same pipeline
              document.dispatchEvent(new CustomEvent("send-interrupt-reply", {
                detail: reply,
              }));
            }, 0);
          }}
          onClose={() => setInterrupt(null)}
        />
      )} */}

      <ReadAloudLanguageModal
        open={langModalOpen}
        onClose={() => setLangModalOpen(false)}
        onSelect={(voice) => {
          setSpeechLang(voice);

          if (pendingSpeech) {
            setActiveSpeechId(pendingSpeech.messageId);
            speakText({
              text: pendingSpeech.text,
              voice,
              onEnd: () => setActiveSpeechId(null),
            });
            setPendingSpeech(null);
          }
        }}
      />
    </div>
  );
}


function SnowFall() {
  return (
    <style jsx global>{`
      .snowflake {
        position: absolute;
        top: -10px;
        background: white;
        border-radius: 50%;
        opacity: 0.8;
        animation: fall linear infinite;
      }
      @keyframes fall {
        to {
          transform: translateY(100vh);
        }
      }
    `}</style>
  );
}