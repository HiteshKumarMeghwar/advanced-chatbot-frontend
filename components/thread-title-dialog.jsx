"use client";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";

export default function ThreadTitleDialog({
  open,
  onOpenChange,
  mode = "create",        // "create" | "rename"
  initialTitle = "",
  onConfirm,
}) {
  const [title, setTitle] = useState(initialTitle);
  const [busy, setBusy] = useState(false);

  /* keep input in sync when dialog flips to rename mode */
  useEffect(() => setTitle(initialTitle), [initialTitle]);

  const handleConfirm = async () => {
    setBusy(true);
    await onConfirm(title.trim());   // parent does API call
    setBusy(false);
    onOpenChange(false);             // close dialog
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {mode === "create" ? "Start a new conversation" : "Rename conversation"}
          </DialogTitle>
          <DialogDescription>
            {mode === "create"
              ? "Give your conversation a name. You can skip this and rename it later."
              : "Enter a new title for this chat."}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-2 rounded-xl p-2 m-4 transition">
          <Input
            placeholder="e.g. Product brainstorming"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && !busy && handleConfirm()}
            disabled={busy}
            autoFocus
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
              onClick={() => onOpenChange(false)}
              disabled={busy}
            >
              Cancel
            </Button>
          </motion.div>

          <motion.div
            whileHover={{ scale: 1.2 }}
            transition={{ type: "spring", stiffness: 300, damping: 10 }}
          >
            <Button onClick={handleConfirm} disabled={busy}>
              {busy ? "Saving…" : mode === "create" ? "Create" : "Save"}
            </Button>
          </motion.div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}