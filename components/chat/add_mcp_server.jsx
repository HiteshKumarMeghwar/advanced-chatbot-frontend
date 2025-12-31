import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { Separator } from "@/components/ui/separator";
import { Trash } from "lucide-react";
import { toast } from "sonner";

export function MCPModal({ open, onClose, onSaveReload, servers = [], loading, onDelete, delLoading }) {
  const [name, setName] = useState("");
  const [url, setUrl] = useState("");
  const [token, setToken] = useState("");
  const [error, setError] = useState("");

  const handleSave = () => {
    if (!name.trim()) {
      toast.error("Server name is required");
      return;
    }
    if (!url.startsWith("http")) {
      toast.error("Valid server URL is required");
      return;
    }

    setError("");

    onSaveReload({
      name: name.trim(),
      url: url.trim(),
      token: token.trim(),
    });

    // Clear inputs
    setName("");
    setUrl("");
    setToken("");
  };

  const handleDelete = (serverName) => {
    onDelete(serverName);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>MCP Remote Servers</DialogTitle>
        </DialogHeader>

        <div className="space-y-3 m-3">
          {/* ---------- Server List ---------- */}
          {servers.length > 0 && (
            <div className="space-y-2 max-h-40 overflow-auto">
              {servers.map((s) => (
                <div key={s.name} className="flex justify-between items-center px-2 py-1 border rounded">
                  <div className="truncate">{s.name} - {s.url}</div>
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => handleDelete(s.name)}
                    disabled={loading || delLoading}
                  >
                    <motion.div
                      whileHover={{ scale: 1.25 }}
                      transition={{
                        scale: { type: "spring", stiffness: 300, damping: 10 },
                        rotate: { duration: 0.2 },
                      }}
                    >
                      <Trash className="h-4 w-4 text-red-500" />
                    </motion.div>
                  </Button>
                </div>
              ))}
              <Separator />
            </div>
          )}

          {/* ---------- Input Fields ---------- */}
          <Input
            placeholder="Server Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <Input
            placeholder="Server URL (https://...)"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
          />
          <Input
            placeholder="Auth Token (optional)"
            value={token}
            onChange={(e) => setToken(e.target.value)}
          />
          <div className="flex justify-end gap-2 pt-4">
            <motion.div
              whileHover={{ scale: 1.25 }}
              transition={{
                scale: { type: "spring", stiffness: 300, damping: 10 },
                rotate: { duration: 0.2 },
              }}
            >
              <Button variant="secondary" onClick={onClose} disabled={loading || delLoading}>
                Cancel
              </Button>
            </motion.div>
            <motion.div
              whileHover={{ scale: 1.25 }}
              transition={{
                scale: { type: "spring", stiffness: 300, damping: 10 },
                rotate: { duration: 0.2 },
              }}
            >
              <Button onClick={handleSave} disabled={loading || delLoading}>
                {loading ? "Saving…" : "Save & Reload"}
              </Button>
            </motion.div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
