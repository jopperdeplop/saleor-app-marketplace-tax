import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { ArrowLeft, Users, CheckCircle, XCircle, Clock } from "lucide-react";
import Link from "next/link";
import { ApplicationList } from "./ApplicationList";

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
// ... (rest of the functions same as before)
async function getApplications(): Promise<Application[]> {
  const portalUrl = process.env.PORTAL_API_URL;
  const secret = process.env.PORTAL_API_SECRET;

  if (!portalUrl || !secret) {
    console.error("Missing PORTAL_API_URL or PORTAL_API_SECRET");
    return [];
  }

  try {
    const response = await fetch(`${portalUrl}/api/admin/applications`, {
      headers: {
        Authorization: `Bearer ${secret}`,
      },
      next: { revalidate: 0 }, // Disable cache for admin view to see changes immediately
    });

    if (!response.ok) {
      console.error("Failed to fetch applications:", response.status);
      return [];
    }

    return response.json();
  } catch (error) {
    console.error("Error fetching applications:", error);
    return [];
  }
}

export default async function ApplicationsPage() {
  const session = await auth();
  if (!session) {
    redirect("/login");
  }

  const applications = await getApplications();
// ... (headers and stats same as before)
  const pending = applications.filter((a) => a.status === "pending");
  const approved = applications.filter((a) => a.status === "approved");
  const rejected = applications.filter((a) => a.status === "rejected");

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
          <div className="flex items-center gap-4 mb-4 text-blue-500">
            <div className="p-3 bg-blue-500/10 rounded-xl">
              <Users size={32} />
            </div>
            <h1 className="text-3xl font-bold font-serif text-stone-900 dark:text-white">
              Vendor Applications
            </h1>
          </div>
          <p className="text-stone-500 text-lg">
            Review and manage vendor onboarding requests from the partner portal.
          </p>
        </header>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="bg-amber-500/10 border border-amber-500/20 rounded-2xl p-6 text-center">
            <Clock className="w-8 h-8 text-amber-500 mx-auto mb-2" />
            <p className="text-3xl font-bold text-amber-500">{pending.length}</p>
            <p className="text-sm text-stone-500">Pending</p>
          </div>
          <div className="bg-green-500/10 border border-green-500/20 rounded-2xl p-6 text-center">
            <CheckCircle className="w-8 h-8 text-green-500 mx-auto mb-2" />
            <p className="text-3xl font-bold text-green-500">{approved.length}</p>
            <p className="text-sm text-stone-500">Approved</p>
          </div>
          <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-6 text-center">
            <XCircle className="w-8 h-8 text-red-500 mx-auto mb-2" />
            <p className="text-3xl font-bold text-red-500">{rejected.length}</p>
            <p className="text-sm text-stone-500">Rejected</p>
          </div>
        </div>

        {/* Applications List */}
        <div className="bg-white dark:bg-stone-900 rounded-3xl border border-stone-200 dark:border-stone-800 overflow-hidden">
          <div className="px-6 py-4 border-b border-stone-200 dark:border-stone-800">
            <h2 className="font-bold text-stone-900 dark:text-white">All Applications</h2>
          </div>

          {applications.length === 0 ? (
            <div className="p-12 text-center text-stone-400">
              <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No applications yet</p>
            </div>
          ) : (
            <ApplicationList applications={applications} />
          )}
        </div>

        <p className="text-center text-stone-400 text-sm mt-8">
          Decisions made here will automatically create vendor accounts in the partner portal.
        </p>
      </div>
    </div>
  );
}
