"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";

import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

export default function InterruptModal({
  interrupt,
  onSelect,
  onClose,
}) {
  if (!interrupt) return null;

  const { interrupt_type, message, candidates = [] } = interrupt;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md rounded-2xl">
        {/* ---------- HEADER ---------- */}
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold">
            Action Required
          </DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground">
            Your confirmation is needed to proceed.
          </DialogDescription>
        </DialogHeader>

        {/* ---------- BODY ---------- */}
        <div className="mt-2 space-y-4">
          {/* message bubble */}
          <div className="rounded-xl border bg-muted/40 p-4 text-sm leading-relaxed">
            <div
              className="prose prose-sm dark:prose-invert max-w-none"
              dangerouslySetInnerHTML={{ __html: message }}
            />
          </div>

          {/* ---------- CONFIRM ---------- */}
          {interrupt_type === "confirm_expense" && (
            <DialogFooter className="flex justify-end gap-2 pt-2">
              <motion.div whileHover={{ scale: 1.05 }}>
                <Button
                  variant="ghost"
                  onClick={() => onSelect(false)}
                >
                  No
                </Button>
              </motion.div>

              <motion.div whileHover={{ scale: 1.05 }}>
                <Button
                  onClick={() => onSelect(true)}
                >
                  Yes, confirm
                </Button>
              </motion.div>
            </DialogFooter>
          )}

          {/* ---------- SELECTION ---------- */}
          {interrupt_type === "expense_selection" && (
            <div className="space-y-2">
              {candidates.map((c) => (
                <motion.div
                  key={c.id}
                  whileHover={{ scale: 1.02 }}
                  transition={{ type: "spring", stiffness: 300, damping: 20 }}
                >
                  <Button
                    variant="outline"
                    className="w-full justify-start rounded-xl px-4 py-3 text-left"
                    onClick={() => onSelect(c.id)}   // ✅ integer only
                  >
                    <div className="flex flex-col">
                      <span className="font-medium">
                        #{c.id} — {c.amount}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {c.note || "No note"}
                      </span>
                    </div>
                  </Button>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
