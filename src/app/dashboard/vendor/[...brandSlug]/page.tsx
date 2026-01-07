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
    <div className="min-h-screen bg-background p-6 md:p-12 text-text-primary">
      <div className="max-w-6xl mx-auto">
        <header className="mb-12 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div>
            <Link href="/" className="inline-flex items-center gap-2 text-text-secondary hover:text-accent mb-4 transition-colors text-[10px] font-extrabold uppercase tracking-widest">
                <ArrowLeft size={16} /> Dashboard
            </Link>
            <h1 className="text-4xl font-bold font-serif mb-2 text-text-primary">{vendor.brandName} Portal</h1>
            <p className="text-text-secondary">View commissions and manage fee overrides for this partner.</p>
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
            
            <div className="bg-card px-6 py-4 rounded-2xl border border-border-custom shadow-sm relative overflow-hidden group">
              {hasActiveOverride && (
                <div className="absolute top-0 right-0 bg-accent text-white text-[10px] font-bold px-2 py-0.5 rounded-bl-lg">
                  TEMP OVERRIDE
                </div>
              )}
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-text-secondary/60 block mb-1">Effective Rate</span>
              <div className="flex items-baseline gap-1">
                  <span className={`text-2xl font-extrabold ${hasActiveOverride ? "text-accent" : "text-text-primary"}`}>
                      {effectiveRate}%
                  </span>
                  {hasActiveOverride && (
                      <span className="text-xs text-text-secondary/50 line-through">{vendor.commissionRate}%</span>
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
        <section className="mb-12 bg-card p-8 rounded-3xl border border-dashed border-border-custom shadow-sm">
            <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-purple-100 dark:bg-purple-900/30 text-purple-600 rounded-lg">
                    <Zap size={20} />
                </div>
                <div>
                    <h3 className="text-lg font-bold text-text-primary">Commission Override</h3>
                    <p className="text-sm text-text-secondary">Temporarily lower or raise fees for this vendor.</p>
                </div>
            </div>
            
            <div className="flex flex-col md:flex-row gap-4 items-end">
                <form action={updateVendorOverride} className="flex-1 flex flex-col md:flex-row gap-4 items-end w-full">
                    <input type="hidden" name="brandSlug" value={brandSlug} />
                    
                    <div className="w-full md:w-auto flex-1">
                        <label className="block text-xs font-bold uppercase tracking-widest text-text-secondary mb-2">Temporary Rate (%)</label>
                        <input 
                            type="number" 
                            step="0.01" 
                            name="tempRate" 
                            defaultValue={vendor.temporaryCommissionRate ?? ''}
                            placeholder="e.g. 5.0"
                            className="w-full bg-stone-50/50 dark:bg-stone-800/50 border border-border-custom rounded-xl px-4 py-3 font-bold focus:ring-2 focus:ring-accent outline-none text-text-primary"
                        />
                    </div>
                    
                    <div className="w-full md:w-auto flex-1">
                        <label className="block text-xs font-bold uppercase tracking-widest text-text-secondary mb-2">Ends At</label>
                        <div className="relative">
                            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary/50" size={16} />
                            <input 
                                type="date" 
                                name="endDate" 
                                defaultValue={vendor.temporaryCommissionEndsAt ? new Date(vendor.temporaryCommissionEndsAt).toISOString().split('T')[0] : ''}
                                className="w-full bg-stone-50/50 dark:bg-stone-800/50 border border-border-custom rounded-xl pl-10 pr-4 py-3 font-medium focus:ring-2 focus:ring-accent outline-none text-text-primary"
                            />
                        </div>
                    </div>

                    <button type="submit" className="w-full md:w-auto px-6 py-3 bg-text-primary text-background font-bold rounded-xl hover:opacity-90 shadow-md transition-all active:scale-95 whitespace-nowrap">
                        Apply Override
                    </button>
                </form>

                {vendor.temporaryCommissionEndsAt && (
                    <form action={removeVendorOverride} className="w-full md:w-auto">
                         <input type="hidden" name="brandSlug" value={brandSlug} />
                         <button type="submit" className="w-full md:w-auto px-6 py-3 bg-red-50 dark:bg-red-900/10 text-red-600 dark:text-red-400 font-bold rounded-xl hover:bg-red-100 dark:hover:bg-red-900/20 transition-all active:scale-95 whitespace-nowrap border border-red-200 dark:border-red-900/30">
                            Remove Override
                        </button>
                    </form>
                )}
            </div>
        </section>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
          <div className="bg-card p-8 rounded-3xl border border-border-custom shadow-sm col-span-1 md:col-span-2">
            <CreditCard className="text-accent mb-4" size={32} />
            <h3 className="text-lg font-bold mb-1 text-text-primary">Total Marketplace Fees</h3>
            <p className="text-3xl font-extrabold text-text-primary">
              €{commissions.reduce((acc: number, c: any) => acc + Number(c.commissionAmount), 0).toFixed(2)}
            </p>
            <p className="text-[10px] text-text-secondary mt-2 uppercase tracking-widest font-extrabold opacity-60">Cumulative Net + VAT platform revenue</p>
          </div>
          <div className="bg-card p-8 rounded-3xl border border-border-custom shadow-sm">
            <Clock className="text-text-secondary opacity-40 mb-4" size={32} />
            <h3 className="text-lg font-bold mb-1 text-text-primary">Pending Orders</h3>
            <p className="text-3xl font-extrabold text-text-primary">
              {commissions.filter((c: any) => c.status === 'PENDING').length}
            </p>
          </div>
          <div className="bg-card p-8 rounded-3xl border border-border-custom shadow-sm relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-2 h-full bg-green-500 opacity-20 group-hover:opacity-100 transition-opacity"></div>
            <CheckCircle className="text-green-500 mb-4" size={32} />
            <h3 className="text-lg font-bold mb-1 text-text-primary">Tax Hub</h3>
            <p className="text-2xl font-extrabold text-green-500">{vendor.countryCode} Hub</p>
            <p className="text-[10px] text-text-secondary mt-1 uppercase font-extrabold tracking-widest opacity-60">{vendor.vatNumber || "No VAT Number"}</p>
          </div>
        </div>

        {/* Platform Data Section */}
        <div className="mb-6 flex items-center gap-2">
            <Package className="text-text-secondary/50" size={18} />
            <span className="text-[10px] font-extrabold uppercase tracking-widest text-text-secondary">Platform Performance</span>
        </div>
        <PlatformStats 
          brand={vendor.brandAttributeValue} 
          stats={data.platformStats} 
        />

        <section className="bg-card rounded-3xl border border-border-custom shadow-sm overflow-hidden mt-12">
          <div className="px-8 py-6 border-b border-border-custom flex justify-between items-center bg-stone-50/30 dark:bg-stone-950/20">
            <div>
                <h2 className="text-xl font-bold uppercase tracking-tight font-serif text-text-primary">Financial Audit Log</h2>
                <p className="text-xs text-text-secondary mt-1">OSS-compliant breakdown of EU marketplace transactions.</p>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-stone-50/50 dark:bg-stone-950/50 border-b border-border-custom">
                  <th className="px-8 py-4 text-[10px] font-extrabold uppercase tracking-widest text-text-secondary opacity-60">Reference</th>
                  <th className="px-8 py-4 text-[10px] font-extrabold uppercase tracking-widest text-text-secondary text-right opacity-60">Order Gross</th>
                  <th className="px-8 py-4 text-[10px] font-extrabold uppercase tracking-widest text-text-secondary opacity-60">Fee Logic</th>
                  <th className="px-8 py-4 text-[10px] font-extrabold uppercase tracking-widest text-text-secondary text-right opacity-60">Fee (Net)</th>
                  <th className="px-8 py-4 text-[10px] font-extrabold uppercase tracking-widest text-text-secondary text-right opacity-60">Fee Tax</th>
                  <th className="px-8 py-4 text-[10px] font-extrabold uppercase tracking-widest text-text-secondary text-right opacity-60">Total Fee</th>
                  <th className="px-8 py-4 text-[10px] font-extrabold uppercase tracking-widest text-text-secondary text-right opacity-60">Doc</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-custom">
                {commissions.length === 0 ? (
                    <tr>
                        <td colSpan={7} className="px-8 py-12 text-center text-text-secondary italic">
                            No financial records found.
                        </td>
                    </tr>
                ) : (
                    commissions.map((comm: any) => {
                        const orderInvoices = invoices.filter((inv: any) => inv.orderId === comm.orderId.split("-")[0]);
                        return (
                            <tr key={comm.id} className="hover:bg-stone-50/30 dark:hover:bg-stone-800/20 transition-colors group">
                                <td className="px-8 py-6 font-mono text-[10px] font-extrabold text-text-primary">#{comm.orderId.split("-")[0]}</td>
                                <td className="px-8 py-6 font-extrabold text-sm text-right text-text-primary">
                                    €{Number(comm.orderGrossTotal).toFixed(2)}
                                </td>
                                <td className="px-8 py-6">
                                    <span className="px-2 py-1 rounded-lg bg-stone-100 dark:bg-stone-800 text-[10px] font-extrabold border border-border-custom text-text-secondary">
                                        {comm.rate}%
                                    </span>
                                </td>
                                <td className="px-8 py-6 text-sm text-right font-bold text-text-secondary">
                                    €{Number(comm.commissionNet || 0).toFixed(2)}
                                </td>
                                <td className="px-8 py-6 text-[10px] text-right text-text-secondary/60 font-mono">
                                    {Number(comm.commissionVat) > 0 ? `€${Number(comm.commissionVat).toFixed(2)}` : 'REVERSE CHARGE'}
                                </td>
                                <td className="px-8 py-6 font-extrabold text-sm text-accent text-right">
                                    -€{Number(comm.commissionAmount).toFixed(2)}
                                </td>
                                <td className="px-8 py-6 text-right">
                                    <div className="flex justify-end gap-2">
                                        {orderInvoices.length === 0 ? (
                                            <span className="text-[10px] text-text-secondary/40 italic uppercase tracking-widest">Syncing...</span>
                                        ) : (
                                            orderInvoices.map((inv: any) => (
                                                <a 
                                                    key={inv.id}
                                                    href={inv.url} 
                                                    target="_blank" 
                                                    rel="noopener noreferrer"
                                                    title={inv.type}
                                                    className="p-1.5 rounded-lg border border-border-custom text-accent hover:bg-accent hover:text-white transition-all shadow-sm"
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
