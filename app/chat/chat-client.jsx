"use client";

import { useState, useRef, useEffect } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import PromptInput from "@/components/chat/prompt-input";
import ChatMessage from "@/components/chat/chat-message";
import Sidebar from "@/components/chat/sidebar";
import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";
import Image from 'next/image'
import { motion } from "framer-motion";
import Snowflakes from "./snow-flakes"
import { v4 as uuidv4 } from "uuid";


export default function ChatPage() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [messages, setMessages] = useState([]);
  const [activeThreadId, setActiveThreadId] = useState(null);
  const [streamingMessageId, setStreamingMessageId] = useState(null);
  const [waitingForBackend, setWaitingForBackend] = useState(false);

  const scrollRef  = useRef(null);
  const bottomRef  = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({
      behavior: streamingMessageId ? "auto" : "smooth",
    });
  }, [messages, streamingMessageId]);

  // Handler for selecting a thread from Sidebar
  const handleThreadSelect = (threadData) => {
    if (!threadData) return;

    setActiveThreadId(threadData.id);

    // reset messages for selected thread
    if (threadData?.messages?.length) {
      setMessages(threadData.messages.map((m) => ({
        role: m.role,
        text: m.content,
        id: m.id
      })));
    } else {
      setMessages([]); // empty state if no messages
    }
  };


  /** Create ONCE, then update the SAME assistant message */
  const appendAssistantMessage = () => {
    const id = `assistant-${uuidv4()}`;

    setStreamingMessageId(id);
    setWaitingForBackend(true); 

    // 1️⃣ create the empty shell only once
    setMessages(prev => [
      ...prev,
      { id, role: "assistant", text: "", streaming: true },
    ]);

    // 2️⃣ return both id and an updater function
    return {
      id,
      updateText: (nextText) => {
        setMessages(prev =>
          prev.map(m => (m.id === id ? { ...m, text: nextText } : m))
        );
      },
      finish: () => {
        setMessages(prev =>
          prev.map(m => (m.id === id ? { ...m, streaming: false } : m))
        );
        setStreamingMessageId(null);
        setWaitingForBackend(false);
      },
    };
  };



  /** Add user message immediately */
  const addUserMessage = (text) => {
    const id = `local-${uuidv4()}`;

    setMessages(prev => [
      ...prev,
      {
        id,
        role: "user",
        text,
        status: "sending",
      },
    ]);

    return id;
  };



  return (
    <div className="flex h-screen bg-background">
      {/* ------------  SIDEBAR  ------------ */}
      <Sidebar open={sidebarOpen} setOpen={setSidebarOpen} onThreadSelect={handleThreadSelect} activeThreadId={activeThreadId} />

      {/* ------------  CHAT AREA  ------------ */}
      <div className="flex flex-1 flex-col">
        {/* header */}
        <Header sidebar={true} sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} protectedRoute={true} />

        {/* messages */}
        <ScrollArea className="flex-1 py-4" ref={scrollRef}>
          <div className="mx-auto w-full max-w-4xl px-2 sm:px-4">
            {messages.length === 0 ? (
              // ---------- Empty state ----------
              <>
                <Snowflakes />
                <SnowFall />
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
                {messages.map((m) => (
                  <ChatMessage 
                    key={m.id} 
                    role={m.role} 
                    text={m.text} 
                    raw={m.raw ?? m.text}
                    isStreaming={m.id === streamingMessageId} 
                  />
                ))}
              </div>
            )}
            <div ref={bottomRef} />
          </div>
        </ScrollArea>

        {/* <Separator /> */}

        {/* input */}
        <div className="sticky top-0 z-20 border-b bg-card/95 backdrop-blur px-4 py-3">
          <PromptInput
            addUserMessage={addUserMessage}
            appendAssistantMessage={appendAssistantMessage}
            threadId={activeThreadId}
            waitingForBackend={waitingForBackend}
          />
        </div>
        {/* <Footer /> */}
      </div>
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