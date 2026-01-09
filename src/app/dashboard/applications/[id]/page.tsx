import { getApplicationDetails, processApplication, deleteApplication } from "@/app/actions/admin";
import { CheckCircle, XCircle, ChevronLeft, Building2, MapPin, Globe, Phone, FileText, Trash2, AlertTriangle } from "lucide-react";
import Link from "next/link";
import { RedirectType, redirect } from "next/navigation";

export default async function ApplicationDetailsPage({ 
  params 
}: { 
  params: Promise<{ id: string }> 
}) {
  const { id } = await params;
  let application;
  
  try {
    application = await getApplicationDetails(parseInt(id));
  } catch (error) {
    return (
      <div className="p-8">
        <div className="bg-red-50 text-red-600 p-4 rounded-lg">
          Error loading application: {error instanceof Error ? error.message : "Unknown error"}
        </div>
        <Link href="/dashboard/applications" className="mt-4 inline-block text-sm text-text-secondary hover:underline">
          &larr; Back to Applications
        </Link>
      </div>
    );
  }

  if (!application) {
    return redirect("/dashboard/applications");
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-20">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link 
            href="/dashboard/applications" 
            className="p-2 hover:bg-stone-100 dark:hover:bg-stone-800 rounded-full transition-colors"
          >
            <ChevronLeft size={20} className="text-text-secondary" />
          </Link>
          <div>
             <h1 className="text-2xl font-bold font-display text-text-primary">{application.companyName}</h1>
             <p className="text-sm text-text-secondary font-mono bg-stone-100 dark:bg-stone-800 px-2 py-0.5 rounded inline-block mt-1">
                ID: {application.id} • {new Date(application.createdAt).toLocaleDateString()}
             </p>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          {application.status === 'pending' ? (
            <>
              <form action={async () => {
                "use server";
                await processApplication(application.id, 'approve');
                redirect('/dashboard/applications');
              }}>
                <button type="submit" className="flex items-center gap-2 px-4 py-2 bg-text-primary text-background rounded-lg text-sm font-bold uppercase tracking-wider hover:opacity-90 transition-opacity">
                  <CheckCircle size={16} /> Approve
                </button>
              </form>
              <form action={async () => {
                "use server";
                await processApplication(application.id, 'reject');
                redirect('/dashboard/applications');
              }}>
                <button type="submit" className="flex items-center gap-2 px-4 py-2 bg-red-50 dark:bg-red-900/20 text-red-600 rounded-lg text-sm font-bold uppercase tracking-wider hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors">
                  <XCircle size={16} /> Reject
                </button>
              </form>
            </>
          ) : (
             <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest ${
               application.status === "approved" ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
             }`}>
               {application.status}
             </span>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Company & Contact */}
        <div className="bg-white dark:bg-stone-900 border border-border-custom rounded-xl overflow-hidden">
          <div className="px-6 py-4 border-b border-border-custom bg-stone-50/50 dark:bg-stone-800/50 flex items-center gap-2">
            <Building2 size={18} className="text-text-secondary" />
            <h2 className="font-bold text-text-primary">Company Profile</h2>
          </div>
          <div className="p-6 space-y-4">
            <Field label="Brand Name" value={application.brandName} />
            <Field label="Legal Name" value={application.legalBusinessName} />
            <Field label="Contact Email" value={application.email} />
            <Field label="Phone" value={application.phoneNumber || "—"} />
            <Field label="Website" value={application.websiteUrl} link />
          </div>
        </div>

        {/* Tax & Legal */}
        <div className="bg-white dark:bg-stone-900 border border-border-custom rounded-xl overflow-hidden">
          <div className="px-6 py-4 border-b border-border-custom bg-stone-50/50 dark:bg-stone-800/50 flex items-center gap-2">
            <FileText size={18} className="text-text-secondary" />
            <h2 className="font-bold text-text-primary">Tax & Legal</h2>
          </div>
          <div className="p-6 space-y-4">
            <Field label="VAT Number" value={application.vatNumber} />
            <Field label="Registration #" value={application.registrationNumber || "—"} />
            <Field label="EORI Number" value={application.eoriNumber || "—"} />
          </div>
        </div>

        {/* Address */}
        <div className="md:col-span-2 bg-white dark:bg-stone-900 border border-border-custom rounded-xl overflow-hidden">
          <div className="px-6 py-4 border-b border-border-custom bg-stone-50/50 dark:bg-stone-800/50 flex items-center gap-2">
            <MapPin size={18} className="text-text-secondary" />
            <h2 className="font-bold text-text-primary">Warehouse Address</h2>
          </div>
          <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
             <Field label="Street" value={application.street} />
             <Field label="City" value={application.city} />
             <Field label="Postal Code" value={application.postalCode} />
             <Field label="Country" value={application.countryCode} />
          </div>
        </div>

        {/* Danger Zone */}
        <div className="md:col-span-2 bg-red-50/30 dark:bg-red-900/10 border border-red-200 dark:border-red-900/30 rounded-xl overflow-hidden">
          <div className="px-6 py-4 border-b border-red-200 dark:border-red-900/30 bg-red-50/50 dark:bg-red-900/20 flex items-center gap-2">
            <Trash2 size={18} className="text-red-600 dark:text-red-400" />
            <h2 className="font-bold text-red-700 dark:text-red-400">Danger Zone</h2>
          </div>
          <div className="p-6 flex items-center justify-between">
            <div className="space-y-1">
              <p className="font-bold text-red-700 dark:text-red-400 flex items-center gap-2">
                <AlertTriangle size={16} /> Delete Vendor Account & All Data
              </p>
              <p className="text-sm text-red-600/70 dark:text-red-400/60">
                This will permanently remove the vendor application, the user account, and all associated integrations. This action cannot be undone.
              </p>
            </div>
            <form action={async () => {
              "use server";
              await deleteApplication(application.id);
              redirect('/dashboard/applications');
            }}>
              <button 
                type="submit" 
                className="px-6 py-3 bg-red-600 text-white rounded-xl text-sm font-bold uppercase tracking-widest hover:bg-red-700 transition-colors shadow-lg shadow-red-200 dark:shadow-none"
                onClick={(e) => {
                  // Note: Client-side confirmation doesn't work directly inside a server component 'form' action like this 
                  // but in Next.js Server Actions with redirect, we rely on the user intent from clicking the button.
                }}
              >
                Delete Everything
              </button>
            </form>
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
