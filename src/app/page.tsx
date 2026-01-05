import React from "react";
import Link from "next/link";
import { Receipt, BarChart3, ShieldCheck, Zap, ArrowRight, Activity, Globe, Settings } from "lucide-react";

import { VendorList } from "@/components/VendorList";

export default function Home() {
  return (
    <div className="min-h-screen">
      <main className="max-w-6xl mx-auto px-6 py-12">
        <header className="mb-12 flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent/10 border border-accent/20 text-accent text-xs font-bold uppercase tracking-widest mb-6">
              <Zap size={14} />
              Marketplace Engine Active
            </div>
            <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight mb-6 font-serif">
              Tax & Commission <br /> <span className="text-accent underline decoration-stone-200 dark:decoration-stone-800">Control Center</span>
            </h1>
            <p className="text-lg text-text-secondary max-w-2xl leading-relaxed">
              Manage Eurozone VAT compliance, vendor commissions, and automated invoicing logic for your Saleor marketplace.
            </p>
          </div>
          <div className="flex gap-4">
             <Link 
                href="/dashboard/settings"
                className="px-6 py-3 rounded-xl bg-accent text-white font-bold hover:opacity-90 shadow-md transition-all flex items-center gap-2"
              >
                <Settings size={18} /> Global Settings
              </Link>
          </div>
        </header>

        <VendorList />

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


