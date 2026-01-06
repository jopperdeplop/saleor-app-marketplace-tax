import { getPortalUsers, triggerPortalPasswordReset } from "@/app/actions/admin";
import { Users, Search, RefreshCw, KeyRound, Shield, AlertCircle } from "lucide-react";
import ClientPortalUserList from "./ClientPortalUserList";

export const dynamic = "force-dynamic";

export default async function PortalUsersPage() {
  let users = [];
  try {
    users = await getPortalUsers();
  } catch (error) {
    console.error("Failed to load users:", error);
  }

  return (
    <div className="p-6 md:p-12 max-w-[1600px] mx-auto">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
        <div>
          <div className="flex items-center gap-3 mb-2 text-indigo-500">
            <div className="p-2 bg-indigo-500/10 rounded-lg">
              <Users size={24} />
            </div>
            <h1 className="text-3xl font-bold font-serif text-stone-900 dark:text-white">Portal Users</h1>
          </div>
          <p className="text-stone-500 text-lg max-w-2xl">
            View and manage all active accounts on the Partner Portal (vendors and staff).
          </p>
        </div>
      </header>

      {users.length === 0 ? (
        <div className="bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-900/30 rounded-2xl p-8 flex items-center gap-4 text-red-600 dark:text-red-400">
             <AlertCircle size={24} />
             <div>
                <h3 className="font-bold text-lg">Failed to load users</h3>
                <p>Could not connect to the Partner Portal API. Ensure both apps are running and secrets match.</p>
             </div>
        </div>
      ) : (
        <ClientPortalUserList initialUsers={users} />
      )}
    </div>
  );
}
