import { useEffect, useState } from "react";
import { FileText, MessageSquare } from "lucide-react";
import DashboardLayout from "../components/layout/DashboardLayout";
import StatsCard from "../components/dashboard/StatsCard";
import RecentDocuments from "../components/dashboard/RecentDocuments";
import RecentChats from "../components/dashboard/RecentChats";
import Loader from "../components/common/Loader";
import { useAuth } from "../hooks/useAuth";
import * as dashboardService from "../services/dashboardService";

export default function DashboardPage() {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    dashboardService.getDashboardData().then((result) => {
      if (isMounted) {
        setData(result);
        setIsLoading(false);
      }
    });
    return () => {
      isMounted = false;
    };
  }, []);

  const firstName = user?.full_name?.split(" ")[0];

  return (
    <DashboardLayout>
      <div className="mx-auto max-w-5xl px-4 py-8 sm:px-8">
        <h1 className="font-display text-2xl text-ink dark:text-paper-text">
          Welcome back{firstName ? `, ${firstName}` : ""}
        </h1>
        <p className="mt-1 text-sm text-ink-soft dark:text-paper-text-soft">
          Here's what's happening with your documents and conversations.
        </p>

        {isLoading ? (
          <Loader className="py-16" />
        ) : (
          <>
            <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
              <StatsCard icon={FileText} label="Total Documents" value={data.total_documents} />
              <StatsCard icon={MessageSquare} label="Total Chats" value={data.total_chats} />
            </div>

            <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
              <div className="rounded-xl border border-border-light bg-paper-raised p-5 dark:border-border-dark dark:bg-ink-bg-raised">
                <h2 className="mb-2 font-display text-base text-ink dark:text-paper-text">
                  Recent Documents
                </h2>
                <RecentDocuments documents={data.recent_documents} />
              </div>

              <div className="rounded-xl border border-border-light bg-paper-raised p-5 dark:border-border-dark dark:bg-ink-bg-raised">
                <h2 className="mb-2 font-display text-base text-ink dark:text-paper-text">
                  Recent Chats
                </h2>
                <RecentChats chats={data.recent_chats} />
              </div>
            </div>
          </>
        )}
      </div>
    </DashboardLayout>
  );
}
