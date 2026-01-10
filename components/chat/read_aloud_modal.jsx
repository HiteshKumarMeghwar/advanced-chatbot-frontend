import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useEffect, useState } from "react";

export function ReadAloudLanguageModal({ open, onClose, onSelect }) {
  const [voices, setVoices] = useState([]);

  useEffect(() => {
    const loadVoices = () => {
      const all = window.speechSynthesis.getVoices();
      const googleVoices = all.filter(v =>
        v.name.toLowerCase().includes("google")
      );
      setVoices(googleVoices);
    };

    loadVoices();
    window.speechSynthesis.onvoiceschanged = loadVoices;
  }, []);

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Select Read-Aloud Language</DialogTitle>
        </DialogHeader>

        <ScrollArea className="max-h-72 pr-2">
          <div className="space-y-2 m-3">
            {voices.map((v) => (
              <motion.div
                key={v.voiceURI}
                whileHover={{ scale: 1.03 }}
              >
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => {
                    onSelect(v);
                    onClose();
                  }}
                >
                  {v.lang} — {v.name}
                </Button>
              </motion.div>
            ))}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
