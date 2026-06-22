import DashboardLayout from "../components/layout/DashboardLayout";
import DocumentUpload from "../components/documents/DocumentUpload";
import DocumentList from "../components/documents/DocumentList";
import Loader from "../components/common/Loader";
import { useDocuments } from "../hooks/useDocuments";
import { useToast } from "../hooks/useToast";

export default function DocumentsPage() {
  const { documents, isLoading, uploadingFiles, uploadFiles, removeDocument } = useDocuments();
  const { showToast } = useToast();

  async function handleDelete(documentId) {
    try {
      await removeDocument(documentId);
      showToast("Document deleted.", "success");
    } catch {
      showToast("Failed to delete document.", "error");
    }
  }

  return (
    <DashboardLayout>
      <div className="mx-auto max-w-3xl px-4 py-8 sm:px-8">
        <h1 className="font-display text-2xl text-ink dark:text-paper-text">
          Documents
        </h1>
        <p className="mt-1 text-sm text-ink-soft dark:text-paper-text-soft">
          Upload PDFs to ask questions about them in chat.
        </p>

        <div className="mt-6">
          <DocumentUpload onUpload={uploadFiles} uploadingFiles={uploadingFiles} />
        </div>

        <div className="mt-8">
          <h2 className="mb-3 text-sm font-medium text-ink-soft dark:text-paper-text-soft">
            Your documents
          </h2>
          {isLoading ? (
            <Loader className="py-12" />
          ) : (
            <DocumentList documents={documents} onDelete={handleDelete} />
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
