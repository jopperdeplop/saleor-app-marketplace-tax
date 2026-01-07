import { getPortalUsers } from "@/app/actions/admin";
import { prisma } from "@/lib/prisma";
import { Users, Search, RefreshCw, KeyRound, Shield, AlertCircle } from "lucide-react";
import ClientPortalUserList from "./ClientPortalUserList";

export const dynamic = "force-dynamic";

export default async function PortalUsersPage() {
  let portalUsers = [];
  try {
    portalUsers = await getPortalUsers();
  } catch (error) {
    console.error("Failed to load users:", error);
  }

  // Fetch local vendors to find ones missing from portal
  const localVendors = await prisma.vendorProfile.findMany({
    select: {
      brandName: true,
      brandAttributeValue: true,
    }
  });

  const seenBrands = new Set(portalUsers.map((u: any) => u.brand));
  const mergedUsers = [...portalUsers];

  localVendors.forEach((v) => {
    if (!seenBrands.has(v.brandAttributeValue)) {
      mergedUsers.push({
        id: `local-${v.brandAttributeValue}`,
        name: v.brandName,
        email: "No Portal Account",
        brand: v.brandAttributeValue,
        role: "Vendor",
        twoFactorEnabled: false,
        createdAt: new Date().toISOString(),
        isLocalOnly: true
      });
    }
  });

  const users = mergedUsers;

  return (
    <div className="p-6 md:p-12 max-w-[1600px] mx-auto min-h-screen bg-background">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
        <div>
          <div className="flex items-center gap-3 mb-2 text-indigo-500">
            <div className="p-2 bg-indigo-500/10 rounded-lg">
              <Users size={24} />
            </div>
            <h1 className="text-3xl font-bold font-serif text-text-primary">Portal Users</h1>
          </div>
          <p className="text-text-secondary text-lg max-w-2xl">
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
