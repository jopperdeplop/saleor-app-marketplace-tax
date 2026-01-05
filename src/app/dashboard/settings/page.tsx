import { prisma } from "@/lib/prisma";
import { updateGlobalSettings } from "@/app/actions";
import { Settings, Save, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default async function SettingsPage() {
  const settings = await prisma.systemSettings.findUnique({
    where: { id: "global" },
  });

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
              <Settings size={32} />
            </div>
            <h1 className="text-3xl font-bold font-serif text-stone-900 dark:text-white">Global Settings</h1>
          </div>
          <p className="text-stone-500 text-lg">
            Configure system-wide parameters for the Marketplace Tax Engine.
          </p>
        </header>

        <section className="bg-white dark:bg-stone-900 p-8 rounded-3xl border border-stone-200 dark:border-stone-800 shadow-sm">
          <form action={updateGlobalSettings}>
            <div className="mb-6">
              <label htmlFor="defaultRate" className="block text-sm font-bold uppercase tracking-widest text-stone-500 mb-2">
                Default Commission Rate (%)
              </label>
              <p className="text-sm text-stone-400 mb-4">
                This rate will be applied to all newly registered vendors automatically.
              </p>
              <div className="relative">
                <input
                  type="number"
                  step="0.01"
                  name="defaultRate"
                  id="defaultRate"
                  defaultValue={settings?.defaultCommissionRate ?? 10.0}
                  className="w-full text-4xl font-bold text-accent bg-transparent border-b-2 border-stone-200 dark:border-stone-700 focus:border-accent outline-none py-2 px-1 transition-colors pl-8"
                  placeholder="10.0"
                />
                <span className="absolute top-1/2 -translate-y-1/2 left-0 text-xl font-bold text-stone-400">
                  %
                </span>
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-accent text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 hover:opacity-90 transition-opacity"
            >
              <Save size={20} /> Save Global Configuration
            </button>
          </form>
        </section>
      </div>
    </div>
  );
}
