"use client";

import { useEffect, useState } from "react";
import { ChevronRight, Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
// import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import FileUploadDrawer from "./file-upload-drawer";
import { motion } from "framer-motion";
import { fetchThreads, createThread, deleteThread, fetchThreadMessages } from "@/api/threads";
import { useRouter } from "next/navigation";

export default function Sidebar({ open, setOpen, onThreadSelect, activeThreadId }) {
  const [threads, setThreads] = useState([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    if (!loading && threads.length > 0 && !activeThreadId) {
      // auto-open the top (most recent) thread
      handleThreadClick(threads[0].id);
    }
  }, [loading, threads, activeThreadId]);

  // fetch threads on mount
  useEffect(() => {
    if (!open) return;
    setLoading(true);
    fetchThreads()
      .then(setThreads)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [open]);

  /* 1.  auto-close when we resize to mobile */
  useEffect(() => {
    const mql = window.matchMedia("(max-width: 767px)");
    const onChange = (e) => {
      if (e.matches) setOpen(false);   // entering mobile → close
    };
    onChange(mql);          // initial call
    mql.addEventListener("change", onChange);
    return () => mql.removeEventListener("change", onChange);
  }, [setOpen]);

  /* 2.  hide component when closed (same markup always) */
  if (!open) return null;

  const handleCreateThread = async () => {
    const title = prompt("Enter thread title");
    const threadTitle = title?.trim() || "Untitled Thread";
    try {
      setLoading(true)
      const newThread = await createThread(threadTitle);
      setThreads((prev) => [newThread, ...prev]);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false)
    }
  };

  const handleDeleteThread = async (threadId) => {
    setLoading(true)
    try {
      await deleteThread(threadId);
      setThreads((prev) => prev.filter((t) => t.id !== threadId));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false)
    }
  };

  const handleThreadClick = async (threadId) => {
    setLoading(true)
    try {
      const threadData = await fetchThreadMessages(threadId);
      if (onThreadSelect) onThreadSelect(threadData);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false)
      router.replace("/chat");
      router.refresh();
    }
  };

  const user = { name: "MeghX", email: "meghx@gmail.com" };

  /* 3.  responsive classes – desktop permanent, mobile absolute overlay */
  return (
    <aside
      className={`
        fixed inset-y-0 left-0 z-40 w-64 border-r bg-card flex flex-col
        md:relative md:inset-auto md:z-auto
      `}
    >
      {/* user strip */}
      <motion.div
        whileHover={{ scale: 1.15 }} // subtle 15 % growth
        transition={{
          scale: { type: "spring", stiffness: 80, damping: 15 }, // gentle spring
        }}
      >
      <div className="flex items-center gap-3 p-4">
        <Avatar>
          <AvatarFallback>{user.name.slice(0, 2).toUpperCase()}</AvatarFallback>
        </Avatar>
        <div className="flex-1 overflow-hidden">
          <p className="text-sm font-medium truncate">{user.name}</p>
          <p className="text-xs text-muted-foreground truncate">{user.email}</p>
        </div>
      </div>
      </motion.div>

      {/* <Separator /> */}

      <div className="p-4">
        <FileUploadDrawer />
      </div>

      {/* <Separator /> */}

      <ScrollArea className="flex-1 px-4 py-2">
        <div className="mb-2 flex items-center justify-between">
          <span className="text-xs font-semibold uppercase text-muted-foreground">Threads</span>
          <motion.div
            whileHover={{ scale: 1.08 }}
            transition={{
              scale: { type: "spring", stiffness: 120, damping: 14 },
            }}
          >
          <Button title="Add New Thread" className="mr-6" variant="ghost" size="icon-xs" onClick={handleCreateThread}>
            <Plus className="h-4 w-4" />
          </Button>
          </motion.div>
        </div>
        <div className="space-y-1">
          {loading ? (
              <p className="text-xs text-center bg-gradient-to-r from-purple-400 via-pink-400 to-indigo-400 bg-clip-text text-transparent animate-pulse drop-shadow-sm">Loading…</p>
            ) : threads.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25 }}
              className="rounded-md border border-dashed p-3 text-center"
            >
              <p className="text-xs text-muted-foreground mb-2">
                No conversations yet
              </p>
            </motion.div>
          ) : (
            threads.map((t) => (
              <motion.div
                key={t.id}
                whileHover={{ scale: 1.03 }}
                transition={{ type: "spring", stiffness: 120, damping: 16 }}
                className={`
                  flex items-center gap-2 w-full rounded-md px-1
                  transition-all
                  ${
                    activeThreadId === t.id
                      ? "bg-primary/10 shadow-sm ring-1 ring-primary/30"
                      : "hover:bg-muted"
                  }
                `}
              >
                <Button
                  title="View chat of this Thread"
                  variant="ghost"
                  className={`
                    flex-1 justify-start
                    ${activeThreadId === t.id ? "font-medium text-primary" : ""}
                  `}
                  onClick={() => handleThreadClick(t.id)}
                >
                  <ChevronRight className="mr-2 h-4 w-4" />
                  {t.title || "Untitled Thread"}
                </Button>
                <Button
                  title="Delete that Thread"
                  variant="ghost"
                  size="icon-xs"
                  className="mr-6"
                  onClick={() => handleDeleteThread(t.id)}
                >
                  <X className="h-3 w-3 text-red-500" />
                </Button>
              </motion.div>
            ))
          )}
        </div>
      </ScrollArea>
    </aside>
  );
}
