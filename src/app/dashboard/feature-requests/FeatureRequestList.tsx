"use client";

import { useTransition } from "react";
import { updateFeatureStatus } from "@/app/actions/admin";
import { CheckCircle, XCircle, Clock, Sparkles, Loader2 } from "lucide-react";

interface FeatureRequest {
  id: number;
  title: string;
  description: string;
  priority: string;
  status: string;
  createdAt: string;
  vendorName: string | null;
  vendorBrand: string | null;
  vendorEmail: string | null;
}

const statusColors = {
  pending: "bg-amber-500/10 text-amber-500",
  approved: "bg-green-500/10 text-green-500",
  rejected: "bg-red-500/10 text-red-500",
  implemented: "bg-purple-500/10 text-purple-500",
};

const priorityColors = {
  low: "bg-stone-500/10 text-stone-500",
  medium: "bg-blue-500/10 text-blue-500",
  high: "bg-red-500/10 text-red-500",
};

export function FeatureRequestList({ requests }: { requests: FeatureRequest[] }) {
  return (
    <div className="divide-y divide-border-custom">
      {requests.map((req) => (
        <FeatureRequestRow key={req.id} req={req} />
      ))}
    </div>
  );
}

function FeatureRequestRow({ req }: { req: FeatureRequest }) {
  const [isPending, startTransition] = useTransition();

  const handleStatusChange = (status: string) => {
    startTransition(async () => {
      try {
        await updateFeatureStatus(req.id, status);
      } catch (error) {
        alert(error instanceof Error ? error.message : "An error occurred");
      }
    });
  };

  return (
    <div className="p-6 hover:bg-stone-50/50 dark:hover:bg-stone-800/50 transition-colors">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <h3 className="font-bold text-text-primary">{req.title}</h3>
            <span className={`px-2 py-0.5 rounded text-[10px] font-extrabold tracking-widest ${priorityColors[req.priority as keyof typeof priorityColors] || priorityColors.medium}`}>
              {req.priority.toUpperCase()}
            </span>
          </div>
          <p className="text-sm text-text-secondary mb-3">{req.description}</p>
          <p className="text-[10px] font-extrabold uppercase tracking-widest text-text-secondary opacity-40">
            From: {req.vendorName || "Unknown"} ({req.vendorBrand})
          </p>
        </div>

        <div className="flex flex-col items-end gap-3">
          <div className="flex items-center gap-2">
            {isPending ? (
              <Loader2 size={16} className="animate-spin text-text-secondary opacity-50" />
            ) : (
              <select
                value={req.status}
                onChange={(e) => handleStatusChange(e.target.value)}
                className="bg-stone-100 dark:bg-stone-800 border-none rounded-lg text-[10px] font-extrabold uppercase tracking-widest px-2 py-1 outline-none focus:ring-2 focus:ring-accent/50 transition-all cursor-pointer text-text-primary"
              >
                <option value="pending">PENDING</option>
                <option value="approved">APPROVED</option>
                <option value="rejected">REJECTED</option>
                <option value="implemented">IMPLEMENTED</option>
              </select>
            )}

            <span
              className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-[10px] font-extrabold tracking-widest ${statusColors[req.status as keyof typeof statusColors] || statusColors.pending}`}
            >
              {req.status === "pending" && <Clock size={12} />}
              {req.status === "approved" && <CheckCircle size={12} />}
              {req.status === "rejected" && <XCircle size={12} />}
              {req.status === "implemented" && <Sparkles size={12} />}
              {req.status.toUpperCase()}
            </span>
          </div>
          <p className="text-[10px] text-text-secondary opacity-40 font-bold uppercase tracking-widest">
            {new Date(req.createdAt).toLocaleDateString()}
          </p>
        </div>
      </div>
    </div>
  );
}
