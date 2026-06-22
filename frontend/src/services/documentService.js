/**
 * Document API calls. Mirrors backend/app/routes/document_routes.py.
 */

import api from "./api";

export async function uploadDocument(file, onUploadProgress) {
  const formData = new FormData();
  formData.append("file", file);

  const res = await api.post("/api/documents/upload", formData, {
    headers: { "Content-Type": "multipart/form-data" },
    onUploadProgress,
  });
  return res.data;
}

export async function listDocuments() {
  const res = await api.get("/api/documents");
  return res.data; // { documents: [...], total: n }
}

export async function getDocument(documentId) {
  const res = await api.get(`/api/documents/${documentId}`);
  return res.data;
}

export async function deleteDocument(documentId) {
  const res = await api.delete(`/api/documents/${documentId}`);
  return res.data;
}
