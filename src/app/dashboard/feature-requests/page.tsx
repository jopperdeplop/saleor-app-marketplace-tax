import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { ArrowLeft, Sparkles, CheckCircle, XCircle, Clock, AlertCircle } from "lucide-react";
import Link from "next/link";

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

async function getFeatureRequests(): Promise<FeatureRequest[]> {
  const portalUrl = process.env.PORTAL_API_URL;
  const secret = process.env.PORTAL_API_SECRET;

  if (!portalUrl || !secret) {
    console.error("Missing PORTAL_API_URL or PORTAL_API_SECRET");
    return [];
  }

  try {
    const response = await fetch(`${portalUrl}/api/admin/feature-requests`, {
      headers: {
        Authorization: `Bearer ${secret}`,
      },
      next: { revalidate: 30 },
    });

    if (!response.ok) {
      console.error("Failed to fetch feature requests:", response.status);
      return [];
    }

    return response.json();
  } catch (error) {
    console.error("Error fetching feature requests:", error);
    return [];
  }
}

const priorityColors = {
  low: "bg-stone-500/10 text-stone-500",
  medium: "bg-blue-500/10 text-blue-500",
  high: "bg-red-500/10 text-red-500",
};

const statusColors = {
  pending: "bg-amber-500/10 text-amber-500",
  approved: "bg-green-500/10 text-green-500",
  rejected: "bg-red-500/10 text-red-500",
  implemented: "bg-purple-500/10 text-purple-500",
};

export default async function FeatureRequestsPage() {
  const session = await auth();
  if (!session) {
    redirect("/login");
  }

  const requests = await getFeatureRequests();
  const pending = requests.filter((r) => r.status === "pending");

  return (
    <div className="min-h-screen bg-stone-50 dark:bg-stone-950 p-6 md:p-12">
      <div className="max-w-6xl mx-auto">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-stone-500 hover:text-accent mb-8 transition-colors font-medium"
        >
          <ArrowLeft size={20} /> Back to Dashboard
        </Link>

        <header className="mb-12">
          <div className="flex items-center gap-4 mb-4 text-purple-500">
            <div className="p-3 bg-purple-500/10 rounded-xl">
              <Sparkles size={32} />
            </div>
            <h1 className="text-3xl font-bold font-serif text-stone-900 dark:text-white">
              Feature Requests
            </h1>
          </div>
          <p className="text-stone-500 text-lg">
            Review feature requests submitted by vendors from the partner portal.
          </p>
        </header>

        {/* Stats */}
        <div className="bg-amber-500/10 border border-amber-500/20 rounded-2xl p-6 mb-8 flex items-center gap-4">
          <AlertCircle className="w-8 h-8 text-amber-500" />
          <div>
            <p className="text-2xl font-bold text-amber-500">{pending.length} pending</p>
            <p className="text-sm text-stone-500">Feature requests awaiting review</p>
          </div>
        </div>

        {/* Requests List */}
        <div className="bg-white dark:bg-stone-900 rounded-3xl border border-stone-200 dark:border-stone-800 overflow-hidden">
          <div className="px-6 py-4 border-b border-stone-200 dark:border-stone-800">
            <h2 className="font-bold text-stone-900 dark:text-white">All Requests</h2>
          </div>

          {requests.length === 0 ? (
            <div className="p-12 text-center text-stone-400">
              <Sparkles className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No feature requests yet</p>
            </div>
          ) : (
            <div className="divide-y divide-stone-200 dark:divide-stone-800">
              {requests.map((req) => (
                <div key={req.id} className="p-6 hover:bg-stone-50 dark:hover:bg-stone-800/50 transition-colors">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-bold text-stone-900 dark:text-white">{req.title}</h3>
                        <span className={`px-2 py-0.5 rounded text-xs font-bold ${priorityColors[req.priority as keyof typeof priorityColors] || priorityColors.medium}`}>
                          {req.priority.toUpperCase()}
                        </span>
                      </div>
                      <p className="text-sm text-stone-600 dark:text-stone-400 mb-3">{req.description}</p>
                      <p className="text-xs text-stone-400">
                        From: {req.vendorName || "Unknown"} ({req.vendorBrand})
                      </p>
                    </div>
                    <div className="text-right">
                      <span
                        className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold ${statusColors[req.status as keyof typeof statusColors] || statusColors.pending}`}
                      >
                        {req.status === "pending" && <Clock size={12} />}
                        {req.status === "approved" && <CheckCircle size={12} />}
                        {req.status === "rejected" && <XCircle size={12} />}
                        {req.status === "implemented" && <Sparkles size={12} />}
                        {req.status.toUpperCase()}
                      </span>
                      <p className="text-xs text-stone-400 mt-2">
                        {new Date(req.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <p className="text-center text-stone-400 text-sm mt-8">
          Feature request status is managed from the partner portal admin section.
        </p>
      </div>
    </div>
  );
}
