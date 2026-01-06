"use client";

import { useTransition } from "react";
import { processApplication } from "@/app/actions/admin";
import { CheckCircle, XCircle, Clock, Loader2 } from "lucide-react";

interface Application {
  id: number;
  companyName: string;
  email: string;
  vatNumber: string;
  country: string;
  warehouseAddress: any;
  status: string;
  createdAt: string;
  processedAt: string | null;
}

export function ApplicationList({ applications }: { applications: Application[] }) {
  return (
    <div className="divide-y divide-stone-200 dark:divide-stone-800">
      {applications.map((app) => (
        <ApplicationRow key={app.id} app={app} />
      ))}
    </div>
  );
}

function ApplicationRow({ app }: { app: Application }) {
  const [isPending, startTransition] = useTransition();

  const handleAction = (action: 'approve' | 'reject') => {
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
    <div className="p-6 hover:bg-stone-50 dark:hover:bg-stone-800/50 transition-colors">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h3 className="font-bold text-stone-900 dark:text-white">{app.companyName}</h3>
          <p className="text-sm text-stone-500">{app.email}</p>
          <p className="text-xs text-stone-400 mt-1">VAT: {app.vatNumber} • {app.country}</p>
        </div>
        
        <div className="flex items-center gap-6">
          {app.status === "pending" && !isPending && (
            <div className="flex items-center gap-2">
              <button
                onClick={() => handleAction('approve')}
                className="px-4 py-2 bg-green-500 text-white text-xs font-bold rounded-lg hover:bg-green-600 transition-colors flex items-center gap-1"
              >
                <CheckCircle size={14} /> Approve
              </button>
              <button
                onClick={() => handleAction('reject')}
                className="px-4 py-2 bg-red-500/10 text-red-500 text-xs font-bold rounded-lg hover:bg-red-500/20 transition-colors flex items-center gap-1"
              >
                <XCircle size={14} /> Reject
              </button>
            </div>
          )}

          {isPending && (
            <div className="flex items-center gap-2 text-stone-400">
              <Loader2 size={16} className="animate-spin" />
              <span className="text-xs font-medium">Processing...</span>
            </div>
          ) }

          <div className="text-right min-w-[100px]">
            <span
              className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold ${
                app.status === "pending"
                  ? "bg-amber-500/10 text-amber-500"
                  : app.status === "approved"
                  ? "bg-green-500/10 text-green-500"
                  : "bg-red-500/10 text-red-500"
              }`}
            >
              {app.status === "pending" && <Clock size={12} />}
              {app.status === "approved" && <CheckCircle size={12} />}
              {app.status === "rejected" && <XCircle size={12} />}
              {app.status.toUpperCase()}
            </span>
            <p className="text-xs text-stone-400 mt-2">
              {new Date(app.createdAt).toLocaleDateString()}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
