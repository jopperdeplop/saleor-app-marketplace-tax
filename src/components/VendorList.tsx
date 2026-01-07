"use client";

import React, { useEffect, useState } from "react";
import { Users, ArrowRight, Loader2, RefreshCw } from "lucide-react";
import Link from "next/link";
import { syncVendors } from "@/app/actions";

interface Vendor {
  brandName: string;
  brandAttributeValue: string;
  commissionRate: number;
  countryCode: string;
  temporaryCommissionRate?: number | null;
  temporaryCommissionEndsAt?: string | null;
  isPlaceholder?: boolean;
}

export function VendorList() {
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);

  const fetchVendors = () => {
    fetch("/api/vendors")
      .then((res) => res.json())
      .then((data) => {
        setVendors(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Failed to load vendors", err);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchVendors();
  }, []);

  const handleSync = async () => {
    setSyncing(true);
    try {
      await syncVendors();
      fetchVendors();
    } catch (error) {
      console.error("Sync failed:", error);
      alert("Failed to sync vendors from Saleor.");
    } finally {
      setSyncing(false);
    }
  };

  // ... imports and interface
  const [searchTerm, setSearchTerm] = useState("");

  const filteredVendors = vendors.filter(v => 
    v.brandName.toLowerCase().includes(searchTerm.toLowerCase()) || 
    v.brandAttributeValue.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <section className="bg-card border border-border-custom rounded-3xl overflow-hidden mt-12 shadow-sm">
      <div className="p-8 md:p-12 border-b border-border-custom bg-stone-50/30 dark:bg-stone-900/10">
        <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-accent/10 rounded-xl text-accent">
              <Users size={24} />
            </div>
            <div>
              <h2 className="text-2xl font-bold font-serif text-text-primary">Vendor Portals</h2>
              <p className="text-text-secondary text-sm">
                Access individual vendor dashboards to view their specific financial data.
              </p>
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-3 w-full xl:w-auto">
             <input
              type="text"
              placeholder="Search vendors..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="px-4 py-2 bg-card border border-border-custom rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-accent min-w-[240px] text-text-primary"
            />
            <div className="flex gap-2">
                <button
                    onClick={handleSync}
                    disabled={syncing}
                    className="px-4 py-2 bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 text-text-primary rounded-lg text-xs font-bold uppercase tracking-widest transition-colors flex items-center justify-center gap-2 disabled:opacity-50 whitespace-nowrap"
                >
                    <RefreshCw size={14} className={syncing ? "animate-spin" : ""} /> 
                    {syncing ? "Syncing..." : "Sync"}
                </button>
                <Link 
                href="/dashboard/register-vendor"
                className="px-4 py-2 bg-text-primary text-background hover:opacity-90 rounded-lg text-xs font-bold uppercase tracking-widest transition-colors flex items-center justify-center gap-2 whitespace-nowrap"
                >
                <Users size={14} /> Register New
                </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
      {loading ? (
        <div className="flex justify-center py-20 text-accent animate-spin">
          <Loader2 size={32} />
        </div>
      ) : vendors.length === 0 ? (
        <div className="text-center py-20 px-8">
          <p className="text-text-secondary font-medium text-lg mb-2">No vendors registered yet.</p>
          <p className="text-sm text-text-secondary mb-8 max-w-md mx-auto">
            Vendors are created automatically when an order is paid with a new Brand, or you can sync now to fetch them all.
          </p>
          <div className="flex justify-center gap-4">
            <button 
                onClick={handleSync}
                disabled={syncing}
                className="inline-flex items-center gap-2 px-6 py-3 bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 rounded-xl font-bold transition-colors disabled:opacity-50 text-text-primary"
            >
                 <RefreshCw size={16} className={syncing ? "animate-spin" : ""} /> 
                 {syncing ? "Syncing..." : "Sync from Saleor"}
            </button>
            <Link 
                href="/dashboard/settings"
                className="inline-flex items-center gap-2 px-6 py-3 bg-accent text-white hover:opacity-90 rounded-xl font-bold transition-colors"
            >
                Configure Defaults
            </Link>
          </div>
        </div>
      ) : (
        <table className="w-full text-left border-collapse">
            <thead>
            <tr className="bg-stone-50/50 dark:bg-stone-950/50 text-text-secondary border-b border-border-custom">
                <th className="px-8 py-4 text-[10px] font-extrabold uppercase tracking-widest opacity-60">Tax Identity</th>
                <th className="px-8 py-4 text-[10px] font-extrabold uppercase tracking-widest opacity-60">Fee Engine</th>
                <th className="px-8 py-4 text-[10px] font-extrabold uppercase tracking-widest text-right opacity-60">Marketplace Hub</th>
            </tr>
            </thead>
            <tbody className="divide-y divide-border-custom">
            {filteredVendors.length === 0 ? (
                <tr>
                    <td colSpan={3} className="px-8 py-12 text-center text-text-secondary">
                        No vendors match your search.
                    </td>
                </tr>
            ) : (
                filteredVendors.map((vendor) => {
                    const now = new Date();
                    const hasActiveOverride = vendor.temporaryCommissionEndsAt && new Date(vendor.temporaryCommissionEndsAt) > now;
                    
                    return (
                        <tr key={vendor.brandAttributeValue} className="group hover:bg-stone-50 dark:hover:bg-stone-900 transition-colors">
                        <td className="px-8 py-6">
                            <div className="flex items-center gap-3">
                                <span className="w-8 h-8 rounded-full bg-stone-100 dark:bg-stone-800 flex items-center justify-center text-[10px] font-bold text-stone-500 border border-stone-200 dark:border-stone-700">
                                    {vendor.countryCode}
                                </span>
                                <Link href={`/dashboard/vendor/${encodeURIComponent(vendor.brandAttributeValue)}`} className="font-bold text-lg hover:text-accent transition-colors block">
                                    {vendor.brandName}
                                </Link>
                                {vendor.isPlaceholder && (
                                    <span className="px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-600 text-[8px] font-bold uppercase tracking-wider border border-amber-500/20">
                                        Setup Pending
                                    </span>
                                )}
                            </div>
                        </td>
                        <td className="px-8 py-6">
                            <div className="flex flex-col gap-1">
                                <div className="flex items-center gap-2">
                                    <span className={`inline-flex items-center px-2 py-0.5 rounded-lg text-xs font-bold border ${hasActiveOverride ? 'bg-stone-50 dark:bg-stone-800 text-stone-400 line-through border-stone-200 dark:border-stone-700' : 'bg-green-50 dark:bg-green-900/10 text-green-700 dark:text-green-400 border-green-100 dark:border-green-900/20'}`}>
                                       {vendor.commissionRate}%
                                    </span>
                                    {hasActiveOverride && (
                                        <ArrowRight size={12} className="text-stone-400" />
                                    )}
                                    {hasActiveOverride && (
                                        <span className="inline-flex items-center px-2 py-0.5 rounded-lg text-xs font-bold bg-accent/10 border border-accent/20 text-accent">
                                            {vendor.temporaryCommissionRate}%
                                        </span>
                                    )}
                                </div>
                                {hasActiveOverride && (
                                    <span className="text-[10px] font-bold text-accent uppercase tracking-tighter opacity-70">
                                        Ends {new Date(vendor.temporaryCommissionEndsAt!).toLocaleDateString()}
                                    </span>
                                )}
                            </div>
                        </td>
                        <td className="px-8 py-6 text-right">
                             <Link 
                                href={`/dashboard/vendor/${encodeURIComponent(vendor.brandAttributeValue)}`}
                                className="inline-flex items-center gap-2 px-4 py-2 bg-stone-100/50 dark:bg-stone-800/50 hover:bg-accent hover:text-white rounded-xl text-xs font-bold uppercase tracking-widest transition-all group-hover:shadow-md active:scale-95"
                            >
                                Management Portal <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                            </Link>
                        </td>
                        </tr>
                    );
                })
            )}
            </tbody>
        </table>
      )}
      </div>
    </section>
  );
}


