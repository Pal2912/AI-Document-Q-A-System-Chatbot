/**
 * useDocuments — centralizes all document state for the Documents page:
 *   - initial fetch
 *   - upload (with per-file progress)
 *   - delete
 *   - POLLING: any document still "processing" gets re-fetched every few
 *     seconds until its status becomes "ready" or "failed". This is what
 *     makes the UI update automatically once Phase 4's background RAG
 *     pipeline finishes, without the user needing to manually refresh.
 */

import { useState, useEffect, useCallback, useRef } from "react";
import * as documentService from "../services/documentService";
import { DOCUMENT_STATUS } from "../utils/constants";

const POLL_INTERVAL_MS = 3000;

export function useDocuments() {
  const [documents, setDocuments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [uploadingFiles, setUploadingFiles] = useState([]); // [{ name, progress }]
  const pollRef = useRef(null);

  const fetchDocuments = useCallback(async () => {
    const data = await documentService.listDocuments();
    setDocuments(data.documents);
    return data.documents;
  }, []);

  useEffect(() => {
    let isMounted = true;

    async function load() {
      await fetchDocuments();
      if (isMounted) setIsLoading(false);
    }
    load();

    return () => {
      isMounted = false;
    };
  }, [fetchDocuments]);

  // Poll while any document is still processing.
  useEffect(() => {
    const hasProcessing = documents.some((d) => d.status === DOCUMENT_STATUS.PROCESSING);

    if (hasProcessing && !pollRef.current) {
      pollRef.current = setInterval(async () => {
        const latest = await fetchDocuments();
        const stillProcessing = latest.some((d) => d.status === DOCUMENT_STATUS.PROCESSING);
        if (!stillProcessing && pollRef.current) {
          clearInterval(pollRef.current);
          pollRef.current = null;
        }
      }, POLL_INTERVAL_MS);
    }

    return () => {
      if (pollRef.current) {
        clearInterval(pollRef.current);
        pollRef.current = null;
      }
    };
  }, [documents, fetchDocuments]);

  const uploadFiles = useCallback(
    async (files) => {
      const fileList = Array.from(files);

      setUploadingFiles(fileList.map((f) => ({ name: f.name, progress: 0 })));

      const results = await Promise.allSettled(
        fileList.map((file) =>
          documentService.uploadDocument(file, (progressEvent) => {
            const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            setUploadingFiles((prev) =>
              prev.map((f) => (f.name === file.name ? { ...f, progress } : f))
            );
          })
        )
      );

      setUploadingFiles([]);
      await fetchDocuments();

      const failed = results.filter((r) => r.status === "rejected");
      return { succeeded: results.length - failed.length, failed: failed.length };
    },
    [fetchDocuments]
  );

  const removeDocument = useCallback(async (documentId) => {
    await documentService.deleteDocument(documentId);
    setDocuments((prev) => prev.filter((d) => d.id !== documentId));
  }, []);

  return {
    documents,
    isLoading,
    uploadingFiles,
    uploadFiles,
    removeDocument,
    refetch: fetchDocuments,
  };
}
