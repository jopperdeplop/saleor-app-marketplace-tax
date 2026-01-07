import { getVendorData } from "@/services/vendor-dashboard";
import { notFound } from "next/navigation";
import { CreditCard, Clock, CheckCircle, Download, Zap, Calendar, ArrowLeft, Loader2, AlertTriangle, Package } from "lucide-react";
import { updateVendorOverride, removeVendorOverride } from "@/app/actions";
import Link from "next/link";
import { PortalAccountCard } from "@/components/PortalAccountCard";
import { PlatformStats } from "@/components/PlatformStats";

export default async function VendorDashboard({
  params,
}: {
  params: Promise<{ brandSlug: string[] }>;
}) {
  const resolvedParams = await params;
  const brandSlugArray = resolvedParams.brandSlug;
  
  // Join segments and decode. If Saleor IDs are Base64, they shouldn't have slashes, 
  // but catch-all ensures we capture the whole thing even if encoded/slashed.
  const brandSlug = decodeURIComponent(brandSlugArray.join("/"));

  console.log("Loading dashboard for vendor ID:", brandSlug);
  
  const data = await getVendorData(brandSlug);

  if (!data) {
    console.error("No vendor found in DB or Portal for ID:", brandSlug);
    notFound();
  }

  const vendor = data.vendor as any;
  const commissions = data.commissions;
  const invoices = data.invoices;
  const portalUser = data.portalUser;
  
  const now = new Date();
  const hasActiveOverride = vendor.temporaryCommissionEndsAt && new Date(vendor.temporaryCommissionEndsAt) > now;
  const effectiveRate = hasActiveOverride && vendor.temporaryCommissionRate !== null
    ? vendor.temporaryCommissionRate 
    : vendor.commissionRate;

  return (
    <div className="min-h-screen bg-stone-50 dark:bg-stone-950 p-6 md:p-12 text-stone-900 dark:text-stone-100">
      <div className="max-w-6xl mx-auto">
        <header className="mb-12 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div>
            <Link href="/" className="inline-flex items-center gap-2 text-stone-500 hover:text-accent mb-4 transition-colors text-sm font-bold uppercase tracking-widest">
                <ArrowLeft size={16} /> Back to Dashboard
            </Link>
            <h1 className="text-4xl font-bold font-serif mb-2">{vendor.brandName} Portal</h1>
            <p className="text-stone-500">View commissions and manage fee overrides for this partner.</p>
          </div>
          
          <div className="flex flex-col md:flex-row gap-4 items-center">
            {vendor.isPlaceholder && (
               <div className="bg-amber-500/10 text-amber-600 border border-amber-500/20 px-4 py-3 rounded-xl flex items-center gap-3 animate-pulse">
                  <AlertTriangle size={20} />
                  <div className="text-xs font-bold uppercase tracking-tight">
                    Tax Profile Needed
                  </div>
               </div>
            )}
            
            <div className="bg-white dark:bg-stone-900 px-6 py-4 rounded-2xl border border-stone-200 dark:border-stone-800 shadow-sm relative overflow-hidden group">
              {hasActiveOverride && (
                <div className="absolute top-0 right-0 bg-accent text-white text-[10px] font-bold px-2 py-0.5 rounded-bl-lg">
                  TEMP OVERRIDE
                </div>
              )}
              <span className="text-xs font-bold uppercase tracking-widest text-stone-400 block mb-1">Effective Rate</span>
              <div className="flex items-baseline gap-1">
                  <span className={`text-2xl font-bold ${hasActiveOverride ? "text-accent" : "text-stone-900 dark:text-white"}`}>
                      {effectiveRate}%
                  </span>
                  {hasActiveOverride && (
                      <span className="text-xs text-stone-400 line-through">{vendor.commissionRate}%</span>
                  )}
              </div>
            </div>
          </div>
        </header>

        {/* Account Management Section */}
        {portalUser && (
            <PortalAccountCard user={portalUser} />
        )}

        {/* Admin Override Control */}
        <section className="mb-12 bg-white dark:bg-stone-900 p-8 rounded-3xl border border-dashed border-stone-300 dark:border-stone-700 shadow-sm">
            <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-purple-100 dark:bg-purple-900/30 text-purple-600 rounded-lg">
                    <Zap size={20} />
                </div>
                <div>
                    <h3 className="text-lg font-bold">Commission Override</h3>
                    <p className="text-sm text-stone-500">Temporarily lower or raise fees for this vendor.</p>
                </div>
            </div>
            
            <div className="flex flex-col md:flex-row gap-4 items-end">
                <form action={updateVendorOverride} className="flex-1 flex flex-col md:flex-row gap-4 items-end w-full">
                    <input type="hidden" name="brandSlug" value={brandSlug} />
                    
                    <div className="w-full md:w-auto flex-1">
                        <label className="block text-xs font-bold uppercase tracking-widest text-stone-500 mb-2">Temporary Rate (%)</label>
                        <input 
                            type="number" 
                            step="0.01" 
                            name="tempRate" 
                            defaultValue={vendor.temporaryCommissionRate ?? ''}
                            placeholder="e.g. 5.0"
                            className="w-full bg-stone-50 dark:bg-stone-800 border-none rounded-xl px-4 py-3 font-bold focus:ring-2 focus:ring-purple-500"
                        />
                    </div>
                    
                    <div className="w-full md:w-auto flex-1">
                        <label className="block text-xs font-bold uppercase tracking-widest text-stone-500 mb-2">Ends At</label>
                        <div className="relative">
                            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" size={16} />
                            <input 
                                type="date" 
                                name="endDate" 
                                defaultValue={vendor.temporaryCommissionEndsAt ? new Date(vendor.temporaryCommissionEndsAt).toISOString().split('T')[0] : ''}
                                className="w-full bg-stone-50 dark:bg-stone-800 border-none rounded-xl pl-10 pr-4 py-3 font-medium focus:ring-2 focus:ring-purple-500"
                            />
                        </div>
                    </div>

                    <button type="submit" className="w-full md:w-auto px-6 py-3 bg-stone-900 dark:bg-white text-white dark:text-stone-900 font-bold rounded-xl hover:opacity-90 shadow-md transition-all active:scale-95 whitespace-nowrap">
                        Apply Override
                    </button>
                </form>

                {vendor.temporaryCommissionEndsAt && (
                    <form action={removeVendorOverride} className="w-full md:w-auto">
                         <input type="hidden" name="brandSlug" value={brandSlug} />
                         <button type="submit" className="w-full md:w-auto px-6 py-3 bg-red-50 dark:bg-red-900/10 text-red-600 dark:text-red-400 font-bold rounded-xl hover:bg-red-100 dark:hover:bg-red-900/20 transition-all active:scale-95 whitespace-nowrap">
                            Remove Override
                        </button>
                    </form>
                )}
            </div>
        </section>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
          <div className="bg-white dark:bg-stone-900 p-8 rounded-3xl border border-stone-200 dark:border-stone-800 shadow-sm col-span-1 md:col-span-2">
            <CreditCard className="text-accent mb-4" size={32} />
            <h3 className="text-lg font-bold mb-1">Total Marketplace Fees</h3>
            <p className="text-3xl font-bold">
              €{commissions.reduce((acc: number, c: any) => acc + Number(c.commissionAmount), 0).toFixed(2)}
            </p>
            <p className="text-xs text-stone-500 mt-2 uppercase tracking-wide font-bold">Cumulative Net + VAT platform revenue</p>
          </div>
          <div className="bg-white dark:bg-stone-900 p-8 rounded-3xl border border-stone-200 dark:border-stone-800 shadow-sm">
            <Clock className="text-stone-400 mb-4" size={32} />
            <h3 className="text-lg font-bold mb-1">Pending Orders</h3>
            <p className="text-3xl font-bold">
              {commissions.filter((c: any) => c.status === 'PENDING').length}
            </p>
          </div>
          <div className="bg-white dark:bg-stone-900 p-8 rounded-3xl border border-stone-200 dark:border-stone-800 shadow-sm relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-2 h-full bg-green-500 opacity-20 group-hover:opacity-100 transition-opacity"></div>
            <CheckCircle className="text-green-500 mb-4" size={32} />
            <h3 className="text-lg font-bold mb-1">Tax Hub</h3>
            <p className="text-2xl font-bold text-green-500">{vendor.countryCode} Hub</p>
            <p className="text-[10px] text-stone-500 mt-1 uppercase font-bold">{vendor.vatNumber || "No VAT Number"}</p>
          </div>
        </div>

        {portalUser && (
            <PortalAccountCard user={portalUser} />
        )}

        {/* Platform Data Section */}
        <div className="mb-6 flex items-center gap-2">
            <Package className="text-stone-400" size={18} />
            <span className="text-xs font-bold uppercase tracking-widest text-stone-500">Platform Performance</span>
        </div>
        <PlatformStats brand={vendor.brandAttributeValue} />

        <section className="bg-white dark:bg-stone-900 rounded-3xl border border-stone-200 dark:border-stone-800 shadow-sm overflow-hidden">
          <div className="px-8 py-6 border-b border-stone-200 dark:border-stone-800 flex justify-between items-center bg-stone-50/50 dark:bg-stone-950/20">
            <div>
                <h2 className="text-xl font-bold uppercase tracking-tight font-serif">Financial Audit Log</h2>
                <p className="text-xs text-stone-500 mt-1">OSS-compliant breakdown of EU marketplace transactions.</p>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-stone-50 dark:bg-stone-950/50">
                  <th className="px-8 py-4 text-xs font-bold uppercase tracking-widest text-stone-500">Reference</th>
                  <th className="px-8 py-4 text-xs font-bold uppercase tracking-widest text-stone-500 text-right">Order Gross</th>
                  <th className="px-8 py-4 text-xs font-bold uppercase tracking-widest text-stone-500">Fee Logic</th>
                  <th className="px-8 py-4 text-xs font-bold uppercase tracking-widest text-stone-500 text-right">Fee (Net)</th>
                  <th className="px-8 py-4 text-xs font-bold uppercase tracking-widest text-stone-500 text-right">Fee Tax</th>
                  <th className="px-8 py-4 text-xs font-bold uppercase tracking-widest text-stone-500 text-right">Total Fee</th>
                  <th className="px-8 py-4 text-xs font-bold uppercase tracking-widest text-stone-500 text-right">Doc</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100 dark:divide-stone-800">
                {commissions.length === 0 ? (
                    <tr>
                        <td colSpan={7} className="px-8 py-12 text-center text-stone-400 italic">
                            No financial records found.
                        </td>
                    </tr>
                ) : (
                    commissions.map((comm: any) => {
                        const orderInvoices = invoices.filter((inv: any) => inv.orderId === comm.orderId.split("-")[0]);
                        return (
                            <tr key={comm.id} className="hover:bg-stone-50/50 dark:hover:bg-stone-950/20 transition-colors group">
                                <td className="px-8 py-6 font-mono text-[10px] font-bold">#{comm.orderId.split("-")[0]}</td>
                                <td className="px-8 py-6 font-bold text-sm text-right">
                                    €{Number(comm.orderGrossTotal).toFixed(2)}
                                </td>
                                <td className="px-8 py-6">
                                    <span className="px-2 py-1 rounded-lg bg-stone-100 dark:bg-stone-800 text-[10px] font-bold border border-stone-200 dark:border-stone-700">
                                        {comm.rate}%
                                    </span>
                                </td>
                                <td className="px-8 py-6 text-sm text-right font-medium text-stone-600 dark:text-stone-400">
                                    €{Number(comm.commissionNet || 0).toFixed(2)}
                                </td>
                                <td className="px-8 py-6 text-[10px] text-right text-stone-500 font-mono">
                                    {Number(comm.commissionVat) > 0 ? `€${Number(comm.commissionVat).toFixed(2)}` : 'REVERSE CHARGE'}
                                </td>
                                <td className="px-8 py-6 font-bold text-sm text-accent text-right">
                                    -€{Number(comm.commissionAmount).toFixed(2)}
                                </td>
                                <td className="px-8 py-6 text-right">
                                    <div className="flex justify-end gap-2">
                                        {orderInvoices.length === 0 ? (
                                            <span className="text-[10px] text-stone-400 italic uppercase">Syncing...</span>
                                        ) : (
                                            orderInvoices.map((inv: any) => (
                                                <a 
                                                    key={inv.id}
                                                    href={inv.url} 
                                                    target="_blank" 
                                                    rel="noopener noreferrer"
                                                    title={inv.type}
                                                    className="p-1.5 rounded-lg border border-stone-200 dark:border-stone-700 text-accent hover:bg-accent hover:text-white transition-all shadow-sm"
                                                >
                                                    <Download size={14} />
                                                </a>
                                            ))
                                        )}
                                    </div>
                                </td>
                            </tr>
                        );
                    })
                )}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </div>
  );
}
