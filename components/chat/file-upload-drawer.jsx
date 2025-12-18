"use client";

import { useState, useCallback, useEffect } from "react";
import { useDropzone } from "react-dropzone";
import { Upload, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { uploadDocuments } from "@/api/documents";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";
import { Progress } from "@/components/ui/progress";

export default function FileUploadDrawer({ threadId, onUploadComplete }) {
  const [open, setOpen] = useState(false);
  const [files, setFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);

  const MAX_BYTES = Number(process.env.NEXT_PUBLIC_MAX_BYTES);
  const ALLOWEDEXT = process.env.NEXT_PUBLIC_ALLOWED_EXT.split(",");

  /* ---------- validation ---------- */
  const validateFile = (file) => {
    const ext = file.name.slice(file.name.lastIndexOf(".")).toLowerCase();
    if (!ALLOWEDEXT.includes(ext)) {
      return `Unsupported file type: ${ext}`;
    }
    if (file.size > MAX_BYTES) {
      return `File too large: ${(file.size / 1024 / 1024).toFixed(1)} MB`;
    }
    return null;
  };

  /* ---------- drop handler ---------- */
  const onDrop = useCallback((acceptedFiles) => {
    const valid = [];
    acceptedFiles.forEach((file) => {
      const err = validateFile(file);
      if (err) {
        toast.error(err);
        return;
      }
      valid.push(file);
    });
    setFiles((prev) => [...prev, ...valid]);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    multiple: true,
    disabled: uploading,
  });

  /* ---------- cleanup on close ---------- */
  useEffect(() => {
    if (!open) {
      setFiles([]);
      setProgress(0);
      setUploading(false);
    }
  }, [open]);

  const removeFile = (idx) =>
    setFiles((f) => f.filter((_, i) => i !== idx));

  /* ---------- upload ---------- */
  const handleUpload = async () => {
    if (!threadId) {
      toast.error("No active thread selected");
      return;
    }
    if (!files.length) {
      toast.error("No files selected");
      return;
    }
    if (uploading) return;

    setUploading(true);
    setProgress(0);

    try {
      const res = await uploadDocuments(files, threadId, setProgress);
      console.log(res)

      const { total, uploaded, skipped, processed } = res;

      /* ---------- Success toast ---------- */
      if (uploaded > 0) {
        toast.success(
          `${uploaded} document${uploaded > 1 ? "s" : ""} uploaded successfully`
        );
      }

      /* ---------- Informational toast for duplicates ---------- */
      if (skipped > 0) {
        const skippedFiles = processed.filter(
          d => d.status === "duplicate_skipped"
        );

        toast.message("Duplicate files skipped", {
          description: (
            <div className="space-y-1">
              {skippedFiles.map(file => (
                <div key={file.file_name} className="text-sm">
                  • {file.file_name}
                </div>
              ))}
            </div>
          ),
        });
      }

      /* ---------- Edge case: nothing uploaded ---------- */
      if (uploaded === 0 && skipped === total) {
        toast.info("All selected files were already uploaded");
      }

      /* ---------- Cleanup ---------- */
      setFiles([]);
      setOpen(false);
      
      // Refresh Sidebar documents
      if (onUploadComplete) onUploadComplete();

    } catch (err) {
      toast.error(err.message || "Document upload failed");
    } finally {
      setUploading(false);
      setProgress(0);
    }

  };


  return (
    <Dialog open={open} onOpenChange={(val) => !uploading && setOpen(val)}>
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
          className={`border-2 border-dashed rounded-xl p-6 m-4 text-center cursor-pointer transition 
            ${isDragActive ? "border-primary bg-primary/5" : "border-muted-foreground/25"}
            ${uploading ? "opacity-50 pointer-events-none" : "cursor-pointer"}
          }`}
        >
          <input {...getInputProps()} />
          {isDragActive ? (
            <p className="text-sm">Drop here …</p>
          ) : (
            <p className="text-sm text-muted-foreground">
              {isDragActive ? "Drop files here…" : "Drag & drop or browse"}
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
                      disabled={uploading}
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

        {/* Progress */}
        {uploading && (
          <div className="px-4 pt-2">
            <Progress value={progress} />
            <p className="mt-1 text-xs text-muted-foreground text-right">
              {progress}%
            </p>
          </div>
        )}

        {/* Actions */}
        <div className="flex justify-end gap-2 m-4">
          <motion.div
            whileHover={{ scale: 1.2 }}
            transition={{ type: "spring", stiffness: 100, damping: 10 }}
          >
            <Button
              variant="ghost"
              disabled={uploading}
              onClick={() => setOpen(false)}
            >
              Cancel
            </Button>
          </motion.div>
          <motion.div
            whileHover={{ scale: 1.2 }}
            transition={{ type: "spring", stiffness: 100, damping: 10 }}
          >
            <Button
              onClick={handleUpload}
              disabled={!files.length || uploading}
            >
              {uploading ? "Uploading…" : "Upload"}
            </Button>
          </motion.div>
        </div>
      </DialogContent>
    </Dialog>
  );
}