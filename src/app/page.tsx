import React from "react";
import { Receipt, BarChart3, ShieldCheck, Zap, ArrowRight, Activity, FileText, Globe } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen">
      <main className="max-w-6xl mx-auto px-6 py-12">
        <header className="mb-20">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent/10 border border-accent/20 text-accent text-xs font-bold uppercase tracking-widest mb-6">
            <Zap size={14} />
            Marketplace Engine Active
          </div>
          <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight mb-6 font-serif">
            Tax & Commission <br /> <span className="text-accent underline decoration-stone-200 dark:decoration-stone-800">Control Center</span>
          </h1>
          <p className="text-lg text-text-secondary max-w-2xl leading-relaxed">
            Your primary hub for managing Eurozone VAT compliance, vendor commissions, and automated invoicing logic for your Saleor marketplace.
          </p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-20">
          {[
            {
              title: "Automated Invoicing",
              desc: "Destination-based VAT receipts & reverse-charge invoices.",
              icon: <Receipt className="text-accent" size={24} />,
            },
            {
              title: "Commission Logic",
              desc: "Real-time calculation of platform fees based on rates.",
              icon: <BarChart3 className="text-cobalt" size={24} />,
            },
            {
              title: "Compliance Shield",
              desc: "EU One-Stop Shop (OSS) reporting compatibility.",
              icon: <ShieldCheck className="text-signal" size={24} />,
            },
            {
              title: "Global Reach",
              desc: "Support for 20+ Eurozone channels and currencies.",
              icon: <Globe className="text-accent" size={24} />,
            },
          ].map((feature, i) => (
            <div
              key={i}
              className="p-6 rounded-2xl bg-card border border-border-custom hover:border-accent/40 transition-all group shadow-sm hover:shadow-md"
            >
              <div className="mb-4 p-3 rounded-xl bg-background border border-border-custom w-fit group-hover:scale-110 transition-transform">
                {feature.icon}
              </div>
              <h3 className="text-lg font-bold mb-2 uppercase tracking-tight">{feature.title}</h3>
              <p className="text-text-secondary text-sm leading-relaxed">{feature.desc}</p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20">
          <section className="md:col-span-2 p-10 rounded-3xl bg-card border border-border-custom shadow-sm relative overflow-hidden">
            <div className="absolute top-0 right-0 p-8 opacity-5">
                <Activity size={200} />
            </div>
            <div className="relative z-10">
              <h2 className="text-3xl font-bold mb-4 font-serif">Application Health</h2>
              <p className="text-text-secondary mb-8 max-w-md">
                All core systems are synchronized with the Saleor instance. The engine is filtering orders by the Brand attribute.
              </p>
              <div className="flex flex-wrap gap-4">
                <button className="px-6 py-3 rounded-lg bg-accent text-white font-bold hover:opacity-90 transition-all flex items-center gap-2">
                  View App Manifest <ArrowRight size={18} />
                </button>
                <button className="px-6 py-3 rounded-lg bg-background border border-border-custom hover:bg-stone-100 dark:hover:bg-stone-800 transition-all font-bold">
                  Documentation
                </button>
              </div>
            </div>
          </section>

          <aside className="p-8 rounded-3xl bg-stone-100 dark:bg-stone-900 border border-border-custom flex flex-col justify-between">
            <div>
                <div className="flex items-center gap-2 mb-4">
                    <div className="h-2 w-2 rounded-full bg-signal animate-pulse" />
                    <span className="text-xs font-bold uppercase tracking-widest text-text-secondary">System Config</span>
                </div>
                <div className="space-y-4">
                    <div className="flex justify-between items-center border-b border-border-custom pb-2">
                        <span className="text-sm font-medium">Next.js Core</span>
                        <span className="text-sm font-bold">15.1.4</span>
                    </div>
                    <div className="flex justify-between items-center border-b border-border-custom pb-2">
                        <span className="text-sm font-medium">ORM Layer</span>
                        <span className="text-sm font-bold">Prisma 7</span>
                    </div>
                    <div className="flex justify-between items-center border-b border-border-custom pb-2">
                        <span className="text-sm font-medium">SDK Version</span>
                        <span className="text-sm font-bold">1.5.0</span>
                    </div>
                </div>
            </div>
            <div className="mt-8 pt-6 border-t border-border-custom">
                <p className="text-xs text-text-secondary italic">
                    Connected to: dashboard.salp.shop
                </p>
            </div>
          </aside>
        </div>
      </main>

      <footer className="border-t border-border-custom px-6 py-12 bg-card">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="text-text-secondary text-sm">
                &copy; 2026 Saleor Marketplace Tax System • Antigravity Ecosystem
            </div>
            <div className="flex gap-8 text-xs font-bold uppercase tracking-widest text-text-secondary">
                <a href="#" className="hover:text-accent transition-colors">Security</a>
                <a href="#" className="hover:text-accent transition-colors">Privacy</a>
                <a href="#" className="hover:text-accent transition-colors">Terms</a>
            </div>
        </div>
      </footer>
    </div>
  );
}


