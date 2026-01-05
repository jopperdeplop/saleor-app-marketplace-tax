"use client";

import React, { useEffect, useState } from "react";
import { Users, ArrowRight, Loader2, RefreshCw } from "lucide-react";
import Link from "next/link";
import { syncVendors } from "@/app/actions";

interface Vendor {
  brandName: string;
  brandAttributeValue: string;
  commissionRate: number;
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
      <div className="p-8 md:p-12 border-b border-border-custom bg-stone-50/50 dark:bg-stone-900/20">
        <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-accent/10 rounded-xl text-accent">
              <Users size={24} />
            </div>
            <div>
              <h2 className="text-2xl font-bold font-serif">Vendor Portals</h2>
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
              className="px-4 py-2 bg-white dark:bg-stone-950 border border-border-custom rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-accent min-w-[240px]"
            />
            <div className="flex gap-2">
                <button
                    onClick={handleSync}
                    disabled={syncing}
                    className="px-4 py-2 bg-stone-200 dark:bg-stone-800 hover:bg-stone-300 dark:hover:bg-stone-700 rounded-lg text-xs font-bold uppercase tracking-widest transition-colors flex items-center justify-center gap-2 disabled:opacity-50 whitespace-nowrap"
                >
                    <RefreshCw size={14} className={syncing ? "animate-spin" : ""} /> 
                    {syncing ? "Syncing..." : "Sync"}
                </button>
                <Link 
                href="/dashboard/register-vendor"
                className="px-4 py-2 bg-stone-900 dark:bg-white text-white dark:text-stone-900 hover:opacity-90 rounded-lg text-xs font-bold uppercase tracking-widest transition-colors flex items-center justify-center gap-2 whitespace-nowrap"
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
                className="inline-flex items-center gap-2 px-6 py-3 bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 rounded-xl font-bold transition-colors disabled:opacity-50"
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
            <tr className="bg-stone-100 dark:bg-stone-950 text-stone-500 border-b border-border-custom">
                <th className="px-8 py-4 text-xs font-bold uppercase tracking-widest">Brand Name</th>
                <th className="px-8 py-4 text-xs font-bold uppercase tracking-widest">Saleor ID</th>
                <th className="px-8 py-4 text-xs font-bold uppercase tracking-widest">Commission</th>
                <th className="px-8 py-4 text-xs font-bold uppercase tracking-widest text-right">Action</th>
            </tr>
            </thead>
            <tbody className="divide-y divide-border-custom">
            {filteredVendors.length === 0 ? (
                <tr>
                    <td colSpan={4} className="px-8 py-12 text-center text-text-secondary">
                        No vendors match your search.
                    </td>
                </tr>
            ) : (
                filteredVendors.map((vendor) => (
                    <tr key={vendor.brandAttributeValue} className="group hover:bg-stone-50 dark:hover:bg-stone-900 transition-colors">
                    <td className="px-8 py-5">
                        <Link href={`/dashboard/vendor/${encodeURIComponent(vendor.brandAttributeValue)}`} className="font-bold text-lg hover:text-accent transition-colors block">
                            {vendor.brandName}
                        </Link>
                    </td>
                    <td className="px-8 py-5 font-mono text-sm text-text-secondary">
                        {vendor.brandAttributeValue}
                    </td>
                    <td className="px-8 py-5">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                           {vendor.commissionRate}%
                        </span>
                    </td>
                    <td className="px-8 py-5 text-right">
                         <Link 
                            href={`/dashboard/vendor/${encodeURIComponent(vendor.brandAttributeValue)}`}
                            className="inline-flex items-center gap-1 text-sm font-bold text-text-secondary hover:text-accent transition-colors"
                        >
                            Manage <ArrowRight size={16} />
                        </Link>
                    </td>
                    </tr>
                ))
            )}
            </tbody>
        </table>
      )}
      </div>
    </section>
  );
}


