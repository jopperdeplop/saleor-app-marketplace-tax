import { getPortalUserDetails } from "@/app/actions/admin";
import { ChevronLeft, User, Building2, Mail, Shield, Calendar, MapPin, Globe, Phone, FileText, Trash2, AlertTriangle, Key } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { DeleteUserButton } from "@/components/DeleteUserButton";

export default async function PortalUserDetailsPage({ 
  params 
}: { 
  params: Promise<{ id: string }> 
}) {
  const { id } = await params;
  let user;
  
  try {
    user = await getPortalUserDetails(parseInt(id));
  } catch (error) {
    return (
      <div className="p-8">
        <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-4 rounded-lg">
          Error loading user: {error instanceof Error ? error.message : "Unknown error"}
        </div>
        <Link href="/dashboard/portal-users" className="mt-4 inline-block text-sm text-text-secondary hover:underline">
          &larr; Back to Portal Users
        </Link>
      </div>
    );
  }

  if (!user) {
    return redirect("/dashboard/portal-users");
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-20 p-6 md:p-12">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link 
            href="/dashboard/portal-users" 
            className="p-2 hover:bg-stone-100 dark:hover:bg-stone-800 rounded-full transition-colors"
          >
            <ChevronLeft size={20} className="text-text-secondary" />
          </Link>
          <div>
             <h1 className="text-2xl font-bold font-display text-text-primary">{user.name}</h1>
             <p className="text-sm text-text-secondary font-mono bg-stone-100 dark:bg-stone-800 px-2 py-0.5 rounded inline-block mt-1">
                ID: {user.id} • {user.role}
             </p>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest ${
            user.twoFactorEnabled 
              ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" 
              : "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"
          }`}>
            {user.twoFactorEnabled ? "2FA Enabled" : "2FA Off"}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Account Info */}
        <div className="bg-white dark:bg-stone-900 border border-border-custom rounded-xl overflow-hidden">
          <div className="px-6 py-4 border-b border-border-custom bg-stone-50/50 dark:bg-stone-800/50 flex items-center gap-2">
            <User size={18} className="text-text-secondary" />
            <h2 className="font-bold text-text-primary">Account Info</h2>
          </div>
          <div className="p-6 space-y-4">
            <Field label="Full Name" value={user.name} />
            <Field label="Email Address" value={user.email} />
            <Field label="Role" value={user.role} />
            <Field label="Created" value={user.createdAt ? new Date(user.createdAt).toLocaleDateString() : "—"} />
          </div>
        </div>

        {/* Brand Info */}
        <div className="bg-white dark:bg-stone-900 border border-border-custom rounded-xl overflow-hidden">
          <div className="px-6 py-4 border-b border-border-custom bg-stone-50/50 dark:bg-stone-800/50 flex items-center gap-2">
            <Building2 size={18} className="text-text-secondary" />
            <h2 className="font-bold text-text-primary">Brand Information</h2>
          </div>
          <div className="p-6 space-y-4">
            <Field label="Brand" value={user.brand} />
            <Field label="Brand Name" value={user.brandName || "—"} />
            <Field label="Legal Business Name" value={user.legalBusinessName || "—"} />
            <Field label="VAT Number" value={user.vatNumber || "—"} />
          </div>
        </div>

        {/* Contact & Address */}
        <div className="bg-white dark:bg-stone-900 border border-border-custom rounded-xl overflow-hidden">
          <div className="px-6 py-4 border-b border-border-custom bg-stone-50/50 dark:bg-stone-800/50 flex items-center gap-2">
            <MapPin size={18} className="text-text-secondary" />
            <h2 className="font-bold text-text-primary">Contact & Address</h2>
          </div>
          <div className="p-6 space-y-4">
            <Field label="Phone" value={user.phoneNumber || "—"} />
            <Field label="Website" value={user.websiteUrl || "—"} link />
            <Field label="Street" value={user.street || "—"} />
            <Field label="City" value={user.city || "—"} />
            <Field label="Postal Code" value={user.postalCode || "—"} />
            <Field label="Country" value={user.countryCode || "—"} />
          </div>
        </div>

        {/* System Info */}
        <div className="bg-white dark:bg-stone-900 border border-border-custom rounded-xl overflow-hidden">
          <div className="px-6 py-4 border-b border-border-custom bg-stone-50/50 dark:bg-stone-800/50 flex items-center gap-2">
            <Key size={18} className="text-text-secondary" />
            <h2 className="font-bold text-text-primary">System Info</h2>
          </div>
          <div className="p-6 space-y-4">
            <Field label="Saleor Page Slug" value={user.saleorPageSlug || "—"} />
            <Field label="Payload Brand Page ID" value={user.payloadBrandPageId || "—"} />
            <Field label="EORI Number" value={user.eoriNumber || "—"} />
            <Field label="Registration #" value={user.registrationNumber || "—"} />
            {user.latitude && user.longitude && (
              <Field label="Coordinates" value={`${user.latitude?.toFixed(4)}, ${user.longitude?.toFixed(4)}`} />
            )}
          </div>
        </div>

        {/* Danger Zone */}
        <div className="md:col-span-2 bg-red-50/30 dark:bg-red-900/10 border border-red-200 dark:border-red-900/30 rounded-xl overflow-hidden">
          <div className="px-6 py-4 border-b border-red-200 dark:border-red-900/30 bg-red-50/50 dark:bg-red-900/20 flex items-center gap-2">
            <Trash2 size={18} className="text-red-600 dark:text-red-400" />
            <h2 className="font-bold text-red-700 dark:text-red-400">Danger Zone</h2>
          </div>
          <div className="p-6 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="space-y-1">
              <p className="font-bold text-red-700 dark:text-red-400 flex items-center gap-2">
                <AlertTriangle size={16} /> Delete User Account & All Data
              </p>
              <p className="text-sm text-red-600/70 dark:text-red-400/60">
                This will permanently remove the user account, integrations, feature requests, and all associated data. This action cannot be undone.
              </p>
            </div>
            <DeleteUserButton userId={user.id} userName={user.name} />
          </div>
        </div>
      </div>
    </div>
  );
}

function Field({ label, value, link }: { label: string, value: string, link?: boolean }) {
  return (
    <div>
      <p className="text-xs font-bold text-text-secondary uppercase tracking-wider mb-1">{label}</p>
      {link && value && value.startsWith('http') ? (
        <a href={value} target="_blank" rel="noopener noreferrer" className="text-text-primary hover:underline font-medium break-all">{value}</a>
      ) : (
        <p className="text-text-primary font-medium break-all">{value}</p>
      )}
    </div>
  );
}
