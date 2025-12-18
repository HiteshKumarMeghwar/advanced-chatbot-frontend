"use client";

import { useEffect, useState } from "react";
import { ChevronRight, Plus, X, FileText, Star, File, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import FileUploadDrawer from "./file-upload-drawer";
import { motion } from "framer-motion";
import { fetchThreads, createThread, deleteThread, fetchThreadMessages } from "@/api/threads";
import { useRouter } from "next/navigation";
import { deleteDocument } from "@/api/documents";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

export default function Sidebar({ open, setOpen, onThreadSelect, activeThreadId }) {
  const [threads, setThreads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [createOpen, setCreateOpen] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [creating, setCreating] = useState(false);
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

    const initThreads = async () => {
      setLoading(true);
      try {
        let fetchedThreads = await fetchThreads();

        // If no threads exist, create one automatically
        if (!fetchedThreads || fetchedThreads.length === 0) {
          const newThread = await createThread("Welcome MeghX");
          fetchedThreads = [newThread];
        }

        setThreads(fetchedThreads);

        // Auto-select the first thread
        if (fetchedThreads.length > 0) {
          handleThreadClick(fetchedThreads[0].id);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    initThreads();
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

  const handleConfirmCreateThread = async () => {
    if (creating) return;

    const title =
      newTitle.trim() || "Untitled Thread";

    try {
      setCreating(true);
      setLoading(true);

      const newThread = await createThread(title);

      setThreads((prev) => [newThread, ...prev]);

      toast.success("New conversation created");

      setCreateOpen(false);
      setNewTitle("");

      await handleThreadClick(newThread.id);
    } catch (err) {
      toast.error("Failed to create conversation");
    } finally {
      setCreating(false);
      setLoading(false);
    }
  };

  const handleDeleteThread = async (threadId) => {
    if (loading) return;

    setLoading(true);
    try {
      const isLastThread = threads.length === 1;

      // 1️⃣ delete requested thread
      await deleteThread(threadId);

      if (isLastThread) {
        // 2️⃣ create fresh thread immediately
        const newThread = await createThread("New Conversation");

        setThreads([newThread]);

        // 3️⃣ auto-select it
        await handleThreadClick(newThread.id);
      } else {
        // 4️⃣ normal delete flow
        const remaining = threads.filter((t) => t.id !== threadId);
        setThreads(remaining);

        // 5️⃣ ensure active thread stays valid
        if (activeThreadId === threadId) {
          await handleThreadClick(remaining[0].id);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
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

  const handleDeleteDocument = async (docId) => {
    if (!activeThreadId) return;

    // optimistic UI
    setThreads(prev =>
      prev.map(t =>
        t.id === activeThreadId
          ? { ...t, documents: t.documents.filter(d => d.id !== docId) }
          : t
      )
    );

    try {
      const res = await deleteDocument(activeThreadId, docId);
      if (res.status === "already_deleted") {
        toast.info("Document was already removed");
      }else{
        toast.success("Document deleted successfully");
      }
    } catch (err) {
      toast.error(err.message);

      // rollback
      const refreshed = await fetchThreads();
      setThreads(refreshed);
    }
  };


  /* ---------- icon by extension ---------- */
  const iconByExt = (ext) => {
    const map = {
      ".pdf":  { icon: File, color: "text-red-500" },
      ".docx": { icon: File, color: "text-blue-500" },
      ".doc":  { icon: File, color: "text-blue-500" },
      ".txt":  { icon: FileText, color: "text-green-500" },
      ".md":   { icon: FileText, color: "text-purple-500" },
      ".pptx": { icon: Presentation, color: "text-orange-500" },
    };
    const found = map[ext.toLowerCase()];
    if (!found) return { icon: File, color: "text-slate-500" }; // fallback
    return found;
  };

  const truncateTitle = (text, max = 15) => {
    if (!text) return "Untitled Thread";
    return text.length > max ? text.slice(0, max) + "…" : text;
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
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Start a new conversation</DialogTitle>
            <DialogDescription>
              Give your conversation a name. You can skip this and rename it later.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-2 rounded-xl p-2 m-4 transition">
            <Input
              placeholder="e.g. Product brainstorming"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleConfirmCreateThread();
              }}
              disabled={creating}
            />
            <p className="text-xs text-muted-foreground">
              Leave empty to create an untitled conversation.
            </p>
          </div>

          <DialogFooter className="gap-2">
            <motion.div
              whileHover={{ scale: 1.2 }}
              transition={{ type: "spring", stiffness: 300, damping: 10 }}
            >
              <Button
                variant="ghost"
                onClick={() => setCreateOpen(false)}
                disabled={creating}
              >
                Cancel
              </Button>
            </motion.div>
            <motion.div
              whileHover={{ scale: 1.2 }}
              transition={{ type: "spring", stiffness: 300, damping: 10 }}
            >
              <Button
                onClick={handleConfirmCreateThread}
                disabled={creating}
              >
                {creating ? "Creating…" : "Create"}
              </Button>
            </motion.div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* user strip */}
      <motion.div
        whileHover={{ scale: 1.15 }} // subtle 15 % growth
        transition={{
          scale: { type: "spring", stiffness: 80, damping: 15 }, // gentle spring
        }}
      >
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Avatar>
          <AvatarFallback>{user.name.slice(0, 2).toUpperCase()}</AvatarFallback>
        </Avatar>
        <div className="flex-1 overflow-hidden">
          <p className="text-sm font-medium truncate">{user.name}</p>
          <p className="text-xs text-muted-foreground truncate">{user.email}</p>
        </div>
      </div>
      </motion.div>

      <Separator />

      <div className="text-center p-4">
        <FileUploadDrawer 
          threadId={activeThreadId}

          onUploadComplete={async () => {
            setLoading(true);
            try {
              const updatedThreads = await fetchThreads();
              setThreads(updatedThreads);
            } catch (err) {
              console.error(err);
            } finally {
              setLoading(false);
            }
          }}
        />
      </div>
      
      {/* ----- Documents for ACTIVE thread ----- */}
      <div className="mb-3">
        <span className="text-xs font-semibold uppercase text-muted-foreground ml-3">Uploaded Documents</span>
      </div>
      <div className="m-4">
        <div className="space-y-1">
          {(() => {
            const active = threads.find((t) => t.id === activeThreadId) || threads[0];
            if (!active?.documents?.length)
              return (
                <div className="rounded-lg border border-dashed p-3 my-2 text-center">
                  <FileText className="mx-auto h-6 w-6 text-muted-foreground mb-2" />
                  <p className="text-xs text-muted-foreground">No documents yet</p>
                </div>
              );

            return (active.documents.map((doc) => {
              const { icon: Icon, color } = iconByExt(doc.file_type);
              return (
                <div key={doc.id} className="group flex items-center gap-3 rounded-lg border bg-card p-3 my-2 shadow-sm hover:shadow transition-shadow">
                  <Icon className={`h-5 w-5 ${color}`} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate" title={doc.file_name}>{doc.file_name}</p>
                    <p className="text-xs text-muted-foreground">
                      {doc.file_type.toUpperCase()} · {new Date(doc.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <Trash2
                    className="
                      h-4 w-4 text-red-500 opacity-0
                      group-hover:opacity-100 cursor-pointer
                      transition
                    "

                    onClick={(e) => {
                      e.stopPropagation(); // don’t trigger thread switch
                      handleDeleteDocument(doc.id);
                    }}
                  />
                </div>
              );
            }))
          })()}
        </div>

        <Separator className="mb-2" />

        <div className="mb-2 flex items-center justify-between">
          <span className="text-xs font-semibold uppercase text-muted-foreground">Threads</span>
          <motion.div
            whileHover={{ scale: 1.08 }}
            transition={{
              scale: { type: "spring", stiffness: 120, damping: 14 },
            }}
          >
          <Button title="Add New Thread" variant="ghost" size="icon-xs" onClick={() => setCreateOpen(true)}>
            <Plus className="h-4 w-4" />
          </Button>
          </motion.div>
        </div>
        <div className="space-y-1 pb-5">
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
                  group flex items-center gap-3 rounded-lg border bg-card p-1 my-2 shadow-sm hover:shadow transition-shadow
                  ${
                    activeThreadId === t.id
                      ? "bg-primary/10 shadow-sm ring-1 ring-primary/30"
                      : "hover:bg-muted"
                  }
                `}
              >
                {/* left side – title */}
                <Button
                  title={t.title || "Untitled Thread"}
                  variant="ghost"
                  onClick={() => handleThreadClick(t.id)}
                  className="flex-1 justify-start text-left"
                >
                  {truncateTitle(t.title, 20)}
                </Button>
                {/* right side – trash */}
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-red-500 opacity-0 group-hover:opacity-100 transition"
                  onClick={(e) => {
                    e.stopPropagation(); // don’t trigger thread switch
                    handleDeleteThread(t.id);
                  }}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </motion.div>
            ))
          )}
        </div>
      </div>
    </aside>
  );
}
