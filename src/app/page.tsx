import React from "react";
import Link from "next/link";
import { Receipt, BarChart3, ShieldCheck, Zap, ArrowRight, Activity, Globe, Settings, Users, Sparkles, LogOut } from "lucide-react";

import { VendorList } from "@/components/VendorList";
import { MarketplaceTaxDashboard } from "@/components/MarketplaceTaxDashboard";
import { auth, signOut } from "@/auth";
import { redirect } from "next/navigation";

export default async function Home() {
  const session = await auth();
  if (!session) {
    redirect("/login");
  }

  return (
    <div className="min-h-screen">
      <main className="max-w-6xl mx-auto px-6 py-12">
        <header className="mb-12 flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent/10 border border-accent/20 text-accent text-xs font-bold uppercase tracking-widest mb-6">
              <Zap size={14} />
              Admin Hub Active
            </div>
            <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight mb-6 font-serif">
              Marketplace <br /> <span className="text-accent underline decoration-stone-200 dark:decoration-stone-800">Control Center</span>
            </h1>
            <p className="text-lg text-text-secondary max-w-2xl leading-relaxed">
              Manage vendors, applications, and marketplace operations.
            </p>
          </div>
          <div className="flex flex-col gap-2">
            <p className="text-xs text-stone-500 text-right">Signed in as {session.user?.email}</p>
            <form action={async () => { "use server"; await signOut({ redirectTo: "/login" }); }}>
              <button type="submit" className="text-xs text-red-500 hover:text-red-400 flex items-center gap-1 ml-auto">
                <LogOut size={12} /> Sign out
              </button>
            </form>
          </div>
        </header>

        {/* Quick Access Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-12">
          <Link href="/dashboard/applications" className="group bg-blue-500/5 border border-blue-500/20 rounded-2xl p-6 hover:bg-blue-500/10 transition-all">
            <Users className="w-8 h-8 text-blue-500 mb-3" />
            <h3 className="font-bold text-stone-900 dark:text-white group-hover:text-blue-500 transition-colors">Vendor Applications</h3>
            <p className="text-sm text-stone-500 mt-1">Review onboarding requests</p>
          </Link>
          <Link href="/dashboard/feature-requests" className="group bg-purple-500/5 border border-purple-500/20 rounded-2xl p-6 hover:bg-purple-500/10 transition-all">
            <Sparkles className="w-8 h-8 text-purple-500 mb-3" />
            <h3 className="font-bold text-stone-900 dark:text-white group-hover:text-purple-500 transition-colors">Feature Requests</h3>
            <p className="text-sm text-stone-500 mt-1">Vendor feedback & ideas</p>
          </Link>
          <Link href="/dashboard/settings" className="group bg-accent/5 border border-accent/20 rounded-2xl p-6 hover:bg-accent/10 transition-all">
            <Settings className="w-8 h-8 text-accent mb-3" />
            <h3 className="font-bold text-stone-900 dark:text-white group-hover:text-accent transition-colors">Settings</h3>
            <p className="text-sm text-stone-500 mt-1">Global configuration</p>
          </Link>
        </div>

        <MarketplaceTaxDashboard />

        <VendorList />

      </main>

      <footer className="border-t border-border-custom px-6 py-8 bg-card">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="text-text-secondary text-xs font-medium">
                &copy; 2026 Salp Marketplace Admin Hub
            </div>
        </div>
      </footer>
    </div>
  );
}
