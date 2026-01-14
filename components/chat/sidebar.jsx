"use client";

import { useEffect, useState } from "react";
import { ChevronRight, Plus, X, FileText, Star, File, MoreVertical, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import FileUploadDrawer from "./file-upload-drawer";
import { motion } from "framer-motion";
import { fetchThreads, createThread, deleteThread, fetchThreadMessages, renameThread } from "@/api/threads";
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
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Input } from "@/components/ui/input";
import ThreadTitleDialog from "../thread-title-dialog";

export default function Sidebar({ open, setOpen, onThreadSelect, activeThreadId }) {
  const [threads, setThreads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState("create");   // "create" | "rename"
  const [renameTarget, setRenameTarget] = useState({ id: "", title: "" });
  const [showAll, setShowAll] = useState(false);
  const [showAllDocs, setShowAllDocs] = useState(false);
  const [deleteDoc, setDeleteDoc] = useState(false);
  const router = useRouter();
  
  const THREAD_LIMIT = 5;
  const visibleThreads = showAll ? threads : threads.slice(0, THREAD_LIMIT);
  
  const DOCS_LIMIT = 3;
  const active = threads.find((t) => t.id === activeThreadId) || threads[0];
  const visibleDocs = showAllDocs ? active?.documents : active?.documents?.slice(0, DOCS_LIMIT);

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
    // fetchUser();
  }, [open]);


   useEffect(() => {
    if (!loading && threads.length > 0 && !activeThreadId) {
      // auto-open the top (most recent) thread
      handleThreadClick(threads[0].id);
    }
  }, [loading, threads, activeThreadId]);


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

  const handleConfirmTitle = async (title) => {
    if (dialogMode === "create") await handleConfirmCreateThread(title);
    else await handleConfirmRenameThread(renameTarget.id, title);
    setDialogOpen(false);
  };

  const handleConfirmCreateThread = async (title) => {
    if (loading) return;

    try {
      setLoading(true);
      const newThread = await createThread(title || "Untitled Thread");

      setThreads((prev) => [newThread, ...prev]);

      toast.success("New conversation created");
      await handleThreadClick(newThread.id);
    } catch (err) {
      toast.error("Failed to create conversation");
    } finally {
      setLoading(false);
    }
  };

  /* ---------- handlers ---------- */
  const openCreate = () => {
    setDialogMode("create");
    setRenameTarget({ id: "", title: "" });
    setDialogOpen(true);
  };

  const openRename = (id, oldTitle) => {
    setDialogMode("rename");
    setRenameTarget({ id, title: oldTitle });
    setDialogOpen(true);
  };

  const handleConfirmRenameThread = async (id, newTitle) => {
    try {
      setLoading(true);
      await renameThread(id, newTitle);
      setThreads((prev) =>
        prev.map((t) => (t.id === id ? { ...t, title: newTitle } : t))
      );
      toast.success("Renamed");
    } catch {
      toast.error("Rename failed");
    } finally {
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

    try {
      setDeleteDoc(true)
      const data = await deleteDocument(activeThreadId, docId);
      if (data.status === "already_deleted") {
        toast.info("Document was already removed");
      } else if (data.status === "deleted") {
        setThreads(prev =>
          prev.map(t =>
            t.id === activeThreadId
              ? { ...t, documents: t.documents.filter(d => d.id !== docId) }
              : t
          )
        );
        toast.success("Document deleted successfully");
      }

    } catch (err) {
      toast.error(err.message);

      // rollback
      const refreshed = await fetchThreads();
      setThreads(refreshed);
    } finally {
      setDeleteDoc(false)
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
  

  /* 3.  responsive classes – desktop permanent, mobile absolute overlay */
  return (
    <aside
      className="
        fixed inset-y-0 left-0 z-40 w-64 border-r bg-card
        flex flex-col h-screen
        md:relative md:inset-auto md:z-auto
      "
    >
      {/* single dialog: create OR rename */}
      <ThreadTitleDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        mode={dialogMode}
        initialTitle={renameTarget.title}
        onConfirm={handleConfirmTitle}
      />
      
      {/* user strip */}
      {/* <motion.div
        whileHover={{ scale: 1.15 }} // subtle 15 % growth
        transition={{
          scale: { type: "spring", stiffness: 80, damping: 15 }, // gentle spring
        }}
      > */}
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* <Avatar>
          <AvatarFallback>{user.name.slice(0, 2).toUpperCase()}</AvatarFallback>
        </Avatar>
        <div className="flex-1 overflow-hidden">
          <p className="text-sm font-medium truncate">{user.name}</p>
          <p className="text-xs text-muted-foreground truncate">{user.email}</p>
        </div> */}
      </div>
      {/* </motion.div>

      <Separator /> */}

      <div className="flex-1 min-h-0 m-4 flex flex-col">
        {/* ----- Document Upload System ----- */}
        <div className="mb-3">
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
          <span className="text-xs font-semibold uppercase text-muted-foreground">
            Uploaded Documents
          </span>
        </div>

        <ScrollArea className="max-h-[30%] min-h-[6rem] pr-1">
          <div className="space-y-1">
            {loading || deleteDoc ? (
              <div className="flex items-center justify-center gap-1 text-xs text-muted-foreground">
                {Array.from({ length: 4 }).map((_, i) => (
                  <span
                    key={i}
                    className="w-1.5 h-1.5 rounded-full bg-gradient-to-r from-purple-400 to-pink-400 animate-pulse"
                    style={{ animationDelay: `${i * 150}ms` }}
                  />
                ))}
              </div>
            ) :(
              !active?.documents?.length ? (
                <div className="rounded-lg border border-dashed p-1 m-2 text-center">
                  <FileText className="mx-auto h-6 w-6 text-muted-foreground mb-2" />
                  <p className="text-xs text-muted-foreground">No documents yet</p>
                </div>
              ) : (
                <>
                  {visibleDocs.map((doc) => {
                    const { icon: Icon, color } = iconByExt(doc.file_type);
                    return (
                      <div
                        key={doc.id}
                        className="group flex items-center gap-3 rounded-lg border bg-card p-1 m-2 shadow-sm hover:shadow transition-shadow"
                      >
                        <Icon className={`h-5 w-5 ${color}`} />
                        <div className="flex-1 min-w-0">
                          <p
                            className="text-sm font-medium truncate"
                            data-tooltip={doc.file_name}
                          >
                            {doc.file_name}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {doc.file_type.toUpperCase()} ·{" "}
                            {new Date(doc.created_at).toLocaleDateString()}
                          </p>
                        </div>
                        <Button
                          data-tooltip="Delete Doc"
                          variant="ghost"
                          size="icon"
                          className="
                            h-4 w-4 text-red-500 opacity-0
                            group-hover:opacity-100 cursor-pointer
                            transition
                          "
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteDocument(doc.id);
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    );
                  })}
  
                  {active.documents.length > DOCS_LIMIT && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowAllDocs((v) => !v)}
                      className="text-center"
                    >
                      {showAllDocs
                        ? "Show less"
                        : `See all (${active.documents.length})`}
                    </Button>
                  )}
                </>
              )
            )}
          </div>
        </ScrollArea>

        <Separator className="mb-2" />

        {/* ----- Threads title and and list ----- */}
        <div className="mb-2 flex items-center justify-between">
          <span className="text-xs font-semibold uppercase text-muted-foreground">Conversations</span>
          <motion.div
            whileHover={{ scale: 1.08 }}
            transition={{
              scale: { type: "spring", stiffness: 120, damping: 14 },
            }}
          >
          <Button data-tooltip="Add New Thread" variant="ghost" size="icon-xs" onClick={openCreate}>
            <Plus className="h-4 w-4" />
          </Button>
          </motion.div>
        </div>
        <ScrollArea className="flex-1 min-h-0 pr-1">
          <div className="space-y-1">
            {loading ? (
                <div className="flex items-center justify-center gap-1 text-xs text-muted-foreground">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <span
                      key={i}
                      className="w-1.5 h-1.5 rounded-full bg-gradient-to-r from-purple-400 to-pink-400 animate-pulse"
                      style={{ animationDelay: `${i * 150}ms` }}
                    />
                  ))}
                </div>
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
              <>
                {visibleThreads.map((t) => (
                  <motion.div
                    key={t.id}
                    whileHover={{ scale: 1.03 }}
                    transition={{ type: "spring", stiffness: 120, damping: 16 }}
                    className={`
                      group flex items-center gap-3 rounded-lg border bg-card p-1 m-2 shadow-sm hover:shadow transition-shadow
                      ${
                        activeThreadId === t.id
                          ? "bg-primary/10 shadow-sm ring-1 ring-primary/30"
                          : "hover:bg-muted"
                      }
                    `}
                  >
                    {/* left side – title */}
                    <Button
                      data-tooltip={t.title || "Untitled Thread"}
                      variant="ghost"
                      onClick={() => handleThreadClick(t.id)}
                      className="flex-1 justify-start text-left"
                    >
                      {truncateTitle(t.title, 15)}
                    </Button>
                    {/* right side – three-dot menu */}
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="opacity-0 group-hover:opacity-100 transition"
                        >
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>

                      <DropdownMenuContent align="end" sideOffset={4}>
                        <DropdownMenuItem onSelect={() => openRename(t.id, t.title)}>
                          <Pencil className="mr-2 h-4 w-4" />
                          Rename
                        </DropdownMenuItem>

                        <DropdownMenuItem
                          onSelect={() => handleDeleteThread(t.id)}
                          className="text-red-600 focus:text-red-600"
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </motion.div>
                ))}
                {threads.length > THREAD_LIMIT && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="mt-2 flex justify-center"
                  >
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowAll((v) => !v)}
                      className="text-xs text-muted-foreground hover:text-foreground"
                    >
                      {showAll ? "Show less" : `See all (${threads.length})`}
                    </Button>
                  </motion.div>
                )}
              </>
            )}
          </div>
        </ScrollArea>
      </div>
    </aside>
  );
}
