import { registerVendor } from "@/app/actions";
import { ArrowLeft, UserPlus, Save } from "lucide-react";
import Link from "next/link";

export default function RegisterVendorPage() {
  return (
    <div className="min-h-screen bg-stone-50 dark:bg-stone-950 p-6 md:p-12">
      <div className="max-w-2xl mx-auto">
        <Link 
          href="/" 
          className="inline-flex items-center gap-2 text-stone-500 hover:text-accent mb-8 transition-colors font-medium"
        >
          <ArrowLeft size={20} /> Back to Dashboard
        </Link>

        <header className="mb-12">
          <div className="flex items-center gap-4 mb-4 text-accent">
            <div className="p-3 bg-accent/10 rounded-xl">
              <UserPlus size={32} />
            </div>
            <h1 className="text-3xl font-bold font-serif text-stone-900 dark:text-white">Register Vendor</h1>
          </div>
          <p className="text-stone-500 text-lg">
            Manually register a vendor to set their commission rate before their first order.
          </p>
        </header>

        <section className="bg-white dark:bg-stone-900 p-8 rounded-3xl border border-stone-200 dark:border-stone-800 shadow-sm">
          <form action={registerVendor} className="space-y-6">
            <div>
              <label htmlFor="brandName" className="block text-sm font-bold uppercase tracking-widest text-stone-500 mb-2">
                Brand Name (Display)
              </label>
              <input
                type="text"
                name="brandName"
                id="brandName"
                required
                className="w-full bg-stone-50 dark:bg-stone-800 border-none rounded-xl px-4 py-3 font-bold focus:ring-2 focus:ring-accent"
                placeholder="e.g. Acme Corp"
              />
            </div>

            <div>
              <label htmlFor="brandSlug" className="block text-sm font-bold uppercase tracking-widest text-stone-500 mb-2">
                Brand Page ID (Saleor Attribute)
              </label>
              <p className="text-xs text-stone-400 mb-2">
                Your system links Brands to Pages. Please enter the Page ID (e.g. from the URL or API).
              </p>
              <input
                type="text"
                name="brandSlug"
                id="brandSlug"
                required
                className="w-full bg-stone-50 dark:bg-stone-800 border-none rounded-xl px-4 py-3 font-mono text-sm focus:ring-2 focus:ring-accent"
                placeholder="e.g. UGFnZTo1"
              />

            </div>

            <div>
              <label htmlFor="commissionRate" className="block text-sm font-bold uppercase tracking-widest text-stone-500 mb-2">
                Initial Commission Rate (%)
              </label>
              <p className="text-xs text-stone-400 mb-2">
                Leave blank to use the Global Default Rate.
              </p>
              <div className="relative">
                <input
                  type="number"
                  step="0.01"
                  name="commissionRate"
                  id="commissionRate"
                  className="w-full bg-stone-50 dark:bg-stone-800 border-none rounded-xl pl-4 pr-10 py-3 font-bold focus:ring-2 focus:ring-accent"
                  placeholder="Def."
                />
                <span className="absolute top-1/2 -translate-y-1/2 right-4 text-stone-400 font-bold">
                  %
                </span>
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-accent text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 hover:opacity-90 transition-opacity mt-8"
            >
              <Save size={20} /> Register Vendor
            </button>
          </form>
        </section>
      </div>
    </div>
  );
}
