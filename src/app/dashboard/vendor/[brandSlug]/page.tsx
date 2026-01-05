import { getVendorData } from "@/services/vendor-dashboard";
import { notFound } from "next/navigation";
import { Receipt, CreditCard, Clock, CheckCircle, Download, Zap, Calendar } from "lucide-react";
import { updateVendorOverride } from "@/app/actions";

export default async function VendorDashboard({
  params,
}: {
  params: Promise<{ brandSlug: string }>;
}) {
  const { brandSlug } = await params;
  const data = await getVendorData(brandSlug);

  if (!data) {
    notFound();
  }

  const { vendor, commissions, invoices } = data;
  
  const now = new Date();
  const hasActiveOverride = vendor.temporaryCommissionEndsAt && new Date(vendor.temporaryCommissionEndsAt) > now;
  const effectiveRate = hasActiveOverride && vendor.temporaryCommissionRate !== null
    ? vendor.temporaryCommissionRate 
    : vendor.commissionRate;

  return (
    <div className="min-h-screen bg-stone-50 dark:bg-stone-950 p-6 md:p-12">
      <div className="max-w-6xl mx-auto">
        <header className="mb-12 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div>
            <h1 className="text-4xl font-bold font-serif mb-2">{vendor.brandName} Portal</h1>
            <p className="text-stone-500">View your commissions and download invoices.</p>
          </div>
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
        </header>

        {/* Admin Override Control */}
        <section className="mb-12 bg-white dark:bg-stone-900 p-8 rounded-3xl border border-dashed border-stone-300 dark:border-stone-700">
            <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-purple-100 dark:bg-purple-900/30 text-purple-600 rounded-lg">
                    <Zap size={20} />
                </div>
                <div>
                    <h3 className="text-lg font-bold">Commission Override</h3>
                    <p className="text-sm text-stone-500">Temporarily lower or raise fees for this vendor.</p>
                </div>
            </div>
            
            <form action={updateVendorOverride} className="flex flex-col md:flex-row gap-4 items-end">
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

                <button type="submit" className="w-full md:w-auto px-6 py-3 bg-stone-900 dark:bg-white text-white dark:text-stone-900 font-bold rounded-xl hover:opacity-90">
                    Apply Override
                </button>
            </form>
        </section>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          <div className="bg-white dark:bg-stone-900 p-8 rounded-3xl border border-stone-200 dark:border-stone-800 shadow-sm">
            <CreditCard className="text-accent mb-4" size={32} />
            <h3 className="text-lg font-bold mb-1">Total Commissions</h3>
            <p className="text-3xl font-bold">
              €{commissions.reduce((acc, c) => acc + Number(c.amount), 0).toFixed(2)}
            </p>
          </div>
          <div className="bg-white dark:bg-stone-900 p-8 rounded-3xl border border-stone-200 dark:border-stone-800 shadow-sm">
            <Clock className="text-cobalt mb-4" size={32} />
            <h3 className="text-lg font-bold mb-1">Pending Sync</h3>
            <p className="text-3xl font-bold">
              {commissions.filter(c => c.status === 'PENDING').length} Orders
            </p>
          </div>
          <div className="bg-white dark:bg-stone-900 p-8 rounded-3xl border border-stone-200 dark:border-stone-800 shadow-sm">
            <CheckCircle className="text-signal mb-4" size={32} />
            <h3 className="text-lg font-bold mb-1">VAT Compliance</h3>
            <p className="text-3xl font-bold">Active</p>
          </div>
        </div>

        <section className="bg-white dark:bg-stone-900 rounded-3xl border border-stone-200 dark:border-stone-800 shadow-sm overflow-hidden">
          <div className="px-8 py-6 border-b border-stone-200 dark:border-stone-800 flex justify-between items-center">
            <h2 className="text-xl font-bold">Invoice History</h2>
            <button className="text-xs font-bold uppercase tracking-widest bg-stone-100 dark:bg-stone-800 px-4 py-2 rounded-full hover:bg-stone-200 transition-colors">
              Export CSV
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-stone-50 dark:bg-stone-950/50">
                  <th className="px-8 py-4 text-xs font-bold uppercase tracking-widest text-stone-500">Order ID</th>
                  <th className="px-8 py-4 text-xs font-bold uppercase tracking-widest text-stone-500">Type</th>
                  <th className="px-8 py-4 text-xs font-bold uppercase tracking-widest text-stone-500">Date</th>
                  <th className="px-8 py-4 text-xs font-bold uppercase tracking-widest text-stone-500 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100 dark:divide-stone-800">
                {invoices.map((invoice) => (
                  <tr key={invoice.id} className="hover:bg-stone-50/50 dark:hover:bg-stone-950/20 transition-colors">
                    <td className="px-8 py-4 font-mono text-sm">{invoice.orderId}</td>
                    <td className="px-8 py-4">
                      <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        invoice.type === 'CUSTOMER' ? 'bg-blue-100 text-blue-700' : 'bg-purple-100 text-purple-700'
                      }`}>
                        {invoice.type}
                      </span>
                    </td>
                    <td className="px-8 py-4 text-sm text-stone-500">
                      {new Date(invoice.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-8 py-4 text-right">
                      <a 
                        href={invoice.url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 text-accent font-bold text-sm hover:underline"
                      >
                        <Download size={14} /> Download
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </div>
  );
}
