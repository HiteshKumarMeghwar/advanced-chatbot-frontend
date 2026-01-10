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
import MCPServerSearch from "./mcp_server_search"

export function MCPModal({ open, onClose, onSaveReload, servers = [], loading, onDelete, delLoading }) {
  const [name, setName] = useState("");
  const [url, setUrl] = useState("");
  const [token, setToken] = useState("");
  const [error, setError] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

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

  const handleDelete = (mcpId) => {
    onDelete(mcpId);
  };

  return (
    <>
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        {/* ----------  VIP LOADER  ---------- */}
        {(loading || delLoading) && (
          <div className="absolute inset-0 z-10 grid place-items-center rounded-2xl bg-background/60 backdrop-blur">
            <div className="relative flex flex-col items-center gap-3">
              {/* 3-D gradient sun */}
              <div className="relative h-14 w-14">
                {/* core glow */}
                <div className="absolute inset-0 rounded-full bg-gradient-to-br from-purple-400 via-pink-400 to-indigo-400 blur-md animate-pulse" />
                {/* rotating ring */}
                <div className="absolute inset-0 rounded-full border-4 border-transparent bg-gradient-to-br from-purple-400 via-pink-400 to-indigo-400 bg-clip-border animate-spin" />
                {/* inner star */}
                <svg className="absolute inset-1 h-12 w-12 text-white/90 animate-pulse" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2l2.09 6.26L20.5 8.5l-5.5 4.09L16.82 20 12 16.5 7.18 20l1.82-7.41L2.5 8.5l6.41-.24L12 2z" />
                </svg>
              </div>

              {/* pulsing MeghX line */}
              <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-indigo-400 bg-clip-text text-sm font-semibold text-transparent animate-pulse">
                MCP is working…
              </span>
            </div>
          </div>
        )}
        <DialogHeader className="flex flex-row items-center justify-between">
          <DialogTitle>MCP Remote Servers</DialogTitle>
          <Input
            placeholder="Search MCP servers…"
            className="w-56 h-8 text-sm mt-3"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            // onKeyDown={(e) => {
            //   if (e.key === "Enter" && searchQuery.trim()) {
            //     setSearchOpen(true);
            //   }
            // }}
          />
        </DialogHeader>

        <div className="space-y-3 m-3">
          {/* ---------- Server List ---------- */}
          {servers.length > 0 && (
            <div className="space-y-2 max-h-40 overflow-auto">
              {servers.map((s) => (
                <div key={s.id} className="flex justify-between items-center px-2 py-1 border rounded">
                  <div className="truncate">{s.name} - {s.url}</div>
                  <Button
                    size="icon"
                    variant="ghost"
                    data-tooltip="Delete MCP"
                    onClick={() => handleDelete(s.id)}
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

    <Dialog open={searchOpen} onOpenChange={setSearchOpen}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>Search MCP Servers</DialogTitle>
        </DialogHeader>
        hello working
        <MCPServerSearch
          query={searchQuery}
          onSelect={(server) => {
            setName(server.name);
            setUrl(server.url);
            setToken(server.token ?? "");
            setSearchOpen(false);
          }}
        />
      </DialogContent>
    </Dialog>
    </>
  );
}
