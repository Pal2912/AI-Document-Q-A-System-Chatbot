/**
 * Drag-and-drop (+ click-to-browse) upload zone. Validates file type/size
 * client-side before sending (mirrors backend limits — see file_utils.py
 * MAX_UPLOAD_SIZE_MB and the .pdf-only check), so the user gets instant
 * feedback instead of waiting on a round-trip for an error the backend
 * would reject anyway.
 */

import { useState, useRef } from "react";
import { Upload, FileText } from "lucide-react";
import { useToast } from "../../hooks/useToast";
import { MAX_UPLOAD_SIZE_MB } from "../../utils/constants";

export default function DocumentUpload({ onUpload, uploadingFiles }) {
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef(null);
  const { showToast } = useToast();

  function validateFiles(files) {
    const valid = [];
    for (const file of files) {
      if (!file.name.toLowerCase().endsWith(".pdf")) {
        showToast(`${file.name} isn't a PDF and was skipped.`, "error");
        continue;
      }
      if (file.size > MAX_UPLOAD_SIZE_MB * 1024 * 1024) {
        showToast(`${file.name} exceeds the ${MAX_UPLOAD_SIZE_MB}MB limit.`, "error");
        continue;
      }
      valid.push(file);
    }
    return valid;
  }

  async function handleFiles(fileList) {
    const valid = validateFiles(Array.from(fileList));
    if (valid.length === 0) return;

    const { succeeded, failed } = await onUpload(valid);
    if (succeeded > 0) {
      showToast(
        `${succeeded} document${succeeded > 1 ? "s" : ""} uploaded. Processing...`,
        "success"
      );
    }
    if (failed > 0) {
      showToast(`${failed} upload${failed > 1 ? "s" : ""} failed.`, "error");
    }
  }

  function handleDrop(e) {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files.length) handleFiles(e.dataTransfer.files);
  }

  return (
    <div>
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
        className={`flex cursor-pointer flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed px-6 py-12 text-center transition-colors ${
          isDragging
            ? "border-accent bg-accent-bg dark:bg-accent-bg-dark"
            : "border-border-light hover:border-accent/50 dark:border-border-dark"
        }`}
      >
        <input
          ref={inputRef}
          type="file"
          accept=".pdf,application/pdf"
          multiple
          className="hidden"
          onChange={(e) => {
            if (e.target.files.length) handleFiles(e.target.files);
            e.target.value = ""; // allow re-selecting the same file later
          }}
        />
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-accent-bg dark:bg-accent-bg-dark">
          <Upload size={22} className="text-accent" />
        </div>
        <div>
          <p className="text-sm font-medium text-ink dark:text-paper-text">
            Drop PDFs here, or click to browse
          </p>
          <p className="mt-1 text-xs text-ink-faint dark:text-paper-text-faint">
            Multiple files supported · up to {MAX_UPLOAD_SIZE_MB}MB each
          </p>
        </div>
      </div>

      {uploadingFiles.length > 0 && (
        <div className="mt-4 space-y-2">
          {uploadingFiles.map((f) => (
            <div
              key={f.name}
              className="flex items-center gap-3 rounded-lg border border-border-light px-4 py-3 dark:border-border-dark"
            >
              <FileText size={16} className="shrink-0 text-ink-faint dark:text-paper-text-faint" />
              <div className="flex-1">
                <p className="truncate text-sm text-ink dark:text-paper-text">{f.name}</p>
                <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-ink/10 dark:bg-paper-text/10">
                  <div
                    className="h-full rounded-full bg-accent transition-all"
                    style={{ width: `${f.progress}%` }}
                  />
                </div>
              </div>
              <span className="shrink-0 font-mono text-xs text-ink-faint dark:text-paper-text-faint">
                {f.progress}%
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
