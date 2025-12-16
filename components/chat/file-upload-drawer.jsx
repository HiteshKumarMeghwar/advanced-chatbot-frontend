"use client";

import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { Upload, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { motion, AnimatePresence } from "framer-motion";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ScrollArea } from "../ui/scroll-area";

export default function FileUploadDrawer() {
  const [open, setOpen] = useState(false);
  const [files, setFiles] = useState([]);

  const onDrop = useCallback((acceptedFiles) => {
    setFiles((prev) => [...prev, ...acceptedFiles]);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "application/pdf": [".pdf"],
      "text/plain": [".txt"],
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document": [".docx"],
    },
    multiple: true,
  });

  const removeFile = (idx) => setFiles((f) => f.filter((_, i) => i !== idx));
  const handleUpload = () => {
    console.log("Upload >>>", files);
    setFiles([]);
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
        <motion.div
          whileHover={{ scale: 1.15 }} // subtle 15 % growth
          transition={{
            scale: { type: "spring", stiffness: 80, damping: 15 }, // gentle spring
          }}
        >
        <DialogTrigger>
          <div className="w-full cursor-pointer rounded-md border border-input bg-background px-4 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground">
            <Upload className="mr-2 inline h-4 w-4" />
            Upload Documents
          </div>
        </DialogTrigger>

        </motion.div>
        
      <DialogContent className="sm:max-w-md">
        <DialogHeader className="relative">
          <DialogTitle>Upload documents</DialogTitle>
          <DialogDescription>Drag & drop or browse multiple files.</DialogDescription>
        </DialogHeader>

        <div
          {...getRootProps()}
          className={`border-2 border-dashed rounded-xl p-6 m-4 text-center cursor-pointer transition ${
            isDragActive ? "border-primary bg-primary/5" : "border-muted-foreground/25"
          }`}
        >
          <input {...getInputProps()} />
          {isDragActive ? (
            <p className="text-sm">Drop here …</p>
          ) : (
            <p className="text-sm text-muted-foreground">
              Drag & drop or <span className="underline">browse</span>
            </p>
          )}
        </div>

        {files.length > 0 && (
          <div className="px-4 pb-4">
            <ScrollArea className="h-48 rounded-md border"> {/* 👈 max 12 rem */}
              {files.map((f, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between px-3 py-2 hover:bg-accent/50 transition"
                >
                  <span className="text-sm truncate flex-1">{f.name}</span>
                  <motion.div
                    whileHover={{ scale: 1.2 }}
                    transition={{ type: "spring", stiffness: 300, damping: 10 }}
                  >
                    <Button
                      variant="ghost"
                      size="icon-xs"
                      onClick={() => removeFile(i)}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </motion.div>
                </div>
              ))}
            </ScrollArea>
          </div>
        )}
        <div className="flex justify-end gap-2 m-4">
          <motion.div
            whileHover={{ scale: 1.2 }}
            transition={{ type: "spring", stiffness: 100, damping: 10 }}
          >

          <Button onClick={() => setOpen(false)}>Cancel</Button>
          </motion.div>
          <motion.div
            whileHover={{ scale: 1.2 }}
            transition={{ type: "spring", stiffness: 100, damping: 10 }}
          >
          <Button onClick={handleUpload} disabled={!files.length}>Upload</Button>
          </motion.div>
        </div>
      </DialogContent>
    </Dialog>
  );
}