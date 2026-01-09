"use client";

import { useTransition } from "react";
import { processApplication } from "@/app/actions/admin";
import { CheckCircle, XCircle, Clock, Loader2 } from "lucide-react";
import Link from "next/link";

interface Application {
  id: number;
  companyName: string;
  email: string;
  vatNumber: string;
  country: string;
  status: string;
  createdAt: string;
  processedAt: string | null;
}

export function ApplicationList({ applications }: { applications: Application[] }) {
  return (
    <div className="divide-y divide-border-custom">
      {applications.map((app) => (
        <Link key={app.id} href={`/dashboard/applications/${app.id}`} className="block hover:bg-stone-50 dark:hover:bg-stone-800/50 transition-colors">
          <ApplicationRow app={app} />
        </Link>
      ))}
    </div>
  );
}

function ApplicationRow({ app }: { app: Application }) {
  const [isPending, startTransition] = useTransition();

  const handleAction = (e: React.MouseEvent, action: 'approve' | 'reject') => {
    e.preventDefault(); // Prevent navigation to detail page
    e.stopPropagation();
    
    if (!confirm(`Are you sure you want to ${action} this application?`)) return;
    
    startTransition(async () => {
      try {
        await processApplication(app.id, action);
      } catch (error) {
        alert(error instanceof Error ? error.message : "An error occurred");
      }
    });
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h3 className="font-bold text-text-primary">{app.companyName}</h3>
          <p className="text-sm text-text-secondary">{app.email}</p>
          <p className="text-[10px] font-extrabold uppercase tracking-widest text-text-secondary opacity-40 mt-1">VAT: {app.vatNumber} • {app.country}</p>
        </div>
        
        <div className="flex items-center gap-6">
          {app.status === "pending" && !isPending && (
            <div className="flex items-center gap-2">
              <button
                onClick={(e) => handleAction(e, 'approve')}
                className="px-4 py-2 bg-text-primary text-background text-[10px] font-extrabold uppercase tracking-widest rounded-lg hover:opacity-90 transition-opacity flex items-center gap-1"
              >
                <CheckCircle size={14} /> Approve
              </button>
              <button
                onClick={(e) => handleAction(e, 'reject')}
                className="px-4 py-2 bg-red-500/10 text-red-500 text-[10px] font-extrabold uppercase tracking-widest rounded-lg hover:bg-red-500/20 transition-colors flex items-center gap-1"
              >
                <XCircle size={14} /> Reject
              </button>
            </div>
          )}

          {isPending && (
            <div className="flex items-center gap-2 text-text-secondary opacity-50">
              <Loader2 size={16} className="animate-spin" />
              <span className="text-xs font-medium">Processing...</span>
            </div>
          ) }

          <div className="text-right min-w-[120px]">
            <span
              className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-[10px] font-extrabold tracking-widest ${
                app.status === "pending"
                  ? "bg-amber-500/10 text-amber-500"
                  : app.status === "approved"
                  ? "bg-green-500/10 text-green-600"
                  : "bg-red-500/10 text-red-500"
              }`}
            >
              {app.status === "pending" && <Clock size={12} />}
              {app.status === "approved" && <CheckCircle size={12} />}
              {app.status === "rejected" && <XCircle size={12} />}
              {app.status.toUpperCase()}
            </span>
            <p className="text-[10px] text-text-secondary opacity-40 mt-2 font-bold uppercase tracking-widest">
              {new Date(app.createdAt).toLocaleDateString()}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
